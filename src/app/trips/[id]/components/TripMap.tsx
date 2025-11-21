"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ItineraryItem } from "@/lib/types";
import { MapPin, Navigation } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Fix para os ícones do Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface TripMapProps {
  items: ItineraryItem[];
}

export default function TripMap({ items }: TripMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calcular o centro do mapa baseado nos itens
  const center: [number, number] = items.length > 0
    ? [
        items.reduce((sum, item) => sum + item.location.lat, 0) / items.length,
        items.reduce((sum, item) => sum + item.location.lng, 0) / items.length,
      ]
    : [48.8566, 2.3522]; // Paris como padrão

  // Criar linha de rota conectando os pontos
  const routeCoordinates: [number, number][] = items
    .sort((a, b) => a.order - b.order)
    .map(item => [item.location.lat, item.location.lng]);

  // Função para gerar link do Google Maps com rota
  const generateGoogleMapsUrl = () => {
    if (items.length === 0) return "#";

    const sortedItems = [...items].sort((a, b) => a.order - b.order);
    
    // Origem (primeiro ponto)
    const origin = `${sortedItems[0].location.lat},${sortedItems[0].location.lng}`;
    
    // Destino (último ponto)
    const destination = `${sortedItems[sortedItems.length - 1].location.lat},${sortedItems[sortedItems.length - 1].location.lng}`;
    
    // Waypoints (pontos intermediários)
    const waypoints = sortedItems
      .slice(1, -1)
      .map(item => `${item.location.lat},${item.location.lng}`)
      .join('|');
    
    // Construir URL do Google Maps
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    
    url += '&travelmode=driving';
    
    return url;
  };

  // Criar ícones customizados para cada tipo
  const createCustomIcon = (type: ItineraryItem['type'], color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); color: white; font-size: 20px;">
            ${getIconEmoji(type)}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const getIconEmoji = (type: ItineraryItem['type']) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      case 'transport': return '🚗';
      default: return '📍';
    }
  };

  const getMarkerColor = (type: ItineraryItem['type']) => {
    switch (type) {
      case 'hotel': return '#9333ea';
      case 'restaurant': return '#f97316';
      case 'attraction': return '#3b82f6';
      case 'transport': return '#22c55e';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    if (mapRef.current && items.length > 0) {
      const bounds = L.latLngBounds(items.map(item => [item.location.lat, item.location.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Adicione atividades para visualizar no mapa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Linha de rota */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#00A6FF"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Marcadores */}
        {items.map((item, index) => (
          <Marker
            key={item.id}
            position={[item.location.lat, item.location.lng]}
            icon={createCustomIcon(item.type, getMarkerColor(item.type))}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-[#00A6FF]">#{index + 1}</span>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                
                <div className="space-y-1 text-sm">
                  {item.startTime && (
                    <p className="text-gray-600">
                      ⏰ {item.startTime} {item.endTime && `- ${item.endTime}`}
                    </p>
                  )}
                  
                  {item.cost && (
                    <p className="font-semibold text-[#00A6FF]">
                      💰 {formatCurrency(item.cost)}
                    </p>
                  )}
                  
                  <p className="text-gray-500 text-xs mt-2">
                    📍 {item.location.address}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Botão para abrir rota no Google Maps */}
      <a
        href={generateGoogleMapsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 bg-[#00A6FF] hover:bg-[#0095E8] text-white px-4 py-2 rounded-lg shadow-lg z-[1000] flex items-center gap-2 transition-colors"
      >
        <Navigation className="w-4 h-4" />
        <span className="font-medium">Abrir Rota no Google Maps</span>
      </a>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legenda</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-gray-700">Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-gray-700">Restaurante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">Atração</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Transporte</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Rota otimizada</span> mostrada em azul
          </p>
        </div>
      </div>
    </div>
  );
}
