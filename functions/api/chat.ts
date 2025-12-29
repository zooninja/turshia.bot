interface Env {
  RATE_KV: KVNamespace;
  LLM_PROVIDER?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_SEC?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  mode?: 'soft' | 'snappy';
}

interface ChatResponse {
  reply: string;
}

interface ErrorResponse {
  error: string;
}

const SYSTEM_PROMPT_BASE = `Ти си Бай Тошо – консултант по туршия и лютеница. Говориш само на български. Отговаряш винаги с 1-3 изречения. Без емоджита.

Стилът ти е селски, троснат, малко тъп. Понякога питаш глупави въпроси. Можеш да си малко груб, но не прекаляваш.

СТРОГИ ПРАВИЛА:
- Винаги на български
- 1-3 изречения максимум
- Без емоджита
- Лек селски сленг, запазваш гласа си
- На всеки ~3-ти отговор задаваш тъп въпрос свързан с темата
- БЕЗ обиди по защитени характеристики (раса, религия, пол, ориентация)
- БЕЗ закани, насилие, self-harm, sexual съдържание
- Ако потребителят пита за политика/война/омраза: отклоняваш към туршия/лютеница или отказваш глуповато

Примери за тон:
- "Еее, какво приказваш бе? Питаш ме за това, че ти нямаш и дома туршия ли?"
- "То като знаеш, ше питаш ли мене? Ама добре де."
- "За туршията значи бе. Гледай, ако щеш да стане хрупкава..."`;

const MODE_MODIFIERS = {
  soft: '\n\nРежим: Малко по-приветлив, селски, но пак директен.',
  snappy: '\n\nРежим: По-троснат, прекъсваш, пак в рамките на безопасността.',
};

async function getClientIP(request: Request): Promise<string> {
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;

  const ip = (request as Request & { cf?: { ip?: string } }).cf?.ip;
  if (ip) return ip;

  return 'unknown';
}

async function checkRateLimit(
  env: Env,
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const maxRequests = parseInt(env.RATE_LIMIT_MAX || '30');
  const windowSec = parseInt(env.RATE_LIMIT_WINDOW_SEC || '600');

  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSec) * windowSec;
  const key = `rl:${ip}:${windowStart}`;

  const current = await env.RATE_KV.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  const newCount = count + 1;
  await env.RATE_KV.put(key, newCount.toString(), {
    expirationTtl: windowSec * 2,
  });

  return { allowed: true, remaining: maxRequests - newCount };
}

function buildSystemPrompt(mode?: 'soft' | 'snappy'): string {
  let prompt = SYSTEM_PROMPT_BASE;
  if (mode && MODE_MODIFIERS[mode]) {
    prompt += MODE_MODIFIERS[mode];
  }
  return prompt;
}

function trimMessages(messages: Message[], maxTurns: number = 12): Message[] {
  if (messages.length <= maxTurns) {
    return messages;
  }
  return messages.slice(-maxTurns);
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' +
    apiKey;

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 200,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error('Gemini API failed');
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error('No reply from Gemini');
  }

  return reply.trim();
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
  ];

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: groqMessages,
    temperature: 0.9,
    max_tokens: 200,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', errorText);
    throw new Error('Groq API failed');
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error('No reply from Groq');
  }

  return reply.trim();
}

async function getLLMReply(
  env: Env,
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const provider = (env.LLM_PROVIDER || 'gemini').toLowerCase();

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    return await callGemini(env.GEMINI_API_KEY, systemPrompt, messages);
  } else if (provider === 'groq') {
    if (!env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }
    return await callGroq(env.GROQ_API_KEY, systemPrompt, messages);
  } else {
    throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

function validateRequest(body: unknown): {
  valid: boolean;
  data?: ChatRequest;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid JSON body' };
  }

  const req = body as Partial<ChatRequest>;

  if (!Array.isArray(req.messages)) {
    return { valid: false, error: 'messages must be an array' };
  }

  for (const msg of req.messages) {
    if (!msg.role || !msg.content) {
      return { valid: false, error: 'Invalid message format' };
    }
    if (msg.role !== 'user' && msg.role !== 'assistant') {
      return { valid: false, error: 'Invalid message role' };
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'Message content must be string' };
    }
    if (msg.content.length > 2000) {
      return { valid: false, error: 'Message too long (max 2000 chars)' };
    }
  }

  if (req.mode && req.mode !== 'soft' && req.mode !== 'snappy') {
    return { valid: false, error: 'Invalid mode' };
  }

  return { valid: true, data: req as ChatRequest };
}

function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = ['http://localhost:5173'];
  const requestOrigin = origin || '';

  if (allowedOrigins.includes(requestOrigin)) {
    return {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }

  return {};
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({
  request,
  env,
}) => {
  const origin = request.headers.get('Origin');
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders(origin),
  };

  try {
    const ip = await getClientIP(request);
    const rateCheck = await checkRateLimit(env, ip);

    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Стига бе, много питаш. Почакай малко.',
        } as ErrorResponse),
        {
          status: 429,
          headers,
        }
      );
    }

    const body = await request.json();
    const validation = validateRequest(body);

    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ error: validation.error } as ErrorResponse),
        {
          status: 400,
          headers,
        }
      );
    }

    const { messages, mode } = validation.data;
    const trimmedMessages = trimMessages(messages);
    const systemPrompt = buildSystemPrompt(mode);

    const reply = await getLLMReply(env, systemPrompt, trimmedMessages);

    return new Response(
      JSON.stringify({ reply } as ChatResponse),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response(
      JSON.stringify({
        error: 'Еee, нещо се счупи бе. Опитай пак.',
      } as ErrorResponse),
      {
        status: 502,
        headers,
      }
    );
  }
};
