'use client'

import React, { useEffect } from 'react'
import { translator, Locale } from '@/lib/translator'

interface TranslationProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export function TranslationProvider({ children, initialLocale }: TranslationProviderProps) {
  useEffect(() => {
    // Always set the locale to match the URL
    if (initialLocale) {
      translator.setLocale(initialLocale)
      translator.savePreference(initialLocale)
    }
  }, [initialLocale])

  return <>{children}</>
}
