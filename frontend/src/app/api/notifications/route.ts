import { NextRequest, NextResponse } from 'next/server'

interface NotificationRequest {
  chatId: string
  message: string
  type?: 'deadline' | 'reminder' | 'alert'
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, type = 'reminder' } = await request.json() as NotificationRequest

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId and message are required' },
        { status: 400 }
      )
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      // Для демо режима - возвращаем успех без отправки
      console.log(`[DEMO] Notification: ${type} to ${chatId}: ${message}`)
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Уведомление отправлено (демо режим)'
      })
    }

    // Эмодзи в зависимости от типа
    const icons: Record<string, string> = {
      deadline: '📅',
      reminder: '⏰',
      alert: '⚠️'
    }

    const fullMessage = `${icons[type]} ${message}`

    // Отправка через Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: fullMessage,
          parse_mode: 'HTML'
        })
      }
    )

    const data = await response.json()

    if (!data.ok) {
      console.error('Telegram API error:', data)
      return NextResponse.json(
        { error: 'Failed to send notification', details: data.description },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Уведомление отправлено'
    })

  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET для проверки статуса
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Telegram Notifications API',
    version: '1.0.0'
  })
}
