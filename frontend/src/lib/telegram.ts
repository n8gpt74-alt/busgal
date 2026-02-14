// Telegram Mini App utilities
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    receiver?: TelegramUser
    chat?: any
    chat_type?: string
    chat_instance?: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: string
  themeParams: any
  isExpanded: boolean
  viewportHeight: number
  viewportWidth: number
  headerColor: string
  backgroundColor: string
  bottomBarColor: string
  ready: () => void
  expand: () => void
  close: () => void
  sendData: (data: any) => void
  switchInlineQuery: (query: string, choose_chat_types?: boolean) => void
  openLink: (url: string, options?: any) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, options?: any) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (ok: boolean) => void) => void
  showScanQrPopup: (options?: any, callback?: (text: string) => void) => void
  closeScanQrPopup: () => void
  mainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
  }
  secondaryButton: any
  HapticFeedback: any
}

// Declare global Telegram object
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

// Check if running in Telegram
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined
}

// Get Telegram user
export function getTelegramUser(): TelegramUser | null {
  if (isTelegramWebApp()) {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null
  }
  return null
}

// Initialize Telegram Web App
export function initTelegramWebApp(): void {
  if (isTelegramWebApp()) {
    const webApp = window.Telegram?.WebApp as any
    webApp?.ready()
    webApp?.expand()
    
    // Set theme colors
    try {
      webApp?.setHeaderColor?.('#0ea5e9')
      webApp?.setBackgroundColor?.('#ffffff')
    } catch (e) {
      console.log('Telegram colors not supported')
    }
    
    console.log('Telegram Web App initialized')
  }
}

// Show notification in Telegram
export function showTelegramNotification(message: string): void {
  if (isTelegramWebApp()) {
    window.Telegram?.WebApp?.showAlert(message)
  } else {
    alert(message)
  }
}

// Confirm action in Telegram
export function confirmTelegramAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (isTelegramWebApp()) {
      window.Telegram?.WebApp?.showConfirm(message, (ok) => {
        resolve(ok)
      })
    } else {
      resolve(confirm(message))
    }
  })
}

// Get init data for API requests
export function getTelegramInitData(): string {
  if (isTelegramWebApp()) {
    return window.Telegram?.WebApp?.initData || ''
  }
  return ''
}
