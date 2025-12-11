"use client";

import { ThemeProvider } from "next-themes";
import { WalletProvider } from "@/app/providers/wallet-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem={false} 
            storageKey="theme"
            disableTransitionOnChange
        >
            <WalletProvider>
                {children}
            </WalletProvider>
        </ThemeProvider>
    );
}
