"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import SharedHeader from "@/components/SharedHeader";
import { useStrategy } from "@/contexts/StrategyContext";

interface MainLayoutProps {
  children: ReactNode;
  selectedStrategy?: string;
  setSelectedStrategy?: (strategy: string) => void;
  onTabChange?: (tab: string) => void;
}

export default function MainLayout({ children, selectedStrategy: propSelectedStrategy, setSelectedStrategy: propSetSelectedStrategy, onTabChange }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedStrategy: contextSelectedStrategy, setSelectedStrategy: contextSetSelectedStrategy } = useStrategy();
  
  // Use props if provided, otherwise use context
  const selectedStrategy = propSelectedStrategy !== undefined ? propSelectedStrategy : contextSelectedStrategy;
  const setSelectedStrategy = propSetSelectedStrategy || contextSetSelectedStrategy;

  const handleLogout = () => {
    localStorage.removeItem('backtest_logged_in');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Background Matrix Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px),
            linear-gradient(rgba(0,255,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-black to-green-800/10 pointer-events-none" />

      {/* Header */}
      <SharedHeader
        currentPage={pathname}
        onLogout={handleLogout}
        selectedStrategy={selectedStrategy}
        setSelectedStrategy={setSelectedStrategy}
        onTabChange={onTabChange}
      />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6 pb-16 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-green-500/30 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-green-400/60 font-mono text-xs">
            Bitcoin Observatorium © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}