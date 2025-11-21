"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, DollarSign, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface DayActivity {
  time: string;
  activity: string;
  description: string;
}

interface TripDetails {
  id: string;
  name: string;
  country: string;
  description: string;
  whyPerfect: string;
  estimatedCost: number;
  bestTimeToVisit: string;
  imageUrl: string;
  itinerary: {
    [day: string]: DayActivity[];
  };
  warnings?: string[];
  matchScore: number;
}

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");

  useEffect(() => {
    const tripId = params.id as string;
    const savedTrips = JSON.parse(localStorage.getItem("myTrips") || "[]");
    const foundTrip = savedTrips.find((t: TripDetails) => t.id === tripId);
    
    if (foundTrip) {
      setTrip(foundTrip);
      // Seleciona o primeiro dia por padrão
      const firstDay = Object.keys(foundTrip.itinerary)[0];
      setSelectedDay(firstDay);
    }
  }, [params.id]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando detalhes da viagem...</p>
        </div>
      </div>
    );
  }

  const days = Object.keys(trip.itinerary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/my-trips")}
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

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={trip.imageUrl}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-bold text-[#00A6FF]">{trip.matchScore}% Match</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">{trip.name}</h1>
            <p className="text-xl text-white/90">{trip.country}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre o Destino</h2>
              <p className="text-gray-600 mb-4">{trip.description}</p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#00A6FF] mb-2">Por que é perfeito para você:</p>
                <p className="text-sm text-gray-700">{trip.whyPerfect}</p>
              </div>
            </div>

            {/* Warnings */}
            {trip.warnings && trip.warnings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Avisos Importantes</h3>
                    <ul className="space-y-2">
                      {trip.warnings.map((warning, idx) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-[#00A6FF]" />
                <h3 className="text-lg font-bold text-gray-900">Custo Estimado</h3>
              </div>
              <p className="text-3xl font-bold text-[#00A6FF]">
                R$ {trip.estimatedCost.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">Valor aproximado por pessoa</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-[#00A6FF]" />
                <h3 className="text-lg font-bold text-gray-900">Melhor Época</h3>
              </div>
              <p className="text-xl font-semibold text-gray-900">{trip.bestTimeToVisit}</p>
              <p className="text-sm text-gray-500 mt-2">Período ideal para visitar</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-[#00A6FF]" />
                <h3 className="text-lg font-bold text-gray-900">Duração</h3>
              </div>
              <p className="text-xl font-semibold text-gray-900">{days.length} dias</p>
              <p className="text-sm text-gray-500 mt-2">Roteiro completo planejado</p>
            </div>
          </div>
        </div>

        {/* Itinerary Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Roteiro Dia a Dia</h2>
          
          {/* Day Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? "bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Activities for Selected Day */}
          <div className="space-y-4">
            {trip.itinerary[selectedDay]?.map((activity, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#00A6FF] flex items-center justify-center">
                    <span className="text-white font-bold">{activity.time}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{activity.activity}</h3>
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
