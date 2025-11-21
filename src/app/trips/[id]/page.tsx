"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, MapPin, Users, DollarSign, 
  Plus, Map as MapIcon, List,
  Clock, UtensilsCrossed, Hotel, Landmark, Navigation,
  Pencil, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";
import { mockTrips, mockItinerary } from "@/lib/mock-data";
import { ItineraryItem, Expense, ItemExpense } from "@/lib/types";
import { formatDate, getTripDuration, formatCurrency } from "@/lib/utils";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dynamic from "next/dynamic";
import AddItemDialog from "./components/AddItemDialog";
import AddExpenseDialog from "./components/AddExpenseDialog";

// Importar o mapa dinamicamente para evitar problemas de SSR
const TripMap = dynamic(() => import("./components/TripMap"), { ssr: false });

type ViewMode = "list" | "map";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  
  const trip = mockTrips.find(t => t.id === tripId);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(mockItinerary);
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [selectedItemForExpense, setSelectedItemForExpense] = useState<string | null>(null);
  const [dayNames, setDayNames] = useState<Record<number, string>>({});
  const [editingDayName, setEditingDayName] = useState<number | null>(null);

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

  // Calcular total gasto (soma de todos os gastos de todos os itens)
  const totalSpent = useMemo(() => {
    return itinerary.reduce((total, item) => {
      const itemExpenses = item.expenses || [];
      const itemTotal = itemExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return total + itemTotal;
    }, 0);
  }, [itinerary]);

  // Calcular valor restante
  const remainingBudget = useMemo(() => {
    if (!trip.totalBudget) return 0;
    return trip.totalBudget - totalSpent;
  }, [trip.totalBudget, totalSpent]);

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

  const totalDayCost = dayItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  const handleAddItem = (newItem: {
    place: string;
    time: string;
    endTime: string;
    address: string;
    lat: number;
    lng: number;
    category: string;
  }) => {
    // Mapear categoria para tipo
    const typeMap: Record<string, ItineraryItem['type']> = {
      'Hospedagem': 'hotel',
      'Restaurante': 'restaurant',
      'Atração': 'attraction',
      'Transporte': 'transport',
    };

    if (editingItem) {
      // Editar item existente
      setItinerary(prev => prev.map(item => 
        item.id === editingItem.id 
          ? {
              ...item,
              name: newItem.place,
              type: typeMap[newItem.category] || "attraction",
              startTime: newItem.time,
              endTime: newItem.endTime,
              location: {
                lat: newItem.lat,
                lng: newItem.lng,
                address: newItem.address,
              },
            }
          : item
      ));
      setEditingItem(null);
    } else {
      // Adicionar novo item
      const newItineraryItem: ItineraryItem = {
        id: `item-${Date.now()}`,
        name: newItem.place,
        description: "",
        type: typeMap[newItem.category] || "attraction",
        day: selectedDay,
        startTime: newItem.time,
        endTime: newItem.endTime,
        location: {
          lat: newItem.lat,
          lng: newItem.lng,
          address: newItem.address,
        },
        order: dayItems.length,
        tripId: tripId,
        expenses: [],
      };

      setItinerary([...itinerary, newItineraryItem]);
    }
    
    setIsAddDialogOpen(false);
  };

  const handleEditItem = (item: ItineraryItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleAddExpense = (newExpense: {
    description: string;
    amount: number;
    paidBy: string;
  }) => {
    if (selectedItemForExpense) {
      // Adicionar gasto ao item específico
      const itemExpense: ItemExpense = {
        id: `expense-${Date.now()}`,
        description: newExpense.description,
        amount: newExpense.amount,
        paidBy: newExpense.paidBy,
        date: new Date().toISOString(),
      };

      setItinerary(prev => prev.map(item => 
        item.id === selectedItemForExpense
          ? {
              ...item,
              expenses: [...(item.expenses || []), itemExpense]
            }
          : item
      ));
    }

    setIsAddExpenseDialogOpen(false);
    setSelectedItemForExpense(null);
  };

  const handleOpenExpenseDialog = (itemId: string) => {
    setSelectedItemForExpense(itemId);
    setIsAddExpenseDialogOpen(true);
  };

  const handleCloseExpenseDialog = () => {
    setIsAddExpenseDialogOpen(false);
    setSelectedItemForExpense(null);
  };

  // Calcular total de gastos de um item específico
  const getItemTotalExpenses = (item: ItineraryItem) => {
    if (!item.expenses || item.expenses.length === 0) return 0;
    return item.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Calcular total de gastos de um dia específico
  const getDayTotalExpenses = (day: number) => {
    const dayItemsForDay = itinerary.filter(item => item.day === day);
    return dayItemsForDay.reduce((total, item) => {
      return total + getItemTotalExpenses(item);
    }, 0);
  };

  // Toggle expand/collapse do dia no mobile
  const toggleDayExpand = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
    setSelectedDay(day);
  };

  // Editar nome do dia
  const handleEditDayName = (day: number) => {
    setEditingDayName(day);
  };

  const handleSaveDayName = (day: number, name: string) => {
    setDayNames(prev => ({
      ...prev,
      [day]: name
    }));
    setEditingDayName(null);
  };

  const getDayName = (day: number) => {
    return dayNames[day] || `Dia ${day}`;
  };

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
              <button 
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Orçamento</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(trip.totalBudget)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Gasto</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalSpent)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                    <DollarSign className={`w-5 h-5 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Restante</p>
                    <p className={`text-sm font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(remainingBudget))}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Days Navigation (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dias da Viagem</h3>
              <div className="space-y-2">
                {days.map(day => {
                  const dayItemsCount = itinerary.filter(item => item.day === day).length;
                  const dayTotalExpenses = getDayTotalExpenses(day);
                  
                  return (
                    <div key={day} className="space-y-2">
                      <button
                        onClick={() => setSelectedDay(day)}
                        className={`w-full text-left p-4 rounded-lg transition-all ${
                          selectedDay === day
                            ? 'bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            {editingDayName === day ? (
                              <input
                                type="text"
                                defaultValue={getDayName(day)}
                                onBlur={(e) => handleSaveDayName(day, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveDayName(day, e.currentTarget.value);
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A6FF]"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="font-semibold">{getDayName(day)}</span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDayName(day);
                              }}
                              className={`p-1 rounded hover:bg-white/20 transition-colors ${
                                selectedDay === day ? 'text-white' : 'text-gray-600'
                              }`}
                              title="Editar nome do dia"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm opacity-90">{dayItemsCount} itens</span>
                        </div>
                        <div className="text-sm opacity-90">
                          {dayTotalExpenses > 0 && formatCurrency(dayTotalExpenses)}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Days Navigation */}
          <div className="lg:hidden space-y-3">
            {days.map(day => {
              const dayItemsForDay = itinerary.filter(item => item.day === day);
              const dayItemsCount = dayItemsForDay.length;
              const dayTotalExpenses = getDayTotalExpenses(day);
              const isExpanded = expandedDay === day;
              
              return (
                <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Card Header - Clicável */}
                  <button
                    onClick={() => toggleDayExpand(day)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {editingDayName === day ? (
                            <input
                              type="text"
                              defaultValue={getDayName(day)}
                              onBlur={(e) => handleSaveDayName(day, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveDayName(day, e.currentTarget.value);
                                }
                              }}
                              className="flex-1 px-2 py-1 text-sm bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A6FF]"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="font-semibold text-gray-900">{getDayName(day)}</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDayName(day);
                            }}
                            className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
                            title="Editar nome do dia"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm text-gray-600">{dayItemsCount} itens</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {dayTotalExpenses > 0 && formatCurrency(dayTotalExpenses)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 ml-3" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 ml-3" />
                    )}
                  </button>

                  {/* Card Content - Expandido */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 space-y-3">
                      {/* View Mode Selector */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Atividades</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-colors ${
                              viewMode === "list"
                                ? 'bg-[#00A6FF] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewMode("map")}
                            className={`p-2 rounded-lg transition-colors ${
                              viewMode === "map"
                                ? 'bg-[#00A6FF] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <MapIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      {viewMode === "list" ? (
                        <div className="space-y-3">
                          {dayItemsForDay.length === 0 ? (
                            <div className="text-center py-8">
                              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-600 text-sm mb-3">Nenhuma atividade planejada</p>
                              <button 
                                onClick={() => setIsAddDialogOpen(true)}
                                className="px-4 py-2 bg-[#00A6FF] text-white rounded-lg text-sm hover:shadow-lg transition-all"
                              >
                                Adicionar Atividade
                              </button>
                            </div>
                          ) : (
                            dayItemsForDay.map((item) => (
                              <MobileItineraryItem 
                                key={item.id} 
                                item={item} 
                                onEdit={handleEditItem}
                                onOpenMaps={openInGoogleMaps}
                                onAddExpense={handleOpenExpenseDialog}
                                totalExpenses={getItemTotalExpenses(item)}
                              />
                            ))
                          )}
                        </div>
                      ) : (
                        <div className="h-[400px] rounded-lg overflow-hidden">
                          <TripMap items={dayItemsForDay} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Content Area (Desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            {/* View Mode Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{getDayName(selectedDay)}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? 'bg-[#00A6FF] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-5 h-5" />
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
              
              {viewMode === "list" && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total do dia: <span className="font-semibold text-gray-900">{formatCurrency(getDayTotalExpenses(selectedDay))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Content Based on View Mode */}
            {viewMode === "list" && (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={dayItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {dayItems.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhuma atividade planejada para este dia</p>
                        <button 
                          onClick={() => setIsAddDialogOpen(true)}
                          className="px-4 py-2 bg-[#00A6FF] text-white rounded-lg hover:shadow-lg transition-all"
                        >
                          Adicionar Atividade
                        </button>
                      </div>
                    ) : (
                      dayItems.map((item) => (
                        <SortableItineraryItem 
                          key={item.id} 
                          item={item} 
                          onEdit={handleEditItem}
                          onOpenMaps={openInGoogleMaps}
                          onAddExpense={handleOpenExpenseDialog}
                          totalExpenses={getItemTotalExpenses(item)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {viewMode === "map" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <TripMap items={dayItems} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de Adicionar/Editar Item */}
      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        onAdd={handleAddItem}
        editingItem={editingItem}
      />

      {/* Dialog de Adicionar Gasto */}
      <AddExpenseDialog
        isOpen={isAddExpenseDialogOpen}
        onClose={handleCloseExpenseDialog}
        onAdd={handleAddExpense}
        collaborators={trip?.collaborators.map(c => c.name) || []}
      />
    </div>
  );
}

// Componente para Mobile (sem drag and drop)
function MobileItineraryItem({ 
  item, 
  onEdit,
  onOpenMaps,
  onAddExpense,
  totalExpenses
}: { 
  item: ItineraryItem;
  onEdit: (item: ItineraryItem) => void;
  onOpenMaps: (lat: number, lng: number) => void;
  onAddExpense: (itemId: string) => void;
  totalExpenses: number;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getItemTypeColor(item.type)}`}>
          {getItemTypeIcon(item.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 truncate">{item.name}</h4>
              {item.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Editar item"
              >
                <Pencil className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600">
            {item.startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.startTime} {item.endTime && `- ${item.endTime}`}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.location.address}</span>
              </div>
              <button
                onClick={() => onOpenMaps(item.location.lat, item.location.lng)}
                className="p-1 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                title="Abrir no Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#00A6FF]" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-300">
              <span className="font-semibold text-[#00A6FF]">{formatCurrency(totalExpenses)}</span>
              <button
                onClick={() => onAddExpense(item.id)}
                className="px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1"
                title="Adicionar gasto"
              >
                <Plus className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-600">Gasto</span>
              </button>
            </div>
          </div>

          {/* Lista de gastos do item */}
          {item.expenses && item.expenses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs font-semibold text-gray-700 mb-2">Gastos:</p>
              <div className="space-y-1.5">
                {item.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-xs text-gray-600 bg-white rounded px-2 py-1.5">
                    <span className="truncate flex-1">{expense.description} - {expense.paidBy}</span>
                    <span className="font-medium text-gray-900 ml-2">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para Desktop (com drag and drop)
function SortableItineraryItem({ 
  item, 
  onEdit,
  onOpenMaps,
  onAddExpense,
  totalExpenses
}: { 
  item: ItineraryItem;
  onEdit: (item: ItineraryItem) => void;
  onOpenMaps: (lat: number, lng: number) => void;
  onAddExpense: (itemId: string) => void;
  totalExpenses: number;
}) {
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
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div 
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 cursor-move ${getItemTypeColor(item.type)}`}
          {...attributes}
          {...listeners}
        >
          {getItemTypeIcon(item.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-lg font-bold text-[#00A6FF]">{formatCurrency(totalExpenses)}</p>
              </div>
              <button
                onClick={() => onAddExpense(item.id)}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                title="Adicionar gasto"
              >
                <Plus className="w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar item"
              >
                <Pencil className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {item.startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.startTime} {item.endTime && `- ${item.endTime}`}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{item.location.address}</span>
              </div>
              <button
                onClick={() => onOpenMaps(item.location.lat, item.location.lng)}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
                title="Abrir no Google Maps"
              >
                <ExternalLink className="w-4 h-4 text-[#00A6FF]" />
              </button>
            </div>
            
            {item.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.duration} min</span>
              </div>
            )}
          </div>

          {/* Lista de gastos do item */}
          {item.expenses && item.expenses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Gastos:</p>
              <div className="space-y-1">
                {item.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-xs text-gray-600">
                    <span>{expense.description} - {expense.paidBy}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
