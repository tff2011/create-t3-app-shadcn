"use client";

import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";
import RiskPresetsManager from "@/components/RiskPresetsManager";

export default function RiskPresetsPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="text-green-400 font-mono text-xl animate-pulse">
            Loading Risk Presets...
          </div>
        </div>
      }>
        <RiskPresetsManager />
      </Suspense>
    </MainLayout>
  );
}
