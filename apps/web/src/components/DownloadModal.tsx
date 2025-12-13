'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, File, Twitter, Send, Link2, Check } from 'lucide-react';
import { Trans } from '@/components/Trans';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal = ({ isOpen, onClose }: DownloadModalProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleDownload = (type: 'pdf' | 'txt') => {
    const link = document.createElement('a');
    link.href = type === 'pdf' 
      ? '/docs/whitepaper-lukas-v0.1.0.pdf' 
      : '/docs/lukas_manifesto_block_927773.txt';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (platform: 'twitter' | 'telegram' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://lukas.lat';
    const text = 'Check out $LUKAS - The Center of Gravity for Latin American Weights 🌎';
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto mx-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">
                  <Trans i18nKey="download.title" fallback="Download" />
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-accent/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Download Options */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    <Trans i18nKey="download.choose_format" fallback="Choose format" />
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleDownload('pdf')}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-border bg-accent/30 hover:bg-accent/60 transition-colors group"
                    >
                      <div className="p-2 sm:p-3 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-center">
                        <Trans i18nKey="download.whitepaper" fallback="Whitepaper" />
                      </span>
                      <span className="text-xs text-muted-foreground">PDF</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownload('txt')}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-border bg-accent/30 hover:bg-accent/60 transition-colors group"
                    >
                      <div className="p-2 sm:p-3 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <File className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-center">
                        <Trans i18nKey="download.manifesto" fallback="Manifesto" />
                      </span>
                      <span className="text-xs text-muted-foreground">TXT</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    <Trans i18nKey="download.or_share" fallback="or share" />
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Share Options */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 sm:p-3 rounded-full border border-border bg-accent/30 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 transition-colors group"
                    title="Share on X"
                  >
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-[#1DA1F2] transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => handleShare('telegram')}
                    className="p-2 sm:p-3 rounded-full border border-border bg-accent/30 hover:bg-[#0088cc]/20 hover:border-[#0088cc]/50 transition-colors group"
                    title="Share on Telegram"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-[#0088cc] transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-2 sm:p-3 rounded-full border border-border bg-accent/30 hover:bg-accent/60 transition-colors group"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    ) : (
                      <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DownloadModal;
