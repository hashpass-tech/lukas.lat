"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";
import { WalletHeader } from "@/components/WalletHeader";
import { MobileThemeSwitcher } from "@/components/MobileThemeSwitcher";
import { Menu, X, BarChart3 } from "lucide-react";
import { Trans } from "@/components/Trans";
import { DownloadButton } from "@/components/DownloadButton";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import { useWallet } from "@/app/providers/wallet-provider";
import { useTranslation } from "@/lib/translator";

export function HeaderClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setMobileSidebarOpen } = useSidebar();
  const { isConnected } = useWallet();
  const { locale } = useTranslation();

  return (
    <div className="pointer-events-auto w-full px-3 sm:px-4 py-2">
      <header className="mx-auto w-full max-w-5xl rounded-2xl border border-border/70 bg-background/90 backdrop-blur-lg shadow-lg">
        <nav className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4 gap-2 sm:gap-3">
          {/* Left: brand + language */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/60 transition-colors">
              <span className="text-lg sm:text-xl font-mono font-bold tracking-tight">
                <span className="sm:hidden"><Trans i18nKey="brand.name" fallback="$LUKAS" /></span>
                <span className="hidden sm:inline"><Trans i18nKey="brand.name.full" fallback="$(LKS) LUKAS" /></span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSwitcher />
              <DownloadButton />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
            {/* Pool Link - shown when wallet connected */}
            {isConnected && (
              <Link
                href={`/${locale}/pool`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary border border-border/50 hover:border-primary/50 rounded-lg transition-all duration-200 hover:bg-primary/5"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Pool</span>
              </Link>
            )}
            <div className="hidden sm:flex">
              <LightPullThemeSwitcher />
            </div>
            <div className="hidden sm:flex flex-shrink-0">
              <WalletHeader connectTextKey="connect.wallet" />
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 sm:hidden"
              onClick={() => {
  setMobileOpen(true);
  setMobileSidebarOpen(true);
}}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <>
          {/* Backdrop - rendered outside the flex container for proper coverage */}
          <div 
            className="fixed inset-0 z-[69] bg-background/80 dark:bg-black/60 backdrop-blur-sm sm:hidden"
            onClick={() => {
              setMobileOpen(false);
              setMobileSidebarOpen(false);
            }}
            aria-hidden="true"
          />
          {/* Sidebar Panel */}
          <div className="fixed inset-y-0 left-0 z-[70] w-3/4 max-w-xs bg-background border-r border-border flex flex-col p-4 gap-4 sm:hidden shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <Link href="/" className="text-base font-mono font-bold text-foreground"><Trans i18nKey="brand.name" fallback="$LUKAS" /></Link>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card hover:bg-accent transition-colors"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSidebarOpen(false);
                }}
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <LanguageSwitcher />
              </div>
              <DownloadButton />
              <div>
                <MobileThemeSwitcher />
              </div>
              {/* Pool Link - shown when wallet connected, between theme and wallet */}
              {isConnected && (
                <Link
                  href={`/${locale}/pool`}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileSidebarOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>Pool Dashboard</span>
                </Link>
              )}
            </div>
            <div className="pt-2 border-t border-border/60">
              <WalletHeader connectTextKey="connect.wallet" />
            </div>
            <div className="mt-auto pt-2">
              <Footer className="relative !z-10" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
