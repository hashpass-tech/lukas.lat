"use client";

import React, { ReactNode } from 'react';
import { AlchemyAccountProvider } from "@account-kit/react";
import { alchemyConfig, queryClient } from "@/app/config";
import { QueryClientProvider } from "@tanstack/react-query";

interface AlchemyProviderProps {
  children: ReactNode;
}

export function AlchemyProvider({ children }: AlchemyProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={alchemyConfig}>
        {children}
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
