'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export function PWAInstallPrompt() {
  const { canInstall, install, swUpdate, updateServiceWorker } = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(swUpdate);

  const handleInstall = async () => {
    const outcome = await install();
    console.log('Install outcome:', outcome);
  };

  const handleUpdate = () => {
    updateServiceWorker();
    setShowUpdatePrompt(false);
  };

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-gradient-to-r from-emerald-500/90 to-green-600/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Install Lukas App
                </h3>
                <p className="text-white/80 text-xs mb-3">
                  Get the full experience with offline access and push notifications
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Install
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('pwa-dismiss'))}
                    className="bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showUpdatePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Update Available
                </h3>
                <p className="text-white/80 text-xs mb-3">
                  A new version of Lukas is available with improvements and bug fixes
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={() => setShowUpdatePrompt(false)}
                    className="bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
