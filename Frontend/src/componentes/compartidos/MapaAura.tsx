"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bike, Home } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { useId } from "react";

// Fix for Leaflet default icons in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapaAuraProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string | number;
    position: [number, number];
    title: string;
    description?: string;
    type?: 'user' | 'courier' | 'pharmacy' | 'clinic';
  }>;
  route?: { origin: [number, number]; destination: [number, number] } | Array<[number, number]>;
  onLocationFound?: (lat: number, lng: number) => void;
  className?: string;
}

const LocationMarker = ({ onLocationFound }: { onLocationFound?: (lat: number, lng: number) => void }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    const handleLocationFound = (e: L.LocationEvent) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onLocationFound) onLocationFound(e.latlng.lat, e.latlng.lng);
    };

    map.locate().on("locationfound", handleLocationFound);
    
    return () => {
      map.stopLocate();
      map.off("locationfound", handleLocationFound);
    };
  }, [map, onLocationFound]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  );
};

const RoutingOverlay = ({ origin, destination }: { origin: [number, number], destination: [number, number] }) => {
  const [route, setRoute] = useState<any>(null);
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      // Usamos OSRM por defecto (libre)
      const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
      
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRoute(coords);
          
          // Ajustar zoom para mostrar toda la ruta
          const bounds = L.latLngBounds([origin, destination, ...coords]);
          map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      } catch (err) {
        console.error("Error al trazar ruta inteligente:", err);
      }
    };

    fetchRoute();
  }, [origin, destination, map]);

  if (!route) return null;

  return (
    <Polyline 
      positions={route} 
      color="var(--accent)" 
      weight={5} 
      opacity={0.8} 
      lineJoin="round" 
    />
  );
};

export const MapaAura = ({ 
  center = [12.115, -86.236], 
  zoom = 13, 
  markers = [],
  route,
  onLocationFound,
  className = "h-[400px] w-full rounded-3xl"
}: MapaAuraProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const mapId = useId().replace(/:/g, "-");
  const [instanceKey] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
    
    // Cleanup definitivo para Leaflet en React 19
    return () => {
      const container = document.getElementById(mapId);
      if (container) {
        // @ts-ignore
        container._leaflet_id = null;
      }
    };
  }, [mapId]);

  // Iconos definidos dentro o garantizados de ser cliente-side
  const CourierIcon = L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative">
        <div className="absolute -inset-2 bg-accent/30 rounded-full animate-ping" />
        <div className="relative w-10 h-10 bg-accent rounded-2xl border-2 border-bg flex items-center justify-center shadow-glow-accent text-white">
          <Bike size={20} />
        </div>
      </div>
    ),
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  const UserIcon = L.divIcon({
    html: renderToStaticMarkup(
      <div className="w-10 h-10 bg-white rounded-2xl border-2 border-accent flex items-center justify-center shadow-xl text-accent">
        <Home size={20} />
      </div>
    ),
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  if (!isMounted) {
    return (
      <div className={`${className} bg-surface animate-pulse flex items-center justify-center border border-border`}>
        <span className="text-muted font-display text-sm uppercase tracking-widest italic">Sincronizando con Satélite Aura...</span>
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden border border-border-light shadow-2xl relative group`}>
      <MapContainer 
        id={mapId}
        key={instanceKey}
        center={center} 
        zoom={zoom} 
        zoomControl={false}
        className="h-full w-full grayscale-[0.2] contrast-[1.1]"
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {onLocationFound && <LocationMarker onLocationFound={onLocationFound} />}
        
        {route && !Array.isArray(route) && <RoutingOverlay origin={route.origin} destination={route.destination} />}
        {route && Array.isArray(route) && <Polyline positions={route} color="var(--accent)" weight={5} opacity={0.8} />}

        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={marker.type === 'courier' ? CourierIcon : UserIcon}
          >
            <Popup className="aura-popup">
              <div className="p-3 min-w-[180px] bg-bg text-text rounded-2xl">
                <h4 className="font-display text-accent font-bold text-sm mb-1 uppercase tracking-wider">{marker.title}</h4>
                {marker.description && <p className="text-[11px] text-muted leading-relaxed">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* UI Overlays */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
        <div className="px-4 py-2 bg-bg/80 backdrop-blur-md border border-border rounded-full flex items-center gap-2 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-text uppercase tracking-widest">En Vivo</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-accent/20 rounded-3xl z-[1000]" />
    </div>
  );
};

export default MapaAura;
