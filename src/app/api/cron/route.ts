import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { supabase } from '@/lib/supabase';

// Inicializando o Google Gen AI (API Fetch básica para garantir no Edge ou Serverless)
// Para evitar problemas com a biblioteca em Edge Runtimes, chamaremos o endpoint via fetch.
async function runGeminiAnalysis(textBatch: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const model = "gemini-1.5-flash"; // Mais rápido e muito barato
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
Você é um analista tático de futebol extremamente rigoroso trabalhando para times de elite. Seu dever é avaliar as manchetes abaixo e identificar se elas contêm alguma novidade crítica.
Critérios de Retenção RÍGIDOS:
- SÓ PASSA: Lesões, escalações prováveis/oficiais, cortes médicos, punições e suspensões, e jogadores que foram poupados.
- SÓ PASSA SE FOR JOGADOR-CHAVE: Tem que ser um jogador importante com status de titular ou vital (impacto real). Nada de reservas obscuros.
- TIMES SUPORTADOS: "Flamengo", "Palmeiras", "Manchester City", "Arsenal", "Liverpool", "Barcelona", "Real Madrid", "Inter de Milão", "Bayern de Munique".
- IGNORAR E DESCARTAR (isValid: false): Rumores de transferências (ex: fulano em negociação), opiniões de jornalistas, críticas, renovações de contrato, polêmicas extra-campo não relacionadas a suspensões.

Os tipos de impacto aceitos (impactType) são ESTRITAMENTE: "lesao", "escalacao", "retorno", "poupados".

Eu vou passar uma lista de textos de notícias combinadas. Você deve ler e me devolver UM ARRAY JSON EXATO (nada fora dele) no seguinte formato de exemplo para as que passarem:
[
  { 
    "title": "A manchete", 
    "description": "breve resumo focado na lesão/fato", 
    "team": "O nome do time oficial", 
    "impactType": "lesao", 
    "keyPlayer": "Nome do Jogador", 
    "source": "A fonte originada", 
    "url": "a url da noticia passava",
    "isValid": true 
  }
]
Se a notícia não atende os critérios ou for irrelevante, devolva no array mas com "isValid": false.

Aqui estão as notícias para você classificar (retorne APENAS o JSON ARRAY válido, sem formatadores markdown ou textos extras como \`\`\`json): 
\n${textBatch}
`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();
  try {
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Falha ao analisar a resposta do Gemini:", error, data);
    return [];
  }
}

export async function GET(req: Request) {
  // Verificação de Segredo (Opcional, mas recomendado para o Cron real)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('Authorization');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Permitir passar em desenvolvimento para facilitar
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const parser = new Parser();
  
  // Fontes alvo (limitadas para não estourar a API num ping só)
  const feeds = [
    { url: 'https://news.google.com/rss/search?q=flamengo+when:24h&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News - Flamengo' },
    { url: 'https://news.google.com/rss/search?q=palmeiras+when:24h&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News - Palmeiras' },
    { url: 'https://news.google.com/rss/search?q=real+madrid+when:24h&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News - Real Madrid' },
    { url: 'https://news.google.com/rss/search?q=inter+milao+when:24h&hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News - Inter de Milão' }
  ];

  try {
    let rawItemsToProcess: any[] = [];

    // Pegar algumas noticias de cada fonte
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        // Pegamos as 5 mais novas de cada
        const top5 = parsed.items.slice(0, 5).map(item => ({
          title: item.title,
          description: item.contentSnippet || item.content || "",
          url: item.link,
          source: feed.source
        }));
        rawItemsToProcess = [...rawItemsToProcess, ...top5];
      } catch (err) {
        console.error(`Erro ao ler RSS da fonte: ${feed.source}`);
      }
    }

    if (rawItemsToProcess.length === 0) {
      return NextResponse.json({ message: "Nenhuma notícia encontrada nos RSS." });
    }

    // Criar o batch text para a IA
    const batchText = JSON.stringify(rawItemsToProcess.map((item, index) => ({
      id: index,
      title: item.title,
      summary: item.description,
      source: item.source,
      url: item.url
    })));

    // Chamar Inteligência Artificial Gemini
    let analyzedItems: any[] = [];
    try {
      analyzedItems = await runGeminiAnalysis(batchText);
    } catch (apiError) {
      console.error("Erro na API LLM:", apiError);
      return NextResponse.json({ error: "Erro na Ia" }, { status: 500 });
    }

    // Filtrar apenas o que a IA determinou como VÁLIDO
    const validNews = analyzedItems.filter(item => item.isValid === true);

    let insertedCount = 0;

    // Para cada notícia válida, inserir no Supabase
    for (const news of validNews) {
      const { error } = await supabase.from('news').insert({
        title: news.title,
        description: news.description,
        team: news.team,
        impact_type: news.impactType,
        key_player: news.keyPlayer,
        source: news.source,
        url: news.url
      });
      // Se der conflito único na URL, o erro vai travar (code 23505 Unique Violation), ignoramos com catch ou checagem:
      if (!error) {
        insertedCount++;
      } else {
         if(error.code !== '23505') {
            console.error("Erro no Supabase:", error.message);
         }
      }
    }

    return NextResponse.json({ 
      status: "Scraping Completo", 
      total_analisado: rawItemsToProcess.length, 
      aprovados_ia: validNews.length,
      novos_inseridos_db: insertedCount 
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
