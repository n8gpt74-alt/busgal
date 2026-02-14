import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/data/tax-knowledge'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, userType, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const systemPrompt = buildSystemPrompt(userType || 'ip_usn')

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

    // Запрос к Polza AI API
    const apiKey = process.env.POLZA_API_KEY
    const apiUrl = process.env.POLZA_API_URL || 'https://api.polza.ai/api/v1'
    const model = process.env.POLZA_MODEL || 'openai/gpt-4o'

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Polza API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from AI', details: error },
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
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
