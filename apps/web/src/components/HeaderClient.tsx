"use client";

import React, { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";
import { WalletHeader } from "@/components/WalletHeader";
import { MobileThemeSwitcher } from "@/components/MobileThemeSwitcher";
import { Menu, X, Download } from "lucide-react";
import { Trans } from "@/components/Trans";

export function HeaderClient() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="pointer-events-auto w-full px-3 sm:px-4 py-2">
      <header className="mx-auto w-full max-w-5xl rounded-2xl border border-border/70 bg-background/90 backdrop-blur-lg shadow-lg">
        <nav className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4 gap-2 sm:gap-3">
          {/* Left: brand + language */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/60 transition-colors">
              <span className="text-lg sm:text-xl font-mono font-bold tracking-tight">
                <span className="sm:hidden">$LUKAS</span>
                <span className="hidden sm:inline">$(LKS) LUKAS</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSwitcher />
              <a
                href="/docs/whitepaper-lukas-v0.1.0.pdf"
                download
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white hover:from-blue-500 hover:to-purple-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                <span className="hidden lg:inline"><Trans i18nKey="hero.whitepaper" fallback="Whitepaper" /></span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
            <div className="hidden sm:flex">
              <LightPullThemeSwitcher />
            </div>
            <div className="hidden sm:flex flex-shrink-0">
              <WalletHeader connectText="Connect Wallet" />
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 sm:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div className="w-3/4 max-w-xs h-full bg-background/95 backdrop-blur-xl border-r border-border flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-mono font-bold">$LUKAS</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <LanguageSwitcher />
              </div>
              <a
                href="/docs/whitepaper-lukas-v0.1.0.pdf"
                download
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white hover:from-blue-500 hover:to-purple-600 transition-all"
              >
                <Download className="h-4 w-4" />
                <Trans i18nKey="hero.whitepaper" fallback="Whitepaper" />
              </a>
              <div>
                <MobileThemeSwitcher />
              </div>
            </div>
            <div className="pt-2 border-t border-border/60">
              <WalletHeader connectText="Connect Wallet" />
            </div>
          </div>
          <button
            type="button"
            className="flex-1 h-full bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
