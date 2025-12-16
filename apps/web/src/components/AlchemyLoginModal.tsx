"use client";

import React, { useEffect, useRef } from 'react';
import { useSmartAccountClient } from "@account-kit/react";
import { alchemyConfig } from "@/app/config";

interface AlchemyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (address: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Alchemy Login Modal Component
 * 
 * This component renders the Alchemy AccountKit login UI within a modal.
 * It listens for the "triggerAlchemyAuth" event to show the modal and emits
 * custom events when authentication succeeds or fails.
 */
export function AlchemyLoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onError 
}: AlchemyLoginModalProps) {
  // TODO: Fix AccountKit integration - temporarily using placeholder
  const address = null; // useSmartAccountClient should be properly integrated
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Alchemy account connection
  useEffect(() => {
    if (address) {
      // Dispatch success event for wallet provider
      window.dispatchEvent(
        new CustomEvent('alchemyAuthSuccess', {
          detail: { address }
        })
      );

      if (onSuccess) {
        onSuccess(address);
      }

      onClose();
    }
  }, [address, onClose, onSuccess]);

  // Listen for trigger event from wallet provider
  useEffect(() => {
    const handleTriggerAuth = () => {
      // Show the modal or trigger authentication
      if (containerRef.current) {
        containerRef.current.style.display = 'block';
      }
    };

    window.addEventListener('triggerAlchemyAuth', handleTriggerAuth);

    return () => {
      window.removeEventListener('triggerAlchemyAuth', handleTriggerAuth);
    };
  }, []);

  // Handle modal close
  const handleClose = () => {
    if (containerRef.current) {
      containerRef.current.style.display = 'none';
    }
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Alchemy AccountKit UI will be rendered here by the AlchemyAccountProvider */}
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Sign in with Alchemy</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Use email, passkey, or social login to create a wallet account
              </p>
            </div>
            {/* The AlchemyAccountProvider will inject the UI here */}
            <button
              onClick={handleClose}
              className="mt-6 w-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted bg-muted/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
