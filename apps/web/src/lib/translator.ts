import React from 'react'
import { localeMessages } from './locales'

export type Locale = 'en' | 'es' | 'pt' | 'cl'

export class Translator {
  private currentLocale: Locale = 'en'
  private translations: Record<string, string> = {}
  private listeners: (() => void)[] = []

  constructor() {
    this.setLocale('en')
  }

  setLocale(locale: Locale) {
    this.currentLocale = locale
    this.translations = localeMessages[locale] || {}
    this.notifyListeners()
  }

  getLocale(): Locale {
    return this.currentLocale
  }

  translate(key: string, fallback?: string): string {
    return this.translations[key] || fallback || key
  }

  // Subscribe to language changes
  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  // Detect browser language
  detectBrowserLocale(): Locale {
    if (typeof window === 'undefined') return 'en'
    
    // 1. Check localStorage
    const stored = localStorage.getItem('language') as Locale
    if (['en', 'es', 'pt', 'cl'].includes(stored)) {
      return stored
    }

    // 2. Check browser language
    const browserLang = navigator.language.split('-')[0] as Locale
    if (['en', 'es', 'pt', 'cl'].includes(browserLang)) {
      return browserLang
    }

    return 'en'
  }

  // Save preference
  savePreference(locale: Locale) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', locale)
      document.cookie = `language=${locale}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=lax`
    }
  }
}

// Global translator instance
export const translator = new Translator()

// React hook for translations
export function useTranslation() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)

  React.useEffect(() => {
    return translator.subscribe(forceUpdate)
  }, [])

  return {
    t: (key: string, fallback?: string) => translator.translate(key, fallback),
    locale: translator.getLocale(),
    setLocale: (locale: Locale) => {
      translator.setLocale(locale)
      translator.savePreference(locale)
    }
  }
}
