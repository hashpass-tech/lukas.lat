'use client'

import { Trans, useTrans } from './Trans'

export function TranslationDemo() {
  const { t, locale } = useTrans()

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <h2 className="text-xl font-bold mb-4">
        <Trans i18nKey="welcome.title" fallback="Welcome to $LUKAS" />
      </h2>
      
      <p className="mb-4">
        <Trans i18nKey="welcome.description" fallback="The first regional Latin American basket-stable meme coin" />
      </p>
      
      <div className="text-sm text-white/70">
        <p>Current locale: {locale}</p>
        <p>Translation example: {t('common.loading', 'Loading...')}</p>
      </div>
    </div>
  )
}
