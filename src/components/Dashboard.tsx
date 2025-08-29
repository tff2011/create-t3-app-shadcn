"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useStrategy } from "@/contexts/StrategyContext";

// Import modular components
import MainLayout from "@/components/MainLayout";
import Statistics from "./dashboard/Statistics";
import OperationsTable from "./dashboard/OperationsTable";
import StrategyForm from "./dashboard/StrategyForm";
import OperationForm from "./dashboard/OperationForm";
import RiskManagementForm from "./dashboard/RiskManagementForm";
import LiquidationForm from "./dashboard/LiquidationForm";
import ManageStrategies from "./dashboard/ManageStrategies";
import ManageOperations from "./dashboard/ManageOperations";

interface DashboardProps {
  onLogout: () => void;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  createdAt?: Date;
  operations?: any[];
  operationTypes?: string[];
  entrySignals?: string[];
}

interface Operation {
  id: string;
  operationNumber: number;
  currency: string;
  date: Date;
  buySell: string;
  entryPrice: number;
  entrySignal: string;
  dailyAtrPercentPips: number;
  riskManagement?: any;
  liquidation?: any;
  hour?: number;
  minute?: number;
  operationType?: string;
}

interface StrategyStats {
  totalOperations: number;
  winRate: number;
  totalPips: number;
  profitOperations: number;
  lossOperations: number;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { selectedStrategy, setSelectedStrategy } = useStrategy();
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  
  // Function to handle tab changes from MainLayout
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Manage components state
  const [editingStrategy, setEditingStrategy] = useState<{ id: string; name: string; description: string; operationTypes: string[]; entrySignals: string[] } | null>(null);
  const [editingOperation, setEditingOperation] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'strategy' | 'operation'; id: string; name: string } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  
  // Mock user ID - in real app, this would come from auth
  const userId = "user123";

  // Queries
  const { data: strategies } = api.backtest.getStrategies.useQuery({ userId }) as { data: Strategy[] | undefined };
  const { data: operations } = api.backtest.getOperations.useQuery(
    { strategyId: selectedStrategy },
    { enabled: !!selectedStrategy }
  ) as { data: Operation[] | undefined };
  const { data: stats } = api.backtest.getStrategyStats.useQuery(
    { strategyId: selectedStrategy },
    { enabled: !!selectedStrategy }
  ) as { data: StrategyStats | undefined };

  const handleSuccess = () => {
    setActiveTab("dashboard");
  };

  return (
    <MainLayout onTabChange={handleTabChange}>
      <div className="space-y-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Statistics */}
            {selectedStrategy && <Statistics stats={stats} />}

            {/* Operations Table */}
            {selectedStrategy && <OperationsTable operations={operations} />}
            
            {!selectedStrategy && (
              <div className="text-center py-12">
                <p className="text-green-400/70 font-mono text-lg">
                  Select a strategy from the header to view dashboard data
                </p>
              </div>
            )}
          </div>
        )}

        {/* Strategy Tab */}
        {activeTab === "strategy" && (
          <StrategyForm userId={userId} onSuccess={handleSuccess} />
        )}

        {/* Operation Tab */}
        {activeTab === "operation" && (
          <OperationForm 
            selectedStrategy={selectedStrategy} 
            operations={operations}
            strategies={strategies}
            onSuccess={handleSuccess} 
          />
        )}

        {/* Risk Management Tab */}
        {activeTab === "risk" && (
          <RiskManagementForm
            operations={operations}
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
            onSuccess={handleSuccess}
          />
        )}

        {/* Liquidation Tab */}
        {activeTab === "liquidation" && (
          <LiquidationForm
            operations={operations}
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
            onSuccess={handleSuccess}
          />
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <ManageStrategies
              strategies={strategies}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              editingStrategy={editingStrategy}
              setEditingStrategy={setEditingStrategy}
              deleteConfirmationText={deleteConfirmationText}
              setDeleteConfirmationText={setDeleteConfirmationText}
              selectedStrategy={selectedStrategy}
              setSelectedStrategy={setSelectedStrategy}
            />
            <ManageOperations
              strategies={strategies}
              operations={operations}
              selectedStrategy={selectedStrategy}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              editingOperation={editingOperation}
              setEditingOperation={setEditingOperation}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;