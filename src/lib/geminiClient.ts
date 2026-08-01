import { GoogleGenAI, Type } from '@google/genai';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    existingCheck: {
      type: Type.OBJECT,
      properties: {
        hasExactOrDirectMatch: { type: Type.BOOLEAN, description: 'True se já existir módulo com o mesmo assunto no app' },
        existingMatchTitle: { type: Type.STRING, description: 'Título do módulo existente, ou string vazia' },
        analysisNote: { type: Type.STRING, description: 'Análise explicando a checagem no acervo do app e as conexões encontradas' },
        relatedExistingTitles: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Títulos de outros módulos já cadastrados no app que possuem relação temática'
        }
      },
      required: ['hasExactOrDirectMatch', 'existingMatchTitle', 'analysisNote', 'relatedExistingTitles']
    },
    card: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'Slug único em minúsculas sem espaços ou acentos' },
        category: { type: Type.STRING, description: 'Sempre "História"' },
        period: { type: Type.STRING, description: 'Uma entre: "Antiguidade", "Idade Média", "Idade Moderna", "Idade Contemporânea", "História do Brasil"' },
        title: { type: Type.STRING, description: 'Título oficial do dossiê histórico em português do Brasil' },
        era: { type: Type.STRING, description: 'Localização temporal legível, ex: "Século V - Século XV"' },
        evidenceLevel: { type: Type.STRING, description: 'Geralmente "high" ou "good"' },
        summary: { type: Type.STRING, description: 'Resumo executivo historiográfico (2-3 frases) em português do Brasil' },
        fact: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['title', 'description']
        },
        interpretation: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['title', 'description']
        },
        hypothesis: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['title', 'description']
        },
        timeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.STRING },
              event: { type: Type.STRING }
            },
            required: ['year', 'event']
          }
        },
        characters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              bio: { type: Type.STRING }
            },
            required: ['name', 'role', 'bio']
          }
        },
        sources: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: 'Nome do livro ou obra historiográfica' },
              author: { type: Type.STRING, description: 'Nome do historiador ou autor' },
              year: { type: Type.INTEGER, description: 'Ano de publicação ou redação' },
              type: { type: Type.STRING, description: 'Sempre "book" para livros' },
              details: { type: Type.STRING, description: 'Capítulo, volume ou trecho citado' }
            },
            required: ['id', 'title', 'author', 'year', 'type']
          }
        }
      },
      required: ['id', 'category', 'period', 'title', 'era', 'evidenceLevel', 'summary', 'fact', 'interpretation', 'hypothesis', 'timeline', 'characters', 'sources']
    },
    timelineStep: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        label: { type: Type.STRING, description: 'Ex: "330 d.C. - 1453 d.C."' },
        title: { type: Type.STRING },
        year: { type: Type.INTEGER, description: 'Ano numérico para ordenação na linha do tempo, ex: 527' },
        description: { type: Type.STRING },
        mapUrl: { type: Type.STRING },
        mapLabel: { type: Type.STRING },
        era: { type: Type.STRING },
        meanwhile: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              region: { type: Type.STRING },
              event: { type: Type.STRING }
            },
            required: ['region', 'event']
          }
        }
      },
      required: ['id', 'label', 'title', 'year', 'description', 'mapUrl', 'mapLabel', 'era', 'meanwhile']
    },
    kgNodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: 'Ex: CIVILIZACAO, IMPERIO, PERSONAGEM, EVENTO, LIVRO' },
          name: { type: Type.STRING },
          summary: { type: Type.STRING },
          description: { type: Type.STRING },
          era: { type: Type.STRING },
          evidenceLevel: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['id', 'type', 'name', 'summary', 'description', 'era', 'evidenceLevel', 'tags', 'keywords']
      }
    }
  },
  required: ['existingCheck', 'card', 'timelineStep', 'kgNodes']
};

export async function generateContentWithGemini(
  prompt: string,
  existingCards: { id: string; title: string; period: string; era: string; summary: string }[]
): Promise<any> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  console.log('[Gemini Client] VITE_GEMINI_API_KEY:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'NOT FOUND');
  console.log('[Gemini Client] import.meta.env keys:', Object.keys(import.meta.env));

  if (!apiKey) {
    throw new Error('API_KEY_NOT_CONFIGURED');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'chronos-app',
      },
    },
  });

  const existingCardsList = Array.isArray(existingCards) && existingCards.length > 0
    ? existingCards.map((c) => `- ${c.title} (${c.period || ''}, ${c.era || ''}): ${c.summary || ''}`).join('\n')
    : 'Nenhum módulo informado no acervo atual.';

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Você é um historiador acadêmico sênior e curador principal do CHRONOS. O usuário solicitou um novo assunto/conteúdo para a plataforma:
"${prompt}"

ACERVO DE MÓDULOS JÁ CADASTRADOS ATUALMENTE DENTRO DO APLICATIVO:
${existingCardsList}

INSTRUÇÕES CRÍTICAS DE VERIFICAÇÃO E CONEXÃO DE CONTEÚDO:
1. Verifique se o assunto solicitado pelo usuário JÁ EXISTE ou se relaciona diretamente com algum módulo já presente no acervo do aplicativo listado acima.
2. Preencha o objeto "existingCheck" no JSON indicando:
   - "hasExactOrDirectMatch": true se o assunto já possui um módulo idêntico/direto cadastrado no app.
   - "existingMatchTitle": título exato do módulo do app já cadastrado (ou "" se não houver).
   - "analysisNote": nota explicativa de 2 a 3 frases analisando o acervo do app, apontando se o tema já existia e como o novo módulo se conecta ou complementa o acervo existente.
   - "relatedExistingTitles": array com os títulos dos módulos do app que se relacionam com este novo tema.
3. Se o usuário pediu livros ou fontes específicas, inclua no mínimo a quantidade solicitada de LIVROS reais com título em português, autor prestigiado e detalhes.
4. Todo o conteúdo deve ser em PORTUGUÊS DO BRASIL.
5. Monte o módulo no formato JSON estruturado exigido.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema as any,
          }
        });

        if (response && response.text) {
          return JSON.parse(response.text);
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || JSON.stringify(err);
        const isTransientError =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isTransientError && attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        } else if (!isTransientError) {
          break;
        }
      }
    }
  }

  throw lastError || new Error('Falha ao gerar conteúdo com a IA.');
}
