"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, DollarSign, Trash2, Eye, Sparkles } from "lucide-react";

interface SavedTrip {
  id: string;
  name: string;
  country: string;
  description: string;
  matchScore: number;
  imageUrl: string;
  estimatedCost: number;
  bestTimeToVisit: string;
  savedAt: string;
}

export default function MyTripsPage() {
  const router = useRouter();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    // Carrega as viagens salvas do localStorage
    const trips = JSON.parse(localStorage.getItem("myTrips") || "[]");
    setSavedTrips(trips);
  }, []);

  const handleDeleteTrip = (tripId: string) => {
    const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
    setSavedTrips(updatedTrips);
    localStorage.setItem("myTrips", JSON.stringify(updatedTrips));
  };

  const handleViewTrip = (tripId: string) => {
    // Redireciona para a página de detalhes da viagem
    router.push(`/trip/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A6FF] to-blue-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00A6FF] to-blue-600 bg-clip-text text-transparent">
                FindMyTravel
              </h1>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Minhas Viagens</h2>
          <p className="text-lg text-gray-600">
            Gerencie suas viagens salvas e planeje seus próximos destinos
          </p>
        </div>

        {savedTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhuma viagem salva ainda</h3>
            <p className="text-gray-600 mb-6">
              Comece criando uma nova viagem para ver suas recomendações aqui
            </p>
            <button
              onClick={() => router.push("/new-trip")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Criar Nova Viagem</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-[#00A6FF] transition-all"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.imageUrl}
                    alt={trip.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-[#00A6FF]" />
                      <span className="text-sm font-bold text-[#00A6FF]">{trip.matchScore}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{trip.country}</p>
                  <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <DollarSign className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Estimativa</p>
                      <p className="text-sm font-semibold text-gray-900">R$ {trip.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Melhor época</p>
                      <p className="text-sm font-semibold text-gray-900">{trip.bestTimeToVisit}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewTrip(trip.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#00A6FF] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalhes</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
