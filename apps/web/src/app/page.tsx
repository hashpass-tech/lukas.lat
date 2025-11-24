"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { translator } from "@/lib/translator";

// Supported locales
const locales = ['en', 'es', 'pt', 'cl']
const defaultLocale = 'en'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Initialize translator and redirect
    if (typeof window !== 'undefined') {
      // Initialize translator with detected locale
      const detectedLocale = translator.detectBrowserLocale()
      translator.setLocale(detectedLocale)
      
      // Redirect to locale-specific route
      const newPath = `/${detectedLocale}`
      window.location.href = newPath
    }
  }, [])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
        <p className="text-white/80 text-sm">Initializing...</p>
        <p className="text-white/60 text-xs mt-2">Setting up translations</p>
      </div>
    </div>
  )
}
