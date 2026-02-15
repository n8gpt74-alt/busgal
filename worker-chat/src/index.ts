/**
 * Cloudflare Worker для AI-бухгалтера с RAG
 * База знаний встроена в код для работы без внешних зависимостей
 */

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

// База знаний для RAG (встроенная)
const KNOWLEDGE_BASE = {
  usn: {
    keywords: ['усн', 'упрощенка', 'упрощенная система', 'доходы', 'расходы', '6 процентов', '15 процентов', 'ставка', 'авансовый платеж', 'декларация', 'книгу учета', 'кудир', 'лимит', '265 миллионов', '130 сотрудников', 'минимальный налог', 'вычет'],
    content: `УСН (Упрощённая система налогообложения) - глава 26.2 НК РФ

ЛИМИТЫ 2026:
- Доходы: 265 500 000 руб. в год (ст. 346.13 п.4 НК РФ)
- Сотрудники: 130 человек
- Остаточная стоимость ОС: 150 млн руб.

СТАВКИ:
- УСН "Доходы": 6% (ст. 346.14 НК РФ), КБК: 18210501011011000110
- УСН "Доходы - Расходы": 15% (ст. 346.18 НК РФ), КБК: 18210501021011000110
- Минимальный налог: 1% от доходов (ст. 346.18 п.6 НК РФ)

СРОКИ УПЛАТЫ:
- Авансы: до 25 числа (1кв - April, 2кв - July, 3кв - October)
- Декларация: ИП до 30 April, ООО до 31 March

ВЫЧЕТЫ (ст. 346.21 п.3.1 НК РФ):
- ИП без сотрудников: уменьшение на 100% взносов
- ИП с сотрудниками / ООО: уменьшение максимум на 50%`
  },
  patent: {
    keywords: ['патент', 'псн', 'патентная система', 'стоимость патента', 'потенциальный доход', '6 процентов', 'регион', 'лимит', '60 миллионов', '15 сотрудников'],
    content: `Патентная система налогообложения (ПСН) - глава 26.5 НК РФ

ЛИМИТЫ:
- Доходы: 60 000 000 руб. в год (ст. 346.43 п.4 НК РФ)
- Сотрудники: 15 человек (ст. 346.43 п.5 пп.2 НК РФ)

СТОИМОСТЬ ПАТЕНТА:
- Формула: Потенциальный доход × 6% (ст. 346.50 п.1 НК РФ)
- Оплата: до 6 мес - в течение 90 дней, 6-12 мес - 1/3 + 2/3

ПРЕИМУЩЕСТВА:
- Освобождение от НДФЛ, НДС, налога на имущество
- Не нужно сдавать декларацию ПСН
- Фиксированный налог не зависит от дохода`
  },
  selfemployed: {
    keywords: ['самозанятый', 'самозанятость', 'налог на профессиональный доход', 'ндп', 'моя налог', 'чек', '4 процента', '6 процентов', '2 миллиона', '4 миллиона', 'лимит', 'вычет'],
    content: `Самозанятые (НПД) - Федеральный закон № 422-ФЗ от 27.11.2018

СТАВКИ (ст. 10 п.2 422-ФЗ):
- 4% при работе с физическими лицами
- 6% при работе с юридическими лицами и ИП

ЛИМИТ:
- 2 400 000 руб. в год (ст. 4 п.2 422-ФЗ)
- При превышении - переход на ОСНО/УСН

ВЫЧЕТ:
- 10 000 руб. автоматически (ст. 12 п.2 422-ФЗ)
- Ставка снижается: 3% вместо 4%, 4% вместо 6%

РЕГИСТРАЦИЯ:
- Через приложение "Мой налог" или сайт ФНС
- Занимает 5-15 минут

СРОКИ:
- Уплата налога: до 28 числа следующего месяца (ст. 11 п.3 422-ФЗ)
- Декларация: НЕ НУЖНО`
  },
  ooo: {
    keywords: ['ооо', 'общество с ограниченной ответственностью', 'учредитель', 'уставной капитал', 'генеральный директор', 'дивиденд', 'решение участников', 'доля', 'бухгалтерский учет'],
    content: `ООО на УСН

РЕГИСТРАЦИЯ:
- Госпошлина: 4 000 руб.
- Уставной капитал: минимум 10 000 руб.
- Срок: 5 рабочих дней

НАЛОГИ УСН:
- 6% "Доходы" или 15% "Доходы - Расходы"
- Освобождение от НДС, налога на имущество, налога на прибыль

ВЗНОСЫ ЗА СОТРУДНИКОВ (ст. 425 НК РФ):
- ПФР: 22% (лимит 2 400 000 руб., свыше 10%)
- ФОМС: 5,1% (без лимита)
- ФСС: 2,9% (лимит 2 400 000 руб.)
- Итого: 30%

НДФЛ:
- 13% (до 5 млн руб./год)
- 15% (свыше 5 млн руб./год)

ОТЧЁТНОСТЬ:
- Декларация УСН: до 31 March
- 2-НДФЛ: до 1 March
- 6-НДФЛ: квартально до 25 числа
- СЗВ-М: ежемесячно до 15 числа`
  },
  contributions: {
    keywords: ['взнос', 'взносы', 'страховой', 'пенсионный', 'фомс', 'фсс', 'пфр', 'сфр', 'фиксированный', '1 процент', '300 тысяч', '70 тысяч', 'лимит', '2 миллиона'],
    content: `Страховые взносы - Глава 34 НК РФ

ВЗНОСЫ ИП ЗА СЕБЯ (ст. 430 НК РФ):
- Фиксированные: ~56 000 руб. ПФР + ~14 000 руб. ФОМС = ~70 000 руб.
- Дополнительный: 1% от дохода свыше 300 000 руб. (ст. 430 п.1 пп.2 НК РФ)
- Максимум дополнительного: 257 061 руб.

СРОКИ:
- Фиксированные: до 31 декабря
- Дополнительный (1%): до 1 июля

ВЗНОСЫ ЗА СОТРУДНИКОВ (ст. 425 НК РФ):
- ПФР: 22% (лимит 2 400 000 руб.)
- ФОМС: 5,1%
- ФСС: 2,9% (лимит 2 400 000 руб.)
- Травматизм: 0,2-8,5% (в зависимости от ОКВЭД)

УМЕНЬШЕНИЕ НАЛОГА НА ВЗНОСЫ:
- ИП на УСН 6% без сотрудников: до 100%
- ИП на УСН 6% с сотрудниками / ООО: до 50% (ст. 346.21 п.3.1 НК РФ)`
  }
}

