"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { StrategyProvider } from "@/contexts/StrategyContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <StrategyProvider>
          {children}
        </StrategyProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}
