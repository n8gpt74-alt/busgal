'use client'

import { useState } from 'react'
import { isTelegramWebApp, getTelegramUser } from '@/lib/telegram'

interface NotificationSettings {
  deadlines: boolean
  reminders: boolean
  news: boolean
  chatId: string
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    deadlines: true,
    reminders: true,
    news: false,
    chatId: ''
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const user = getTelegramUser()
  const isTelegram = isTelegramWebApp()

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: settings.chatId || String(user?.id || ''),
          message: 'Настройки уведомлений обновлены!',
          type: 'reminder'
        })
      })
      
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Не удалось сохранить настройки. Проверьте соединение и попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  const testNotification = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: settings.chatId || String(user?.id || ''),
          message: 'Тестовое уведомление от SmartAccount! ✅',
          type: 'reminder'
        })
      })
      alert('Тестовое уведомление отправлено!')
    } catch (error) {
      console.error('Error:', error)
      alert('Не удалось отправить тестовое уведомление.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-lg">←</span>
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900">🔔 Уведомления</h1>
            <p className="text-sm text-gray-500">Настройка оповещений</p>
          </div>
        </div>

        {/* Telegram Info */}
        {isTelegram && user && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800">
              Telegram ID: <strong>{user.id}</strong>
            </p>
          </div>
        )}

        {/* Chat ID Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Telegram Chat ID
          </label>
          <input
            type="text"
            value={settings.chatId}
            onChange={(e) => setSettings(prev => ({ ...prev, chatId: e.target.value }))}
            placeholder={user?.id?.toString() || 'Введите ваш Chat ID'}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-2">
            Узнать Chat ID можно у @userinfobot в Telegram
          </p>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Типы уведомлений</h3>
          </div>
          
          {/* Deadlines */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">📅 Сроки отчётности</p>
              <p className="text-sm text-gray-500">Напоминания о налогах и отчётах</p>
            </div>
            <button
              onClick={() => handleToggle('deadlines')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.deadlines ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.deadlines ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Reminders */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">⏰ Напоминания</p>
              <p className="text-sm text-gray-500">Ежедневные/еженедельные напоминания</p>
            </div>
            <button
              onClick={() => handleToggle('reminders')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.reminders ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.reminders ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* News */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">📰 Новости</p>
              <p className="text-sm text-gray-500">Изменения в законодательстве</p>
            </div>
            <button
              onClick={() => handleToggle('news')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.news ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.news ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={testNotification}
          className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors mb-4"
        >
          🧪 Отправить тестовое уведомление
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl transition-all ${
            saved ? 'from-green-500 to-green-600' : ''
          } shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40`}
        >
          {loading ? 'Сохранение...' : saved ? '✅ Сохранено!' : 'Сохранить настройки'}
        </button>

        {/* Help */}
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600">
            <strong>Как настроить:</strong>
          </p>
          <ol className="text-sm text-gray-600 mt-2 space-y-1">
            <li>1. Напишите @userinfobot в Telegram</li>
            <li>2. Скопируйте ваш Chat ID</li>
            <li>3. Вставьте в поле выше</li>
            <li>4. Включите нужные уведомления</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
