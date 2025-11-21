"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles, Loader2, ThermometerSun, Waves, CloudRain, AlertTriangle, DollarSign, Calendar, TrendingUp, Check } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  compatibilityScore: number;
  imageUrl: string;
  climate: {
    avgTemp: string;
    seaTemp: string;
    waveLevel: string;
    rainfall: string;
  };
  risks: {
    level: "low" | "medium" | "high";
    description: string;
  };
  estimatedCost: number;
  highlights: string[];
  itinerary: Array<{
    day: number;
    activities: Array<{
      time: string;
      activity: string;
      description: string;
      alternative?: string;
    }>;
  }>;
  bestTime: string;
  crowdLevel: string;
}

export default function AIResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const generateResults = async () => {
      try {
        // Recuperar dados do localStorage
        const formDataString = localStorage.getItem("travelMatchForm");
        
        if (!formDataString) {
          if (isMounted) {
            setError("Dados da viagem não encontrados. Por favor, preencha o formulário novamente.");
            setLoading(false);
          }
          return;
        }

        const formData = JSON.parse(formDataString);

        // Construir prompt detalhado para a IA
        const prompt = `Você é um especialista em viagens com conhecimento profundo sobre destinos ao redor do mundo, condições climáticas, temperatura do mar, ondas, e riscos meteorológicos.

DADOS DO VIAJANTE:
- Local de partida: ${formData.departureCity}
- Tipo de viagem: ${formData.tripTypes.join(", ")}
- Companhia: ${formData.company}
- Número de viajantes: ${formData.numberOfTravelers}
- Tipo de destino preferido: ${formData.destinationTypes.join(", ")}
- Atividades favoritas: ${formData.activities.join(", ")}
- Tipo de hospedagem: ${formData.accommodation.join(", ")}
- Orçamento: R$ ${formData.budget?.toLocaleString('pt-BR')} (${formData.budgetType === "total" ? "total" : "por pessoa"})
- Período da viagem: ${formData.travelDateType === "dates" ? `${formData.departureDate} a ${formData.returnDate}` : `${formData.month || "Flexível"} por ${formData.monthDuration || "vários"} dias`}

INSTRUÇÕES CRÍTICAS:
1. Analise TODOS os dados fornecidos, especialmente:
   - Temperatura do mar na época escolhida
   - Presença ou ausência de ondas (importante para famílias, surfistas, etc)
   - Histórico climático da região (chuvas sazonais, furacões, ciclones, tempestades tropicais)
   - Nível de lotação turística no período

2. Gere EXATAMENTE 3 destinos ideais, priorizando:
   - Melhor correspondência ao perfil do viajante
   - Adequação climática ao período escolhido
   - Segurança meteorológica
   - Aderência ao orçamento

3. Para CADA destino, forneça:
   - Nome e país
   - Descrição atrativa (2-3 frases)
   - Índice de Compatibilidade (0-100) considerando: clima, segurança meteorológica, lotação, experiência marítima, estilo de viagem
   - URL de imagem (use Unsplash: https://images.unsplash.com/photo-XXXXX)
   - Clima médio no período: temperatura ar, temperatura mar, nível de ondas, índice de chuvas
   - Risco climático: nível (low/medium/high) e descrição detalhada
   - Custo estimado total (diária + alimentação + atividades)
   - 5 principais experiências/diferenciais
   - Melhor época para visitar
   - Nível de lotação esperado no período

4. Crie um roteiro COMPLETO dia a dia para cada destino:
   - Mínimo 5 dias de programação
   - Para cada dia: 4-6 atividades com horários
   - Cada atividade deve ter: horário, nome, descrição detalhada
   - SEMPRE inclua alternativas para condições climáticas adversas
   - Personalize baseado nas preferências declaradas

FORMATO DE RESPOSTA (JSON):
Retorne um array JSON válido com exatamente 3 destinos seguindo esta estrutura:

[
  {
    "id": "dest-1",
    "name": "Nome do Destino",
    "country": "País",
    "description": "Descrição atrativa do destino",
    "compatibilityScore": 95,
    "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "climate": {
      "avgTemp": "28-32°C",
      "seaTemp": "26°C",
      "waveLevel": "Ondas moderadas (1-2m) - ideal para surf iniciante",
      "rainfall": "Baixo (5% de chance)"
    },
    "risks": {
      "level": "low",
      "description": "Período fora da temporada de furacões. Clima estável e previsível."
    },
    "estimatedCost": 5000,
    "highlights": [
      "Praias paradisíacas com águas cristalinas",
      "Gastronomia local premiada",
      "Pôr do sol espetacular",
      "Ótima infraestrutura turística",
      "Seguro para famílias"
    ],
    "bestTime": "Setembro a Março",
    "crowdLevel": "Moderado",
    "itinerary": [
      {
        "day": 1,
        "activities": [
          {
            "time": "09:00",
            "activity": "Check-in e café da manhã",
            "description": "Chegada ao hotel, acomodação e café da manhã de boas-vindas",
            "alternative": "Se chover: aproveite o spa do hotel"
          },
          {
            "time": "11:00",
            "activity": "Praia principal",
            "description": "Primeira experiência nas águas cristalinas",
            "alternative": "Se chover: visite o museu local"
          }
        ]
      }
    ]
  }
]

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`;

        // Chamar API da OpenAI com tratamento de erros
        const response = await fetch("/api/openai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            model: "gpt-4o",
            temperature: 0.8,
            max_tokens: 4000,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(errorData.error || "Erro ao gerar recomendações");
        }

        const data = await response.json();
        
        // Parse da resposta da IA
        let aiResponse = data.response;
        
        // Remover possíveis markdown code blocks
        aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const parsedDestinations = JSON.parse(aiResponse);
        
        if (isMounted) {
          setDestinations(parsedDestinations);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Erro ao gerar resultados:", err);
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message || "Erro ao gerar recomendações. Por favor, tente novamente.");
          setLoading(false);
        }
      }
    };

    generateResults();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const handleSelectDestination = (destination: Destination) => {
    try {
      // Salvar destino selecionado em "Minhas Viagens"
      const savedTripsString = localStorage.getItem("myTrips");
      const savedTrips = savedTripsString ? JSON.parse(savedTripsString) : [];
      
      // Adicionar novo destino
      savedTrips.push(destination);
      localStorage.setItem("myTrips", JSON.stringify(savedTrips));
      
      // Redirecionar para página inicial
      router.push("/");
    } catch (error) {
      console.error("Erro ao salvar viagem:", error);
      alert("Erro ao salvar viagem. Por favor, tente novamente.");
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-100 text-green-800 border-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "high": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return <Check className="w-5 h-5" />;
      case "medium": return <AlertTriangle className="w-5 h-5" />;
      case "high": return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#00A6FF] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analisando suas preferências...</h2>
          <p className="text-gray-600">Nossa IA está encontrando os destinos perfeitos para você</p>
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <p>✓ Verificando condições climáticas</p>
            <p>✓ Analisando temperatura do mar</p>
            <p>✓ Avaliando riscos meteorológicos</p>
            <p>✓ Criando roteiros personalizados</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/new-trip")}
                className="px-6 py-3 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#00A6FF]" />
            <h1 className="text-4xl font-bold text-gray-900">Seus Destinos Perfeitos</h1>
          </div>
          <p className="text-lg text-gray-600">
            Baseado nas suas preferências, encontramos {destinations.length} destinos incríveis para você
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Ranking Badge */}
              <div className="relative">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-white rounded-full px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00A6FF]" />
                    <span className="font-bold text-gray-900">#{index + 1}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
                  <span className="font-bold text-[#00A6FF]">{destination.compatibilityScore}%</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{destination.name}</h2>
                <p className="text-sm text-gray-500 mb-3">{destination.country}</p>
                <p className="text-gray-700 mb-4">{destination.description}</p>

                {/* Climate Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <ThermometerSun className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700">Clima: {destination.climate.avgTemp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Waves className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">Mar: {destination.climate.seaTemp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Waves className="w-4 h-4 text-cyan-500" />
                    <span className="text-gray-700">{destination.climate.waveLevel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CloudRain className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Chuvas: {destination.climate.rainfall}</span>
                  </div>
                </div>

                {/* Risk Level */}
                <div className={`flex items-center gap-2 p-3 rounded-lg border-2 mb-4 ${getRiskColor(destination.risks.level)}`}>
                  {getRiskIcon(destination.risks.level)}
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase">Risco Climático</p>
                    <p className="text-sm">{destination.risks.description}</p>
                  </div>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Custo estimado</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    R$ {destination.estimatedCost.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Destaques:</p>
                  <ul className="space-y-1">
                    {destination.highlights.slice(0, 3).map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Time & Crowd */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">Melhor época</p>
                    <p className="font-semibold text-gray-900">{destination.bestTime}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600">Lotação</p>
                    <p className="font-semibold text-gray-900">{destination.crowdLevel}</p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSelectDestination(destination)}
                  className="w-full py-3 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Adicionar às Minhas Viagens
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Itinerary Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview dos Roteiros</h2>
          
          {destinations.map((destination, destIndex) => (
            <div key={destination.id} className="mb-8 last:mb-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#00A6FF] text-white flex items-center justify-center text-sm">
                  {destIndex + 1}
                </span>
                {destination.name} - Primeiros 2 Dias
              </h3>
              
              {destination.itinerary.slice(0, 2).map((day) => (
                <div key={day.day} className="mb-6 pl-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-[#00A6FF]" />
                    <h4 className="font-semibold text-gray-900">Dia {day.day}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-[#00A6FF] min-w-[60px]">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{activity.activity}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          {activity.alternative && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              💡 {activity.alternative}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <p className="text-sm text-gray-500 pl-10">
                + {destination.itinerary.length - 2} dias adicionais de programação completa
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push("/new-trip")}
            className="px-6 py-3 border-2 border-[#00A6FF] text-[#00A6FF] rounded-lg hover:bg-blue-50 transition-all font-semibold"
          >
            Fazer nova busca
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Ver Minhas Viagens
          </button>
        </div>
      </main>
    </div>
  );
}
