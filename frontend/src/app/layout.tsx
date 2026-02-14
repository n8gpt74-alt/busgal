import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartAccount - AI Бухгалтер',
  description: 'Ваш личный AI-бухгалтер в кармане',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>{children}</body>
    </html>
  )
}
