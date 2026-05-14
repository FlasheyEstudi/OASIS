"use client";

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, Navigation } from 'lucide-react';

export function MapaAura({ centro = [12.1328, -86.2504], marcadores = [] }: { centro?: [number, number], marcadores?: any[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const initializationRef = useRef<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Pedir permiso de ubicación al montar
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.warn("Permiso de ubicación denegado", err)
      );
    }
  }, []);

  useEffect(() => {
    if (initializationRef.current || mapInstanceRef.current) return;
    initializationRef.current = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!mapContainerRef.current) return;

        mapContainerRef.current.innerHTML = '';
        
        // Inicializar mapa con estilo oscuro (usando filtros CSS en la capa)
        const map = L.map(mapContainerRef.current, {
          center: centro,
          zoom: 15,
          zoomControl: false,
          attributionControl: false
        });

        // Capa de Mapa con filtro oscuro vía CSS
        const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
        }).addTo(map);

        // Iconos personalizados
        const IconoRepartidor = L.divIcon({
          html: `<div class="w-10 h-10 bg-primary rounded-full border-4 border-black flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse text-black">🛵</div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const IconoUsuario = L.divIcon({
          html: `<div class="w-10 h-10 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center shadow-lg shadow-blue-500/40 text-white">🏠</div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        // Dibujar ruta (Polyline) entre usuario y repartidor si ambos existen
        if (userPos) {
          L.marker(userPos, { icon: IconoUsuario }).addTo(map).bindPopup("Tu Ubicación");
          
          marcadores.forEach(m => {
            L.marker(m.pos, { icon: IconoRepartidor }).addTo(map).bindPopup(m.nombre);
            
            // Trazado de ruta pulido
            L.polyline([userPos, m.pos], {
              color: '#00ffa3',
              weight: 4,
              opacity: 0.6,
              dashArray: '10, 10',
              lineJoin: 'round'
            }).addTo(map);
          });
          
          // Ajustar vista para ver ambos
          const bounds = L.latLngBounds([userPos, ...marcadores.map(m => m.pos)]);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          // Si no hay posición de usuario, solo mostrar marcadores originales
          marcadores.forEach(m => {
            L.marker(m.pos, { icon: IconoRepartidor }).addTo(map).bindPopup(m.nombre);
          });
        }

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (error) {
        console.error("Error Map:", error);
        initializationRef.current = false;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initializationRef.current = false;
    };
  }, [userPos, marcadores]);

  return (
    <div className="w-full h-full relative bg-[#0a0a0a] group">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Calculando Ruta Aura...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0" 
      />
      
      {/* Botón de centrado rápido */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
        <button className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-primary tap-active">
          <Navigation className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]" />
    </div>
  );
}
