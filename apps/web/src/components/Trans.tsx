'use client'

import React from 'react'
import { useTranslation } from '@/lib/translator'

interface TransProps {
  i18nKey: string
  fallback?: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  children?: React.ReactNode
}

export function Trans({ i18nKey, fallback, className, as: Component = 'span', children }: TransProps) {
  const { t } = useTranslation()
  const translatedText = t(i18nKey, fallback)

  if (Component === React.Fragment) {
    return <>{translatedText}</>
  }

  return <Component className={className}>{translatedText}</Component>
}

// Hook for easy access to translations
export function useTrans() {
  const { t, locale, setLocale } = useTranslation()
  return { t, locale, setLocale }
}
