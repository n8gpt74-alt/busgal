import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/data/tax-knowledge'
import { searchKnowledge, buildContextFromResults, shouldUseRAG } from '@/data/knowledge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    const message = typeof body?.message === 'string' ? body.message : ''
    const userType = typeof body?.userType === 'string' ? body.userType : ''
    const history = Array.isArray(body?.history) ? body.history : []

    if (!message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Используем RAG для поиска релевантных документов
    const useRAG = shouldUseRAG(message)
    let ragContext = ''
    
    if (useRAG) {
      const searchResults = searchKnowledge(message, userType || 'ip_usn', 3)
      ragContext = buildContextFromResults(searchResults, 4000)
      console.log('RAG: Найдено документов:', searchResults.length, 'Совпадения:', searchResults.map(r => r.matchedKeywords).flat().slice(0, 10))
    }

    // Базовый системный промпт
    const basePrompt = buildSystemPrompt(userType || 'ip_usn')
    
    // Добавляем RAG контекст, если найден
    const systemPrompt = ragContext 
      ? `${basePrompt}

${ragContext}

## Важные инструкции по использованию контекста:
1. Используй предоставленную информацию из базы знаний для точных ответов
2. Всегда указывай конкретные статьи НК РФ или законов при упоминании правил
3. Приводи точные суммы, ставки и лимиты на ${new Date().getFullYear()} год
4. Если в контексте есть ответ на вопрос - используй его
5. Если информации недостаточно - скажи об этом`
      : basePrompt

    // Формируем историю сообщений для контекста
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Добавляем историю (последние 10 сообщений)
    if (history && history.length > 0) {
      const recentHistory = history.slice(-10)
      recentHistory.forEach((msg: Message) => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Добавляем текущее сообщение
    messages.push({ role: 'user', content: message })

    // По умолчанию работаем в режиме заглушки, чтобы деплой жил без ключей.
    // Если заданы env-переменные POLZA_API_KEY/POLZA_API_URL — используем Polza AI API.
    const apiKey = process.env.POLZA_API_KEY
    const apiUrl = process.env.POLZA_API_URL || 'https://api.polza.ai/api/v1'
    const model = process.env.POLZA_MODEL || 'openai/gpt-4o'
    const controller = new AbortController()
    const timeoutMs = Number(process.env.CHAT_TIMEOUT_MS || 25000)
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const useStub = !apiKey

    if (useStub) {
      const ragInfo = ragContext ? '\n\n(Использован RAG контекст для поиска ответа)' : ''
      const assistantResponse = `Заглушка ответа (нет POLZA_API_KEY).

Ваш вопрос: ${message}
Тип: ${userType || 'ip_usn'}
Сообщений в истории: ${Array.isArray(history) ? history.length : 0}${ragInfo}`

      return NextResponse.json({
        response: assistantResponse,
        success: true,
        stub: true
      })
    }
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    }).finally(() => {
      clearTimeout(timeoutId)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('Polza API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantResponse = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.'

    return NextResponse.json({
      response: assistantResponse,
      success: true
    })

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Upstream timeout' },
        { status: 504 }
      )
    }
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

