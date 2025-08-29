"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface StrategyContextType {
  selectedStrategy: string;
  setSelectedStrategy: (strategy: string) => void;
}

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

export function StrategyProvider({ children }: { children: ReactNode }) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");

  return (
    <StrategyContext.Provider value={{ selectedStrategy, setSelectedStrategy }}>
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategy() {
  const context = useContext(StrategyContext);
  if (context === undefined) {
    throw new Error("useStrategy must be used within a StrategyProvider");
  }
  return context;
}