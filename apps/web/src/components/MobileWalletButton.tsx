"use client";

import React from "react";
import { useWallet } from "@/app/providers/wallet-provider";
import { Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileWalletButton: React.FC = () => {
  const { address, isConnected, connect, disconnect, isConnecting } = useWallet();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect("metamask");
      } catch (e) {
        console.error("Mobile wallet connect failed", e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isConnecting}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-semibold transition-all duration-200",
        "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 active:scale-[0.98]",
        isConnected && "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      )}
    >
      {isConnected ? (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>{formatAddress(address as string)}</span>
          </div>
          <LogOut className="h-4 w-4" />
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
        </>
      )}
    </button>
  );
};
