import React from 'react'
import { localeMessages } from './locales'

export type Locale = 'en' | 'es' | 'pt' | 'cl'

export class Translator {
  private currentLocale: Locale = 'en'
  private translations: { [key: string]: string } = {}
  private listeners: (() => void)[] = []

  constructor(initialLocale?: Locale) {
    this.setLocale(initialLocale || 'en')
  }

  setLocale(locale: Locale) {
    this.currentLocale = locale
    this.translations = localeMessages[locale] as { [key: string]: string } || {}
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

// Create a new translator instance with specific locale
export function createTranslator(initialLocale?: Locale): Translator {
  return new Translator(initialLocale)
}

// React hook for translations
export function useTranslation() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)

  React.useEffect(() => {
    console.log('useTranslation: subscribing to translator changes')
    return translator.subscribe(() => {
      console.log('useTranslation: translator changed, forcing update')
      forceUpdate()
    })
  }, [])

  return {
    t: (key: string, fallback?: string) => translator.translate(key, fallback),
    locale: translator.getLocale(),
    setLocale: (locale: Locale) => {
      console.log('useTranslation: setting locale to', locale)
      translator.setLocale(locale)
      translator.savePreference(locale)
    }
  }
}