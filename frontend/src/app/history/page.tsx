'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Trash2, ChevronRight, Plus, 
  Bot, Clock, Trash, Search, X
} from 'lucide-react'
import { 
  getChatSessions, 
  deleteChatSession, 
  clearAllChatHistory,
  formatChatDate,
  ChatSession
} from '@/lib/chat-history'

const userTypeNames: Record<string, string> = {
  'ip_usn': 'ИП на УСН',
  'ip_patent': 'ИП на патенте',
  'selfemployed': 'Самозанятый',
  'ooo': 'ООО'
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = () => {
    const data = getChatSessions()
    setSessions(data)
  }

  const handleDeleteSession = (id: string) => {
    deleteChatSession(id)
    loadSessions()
    setDeleteConfirm(null)
  }

  const handleClearAll = () => {
    clearAllChatHistory()
    loadSessions()
    setShowClearConfirm(false)
  }

  const handleNewChat = () => {
    window.location.href = '/'
  }

  // Filter sessions by search query
  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = new Date(session.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let key = date.toLocaleDateString('ru-RU')
    if (date.toDateString() === today.toDateString()) {
      key = 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Вчера'
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(session)
    return groups
  }, {} as Record<string, ChatSession[]>)

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
              <span className="text-white text-lg">←</span>
            </a>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">История чатов</h1>
              <p className="text-xs text-blue-300">{sessions.length} сохранённых чатов</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleNewChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Новый</span>
            </motion.button>
            {sessions.length > 0 && (
              <motion.button
                onClick={() => setShowClearConfirm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Search */}
      <div className="relative z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск в чатах..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {sessions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Нет сохранённых чатов</h2>
              <p className="text-gray-400 mb-6">Ваши чаты с AI-бухгалтером будут сохраняться здесь</p>
              <motion.button
                onClick={handleNewChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl"
              >
                Начать новый чат
              </motion.button>
            </motion.div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">По вашему запросу ничего не найдено</p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date} className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">{date}</h3>
                <div className="space-y-2">
                  {dateSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <a
                        href={`/?session=${session.id}`}
                        className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-blue-300">
                                {userTypeNames[session.userType] || 'ИП на УСН'}
                              </span>
                            </div>
                            <h4 className="text-white font-medium truncate">{session.title}</h4>
                            <p className="text-sm text-gray-400 truncate">
                              {session.messages[session.messages.length - 1]?.content || 'Пустой чат'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatChatDate(session.updatedAt)}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </a>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteConfirm(session.id)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Удалить чат?</h3>
              <p className="text-gray-400 mb-6">Это действие нельзя отменить.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleDeleteSession(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear all confirmation modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Очистить всю историю?</h3>
              <p className="text-gray-400 mb-6">Все {sessions.length} чатов будут удалены безвозвратно.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Очистить всё
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