// Поиск релевантных документов
function searchKnowledge(query: string, userType: string): string[] {
  const normalizedQuery = query.toLowerCase()
  const results: Array<{source: string, score: number, content: string}> = []
  
  // Определяем релевантные документы по типу пользователя
  const userDocMap: Record<string, string[]> = {
    'ip_usn': ['usn', 'contributions'],
    'ip_patent': ['patent', 'contributions'],
    'selfemployed': ['selfemployed', 'contributions'],
    'ooo': ['ooo', 'contributions']
  }
  
  const relevantDocs = userDocMap[userType] || ['usn', 'contributions']
  
  for (const docId of relevantDocs) {
    const doc = KNOWLEDGE_BASE[docId as keyof typeof KNOWLEDGE_BASE]
    if (!doc) continue
    
    let score = 0
    for (const keyword of doc.keywords) {
      if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery.split(' ')[0])) {
        score += 1
      }
    }
    
    if (score > 0) {
      results.push({
        source: docId,
        score,
        content: doc.content
      })
    }
  }
  
  // Сортируем по убыванию релевантности
  results.sort((a, b) => b.score - a.score)
  
  return results.map(r => r.content).slice(0, 2)
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

    // RAG: ищем релевантные документы
    const relevantDocs = searchKnowledge(message, userType)
    const ragContext = relevantDocs.length > 0 
      ? `\n\n## Релевантная информация из базы знаний:\n${relevantDocs.join('\n\n---\n\n')}\n\nИспользуй эту информацию для точных ответов с указанием статей НК РФ.`
      : ''

    // Базовый промпт с RAG
    const userTypeNames: Record<string, string> = {
      'ip_usn': 'ИП на УСН',
      'ip_patent': 'ИП на патенте',
      'selfemployed': 'Самозанятый',
      'ooo': 'ООО на УСН'
    }
    
    const systemPrompt = `Ты AI-бухгалтер SmartAccount, эксперт по налогам и бухгалтерии малого бизнеса в России.

Пользователь: ${userTypeNames[userType] || 'Пользователь'}
Текущий год: 2026

Правила ответа:
1. Всегда указывай конкретные статьи НК РФ (например, ст. 346.14 НК РФ)
2. Приводи точные суммы, ставки и лимиты на 2026 год
3. Указывай КБК для платежей
4. Называй точные сроки в формате "до [дата]"
5. Если не уверен — так и скажи${ragContext}`

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
          max_tokens: 1500,
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
          rag: relevantDocs.length > 0,
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
