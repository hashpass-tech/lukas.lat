"use client";

import { AnimatePresence, motion } from "motion/react";
import { Trans } from "@/components/Trans";
import { useTranslation } from "@/lib/translator";

type Currency = {
  country: string;
  code: string;
  name: string;
  weight: number;
  color: string;
};

interface CurrencyModalProps {
  currency: Currency | null;
  onClose: () => void;
  currencies: Currency[];
}

export function CurrencyModal({ currency, onClose, currencies }: CurrencyModalProps) {
  const { locale } = useTranslation(); // Ensure re-render on language change
  
  if (!currency) {
    return null;
  }
  
  // Special handling for LUKAS token
  if (currency.code === 'LUKAS') {
    return <LukasTokenModal onClose={onClose} currencies={currencies} />;
  }

  // Regular currency modal
  const imageUrl = `/coins/${currency.code.toLowerCase()}-coin.svg`;
  return (
    <AnimatePresence>
      {currency && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-slate-300/60 dark:border-slate-700/40 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              currency={currency}
              onClose={onClose}
              showIcon={true}
            />

            <ModalBody currency={currency} imageUrl={imageUrl} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LukasTokenModal({ 
  onClose, 
  currencies 
}: { 
  onClose: () => void;
  currencies: Currency[];
}) {
  const { locale } = useTranslation(); // Ensure re-render on language change
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full border border-slate-300/60 dark:border-slate-700/40 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader
            currency={{
              code: 'LUKAS',
              name: 'LUKAS Token',
              country: '🌟',
              weight: 100,
              color: 'from-emerald-400 to-green-600'
            }}
            onClose={onClose}
            showIcon={false}
          />

          <div className="space-y-6 text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
                <Trans i18nKey="lukas.what_is_title" fallback="What is LUKAS?" />
              </h4>
              <p className="leading-relaxed">
                <Trans
                  i18nKey="lukas.description"
                  fallback="$LUKAS is the first regional stable-basket meme coin designed to unify Latin American currency volatility into a single, gravity-centered asset. It combines the stability of a basket of major Latin American currencies with the community-driven nature of meme coins."
                />
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
                <Trans i18nKey="lukas.key_features" fallback="Key Features" />
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong><Trans i18nKey="lukas.regional_focus" fallback="Regional Focus:" /></strong>{" "}
                  <Trans i18nKey="lukas.regional_focus_desc" fallback="Optimized for Latin American markets" />
                </li>
                <li>
                  <strong><Trans i18nKey="lukas.stable_basket" fallback="Stable Basket:" /></strong>{" "}
                  <Trans i18nKey="lukas.stable_basket_desc" fallback="Backed by BRL, MXN, COP, CLP, and ARS" />
                </li>
                <li>
                  <strong><Trans i18nKey="lukas.gravity_centered" fallback="Gravity-Centered:" /></strong>{" "}
                  <Trans i18nKey="lukas.gravity_centered_desc" fallback="Algorithmically balanced for stability" />
                </li>
                <li>
                  <strong><Trans i18nKey="lukas.community_driven" fallback="Community Driven:" /></strong>{" "}
                  <Trans i18nKey="lukas.community_driven_desc" fallback="Meme coin culture with real utility" />
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">
                <Trans i18nKey="lukas.currency_basket" fallback="Currency Basket" />
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {currencies.map((c) => (
                  <div key={c.code} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-lg">{c.country}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{c.code}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{c.weight}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ModalHeaderProps {
  currency: Currency;
  onClose: () => void;
  showIcon: boolean;
}

function ModalHeader({ currency, onClose, showIcon }: ModalHeaderProps) {
  const { locale } = useTranslation(); // Ensure re-render on language change
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 ${
          currency.code === 'LUKAS' 
            ? 'bg-gradient-to-br from-emerald-400 to-green-600' 
            : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
        } rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className="text-3xl">
            {currency.code === 'LUKAS' ? '🌟' : currency.country}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {currency.code === 'LUKAS' ? (
              <Trans i18nKey="lukas.token.title" fallback="LUKAS Token" />
            ) : (
              currency.code
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {currency.code === 'LUKAS' ? (
              <Trans i18nKey="lukas.token.subtitle" fallback="Regional Stable-Basket Meme Coin" />
            ) : (
              <Trans i18nKey={currency.name} fallback={currency.name} />
            )}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ModalBodyProps {
  currency: Currency;
  imageUrl: string;
}

function ModalBody({ currency, imageUrl }: ModalBodyProps) {
  const { locale } = useTranslation(); // Ensure re-render on language change
  
  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-2xl">
        <img
          src={imageUrl}
          alt={`${currency.code} coin`}
          className="w-full h-full object-contain p-4 dark:invert"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden w-full h-full flex items-center justify-center">
          <span className="text-6xl dark:invert">{currency.country}</span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          {currency.weight}%
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          <Trans i18nKey="currency.weight" fallback="Currency Weight" />
        </p>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <Trans
          i18nKey={`currency.${currency.code.toLowerCase()}.description`}
          fallback=""
        />
      </div>
    </div>
  );
}
