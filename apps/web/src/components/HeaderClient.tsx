"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WalletHeader } from "@/components/WalletHeader";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";

export function HeaderClient() {
  return (
    <div className="pointer-events-auto w-full px-3 sm:px-4 py-2">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 sm:gap-3">
        {/* Left: language switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <LanguageSwitcher />
        </div>

        {/* Right: wallet connect + theme switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
          <WalletHeader />
          <LightPullThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
