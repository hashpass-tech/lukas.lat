'use client'

import React from 'react'
import { useTranslation } from '@/lib/translator'

interface TransProps {
  i18nKey?: string
  id?: string
  fallback?: string
  message?: string
  className?: string
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any> | 'span'
  children?: React.ReactNode
}

export function Trans({ i18nKey, id, fallback, message, className, as: Component = 'span' }: TransProps) {
  const { t } = useTranslation()
  
  // Support both old format (id/message) and new format (i18nKey/fallback)
  const key = i18nKey || id || ''
  const fallbackText = fallback || message || key
  const translatedText = t(key, fallbackText)

  if (Component === React.Fragment) {
    return <>{translatedText}</>
  }

  const Comp = Component as React.ComponentType<any>
  return <Comp className={className}>{translatedText}</Comp>
}

// Hook for easy access to translations
export function useTrans() {
  const { t, locale, setLocale } = useTranslation()
  return { t, locale, setLocale }
}
