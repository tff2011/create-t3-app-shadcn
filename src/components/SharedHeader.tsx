"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { BarChart3, Plus, TrendingUp, Target, AlertTriangle, Settings, Shield, ChevronDown, Zap, Briefcase, PieChart } from "lucide-react";
import { api } from "@/trpc/react";

interface Strategy {
  id: string;
  name: string;
  description: string;
}

interface SharedHeaderProps {
  currentPage: string;
  onLogout?: () => void;
  selectedStrategy?: string;
  setSelectedStrategy?: (id: string) => void;
  onTabChange?: (tab: string) => void;
}

const SharedHeader = ({ currentPage, onLogout, selectedStrategy, setSelectedStrategy, onTabChange }: SharedHeaderProps) => {
  const router = useRouter();

  // Fetch strategies for the select dropdown
  const { data: strategies } = api.backtest.getStrategies.useQuery({ userId: "user123" });

  // Organized navigation groups
  const operationsGroup = [
    { id: "operation", label: "New Operation", icon: TrendingUp, path: "/", tab: "operation", description: "Create new trading operation" },
    { id: "risk", label: "Risk Management", icon: Target, path: "/", tab: "risk", description: "Manage operation risks" },
    { id: "liquidation", label: "Liquidation", icon: AlertTriangle, path: "/", tab: "liquidation", description: "Close out operations" },
  ];

  const strategiesGroup = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/", tab: "dashboard", description: "Overview of results" },
    { id: "strategy", label: "New Strategy", icon: Plus, path: "/", tab: "strategy", description: "Create new trading strategy" },
    { id: "manage", label: "Manage Strategies", icon: Settings, path: "/", tab: "manage", description: "Edit and configure strategies" },
  ];

  const accountsGroup = [
    { id: "trading-accounts", label: "Trading Accounts", icon: Briefcase, path: "/trading-accounts", description: "Manage investment accounts" },
    { id: "risk-presets", label: "Risk Presets", icon: Shield, path: "/risk-presets", description: "Configure risk levels" },
  ];

  // Helper function to determine if an item should be highlighted
  const isItemActive = (itemPath: string) => {
    if (currentPage === "/") {
      return itemPath === "/";
    }
    return itemPath === currentPage;
  };

  const handleNavigation = (path: string, tab?: string) => {
    if (path === "/" && tab && onTabChange) {
      onTabChange(tab);
    } else {
      router.push(path);
    }
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
            {/* Strategy Selector */}
            {setSelectedStrategy && (
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-mono text-sm">Strategy:</span>
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
              </div>
            )}

            {onLogout && (
              <Button
                onClick={onLogout}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-mono font-bold px-6 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/40 transform hover:scale-105 border-0"
              >
                LOGOUT
              </Button>
            )}
          </div>
        </div>

        <nav className="flex items-center justify-between w-full">
          {/* Grouped dropdown navigation */}
          <div className="flex items-center space-x-2">
            {/* Operations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="font-mono text-sm text-green-400 hover:bg-green-950/60 hover:text-green-200 hover:border-green-500/40 transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                  Operations
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/98 border border-green-500/60 backdrop-blur-md shadow-2xl shadow-green-500/10 min-w-[280px]">
                <DropdownMenuLabel className="text-green-400 font-mono text-xs px-3 py-2">Manage Operations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-500/30" />
                {operationsGroup.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleNavigation(item.path, (item as any).tab)}
                      className="font-mono text-sm cursor-pointer px-3 py-3 mx-2 my-1 rounded text-green-400 hover:bg-green-950/60 hover:text-green-200 transition-all duration-200 focus:bg-green-950/60 focus:text-green-200 focus:outline-none"
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-green-400/60 mt-0.5">{item.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Strategies Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="font-mono text-sm text-green-400 hover:bg-green-950/60 hover:text-green-200 hover:border-green-500/40 transition-all duration-300"
                >
                  <PieChart className="w-4 h-4 mr-2 text-blue-400" />
                  Strategies
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/98 border border-green-500/60 backdrop-blur-md shadow-2xl shadow-green-500/10 min-w-[280px]">
                <DropdownMenuLabel className="text-green-400 font-mono text-xs px-3 py-2">Manage Strategies</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-500/30" />
                {strategiesGroup.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleNavigation(item.path, (item as any).tab)}
                      className="font-mono text-sm cursor-pointer px-3 py-3 mx-2 my-1 rounded text-green-400 hover:bg-green-950/60 hover:text-green-200 transition-all duration-200 focus:bg-green-950/60 focus:text-green-200 focus:outline-none"
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-green-400/60 mt-0.5">{item.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Accounts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="font-mono text-sm text-green-400 hover:bg-green-950/60 hover:text-green-200 hover:border-green-500/40 transition-all duration-300"
                >
                  <Briefcase className="w-4 h-4 mr-2 text-purple-400" />
                  Accounts
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/98 border border-green-500/60 backdrop-blur-md shadow-2xl shadow-green-500/10 min-w-[280px]">
                <DropdownMenuLabel className="text-green-400 font-mono text-xs px-3 py-2">Manage Accounts</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-500/30" />
                {accountsGroup.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleNavigation(item.path, (item as any).tab)}
                      className="font-mono text-sm cursor-pointer px-3 py-3 mx-2 my-1 rounded text-green-400 hover:bg-green-950/60 hover:text-green-200 transition-all duration-200 focus:bg-green-950/60 focus:text-green-200 focus:outline-none"
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-green-400/60 mt-0.5">{item.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default SharedHeader;
