"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  }>;
  onLocationFound?: (lat: number, lng: number) => void;
  className?: string;
}

const LocationMarker = ({ onLocationFound }: { onLocationFound?: (lat: number, lng: number) => void }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onLocationFound) onLocationFound(e.latlng.lat, e.latlng.lng);
    });
  }, [map, onLocationFound]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Tu ubicación actual</Popup>
    </Marker>
  );
};

export const MapaAura = ({ 
  center = [12.115, -86.236], // Managua por defecto
  zoom = 13, 
  markers = [],
  onLocationFound,
  className = "h-[400px] w-full rounded-3xl"
}: MapaAuraProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`${className} bg-surface animate-pulse flex items-center justify-center border border-border`}>
        <span className="text-muted font-display text-sm uppercase tracking-widest">Sincronizando Mapa Aura...</span>
      </div>
    );
  }

  const isDark = theme === "dark";
  const tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className={`${className} overflow-hidden border border-border shadow-glow-accent/5 relative`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ 
          filter: isDark 
            ? "hue-rotate(100deg) saturate(0.8) brightness(0.9) contrast(1.1)" 
            : "hue-rotate(100deg) saturate(0.3) brightness(1.05)"
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        
        {onLocationFound && <LocationMarker onLocationFound={onLocationFound} />}

        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div className="p-2 min-w-[150px]">
                <h4 className="font-bold text-accent mb-1">{marker.title}</h4>
                {marker.description && <p className="text-xs text-muted-foreground">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay Glow effect */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-accent/10 rounded-3xl z-[1000]" />
    </div>
  );
};

export default MapaAura;
