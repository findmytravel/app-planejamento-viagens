"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MapPin, Calendar, Users, DollarSign, Sparkles } from "lucide-react";
import { mockTrips } from "@/lib/mock-data";
import { formatDate, getTripDuration, formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Trip } from "@/lib/types";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Carregar viagens do localStorage + mockTrips
  useEffect(() => {
    const loadTrips = () => {
      try {
        // Carregar viagens salvas do Travel Match
        const savedTripsString = localStorage.getItem("myTrips");
        const savedTrips = savedTripsString ? JSON.parse(savedTripsString) : [];
        
        // Converter viagens do Travel Match para o formato Trip
        const convertedTrips: Trip[] = savedTrips.map((destination: any) => ({
          id: destination.id,
          name: destination.name,
          destination: `${destination.name}, ${destination.country}`,
          startDate: new Date().toISOString(), // Data atual como placeholder
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 dias
          status: 'planning' as const,
          coverImage: destination.imageUrl,
          totalBudget: destination.estimatedCost,
          spentAmount: 0,
          collaborators: [],
          itemsCount: destination.itinerary?.length || 0,
          description: destination.description,
        }));

        // Combinar com mockTrips
        const allTrips = [...convertedTrips, ...mockTrips];
        setTrips(allTrips);
      } catch (error) {
        console.error("Erro ao carregar viagens:", error);
        // Em caso de erro, usar apenas mockTrips
        setTrips(mockTrips);
      }
    };

    loadTrips();
  }, []);

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A6FF] to-blue-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00A6FF] to-blue-600 bg-clip-text text-transparent">
                FindMyTravel
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/new-trip")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Criar com IA
              </button>
              <button 
                onClick={() => router.push("/new-trip")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nova Viagem</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar viagens por destino ou nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Viagens</p>
                <p className="text-3xl font-bold text-gray-900">{trips.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#00A6FF]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Em Planejamento</p>
                <p className="text-3xl font-bold text-gray-900">
                  {trips.filter(t => t.status === 'planning').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {trips.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Minhas Viagens</h2>
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma viagem encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => router.push(`/trips/${trip.id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const duration = getTripDuration(trip.startDate, trip.endDate);
  const budgetPercentage = trip.totalBudget && trip.spentAmount 
    ? (trip.spentAmount / trip.totalBudget) * 100 
    : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
            {getStatusLabel(trip.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00A6FF] transition-colors">
          {trip.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-[#00A6FF]" />
          <span>{trip.destination}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4" suppressHydrationWarning>
          <Calendar className="w-4 h-4 text-gray-400" />
          <span suppressHydrationWarning>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          <span className="text-gray-400" suppressHydrationWarning>• {duration} dias</span>
        </div>

        {/* Budget Progress */}
        {trip.totalBudget && trip.spentAmount !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Orçamento</span>
              <span className="font-medium text-gray-900" suppressHydrationWarning>
                {formatCurrency(trip.spentAmount)} / {formatCurrency(trip.totalBudget)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetPercentage > 90 ? 'bg-red-500' : 'bg-[#00A6FF]'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{trip.collaborators.length} pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00A6FF]" />
            <span className="text-sm text-gray-600">{trip.itemsCount} itens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
