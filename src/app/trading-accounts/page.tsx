"use client";

import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";
import TradingAccountsManager from "@/components/TradingAccountsManager";

export default function TradingAccountsPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="text-green-400 font-mono text-xl animate-pulse">
            Loading Trading Accounts...
          </div>
        </div>
      }>
        <TradingAccountsManager />
      </Suspense>
    </MainLayout>
  );
}
