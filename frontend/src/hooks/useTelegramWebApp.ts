import { useEffect, useState } from 'react'

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
    }
    auth_date: number
    hash: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void
    getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void
    removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void
    removeItems: (keys: string[], callback?: (error: Error | null, success: boolean) => void) => void
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void
  }
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
  sendData: (data: string) => void
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  enableVerticalSwipes: () => void
  disableVerticalSwipes: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export const useTelegramWebApp = (): TelegramWebApp | null => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp)
    }
  }, [])

  return webApp
}

