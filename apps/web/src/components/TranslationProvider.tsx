'use client'

import React, { useEffect } from 'react'
import { translator, Locale } from '@/lib/translator'

interface TranslationProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export function TranslationProvider({ children, initialLocale }: TranslationProviderProps) {
  useEffect(() => {
    // Initialize translator with detected locale
    if (typeof window !== 'undefined') {
      const detectedLocale = initialLocale || translator.detectBrowserLocale()
      translator.setLocale(detectedLocale)
    }
  }, [initialLocale])

  return <>{children}</>
}
