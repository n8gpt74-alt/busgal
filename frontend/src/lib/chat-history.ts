// Chat history storage utilities using localStorage

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatSession {
  id: string
  userType: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'smartaccount_chat_history'
const MAX_SESSIONS = 10
const MAX_MESSAGES_PER_SESSION = 100

// Get all chat sessions
export function getChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const sessions = JSON.parse(data) as ChatSession[]
    // Sort by updatedAt descending
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

// Get a specific chat session
export function getChatSession(id: string): ChatSession | null {
  const sessions = getChatSessions()
  return sessions.find(s => s.id === id) || null
}

// Save a new message to a session
export function saveMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return
  
  const sessions = getChatSessions()
  const sessionIndex = sessions.findIndex(s => s.id === sessionId)
  
  const newMessage: ChatMessage = {
    ...message,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  }
  
  if (sessionIndex === -1) {
    // Create new session
    const newSession: ChatSession = {
      id: sessionId,
      userType: message.role === 'user' ? 'ip_usn' : 'ip_usn', // Default, will be updated
      title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      messages: [newMessage],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    sessions.unshift(newSession)
  } else {
    // Add to existing session
    sessions[sessionIndex].messages.push(newMessage)
    
    // Update title if first user message
    if (message.role === 'user' && sessions[sessionIndex].messages.length === 1) {
      sessions[sessionIndex].title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
    }
    
    sessions[sessionIndex].updatedAt = Date.now()
    
    // Move to top
    const [session] = sessions.splice(sessionIndex, 1)
    sessions.unshift(session)
  }
  
  // Limit messages per session
  if (sessions[0] && sessions[0].messages.length > MAX_MESSAGES_PER_SESSION) {
    sessions[0].messages = sessions[0].messages.slice(-MAX_MESSAGES_PER_SESSION)
  }
  
  // Limit total sessions
  while (sessions.length > MAX_SESSIONS) {
    sessions.pop()
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

// Create a new chat session
export function createChatSession(userType: string): ChatSession {
  const session: ChatSession = {
    id: Date.now().toString(),
    userType,
    title: 'Новый чат',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  const sessions = getChatSessions()
  sessions.unshift(session)
  
  // Limit total sessions
  while (sessions.length > MAX_SESSIONS) {
    sessions.pop()
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  return session
}

// Update session user type
export function updateSessionUserType(sessionId: string, userType: string): void {
  const sessions = getChatSessions()
  const session = sessions.find(s => s.id === sessionId)
  
  if (session) {
    session.userType = userType
    session.updatedAt = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }
}

// Delete a chat session
export function deleteChatSession(id: string): void {
  const sessions = getChatSessions()
  const filtered = sessions.filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

// Clear all chat history
export function clearAllChatHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Format timestamp to readable date
export function formatChatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    return days[date.getDay()]
  }
  
  // Default
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// Get welcome message for user type
export function getWelcomeMessage(userType: string): string {
  const messages: Record<string, string> = {
    'ip_usn': 'Привет! Я ваш AI-бухгалтер для ИП на УСН. Могу помочь с налогами, расходами, отчётностью. О чём хотите спросить?',
    'ip_patent': 'Привет! Я ваш AI-бухгалтер для ИП на патенте. Расскажу про налоги, лимиты и требования. Что интересует?',
    'selfemployed': 'Привет! Я ваш AI-бухгалтер для самозанятых. Помогу разобраться с чеками, налогами и доходами. О чём спросим?',
    'ooo': 'Привет! Я ваш AI-бухгалтер для ООО. Могу помочь с налогами, зарплатами, отчётностью. Что хотите узнать?'
  }
  return messages[userType] || 'Привет! Я ваш AI-бухгалтер. Чем могу помочь?'
}
