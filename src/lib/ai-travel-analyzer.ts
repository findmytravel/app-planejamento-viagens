import { TravelMatchForm } from "@/types/travel";

export interface AIAnalysisResult {
  destinations: DestinationRecommendation[];
  analysisInsights: string;
}

export interface DestinationRecommendation {
  id: string;
  name: string;
  country: string;
  description: string;
  matchScore: number;
  imageUrl: string;
  highlights: string[];
  itinerary: DayItinerary[];
  estimatedCost: number;
  bestTimeToVisit: string;
  weatherInfo: string;
  seaConditions?: SeaConditions;
  safetyWarnings?: string[];
}

export interface SeaConditions {
  temperature: string;
  waveConditions: string;
  waterColor: string;
}

export interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  category: string;
}

/**
 * Analisa as respostas do Travel Match usando IA e retorna recomendações personalizadas
 */
export async function analyzeTravelPreferences(
  formData: TravelMatchForm
): Promise<AIAnalysisResult> {
  try {
    // Prepara o prompt para a IA com TODAS as respostas do usuário
    const prompt = buildAnalysisPrompt(formData);

    console.log("🚀 Enviando requisição para análise de viagem...");

    // Chama a API da IA (OpenAI GPT-4)
    const response = await fetch("/api/ai/analyze-travel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        formData,
      }),
    });

    console.log("📡 Resposta recebida:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      console.error("❌ Erro na resposta:", errorData);
      
      // Lança erro com mensagem específica
      throw new Error(errorData.error || errorData.details || "Falha ao analisar preferências de viagem");
    }

    const result: AIAnalysisResult = await response.json();
    console.log("✅ Análise concluída com sucesso:", result.destinations.length, "destinos");
    
    return result;
  } catch (error) {
    console.error("❌ Erro ao analisar preferências:", error);
    
    // Re-lança o erro com mensagem mais clara
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error("Erro ao processar análise de viagem. Por favor, tente novamente.");
  }
}

/**
 * Constrói o prompt detalhado para a IA considerando TODAS as respostas
 */
function buildAnalysisPrompt(formData: TravelMatchForm): string {
  const hasBeach = formData.destinationTypes.includes("Praia");
  
  let prompt = `Você é um especialista em viagens com conhecimento profundo sobre destinos ao redor do mundo. 
Analise cuidadosamente as seguintes preferências do viajante e recomende 3 destinos IDEAIS:

INFORMAÇÕES DO VIAJANTE:
- Cidade de partida: ${formData.departureCity}
- Tipos de viagem desejados: ${formData.tripTypes.join(", ")}
- Viajando: ${formData.company}
- Número de pessoas: ${formData.numberOfTravelers}
${formData.companions.length > 0 ? `- Companheiros: ${formData.companions.map(c => `${c.name} (${c.relation})`).join(", ")}` : ""}

PREFERÊNCIAS DE DESTINO:
- Tipos de destino: ${formData.destinationTypes.join(", ")}
- Atividades favoritas: ${formData.activities.join(", ")}

${hasBeach ? `
PREFERÊNCIAS DE PRAIA (MUITO IMPORTANTE):
- Atividades na praia: ${formData.beachActivities.join(", ")}
- Temperatura do mar: ${formData.seaTemperature}
- Tipo de mar (ondas): ${formData.seaType}
- Cor do mar: ${formData.seaColor}
` : ""}

HOSPEDAGEM:
- Tipo preferido: ${formData.accommodation.join(", ")}
${hasBeach && formData.beachfront ? `- Pé na areia: ${formData.beachfront}` : ""}

DATAS E DURAÇÃO:
${formData.travelDateType === "dates" 
  ? `- Data de ida: ${formData.departureDate}
- Data de volta: ${formData.returnDate}
- Duração: ${calculateDuration(formData.departureDate, formData.returnDate)} dias`
  : `- Mês desejado: ${formData.month}
- Duração: ${formData.monthDuration} dias`
}

ORÇAMENTO:
- Tipo: ${formData.budgetType === "total" ? "Valor total da viagem" : "Valor por pessoa"}
- Valor: R$ ${formData.budget?.toLocaleString("pt-BR")}
${formData.budgetType === "per-person" ? `- Valor total: R$ ${((formData.budget || 0) * formData.numberOfTravelers).toLocaleString("pt-BR")}` : ""}

INSTRUÇÕES CRÍTICAS:
1. Considere TODAS as respostas acima, especialmente:
   - Condições do mar (temperatura, ondas, cor) - ESSENCIAL para surfistas, famílias com crianças
   - Clima e sazonalidade - verifique se o período coincide com época de chuvas, furacões ou ciclones
   - Atividades específicas mencionadas
   
2. Para cada destino recomendado, forneça:
   - Nome e país
   - Descrição detalhada (por que é perfeito para este viajante)
   - Score de compatibilidade (0-100%)
   - Destaques principais (4-5 itens)
   - Roteiro dia a dia completo com atividades específicas e horários
   - Custo estimado realista
   - Melhor época para visitar
   - Informações climáticas detalhadas
   ${hasBeach ? "- Condições específicas do mar (temperatura, ondas, cor da água)" : ""}
   - Avisos de segurança se aplicável (furacões, chuvas, etc)

3. Os destinos devem ser DIVERSOS mas todos altamente compatíveis
4. Priorize destinos acessíveis a partir de ${formData.departureCity}
5. Respeite rigorosamente o orçamento informado
6. Crie roteiros PRÁTICOS e REALIZÁVEIS com horários realistas

Retorne a resposta em formato JSON estruturado.`;

  return prompt;
}

/**
 * Calcula a duração em dias entre duas datas
 */
function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Valida se um destino é seguro para viajar no período selecionado
 */
export function validateTravelSafety(
  destination: string,
  month: string
): { safe: boolean; warnings: string[] } {
  // Aqui você pode integrar com APIs de clima e segurança
  // Por enquanto, retorna validação básica
  
  const warnings: string[] = [];
  
  // Exemplo: Caribe durante temporada de furacões
  const hurricaneMonths = ["Agosto", "Setembro", "Outubro", "Novembro"];
  const caribbeanDestinations = ["Cancún", "Punta Cana", "Aruba", "Jamaica"];
  
  if (
    hurricaneMonths.includes(month) &&
    caribbeanDestinations.some(d => destination.includes(d))
  ) {
    warnings.push("Temporada de furacões - maior risco de tempestades");
  }
  
  return {
    safe: warnings.length === 0,
    warnings,
  };
}
