type Env = {
  POLZA_API_KEY?: string
  POLZA_API_URL?: string
  POLZA_MODEL?: string
  CHAT_TIMEOUT_MS?: string
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type IncomingMessage = {
  role?: 'user' | 'assistant'
  content?: unknown
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
    ...init,
  })
}

function withCors(res: Response) {
  const headers = new Headers(res.headers)
  headers.set('access-control-allow-origin', '*')
  headers.set('access-control-allow-methods', 'POST, OPTIONS')
  headers.set('access-control-allow-headers', 'content-type')
  return new Response(res.body, { status: res.status, headers })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }))
    }

    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/chat') {
      return withCors(json({ error: 'Not found' }, { status: 404 }))
    }

    const apiKey = env.POLZA_API_KEY
    if (!apiKey) {
      return withCors(json({ error: 'POLZA_API_KEY is not set' }, { status: 500 }))
    }

    const body = await request.json().catch(() => null as any)
    const message = typeof body?.message === 'string' ? body.message : ''
    const userType = typeof body?.userType === 'string' ? body.userType : 'ip_usn'
    const history = Array.isArray(body?.history) ? (body.history as IncomingMessage[]) : []

    if (!message.trim()) {
      return withCors(json({ error: 'Message is required' }, { status: 400 }))
    }

    const systemPrompt = `Ты AI-бухгалтер SmartAccount. Пользовательский тип: ${userType}. Отвечай по-русски, конкретно, без воды. Если не уверен — так и скажи.`

    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }]

    for (const msg of history.slice(-10)) {
      const role = msg?.role === 'assistant' ? 'assistant' : msg?.role === 'user' ? 'user' : null
      const content = typeof msg?.content === 'string' ? msg.content : null
      if (role && content) messages.push({ role, content })
    }

    messages.push({ role: 'user', content: message })

    const apiUrl = env.POLZA_API_URL || 'https://api.polza.ai/api/v1'
    const model = env.POLZA_MODEL || 'openai/gpt-4o'
    const timeoutMs = Number(env.CHAT_TIMEOUT_MS || 25000)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const resp = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1200,
        }),
      })

      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        return withCors(json({ error: 'Upstream error', status: resp.status, details: text }, { status: 502 }))
      }

      const data: any = await resp.json().catch(() => null)
      const assistantResponse = data?.choices?.[0]?.message?.content

      return withCors(
        json({
          response: typeof assistantResponse === 'string' && assistantResponse.trim() ? assistantResponse : 'Не удалось получить ответ.',
          success: true,
        })
      )
    } catch (e: any) {
      if (e instanceof Error && e.name === 'AbortError') {
        return withCors(json({ error: 'Upstream timeout' }, { status: 504 }))
      }
      return withCors(json({ error: 'Worker error' }, { status: 500 }))
    } finally {
      clearTimeout(timeoutId)
    }
  },
}
