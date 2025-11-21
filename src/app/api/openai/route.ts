import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "gpt-4o", temperature = 0.7, max_tokens = 4000 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a API key está configurada
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key da OpenAI não configurada. Por favor, configure a variável OPENAI_API_KEY nas configurações do projeto." },
        { status: 500 }
      );
    }

    // Chamar API da OpenAI com timeout e tratamento de erros
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Você é um especialista em viagens com conhecimento profundo sobre destinos ao redor do mundo, condições climáticas, temperatura do mar, ondas e riscos meteorológicos. Sempre retorne respostas em formato JSON válido quando solicitado."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature,
          max_tokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        console.error("Erro da OpenAI:", errorData);
        return NextResponse.json(
          { error: "Erro ao chamar API da OpenAI", details: errorData },
          { status: response.status }
        );
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "";

      return NextResponse.json({ response: aiResponse });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: "Tempo limite excedido ao chamar API da OpenAI" },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Erro no endpoint OpenAI:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
