"use client";

import React from "react";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WalletHeader } from "@/components/WalletHeader";
import { LightPullThemeSwitcher } from "@/components/LightPullThemeSwitcher";

const Navbar: React.FC = () => {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  const containerClasses = `flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-lg w-full max-w-5xl relative z-10 border ${
    isDark
      ? "bg-slate-900/95 border-slate-800/80"
      : "bg-white border-slate-200/60"
  }`;

  return (
    <div className="flex justify-center w-full py-2 px-2 sm:py-4 sm:px-4 pointer-events-auto">
      <div className={containerClasses}>
        {/* Left: wallet + theme */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap min-w-0">
            <WalletHeader />
            <LightPullThemeSwitcher />
          </div>
        </div>

        {/* Right: Language switcher */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0 w-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};

export { Navbar };
