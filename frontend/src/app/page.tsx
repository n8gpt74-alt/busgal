'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, FileText, Bell, Calculator, TrendingUp, Shield, 
  CheckCircle, ArrowRight, Sparkles, Zap, CreditCard,
  Briefcase, Users, Building
} from 'lucide-react'
import { initTelegramWebApp, isTelegramWebApp } from '@/lib/telegram'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const userTypes = [
  { 
    id: 'ip_usn', 
    name: 'ИП на УСН', 
    desc: 'Упрощённая система',
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50'
  },
  { 
    id: 'ip_patent', 
    name: 'ИП на патенте', 
    desc: 'Патентная система',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50'
  },
  { 
    id: 'selfemployed', 
    name: 'Самозанятый', 
    desc: 'Налог на проф. доход',
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50'
  },
  { 
    id: 'ooo', 
    name: 'ООО', 
    desc: 'Общество с ограниченной ответственностью',
    icon: Building,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50'
  }
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<string>('')
  const [showTypeSelector, setShowTypeSelector] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initTelegramWebApp()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userType: userType,
          history: messages
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectUserType = (type: string) => {
    setUserType(type)
    setShowTypeSelector(false)
    setMessages([{
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(type),
      timestamp: new Date()
    }])
  }

  const getWelcomeMessage = (type: string) => {
    const messages: Record<string, string> = {
      'ip_usn': 'Привет! Я ваш AI-бухгалтер для ИП на УСН. Могу помочь с налогами, расходами, отчётностью. О чём хотите спросить?',
      'ip_patent': 'Привет! Я ваш AI-бухгалтер для ИП на патенте. Расскажу про налоги, лимиты и требования. Что интересует?',
      'selfemployed': 'Привет! Я ваш AI-бухгалтер для самозанятых. Помогу разобраться с чеками, налогами и доходами. О чём спросим?',
      'ooo': 'Привет! Я ваш AI-бухгалтер для ООО. Могу помочь с налогами, зарплатами, отчётностью. Что хотите узнать?'
    }
    return messages[type] || 'Привет! Я ваш AI-бухгалтер. Чем могу помочь?'
  }

  const currentType = userTypes.find(t => t.id === userType)

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0f]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SmartAccount</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                AI Бухгалтер
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.a 
              href="/documents"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Документы</span>
            </motion.a>
            <motion.a 
              href="/notifications"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
            </motion.a>
            <motion.button 
              onClick={() => { setMessages([]); setShowTypeSelector(true) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Сменить
            </motion.button>
          </div>
        </div>
      </header>

      {/* User Type Selector */}
      <AnimatePresence>
        {showTypeSelector ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex items-center justify-center p-4 relative z-10"
          >
            <div className="max-w-md w-full">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/30"
                  animate={{ 
                    boxShadow: ['0 0 30px rgba(139, 92, 246, 0.3)', '0 0 60px rgba(139, 92, 246, 0.5)', '0 0 30px rgba(139, 92, 246, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Добро пожаловать!</h2>
                <p className="text-gray-400">Выберите тип налогоплательщика для персонализированной помощи</p>
              </motion.div>
              
              <div className="space-y-3">
                {userTypes.map((type, index) => (
                  <motion.button
                    key={type.id}
                    onClick={() => selectUserType(type.id)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 text-left bg-gradient-to-r ${type.bgGradient} hover:from-white hover:to-gray-50 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40 group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${type.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg">{type.name}</p>
                        <p className="text-sm text-gray-600">{type.desc}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 relative z-10">
              <div className="max-w-3xl mx-auto space-y-4">
                {/* User Type Badge */}
                {currentType && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center mb-4"
                  >
                    <div className={`px-4 py-1.5 bg-gradient-to-r ${currentType.gradient} rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-lg`}>
                      <currentType.icon className="w-4 h-4" />
                      <span>{currentType.name}</span>
                    </div>
                  </motion.div>
                )}
                
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 backdrop-blur-sm border border-white/10 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.span 
                            key={i}
                            className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="relative z-10 bg-white/5 backdrop-blur-xl border-t border-white/10 p-4">
              <div className="max-w-3xl mx-auto flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите ваш вопрос..."
                    className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-500 transition-all"
                    disabled={isLoading}
                  />
                </div>
                <motion.button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span className="hidden sm:inline">Отправить</span>
                </motion.button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
