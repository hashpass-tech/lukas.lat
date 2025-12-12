'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans } from '@/components/Trans';

interface DownloadButtonProps {
  href: string;
  label?: string;
  i18nKey?: string;
}

export const DownloadButton = ({ href, label = 'Download', i18nKey }: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDownloadClick = () => {
    if (isDownloading) return;

    setIsDownloading(true);

    // Trigger actual download
    const link = document.createElement('a');
    link.href = href;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset after animation
    setTimeout(() => {
      setIsDownloading(false);
    }, 2500);
  };

  return (
    <motion.button
      onClick={handleDownloadClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center rounded-full overflow-hidden
        ${isDownloading 
          ? 'cursor-wait' 
          : 'cursor-pointer'
        }
        bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
        dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600
        shadow-md hover:shadow-lg hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/20
        transition-shadow duration-300`}
      animate={{
        width: isDownloading ? 34 : 130,
        scale: isHovered && !isDownloading ? 1.02 : 1,
      }}
      transition={{ 
        duration: 0.35, 
        ease: [0.4, 0, 0.2, 1],
        scale: { duration: 0.2 }
      }}
      style={{ minWidth: isDownloading ? '34px' : '130px', height: 34 }}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered && !isDownloading ? '100%' : '-100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Spinner animation inside circle */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{
                x: [0, 10, 0, -10, 0],
                y: [0, -10, 0, 10, 0],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular button with icon */}
      <motion.div
        className="h-8 w-8 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm flex justify-center items-center relative z-10 flex-shrink-0 ml-px"
        animate={isDownloading ? {
          rotate: 360,
        } : {
          rotate: 0,
        }}
        transition={{
          duration: isDownloading ? 2 : 0.3,
          ease: isDownloading ? 'linear' : 'easeOut',
          repeat: isDownloading ? Infinity : 0,
        }}
      >
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
          <motion.circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <motion.circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isDownloading ? 1 : 0 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            style={{ 
              strokeDasharray: '81.7',
              strokeDashoffset: '0',
            }}
          />
        </svg>

        {/* Download icon */}
        <motion.svg
          className="w-4 h-4 text-white z-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ 
            opacity: isDownloading ? 0 : 1,
            y: isDownloading ? 10 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16"
          />
        </motion.svg>

        {/* Checkmark on complete */}
        <motion.svg
          className="w-5 h-5 text-white absolute z-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: isDownloading ? 0 : 0,
            scale: isDownloading ? 0.5 : 0.5,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      {/* Download label */}
      <AnimatePresence mode="wait">
        {!isDownloading && (
          <motion.span
            className="ml-1.5 pr-3 text-white text-sm font-medium select-none z-10 whitespace-nowrap drop-shadow-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {i18nKey ? <Trans i18nKey={i18nKey} fallback={label} /> : label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default DownloadButton;
