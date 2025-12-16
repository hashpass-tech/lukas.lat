"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/app/providers/wallet-provider";
import { AlchemyProvider } from "@/app/providers/alchemy-provider";

export function Providers({ children }: { children: any }) {
    return (
        <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem={false} 
            storageKey="theme"
            disableTransitionOnChange
        >
            <AlchemyProvider>
                <WalletProvider>
                    {children}
                </WalletProvider>
            </AlchemyProvider>
        </ThemeProvider>
    );
}
