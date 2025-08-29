import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Plus, TrendingUp, Target, AlertTriangle, Settings, DollarSign, Shield } from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  description: string;
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  strategies: Strategy[] | undefined;
  selectedStrategy: string;
  setSelectedStrategy: (id: string) => void;
}

const Header = ({ activeTab, setActiveTab, onLogout, strategies, selectedStrategy, setSelectedStrategy }: HeaderProps) => {
  const allTabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "operation", label: "New Operation", icon: TrendingUp },
    { id: "risk", label: "Risk Management", icon: Target },
    { id: "liquidation", label: "Liquidation", icon: AlertTriangle },
    { id: "trading-accounts", label: "Trading Accounts", icon: DollarSign },
    { id: "risk-presets", label: "Risk Presets", icon: Shield },
    { id: "strategy", label: "New Strategy", icon: Plus },
    { id: "manage", label: "Manage Strategies", icon: Settings },
  ];

  const renderTab = (tab: { id: string; label: string; icon: any }) => {
    const Icon = tab.icon;
    return (
      <Button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        variant={activeTab === tab.id ? "default" : "ghost"}
        className={`font-mono text-sm ${
          activeTab === tab.id
            ? "bg-green-600 text-black hover:bg-green-500"
            : "text-green-400 hover:bg-green-900/20 hover:text-green-300"
        } transition-all duration-300`}
        aria-label={tab.label}
      >
        <Icon className="w-4 h-4 mr-2" />
        {tab.label}
      </Button>
    );
  };

  return (
    <header className="relative z-10 bg-black/90 backdrop-blur-md border-b border-green-500/50 shadow-lg shadow-green-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
              <span className="text-black font-bold text-xl">₿</span>
            </div>
            <h1 className="text-green-400 text-2xl font-mono font-bold tracking-wider">
              BACKTESTING OBSERVATORIUM
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="bg-black/60 border-green-500/60 text-green-300 font-mono">
                  <SelectValue placeholder="Select Strategy..." />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-green-500/60">
                  {strategies?.map((strategy: Strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id} className="text-green-300 font-mono">
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={onLogout}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-mono font-bold px-6 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/40 transform hover:scale-105 border-0"
            >
              LOGOUT
            </Button>
          </div>
        </div>
        
        <nav className="flex items-center justify-between w-full">
          {/* All tabs in one line */}
          <div className="flex items-center space-x-1">
            {allTabs.map(renderTab)}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;