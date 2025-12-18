"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/app/providers/wallet-provider";
import { LukasSDKProvider } from "@/app/providers/lukas-sdk-provider";
// import { AlchemyProvider } from "@/app/providers/alchemy-provider"; // Temporarily disabled for static export

export function Providers({ children }: { children: any }) {
    return (
        <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem={false} 
            storageKey="theme"
            disableTransitionOnChange
        >
            {/* <AlchemyProvider> */}
                <WalletProvider>
                    <LukasSDKProvider>
                        {children}
                    </LukasSDKProvider>
                </WalletProvider>
            {/* </AlchemyProvider> */}
        </ThemeProvider>
    );
}
