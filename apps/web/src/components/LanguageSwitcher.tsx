'use client'

import { useTranslation } from '@/lib/translator'

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  const languages = {
    en: { name: 'EN', fullName: 'English' },
    es: { name: 'ES', fullName: 'Español' }, 
    pt: { name: 'PT', fullName: 'Português' },
    cl: { name: 'CL', fullName: 'Chileno' }
  }

  const changeLanguage = (lang: string) => {
    console.log('LanguageSwitcher: Changing to', lang, 'from', locale)
    setLocale(lang as any)
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-full backdrop-blur-md bg-card/80 dark:bg-card/60 border border-border shadow-lg">
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
            locale === code
              ? 'bg-primary text-primary-foreground shadow-md backdrop-blur-sm border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
          title={lang.fullName}
        >
          {lang.name}
        </button>
      ))}
    </div>
  )
}
