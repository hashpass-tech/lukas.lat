'use client'

import { useState, useEffect } from 'react'

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  const languages = {
    en: { name: 'EN', fullName: 'English' },
    es: { name: 'ES', fullName: 'Español' }, 
    pt: { name: 'PT', fullName: 'Português' },
    cl: { name: 'CL', fullName: 'Chileno' }
  }

  const changeLanguage = (lang: string) => {
    console.log('Changing to', lang)
    setCurrentLanguage(lang)
    localStorage.setItem('language', lang)
    
    // Navigate to the new language route
    const currentPath = window.location.pathname
    const newPath = currentPath.replace(/^\/[^\/]+/, `/${lang}`)
    window.location.href = newPath
  }

  useEffect(() => {
    // Get language from URL path first, then fallback to localStorage
    const pathLang = window.location.pathname.split('/')[1]
    const detectedLang = Object.keys(languages).includes(pathLang) ? pathLang : 'en'
    setCurrentLanguage(detectedLang)
    localStorage.setItem('language', detectedLang)
  }, [])

  return (
    <div className="flex items-center gap-1 p-1 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-lg">
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
            currentLanguage === code
              ? 'bg-white/30 dark:bg-white/20 text-slate-900 dark:text-white shadow-md backdrop-blur-sm border border-white/30 dark:border-white/20'
              : 'text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-white/5'
          }`}
          title={lang.fullName}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )
}
