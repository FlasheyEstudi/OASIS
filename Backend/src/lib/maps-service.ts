// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Maps & Routing Service
// Powered by GraphHopper (self-hosted) + Nominatim (Geocoding)
// Fallback: GraphHopper Public API (500 req/day free)
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';
import { calculateDistance } from './oasis-utils';

// ───────────────────────────────────────────────────────────────
// Configuration
// GRAPHHOPPER_URL: http://localhost:8989 (self-hosted Docker)
//                 https://graphhopper.com/api/1  (public API fallback)
// GRAPHHOPPER_KEY: only needed for public API
// ───────────────────────────────────────────────────────────────
const GRAPHHOPPER_URL = process.env.GRAPHHOPPER_URL || 'https://graphhopper.com/api/1';
const GRAPHHOPPER_KEY = process.env.GRAPHHOPPER_KEY || '';
const IS_PUBLIC_API = GRAPHHOPPER_URL.includes('graphhopper.com/api/1');

export interface RouteStop {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface RouteResult {
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  distanceKm: number;
  estimatedMinutes: number;
  pickup: RouteStop;
  dropoff: RouteStop;
  waypoints?: RouteStop[];
}

// ───────────────────────────────────────────────────────────────
// Greedy nearest-neighbor algorithm to sort multi-stop waypoints
// Minimizes total travel distance using Haversine before calling GraphHopper
// ───────────────────────────────────────────────────────────────
export function sortStopsGreedy(origin: RouteStop, stops: RouteStop[]): RouteStop[] {
  if (stops.length <= 1) return stops;

  const unvisited = [...stops];
  const sorted: RouteStop[] = [];
  let current = origin;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(
        current.latitude, current.longitude,
        unvisited[i].latitude, unvisited[i].longitude
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    sorted.push(unvisited[nearestIdx]);
    current = unvisited[nearestIdx];
    unvisited.splice(nearestIdx, 1);
  }

  return sorted;
}

// ───────────────────────────────────────────────────────────────
// GraphHopper Route Calculation
// Supports single route (A→B) and multi-stop routes (A→B→C→...)
// ───────────────────────────────────────────────────────────────
export async function getGraphHopperRoute(
  stops: RouteStop[],
  vehicle: 'motorcycle' | 'car' | 'bike' = 'motorcycle'
): Promise<RouteResult | null> {
  if (stops.length < 2) return null;

  try {
    // Build query params: each stop becomes a `point` parameter
    const pointParams = stops
      .map(s => `point=${s.latitude},${s.longitude}`)
      .join('&');

    const keyParam = IS_PUBLIC_API && GRAPHHOPPER_KEY ? `&key=${GRAPHHOPPER_KEY}` : '';
    const url = `${GRAPHHOPPER_URL}/route?${pointParams}&vehicle=${vehicle}&locale=es&instructions=false&points_encoded=false${keyParam}`;

    console.log(`[GraphHopper] Calculating route via: ${url.substring(0, 100)}...`);

    const response = await axios.get(url, { timeout: 8000 });

    if (!response.data?.paths?.length) return null;

    const path = response.data.paths[0];
    const coordinates: [number, number][] = path.points.coordinates.map(
      (c: [number, number]) => [c[0], c[1]] // GeoJSON is [lng, lat]
    );

    return {
      geometry: {
        type: 'LineString',
        coordinates,
      },
      distanceKm: Math.round((path.distance / 1000) * 10) / 10,
      estimatedMinutes: Math.round(path.time / 60000),
      pickup: stops[0],
      dropoff: stops[stops.length - 1],
      waypoints: stops.slice(1, -1),
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`[GraphHopper] HTTP ${error.response?.status}: ${JSON.stringify(error.response?.data)}`);
    } else {
      console.error('[GraphHopper] Error:', error.message);
    }
    return null;
  }
}

// ───────────────────────────────────────────────────────────────
// Straight-line fallback using Haversine when GraphHopper is unavailable
// ───────────────────────────────────────────────────────────────
export function getFallbackRoute(pickup: RouteStop, dropoff: RouteStop): RouteResult {
  const distanceKm = calculateDistance(
    pickup.latitude, pickup.longitude,
    dropoff.latitude, dropoff.longitude
  );
  // Motorcycle average 25 km/h in urban Nicaragua
  const estimatedMinutes = Math.round((distanceKm / 25) * 60);

  return {
    geometry: {
      type: 'LineString',
      coordinates: [
        [pickup.longitude, pickup.latitude],
        [dropoff.longitude, dropoff.latitude],
      ],
    },
    distanceKm: Math.round(distanceKm * 10) / 10,
    estimatedMinutes,
    pickup,
    dropoff,
  };
}

// ───────────────────────────────────────────────────────────────
// Geocode address using Nominatim (OpenStreetMap) - always free
// ───────────────────────────────────────────────────────────────
export async function geocodeAddress(address: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Nicaragua')}&format=json&limit=1&countrycodes=ni`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'OasisHealthtech/1.0 (oasis-health.app)' },
      timeout: 5000,
    });

    if (response.data?.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('[Nominatim] Geocode error:', error);
    return null;
  }
}

// ───────────────────────────────────────────────────────────────
// Legacy OSRM alias (kept for backward compat, now routes through GraphHopper)
// ───────────────────────────────────────────────────────────────
export async function getOSRMRoute(start: [number, number], end: [number, number]) {
  const result = await getGraphHopperRoute([
    { latitude: start[0], longitude: start[1] },
    { latitude: end[0], longitude: end[1] },
  ]);
  if (!result) return null;
  return {
    geometry: result.geometry,
    distance: result.distanceKm,
    duration: result.estimatedMinutes,
  };
}
