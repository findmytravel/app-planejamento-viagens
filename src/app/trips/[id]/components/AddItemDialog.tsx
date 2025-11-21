"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Clock, Loader2, Search, Tag } from "lucide-react";
import { ItineraryItem } from "@/lib/types";

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    place: string;
    time: string;
    endTime: string;
    address: string;
    lat: number;
    lng: number;
    category: string;
  }) => void;
  editingItem?: ItineraryItem | null;
}

interface PlaceSuggestion {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

// Declaração global para Google Maps
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

export default function AddItemDialog({ isOpen, onClose, onAdd, editingItem }: AddItemDialogProps) {
  const [place, setPlace] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [category, setCategory] = useState("Atração");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingItem) {
      setPlace(editingItem.name);
      setTime(editingItem.startTime || "");
      setEndTime(editingItem.endTime || "");
      setAddress(editingItem.location.address);
      setLat(editingItem.location.lat);
      setLng(editingItem.location.lng);
      
      // Mapear tipo para categoria
      const categoryMap: Record<string, string> = {
        'hotel': 'Hospedagem',
        'restaurant': 'Restaurante',
        'attraction': 'Atração',
        'transport': 'Transporte',
      };
      setCategory(categoryMap[editingItem.type] || 'Atração');
    } else {
      // Limpar formulário quando não estiver editando
      setPlace("");
      setTime("");
      setEndTime("");
      setAddress("");
      setLat(0);
      setLng(0);
      setCategory("Atração");
    }
  }, [editingItem, isOpen]);

  // Carregar Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsGoogleLoaded(true);
      initializeGoogleServices();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBZxNUxKCo9bISiXV2eoWTEmqZOM9_WV7M&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
      initializeGoogleServices();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup não remove o script para evitar recarregamentos
    };
  }, []);

  const initializeGoogleServices = () => {
    if (window.google && window.google.maps) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  };

  // Buscar sugestões de locais usando Google Places API
  useEffect(() => {
    if (!isGoogleLoaded || place.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Reativa as sugestões quando o usuário altera o texto
    setShowSuggestions(true);

    const searchPlaces = async () => {
      setIsSearching(true);
      
      try {
        if (!autocompleteServiceRef.current) {
          initializeGoogleServices();
        }

        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: place,
            types: ["establishment", "geocode"],
          },
          (predictions: any[], status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const placeSuggestions: PlaceSuggestion[] = predictions.map((prediction) => ({
                name: prediction.structured_formatting.main_text,
                address: prediction.description,
                lat: 0, // Será preenchido ao selecionar
                lng: 0, // Será preenchido ao selecionar
                placeId: prediction.place_id,
              }));

              setSuggestions(placeSuggestions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
            setIsSearching(false);
          }
        );
      } catch (error) {
        console.error("Erro ao buscar locais:", error);
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPlaces, 500);
    return () => clearTimeout(debounceTimer);
  }, [place, isGoogleLoaded]);

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setPlace(suggestion.name);
    setAddress(suggestion.address);
    setShowSuggestions(false);
    setSuggestions([]); // Limpa as sugestões após seleção
    setIsSearching(true);

    // Obter detalhes do local (incluindo coordenadas)
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ["geometry", "formatted_address"],
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setLat(place.geometry.location.lat());
            setLng(place.geometry.location.lng());
            setAddress(place.formatted_address);
          }
          setIsSearching(false);
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!place || !time || !endTime || !address || !category) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    onAdd({
      place,
      time,
      endTime,
      address,
      lat,
      lng,
      category,
    });

    // Limpar formulário
    setPlace("");
    setTime("");
    setEndTime("");
    setAddress("");
    setLat(0);
    setLng(0);
    setCategory("Atração");
    setSuggestions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingItem ? "Editar Item" : "Adicionar Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo Lugar */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Lugar *
            </label>
            <div className="relative">
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Digite o nome do local..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent transition-all"
                required
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A6FF] animate-spin" />
              )}
            </div>

            {/* Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#00A6FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{suggestion.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{suggestion.address}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {isGoogleLoaded 
                ? "Digite pelo menos 3 caracteres para buscar locais no Google" 
                : "Carregando Google Places..."}
            </p>
          </div>

          {/* Campo Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Categoria *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent transition-all appearance-none bg-white"
                required
              >
                <option value="Hospedagem">Hospedagem</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Atração">Atração</option>
                <option value="Transporte">Transporte</option>
              </select>
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Campo Horário Inicial */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Horário Inicial *
            </label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent transition-all"
                required
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Campo Horário Final */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Horário Final *
            </label>
            <div className="relative">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent transition-all"
                required
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Campo Endereço */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Endereço *
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Endereço completo"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent transition-all"
                required
                readOnly={lat !== 0 && lng !== 0}
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {lat !== 0 && lng !== 0 && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ Endereço preenchido automaticamente pelo Google
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              {editingItem ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
