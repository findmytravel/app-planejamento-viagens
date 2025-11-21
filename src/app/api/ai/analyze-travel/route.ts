import { NextRequest, NextResponse } from "next/server";
import { TravelMatchForm } from "@/types/travel";
import { AIAnalysisResult } from "@/lib/ai-travel-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, formData } = body;

    console.log("📥 Requisição recebida:", { 
      hasPrompt: !!prompt, 
      hasFormData: !!formData 
    });

    // Verifica se a chave da API está configurada
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY não está configurada");
      return NextResponse.json(
        { error: "Chave da API da OpenAI não configurada. Por favor, configure a variável OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    console.log("✅ API Key encontrada");

    // Chama a API da OpenAI
    console.log("🚀 Chamando OpenAI API...");
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em viagens com conhecimento profundo sobre destinos, clima, condições do mar, sazonalidade e planejamento de roteiros. 
            Você deve analisar cuidadosamente todas as preferências do usuário e recomendar destinos que sejam PERFEITOS para o perfil dele.
            Sempre considere: temperatura do mar, condições de ondas, clima, época de chuvas/furacões/ciclones, e todos os outros fatores mencionados.
            Retorne SEMPRE em formato JSON válido com a seguinte estrutura:
            {
              "destinations": [
                {
                  "id": "string",
                  "name": "string",
                  "country": "string",
                  "description": "string",
                  "matchScore": number,
                  "imageUrl": "string",
                  "highlights": ["string"],
                  "itinerary": [
                    {
                      "day": number,
                      "title": "string",
                      "activities": [
                        {
                          "time": "string",
                          "name": "string",
                          "description": "string",
                          "category": "string"
                        }
                      ]
                    }
                  ],
                  "estimatedCost": number,
                  "bestTimeToVisit": "string",
                  "weatherInfo": "string",
                  "seaConditions": {
                    "temperature": "string",
                    "waveConditions": "string",
                    "waterColor": "string"
                  },
                  "safetyWarnings": ["string"]
                }
              ],
              "analysisInsights": "string"
            }`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    console.log("📡 Resposta OpenAI status:", openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ Erro da OpenAI:", errorText);
      
      // Trata erros específicos da OpenAI
      let errorMessage = "Falha ao analisar com IA";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
        
        // Erros comuns
        if (errorMessage.includes("invalid_api_key")) {
          errorMessage = "Chave da API inválida. Verifique sua configuração.";
        } else if (errorMessage.includes("insufficient_quota")) {
          errorMessage = "Cota da API excedida. Verifique seu plano OpenAI.";
        } else if (errorMessage.includes("rate_limit")) {
          errorMessage = "Limite de requisições atingido. Tente novamente em alguns segundos.";
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log("✅ Resposta OpenAI recebida com sucesso");

    // Valida se a resposta contém o conteúdo esperado
    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      console.error("❌ Resposta da OpenAI em formato inválido:", openaiData);
      return NextResponse.json(
        { error: "Resposta da IA em formato inválido" },
        { status: 500 }
      );
    }

    const aiResponse = JSON.parse(openaiData.choices[0].message.content);
    console.log("✅ JSON parseado com sucesso");

    // Valida estrutura da resposta
    if (!aiResponse.destinations || !Array.isArray(aiResponse.destinations)) {
      console.error("❌ Estrutura de destinos inválida:", aiResponse);
      return NextResponse.json(
        { error: "Estrutura de resposta da IA inválida" },
        { status: 500 }
      );
    }

    // Estrutura a resposta no formato esperado
    const result: AIAnalysisResult = {
      destinations: aiResponse.destinations || [],
      analysisInsights: aiResponse.analysisInsights || "Análise completa realizada com sucesso.",
    };

    console.log("✅ Retornando", result.destinations.length, "destinos");
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erro ao processar análise de viagem:", error);
    
    // Tratamento de erros específicos
    let errorMessage = "Erro ao processar análise de viagem";
    let errorDetails = "Erro desconhecido";
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Erros de parsing JSON
      if (error.message.includes("JSON")) {
        errorMessage = "Erro ao processar resposta da IA";
        errorDetails = "A resposta da IA não está em formato válido";
      }
      // Erros de rede
      else if (error.message.includes("fetch")) {
        errorMessage = "Erro de conexão com a API";
        errorDetails = "Não foi possível conectar ao serviço de IA";
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
