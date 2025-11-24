"use client";

import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WalletHeader } from "@/components/WalletHeader";
import { useWallet } from "@/app/providers/wallet-provider";

export function HeaderClient() {
  try {
    const { isConnected } = useWallet();
    
    return (
      <div className="pointer-events-auto w-full flex justify-between items-center px-4 py-2">
        <div className="flex-1" />
        <LanguageSwitcher />
        <div className="flex-1 flex justify-end items-center gap-3">
          <WalletHeader />
          <LightPullThemeSwitcher />
        </div>
      </div>
    );
  } catch (error) {
    // Fallback if wallet context is not available
    return (
      <div className="pointer-events-auto w-full flex justify-between items-start px-4 py-2">
        <div className="flex-1" />
        <LanguageSwitcher />
        <div className="flex-1 flex justify-end items-start gap-3">
          <LightPullThemeSwitcher />
        </div>
      </div>
    );
  }
}
