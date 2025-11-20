"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, MapPin, Users, DollarSign, 
  Plus, Map as MapIcon, List, Grid3x3, Sparkles,
  Clock, UtensilsCrossed, Hotel, Landmark, Navigation
} from "lucide-react";
import { mockTrips, mockItinerary } from "@/lib/mock-data";
import { ItineraryItem } from "@/lib/types";
import { formatDate, getTripDuration, formatCurrency } from "@/lib/utils";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dynamic from "next/dynamic";

// Importar o mapa dinamicamente para evitar problemas de SSR
const TripMap = dynamic(() => import("./components/TripMap"), { ssr: false });

type ViewMode = "timeline" | "calendar" | "map";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  
  const trip = mockTrips.find(t => t.id === tripId);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(mockItinerary);
  const [selectedDay, setSelectedDay] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Viagem não encontrada</h2>
          <button 
            onClick={() => router.push("/")}
            className="text-[#00A6FF] hover:underline"
          >
            Voltar para início
          </button>
        </div>
      </div>
    );
  }

  const duration = getTripDuration(trip.startDate, trip.endDate);
  const days = Array.from({ length: duration }, (_, i) => i + 1);
  
  const dayItems = useMemo(() => {
    return itinerary.filter(item => item.day === selectedDay);
  }, [itinerary, selectedDay]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    setItinerary((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      
      // Atualizar a ordem
      return newItems.map((item, index) => ({
        ...item,
        order: item.day === selectedDay ? index : item.order
      }));
    });
  };

  const optimizeRoute = () => {
    // Algoritmo simples de otimização baseado em proximidade
    const dayItemsCopy = [...dayItems];
    const optimized: ItineraryItem[] = [];
    
    if (dayItemsCopy.length === 0) return;
    
    // Começar com o primeiro item
    optimized.push(dayItemsCopy.shift()!);
    
    // Encontrar o próximo item mais próximo
    while (dayItemsCopy.length > 0) {
      const lastItem = optimized[optimized.length - 1];
      let closestIndex = 0;
      let minDistance = Infinity;
      
      dayItemsCopy.forEach((item, index) => {
        const distance = Math.sqrt(
          Math.pow(item.location.lat - lastItem.location.lat, 2) +
          Math.pow(item.location.lng - lastItem.location.lng, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      optimized.push(dayItemsCopy.splice(closestIndex, 1)[0]);
    }
    
    // Atualizar o itinerário com a ordem otimizada
    setItinerary(prev => {
      const otherDays = prev.filter(item => item.day !== selectedDay);
      const optimizedWithOrder = optimized.map((item, index) => ({
        ...item,
        order: index
      }));
      return [...otherDays, ...optimizedWithOrder].sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.order - b.order;
      });
    });
  };

  const totalDayCost = dayItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-sm text-gray-600">{trip.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Users className="w-4 h-4" />
                Compartilhar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Adicionar Item</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Info Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#00A6FF]" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Duração</p>
                <p className="text-sm font-semibold text-gray-900">{duration} dias</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Destino</p>
                <p className="text-sm font-semibold text-gray-900">{trip.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Viajantes</p>
                <p className="text-sm font-semibold text-gray-900">{trip.collaborators.length} pessoas</p>
              </div>
            </div>
            
            {trip.totalBudget && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Orçamento</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(trip.totalBudget)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Days Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dias da Viagem</h3>
              <div className="space-y-2">
                {days.map(day => {
                  const dayItemsCount = itinerary.filter(item => item.day === day).length;
                  const dayCost = itinerary
                    .filter(item => item.day === day)
                    .reduce((sum, item) => sum + (item.cost || 0), 0);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedDay === day
                          ? 'bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Dia {day}</span>
                        <span className="text-sm opacity-90">{dayItemsCount} itens</span>
                      </div>
                      <div className="text-sm opacity-90">
                        {dayCost > 0 && formatCurrency(dayCost)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* View Mode Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Dia {selectedDay}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "timeline"
                        ? 'bg-[#00A6FF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "calendar"
                        ? 'bg-[#00A6FF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "map"
                        ? 'bg-[#00A6FF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {viewMode === "timeline" && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total do dia: <span className="font-semibold text-gray-900">{formatCurrency(totalDayCost)}</span>
                  </div>
                  <button
                    onClick={optimizeRoute}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Otimizar Rota
                  </button>
                </div>
              )}
            </div>

            {/* Content Based on View Mode */}
            {viewMode === "timeline" && (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={dayItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {dayItems.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhuma atividade planejada para este dia</p>
                        <button className="px-4 py-2 bg-[#00A6FF] text-white rounded-lg hover:shadow-lg transition-all">
                          Adicionar Atividade
                        </button>
                      </div>
                    ) : (
                      dayItems.map((item) => (
                        <SortableItineraryItem key={item.id} item={item} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {viewMode === "calendar" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#00A6FF] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getItemTypeColor(item.type)}`}>
                          {getItemTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                          {item.startTime && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.startTime}
                            </p>
                          )}
                          {item.cost && (
                            <p className="text-sm font-medium text-[#00A6FF] mt-1">
                              {formatCurrency(item.cost)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <TripMap items={dayItems} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableItineraryItem({ item }: { item: ItineraryItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getItemTypeColor(item.type)}`}>
          {getItemTypeIcon(item.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
            {item.cost && (
              <div className="text-right">
                <p className="text-lg font-bold text-[#00A6FF]">{formatCurrency(item.cost)}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {item.startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.startTime} {item.endTime && `- ${item.endTime}`}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{item.location.address}</span>
            </div>
            
            {item.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.duration} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getItemTypeIcon(type: ItineraryItem['type']) {
  switch (type) {
    case 'hotel':
      return <Hotel className="w-6 h-6 text-white" />;
    case 'restaurant':
      return <UtensilsCrossed className="w-6 h-6 text-white" />;
    case 'attraction':
      return <Landmark className="w-6 h-6 text-white" />;
    case 'transport':
      return <Navigation className="w-6 h-6 text-white" />;
    default:
      return <MapPin className="w-6 h-6 text-white" />;
  }
}

function getItemTypeColor(type: ItineraryItem['type']) {
  switch (type) {
    case 'hotel':
      return 'bg-gradient-to-br from-purple-500 to-purple-600';
    case 'restaurant':
      return 'bg-gradient-to-br from-orange-500 to-orange-600';
    case 'attraction':
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    case 'transport':
      return 'bg-gradient-to-br from-green-500 to-green-600';
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600';
  }
}
