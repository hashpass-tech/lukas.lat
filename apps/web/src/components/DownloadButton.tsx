'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadButtonProps {
  href: string;
  label?: string;
}

export const DownloadButton = ({ href, label = 'Download' }: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

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
    }, 3500);
  };

  return (
    <motion.button
      onClick={handleDownloadClick}
      className={`relative flex items-center border-2 rounded-full overflow-hidden transition-all
        ${isDownloading ? 'cursor-wait border-blue-500' : 'cursor-pointer border-blue-500'}`}
      animate={{
        width: isDownloading ? 48 : 140,
        borderRadius: '9999px'
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ minWidth: isDownloading ? '48px' : '140px', height: 48 }}
    >
      {/* Spinner animation inside circle */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            className="absolute inset-0 w-2 h-2 bg-white rounded-full m-auto z-20"
            initial={{ opacity: 1 }}
            animate={{
              rotate: 360,
              x: [0, 20, 0, -20, 0],
              y: [0, -20, 0, 20, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
          />
        )}
      </AnimatePresence>

      {/* Circular button with icon */}
      <motion.div
        className="h-12 w-12 rounded-full bg-blue-500 flex justify-center items-center relative shadow-lg z-10 flex-shrink-0"
        animate={isDownloading ? {
          rotate: 180,
          scale: [0.95, 1, 0.95],
        } : {}}
        transition={{
          duration: isDownloading ? 1 : 0.4,
          times: isDownloading ? [0, 0.7, 1] : undefined
        }}
      >
        {/* Progress fill */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-blue-800 rounded-full"
          initial={{ height: '0%' }}
          animate={isDownloading ? { height: '100%' } : { height: '0%' }}
          transition={{ duration: 3, ease: 'easeInOut' }}
          style={{ zIndex: 1 }}
        />

        {/* Download icon */}
        <motion.svg
          className="w-5 h-5 text-white z-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ opacity: 1 }}
          animate={{ opacity: isDownloading ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 19V5m0 14-4-4m4 4 4-4"
          />
        </motion.svg>

        {/* Loading block */}
        <motion.div
          className="w-3 h-3 rounded-full bg-white absolute z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isDownloading ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Download label */}
      <AnimatePresence>
        {!isDownloading && (
          <motion.span
            className="ml-2 pr-3 text-white text-sm font-medium select-none z-10 whitespace-nowrap"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default DownloadButton;
