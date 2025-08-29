import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Shield, DollarSign, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Filter, SortAsc, SortDesc } from "lucide-react";
import { useState } from "react";

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
}

interface OperationsTableProps {
  operations: Operation[] | undefined;
}

// Função para calcular o número da semana (formato ISO 8601)
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Função para renderizar Buy/Sell com cores e ícones
const renderBuySellIndicator = (buySell: string) => {
  if (buySell === "C") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-900/30 border border-green-500/50">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-green-300 font-semibold">BUY</span>
      </div>
    );
  } else {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-900/30 border border-red-500/50">
        <TrendingDown className="w-4 h-4 text-red-400" />
        <span className="text-red-300 font-semibold">SELL</span>
      </div>
    );
  }
};

// Função para determinar o status da operação
const getOperationStatus = (op: Operation) => {
  if (op.liquidation) {
    return {
      status: "liquidated",
      label: "Liquidated",
      color: "text-green-400",
      icon: <CheckCircle className="w-4 h-4" />,
      bgColor: "bg-green-900/20"
    };
  } else if (op.riskManagement) {
    return {
      status: "at_risk",
      label: "Protected",
      color: "text-yellow-400",
      icon: <Shield className="w-4 h-4" />,
      bgColor: "bg-yellow-900/20"
    };
  } else {
    return {
      status: "pending",
      label: "Pending",
      color: "text-orange-400",
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: "bg-orange-900/20"
    };
  }
};

const OperationsTable = ({ operations }: OperationsTableProps) => {
  // Estados para filtros
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "number-asc" | "number-desc" | "currency">("date-desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "protected" | "liquidated">("all");
  const [buySellFilter, setBuySellFilter] = useState<"all" | "buy" | "sell">("all");

  if (!operations) return null;

  // Função para filtrar operações
  const filterOperations = (ops: Operation[]) => {
    return ops.filter(op => {
      // Filtro por status
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && (op.riskManagement || op.liquidation)) return false;
        if (statusFilter === "protected" && (!op.riskManagement || op.liquidation)) return false;
        if (statusFilter === "liquidated" && !op.liquidation) return false;
      }

      // Filtro por Buy/Sell
      if (buySellFilter !== "all") {
        if (buySellFilter === "buy" && op.buySell !== "C") return false;
        if (buySellFilter === "sell" && op.buySell === "C") return false;
      }

      return true;
    });
  };

  // Função para ordenar operações
  const sortOperations = (ops: Operation[]) => {
    const sorted = [...ops];

    switch (sortBy) {
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "number-asc":
        return sorted.sort((a, b) => a.operationNumber - b.operationNumber);
      case "number-desc":
        return sorted.sort((a, b) => b.operationNumber - a.operationNumber);
      case "currency":
        return sorted.sort((a, b) => a.currency.localeCompare(b.currency));
      default:
        return sorted;
    }
  };

  // Aplicar filtros e ordenação
  const filteredAndSortedOperations = sortOperations(filterOperations(operations));

  return (
    <Card className="bg-black/90 border-green-500/60">
      <CardHeader>
        <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Operations Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-green-900/10 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-mono text-sm">Filters:</span>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <SortDesc className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-mono text-sm">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-black/60 border-blue-500/50 text-blue-300 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-blue-500/50">
                <SelectItem value="date-desc" className="text-blue-300 font-mono">Newest First</SelectItem>
                <SelectItem value="date-asc" className="text-blue-300 font-mono">Oldest First</SelectItem>
                <SelectItem value="number-desc" className="text-blue-300 font-mono">Operation # (High to Low)</SelectItem>
                <SelectItem value="number-asc" className="text-blue-300 font-mono">Operation # (Low to High)</SelectItem>
                <SelectItem value="currency" className="text-blue-300 font-mono">Currency (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-mono text-sm">Status:</span>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32 bg-black/60 border-yellow-500/50 text-yellow-300 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-yellow-500/50">
                <SelectItem value="all" className="text-yellow-300 font-mono">All</SelectItem>
                <SelectItem value="pending" className="text-yellow-300 font-mono">Pending</SelectItem>
                <SelectItem value="protected" className="text-yellow-300 font-mono">Protected</SelectItem>
                <SelectItem value="liquidated" className="text-yellow-300 font-mono">Liquidated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buy/Sell Filter */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-mono text-sm">Direction:</span>
            <Select value={buySellFilter} onValueChange={(value: any) => setBuySellFilter(value)}>
              <SelectTrigger className="w-24 bg-black/60 border-green-500/50 text-green-300 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-green-500/50">
                <SelectItem value="all" className="text-green-300 font-mono">All</SelectItem>
                <SelectItem value="buy" className="text-green-300 font-mono">Buy</SelectItem>
                <SelectItem value="sell" className="text-red-300 font-mono">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Counter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-green-300 font-mono text-sm">
              Showing {filteredAndSortedOperations.length} of {operations.length} operations
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-green-300 font-mono text-sm">
            <thead>
              <tr className="border-b border-green-500/30">
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Currency</th>
                <th className="text-left p-2">Date</th>
                <th className="text-center p-2">Week</th>
                <th className="text-left p-2">B/S</th>
                <th className="text-left p-2">Entry</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Alerts</th>
                <th className="text-left p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOperations.map((op) => {
                const statusInfo = getOperationStatus(op);
                return (
                  <tr key={op.id} className="border-b border-green-500/20 hover:bg-green-900/20">
                    <td className="p-2">
                      <span className="bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded text-sm font-bold border border-cyan-500/30">
                        #{op.operationNumber}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-sm font-mono border border-purple-500/30">
                        {op.currency}
                      </span>
                    </td>
                    <td className="p-2">{new Date(op.date).toLocaleDateString()}</td>
                    <td className="p-2 text-center">
                      <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs font-bold">
                        W{getWeekNumber(new Date(op.date))}
                      </span>
                    </td>
                    <td className="p-2">{renderBuySellIndicator(op.buySell)}</td>
                    <td className="p-2">
                      <span className="bg-gray-900/50 text-yellow-300 px-2 py-1 rounded text-sm font-mono border border-gray-500/30">
                        {Number(op.entryPrice).toFixed(5)}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${statusInfo.bgColor}`}>
                        <span className={statusInfo.color}>{statusInfo.icon}</span>
                        <span className={statusInfo.color}>{statusInfo.label}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {!op.riskManagement && !op.liquidation && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <Shield className="w-3 h-3" />
                            <span className="text-xs">Risk Missing</span>
                          </div>
                        )}
                        {!op.liquidation && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-xs">Pending Close</span>
                          </div>
                        )}
                        {op.liquidation && (
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs">Closed</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {op.liquidation && (
                        <span className={op.liquidation.profitOrLoss === "PROFIT" ? "text-green-400" : "text-red-400"}>
                          {op.liquidation.profitOrLoss === "PROFIT" ? "PROFIT" : "LOSS"} ({op.liquidation.balanceInPips.toString()} pips)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationsTable;