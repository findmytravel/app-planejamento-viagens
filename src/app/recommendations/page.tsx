"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Sparkles, Check, Loader2, AlertTriangle } from "lucide-react";
import { analyzeTravelPreferences } from "@/lib/ai-travel-analyzer";
import type { DestinationRecommendation, DayItinerary, Activity } from "@/lib/ai-travel-analyzer";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<DestinationRecommendation[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Recupera os dados do formulário do localStorage
        const formDataString = localStorage.getItem("travelMatchForm");
        
        if (!formDataString) {
          setError("Dados do formulário não encontrados. Por favor, preencha o questionário novamente.");
          setIsLoading(false);
          return;
        }

        const formData = JSON.parse(formDataString);
        
        // Chama a função de análise da IA
        const result = await analyzeTravelPreferences(formData);
        
        setRecommendations(result.destinations);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao gerar recomendações:", err);
        
        // Extrai mensagem de erro específica
        let errorMessage = "Erro ao gerar recomendações. Por favor, tente novamente.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    generateRecommendations();
  }, []);

  const handleSelectDestination = (destinationId: string) => {
    setSelectedDestination(destinationId);
  };

  const handleSaveToMyTrips = async () => {
    if (!selectedDestination) return;

    setIsSaving(true);
    
    try {
      const destination = recommendations.find(d => d.id === selectedDestination);
      
      if (!destination) {
        throw new Error("Destino não encontrado");
      }

      // Salva a viagem no localStorage (posteriormente será no banco de dados)
      const savedTrips = JSON.parse(localStorage.getItem("myTrips") || "[]");
      savedTrips.push({
        ...destination,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem("myTrips", JSON.stringify(savedTrips));
      
      setIsSaving(false);
      // Redireciona para a página inicial em vez de /my-trips
      router.push("/");
    } catch (err) {
      console.error("Erro ao salvar viagem:", err);
      setIsSaving(false);
      alert("Erro ao salvar viagem. Por favor, tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A6FF] to-blue-600 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Analisando suas preferências...</h2>
          <p className="text-gray-600 mb-6">Nossa IA está encontrando os destinos perfeitos para você</p>
          <Loader2 className="w-8 h-8 text-[#00A6FF] animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/new-trip")}
            className="px-6 py-3 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Voltar ao questionário
          </button>
        </div>
      </div>
    );
  }

  const selectedDestinationData = recommendations.find(d => d.id === selectedDestination);

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
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Análise Completa</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Seus Destinos Ideais</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Com base nas suas preferências, nossa IA selecionou 3 destinos perfeitos para você. 
            Cada um com roteiro completo e personalizado.
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {recommendations.map((destination) => (
            <div
              key={destination.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all cursor-pointer ${
                selectedDestination === destination.id
                  ? 'border-[#00A6FF] ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelectDestination(destination.id)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#00A6FF]" />
                    <span className="text-sm font-bold text-[#00A6FF]">{destination.matchScore}% Match</span>
                  </div>
                </div>
                {selectedDestination === destination.id && (
                  <div className="absolute top-4 left-4 bg-[#00A6FF] text-white p-2 rounded-full shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{destination.country}</p>
                <p className="text-gray-600 mb-4 line-clamp-3">{destination.description}</p>

                {/* Highlights */}
                <div className="space-y-2 mb-4">
                  {destination.highlights.slice(0, 3).map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Estimativa</p>
                    <p className="text-sm font-semibold text-gray-900">R$ {destination.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Melhor época</p>
                    <p className="text-sm font-semibold text-gray-900">{destination.bestTimeToVisit}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed View */}
        {selectedDestinationData && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#00A6FF] p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedDestinationData.name}</h3>
                <p className="text-gray-600">{selectedDestinationData.description}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <Sparkles className="w-5 h-5 text-[#00A6FF]" />
                <span className="font-bold text-[#00A6FF]">{selectedDestinationData.matchScore}% Match</span>
              </div>
            </div>

            {/* Safety Warnings */}
            {selectedDestinationData.safetyWarnings && selectedDestinationData.safetyWarnings.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Avisos Importantes</h4>
                    <ul className="space-y-1">
                      {selectedDestinationData.safetyWarnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-800">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Weather and Sea Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Informações Climáticas</h4>
                <p className="text-sm text-gray-700">{selectedDestinationData.weatherInfo}</p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-medium">Melhor época:</span> {selectedDestinationData.bestTimeToVisit}
                </p>
              </div>
              
              {selectedDestinationData.seaConditions && (
                <div className="p-4 bg-cyan-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Condições do Mar</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Temperatura:</span> {selectedDestinationData.seaConditions.temperature}</p>
                    <p><span className="font-medium">Ondas:</span> {selectedDestinationData.seaConditions.waveConditions}</p>
                    <p><span className="font-medium">Cor da água:</span> {selectedDestinationData.seaConditions.waterColor}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Itinerary */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Roteiro Completo</h4>
              <div className="space-y-6">
                {selectedDestinationData.itinerary.map((day) => (
                  <div key={day.day} className="border-l-4 border-[#00A6FF] pl-6">
                    <h5 className="text-xl font-bold text-gray-900 mb-4">
                      Dia {day.day}: {day.title}
                    </h5>
                    <div className="space-y-4">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-20 text-sm font-semibold text-[#00A6FF]">
                            {activity.time}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h6 className="font-semibold text-gray-900">{activity.name}</h6>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {activity.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSaveToMyTrips}
                disabled={isSaving}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg font-semibold">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    <span className="text-lg font-semibold">Adicionar a Minhas Viagens</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CTA when no selection */}
        {!selectedDestination && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">
              Selecione um destino acima para ver o roteiro completo
            </p>
            <div className="flex items-center justify-center gap-2 text-[#00A6FF]">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Clique em qualquer card para começar</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
