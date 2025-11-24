"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Supported locales
const locales = ['en', 'es', 'pt', 'cl']
const defaultLocale = 'en'

// Function to detect user's preferred language on client side
function detectClientLocale(): string {
  // 1. Check localStorage
  const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('language') : null
  if (storedLocale && locales.includes(storedLocale)) {
    return storedLocale
  }

  // 2. Check browser language
  if (typeof window !== 'undefined' && window.navigator) {
    const browserLang = window.navigator.language.split('-')[0]
    if (locales.includes(browserLang)) {
      return browserLang
    }
  }

  // 3. Fallback to default
  return defaultLocale
}

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect for GitHub Pages compatibility
    if (typeof window !== 'undefined') {
      const detectedLocale = detectClientLocale()
      const newPath = `/${detectedLocale}/`
      
      // Use window.location for immediate redirect (more reliable on static hosting)
      window.location.href = newPath
    }
  }, [])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
        <p className="text-white/80 text-sm">Detecting language...</p>
        <p className="text-white/60 text-xs mt-2">Redirecting to appropriate locale</p>
      </div>
    </div>
  )
}
