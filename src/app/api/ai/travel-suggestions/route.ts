import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, formData } = await request.json();

    // Calcular duração da viagem
    let tripDuration = 7; // padrão
    if (formData.travelDateType === "dates" && formData.departureDate && formData.returnDate) {
      const start = new Date(formData.departureDate);
      const end = new Date(formData.returnDate);
      tripDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } else if (formData.monthDuration) {
      tripDuration = formData.monthDuration;
    }

    // Determinar mês da viagem para análise climática
    let travelMonth = "";
    if (formData.travelDateType === "dates" && formData.departureDate) {
      const date = new Date(formData.departureDate);
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      travelMonth = months[date.getMonth()];
    } else if (formData.month) {
      travelMonth = formData.month;
    }

    const systemPrompt = `Você é um especialista em viagens com conhecimento profundo sobre:
- Destinos turísticos mundiais
- Condições climáticas sazonais
- Temperatura e condições do mar (ondas, correntes, visibilidade)
- Riscos climáticos (chuvas, furacões, ciclones, monções)
- Planejamento de roteiros detalhados
- Custos de viagem realistas

REGRAS CRÍTICAS:
1. ${formData.destinationTypes.includes("Praia") ? "Para destinos de praia, SEMPRE verifique: temperatura do mar na época, tipo de ondas (calmo/agitado), riscos de tempestades/furacões" : "Verifique condições climáticas e riscos na época"}
2. Crie roteiros DIA A DIA com ${tripDuration} dias de atividades
3. Inclua horários específicos (ex: 09:00, 14:00) para cada atividade
4. Seja realista com custos baseado no orçamento de R$ ${formData.budget?.toLocaleString('pt-BR')}
5. Se houver riscos climáticos na época escolhida (${travelMonth || "não especificado"}), AVISE claramente
6. Use URLs reais do Unsplash para imagens (formato: https://images.unsplash.com/photo-[ID]?w=800&h=600&fit=crop)

FORMATO DE RESPOSTA (JSON válido):
{
  "destinations": [
    {
      "id": "1",
      "name": "Nome do Destino",
      "country": "País",
      "description": "Descrição curta e atrativa (1-2 frases)",
      "whyPerfect": "Por que é perfeito para este perfil (2-3 frases, mencione clima/mar se aplicável)",
      "estimatedCost": 5000,
      "bestTimeToVisit": "Mês - Mês",
      "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "warnings": ["Aviso sobre clima/mar se aplicável, ex: 'Época de chuvas em Março'"],
      "itinerary": {
        "Dia 1": [
          {
            "time": "09:00",
            "activity": "Check-in no Hotel",
            "description": "Chegada e acomodação no hotel escolhido"
          },
          {
            "time": "14:00",
            "activity": "Passeio pela Praia",
            "description": "Primeira exploração da região"
          }
        ],
        "Dia 2": [...]
      }
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro ao gerar sugestões de viagem" },
      { status: 500 }
    );
  }
}
