import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import TimeInput from "./TimeInput";

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

interface LiquidationFormProps {
  operations: Operation[] | undefined;
  selectedOperation: string;
  setSelectedOperation: (id: string) => void;
  onSuccess: () => void;
}

const LiquidationForm = ({ operations, selectedOperation, setSelectedOperation, onSuccess }: LiquidationFormProps) => {
  const [liquidationForm, setLiquidationForm] = useState({
    liquidationDate: "",
    liquidationHour: 0,
    liquidationMinute: 0,
    liquidationQuotation: 0,
    balanceInPips: 0,
    liquidationProportion: "",
    profitOrLoss: "PROFIT" as "PROFIT" | "LOSS" | "BREAK_EVEN",
    operationRisk: "",
    stopLossPips: 0,
    liquidationReason: "",
    liquidationType: "",
  });

  // Get entry date from selected operation
  const getEntryDate = () => {
    if (selectedOperation && operations) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp) {
        const date = new Date(selectedOp.date);
        // Format as YYYY-MM-DD without timezone conversion issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  };

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('liquidationForm');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setLiquidationForm(prev => ({
          ...prev,
          ...parsedData,
          profitOrLoss: parsedData.profitOrLoss ?? "PROFIT" as "PROFIT" | "LOSS" | "BREAK_EVEN",
          operationRisk: parsedData.operationRisk ?? "",
          stopLossPips: parsedData.stopLossPips ?? 0,
          liquidationProportion: parsedData.liquidationProportion ?? ""
        }));
      } catch (error) {
        console.error('Error loading liquidation form data:', error);
      }
    }
  }, []);

  // Auto-calculate balance in pips when liquidation quotation changes
  useEffect(() => {
    if (selectedOperation && operations && liquidationForm.liquidationQuotation > 0) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp && selectedOp.entryPrice > 0) {
        const entryPrice = Number(selectedOp.entryPrice);
        const liquidationPrice = liquidationForm.liquidationQuotation;
        const priceDifference = Math.abs(liquidationPrice - entryPrice);
        const balanceInPips = Math.round(priceDifference * 10000); // Convert to pips

        setLiquidationForm(prev => ({
          ...prev,
          balanceInPips: balanceInPips
        }));
      }
    }
  }, [liquidationForm.liquidationQuotation, selectedOperation, operations]);

  // Auto-fill liquidation date with entry date when operation is selected (only if empty or invalid)
  useEffect(() => {
    if (selectedOperation && operations) {
      const entryDate = getEntryDate();
      if (entryDate) {
        setLiquidationForm(prev => {
          // Only auto-fill if the current liquidation date is empty or before entry date
          if (!prev.liquidationDate || prev.liquidationDate < entryDate) {
            return {
              ...prev,
              liquidationDate: entryDate
            };
          }
          return prev;
        });
      }
    }
  }, [selectedOperation, operations, liquidationForm.liquidationDate]);

  // Auto-calculate liquidation proportion (ratio) when quotation changes
  useEffect(() => {
    if (selectedOperation && operations && liquidationForm.liquidationQuotation > 0) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp && selectedOp.entryPrice > 0 && selectedOp.riskManagement) {
        const entryPrice = Number(selectedOp.entryPrice);
        const liquidationPrice = liquidationForm.liquidationQuotation;
        const stopPrice = Number(selectedOp.riskManagement.stopQuotation);

        // Calculate pips difference for profit target
        const profitPips = Math.abs(liquidationPrice - entryPrice) * 10000;

        // Calculate pips difference for stop loss
        const stopPips = Math.abs(stopPrice - entryPrice) * 10000;

        if (stopPips > 0) {
          // Calculate ratio: profit pips / stop pips
          const ratio = profitPips / stopPips;

          // Round to 2 decimal places and format as ratio
          const roundedRatio = Math.round(ratio * 100) / 100;
          const ratioString = roundedRatio.toFixed(2).replace('.', ',');

          // Remove trailing zeros from decimal part, show decimals only if significant
          const ratioParts = ratioString.split(',');
          const integerPart = ratioParts[0];
          const decimalPart = ratioParts[1] ? ratioParts[1].replace(/0+$/, '') : ''; // Remove trailing zeros

          // Format: show decimals only if there are significant digits
          const formattedRatio = decimalPart && decimalPart !== '00'
            ? `${integerPart},${decimalPart}:1`
            : `${integerPart}:1`;

          setLiquidationForm(prev => ({
            ...prev,
            liquidationProportion: formattedRatio
          }));
        }
      }
    }
  }, [liquidationForm.liquidationQuotation, selectedOperation, operations]);

  // Auto-calculate profit or loss based on price difference and operation type
  useEffect(() => {
    if (selectedOperation && operations && liquidationForm.liquidationQuotation > 0) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp && selectedOp.entryPrice > 0) {
        const entryPrice = Number(selectedOp.entryPrice);
        const liquidationPrice = liquidationForm.liquidationQuotation;
        const priceDifference = liquidationPrice - entryPrice;

        // Determine if it's profit, loss, or break even based on operation type and price movement
        let result: "PROFIT" | "LOSS" | "BREAK_EVEN" = "LOSS";

        if (priceDifference === 0) {
          // Break even when prices are equal
          result = "BREAK_EVEN";
        } else if (selectedOp.buySell === "Buy" || selectedOp.buySell === "C") {
          // For BUY operations: profit when price goes UP, loss when price goes DOWN
          result = priceDifference > 0 ? "PROFIT" : "LOSS";
        } else if (selectedOp.buySell === "Sell" || selectedOp.buySell === "V") {
          // For SELL operations: profit when price goes DOWN, loss when price goes UP
          result = priceDifference < 0 ? "PROFIT" : "LOSS";
        }

        setLiquidationForm(prev => ({
          ...prev,
          profitOrLoss: result
        }));
      }
    }
  }, [liquidationForm.liquidationQuotation, selectedOperation, operations]);



  // Auto-calculate stop loss in pips from database
  useEffect(() => {
    if (selectedOperation && operations) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp && selectedOp.entryPrice > 0 && selectedOp.riskManagement) {
        const entryPrice = Number(selectedOp.entryPrice);
        const stopPrice = Number(selectedOp.riskManagement.stopQuotation);

        // Calculate stop loss in pips
        const stopLossPips = Math.round(Math.abs(stopPrice - entryPrice) * 10000);

        setLiquidationForm(prev => ({
          ...prev,
          stopLossPips: stopLossPips
        }));
      }
    }
  }, [selectedOperation, operations]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      liquidationDate: liquidationForm.liquidationDate,
      liquidationHour: liquidationForm.liquidationHour,
      liquidationMinute: liquidationForm.liquidationMinute,
      liquidationQuotation: liquidationForm.liquidationQuotation,
      balanceInPips: liquidationForm.balanceInPips,
      liquidationProportion: liquidationForm.liquidationProportion,
      profitOrLoss: liquidationForm.profitOrLoss,
      operationRisk: liquidationForm.operationRisk,
      stopLossPips: liquidationForm.stopLossPips,
      liquidationReason: liquidationForm.liquidationReason,
      liquidationType: liquidationForm.liquidationType,
    };
    localStorage.setItem('liquidationForm', JSON.stringify(dataToSave));
  }, [liquidationForm]);


  const utils = api.useUtils();
  const createLiquidation = api.backtest.createLiquidation.useMutation({
    onSuccess: () => {
      setLiquidationForm({
        liquidationDate: "",
        liquidationHour: 0,
        liquidationMinute: 0,
        liquidationQuotation: 0,
        balanceInPips: 0,
        liquidationProportion: "",
        profitOrLoss: "PROFIT" as "PROFIT" | "LOSS" | "BREAK_EVEN",
        operationRisk: "",
        stopLossPips: 0,
        liquidationReason: "",
        liquidationType: "",
      });
      // Clear localStorage after successful submission
      localStorage.removeItem('liquidationForm');
      utils.backtest.getOperations.invalidate();
      utils.backtest.getStrategyStats.invalidate();
      onSuccess();
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperation) return;

    // Convert percentage to decimal for backend
    const operationRiskValue = parseFloat(liquidationForm.operationRisk.replace(',', '.')) ?? 0;

    // Convert ratio format to decimal for backend
    let liquidationProportionValue = 0;
    if (liquidationForm.liquidationProportion) {
      const ratioMatch = liquidationForm.liquidationProportion.match(/^(\d+(?:,\d+)?):(\d+(?:,\d+)?)$/);
      if (ratioMatch) {
        const riskPart = parseFloat(ratioMatch[1]?.replace(',', '.') ?? '0');
        const rewardPart = parseFloat(ratioMatch[2]?.replace(',', '.') ?? '0');
        if (rewardPart > 0) {
          liquidationProportionValue = Number((riskPart / rewardPart).toFixed(2));
        }
      }
    }

    await createLiquidation.mutateAsync({
      operationId: selectedOperation,
      liquidationDate: new Date(liquidationForm.liquidationDate),
      liquidationHour: liquidationForm.liquidationHour,
      liquidationMinute: liquidationForm.liquidationMinute,
      liquidationQuotation: liquidationForm.liquidationQuotation,
      balanceInPips: liquidationForm.balanceInPips,
      liquidationProportion: liquidationProportionValue,
      profitOrLoss: liquidationForm.profitOrLoss,
      operationRisk: operationRiskValue,
      liquidationReason: liquidationForm.liquidationReason,
      liquidationType: liquidationForm.liquidationType,
    });
  };

  // Filter operations that don't have liquidation yet
  const availableOperations = operations?.filter(op => !op.liquidation) ?? [];

  return (
    <Card className="bg-black/90 border-green-500/60">
      <CardHeader>
        <CardTitle className="text-green-400 font-mono">Liquidation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-green-300 font-mono">Select Operation</Label>
            <Select value={selectedOperation} onValueChange={setSelectedOperation}>
              <SelectTrigger className="bg-black/50 border-green-500/60 text-green-300 font-mono">
                <SelectValue placeholder="Choose operation to liquidate..." />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-green-500/60">
                {availableOperations.map((op) => (
                  <SelectItem key={op.id} value={op.id} className="text-green-300 font-mono">
                    #{op.operationNumber} - {new Date(op.date).toLocaleDateString('pt-BR')} - {op.currency} - {op.buySell} @ {Number(op.entryPrice).toFixed(5)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOperation && (
            <>
              {/* Liquidation Date, Hour, Minute, Quotation and Operation Risk in same row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Liquidation Date</Label>
                  <Input
                    type="date"
                    value={liquidationForm.liquidationDate}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      // Validate that year is not more than 4 digits
                      if (dateValue) {
                        const year = new Date(dateValue).getFullYear();
                        if (year > 9999) {
                          return; // Don't update if year exceeds 4 digits
                        }
                      }
                      setLiquidationForm({ ...liquidationForm, liquidationDate: dateValue });
                    }}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    min={selectedOperation ? getEntryDate() : "1900-01-01"}
                    max="9999-12-31"
                    required
                  />
                </div>

                <div>
                  <TimeInput
                    label="Hour (24h)"
                    value={liquidationForm.liquidationHour}
                    onChange={(value) => setLiquidationForm({ ...liquidationForm, liquidationHour: value })}
                    max={23}
                    placeholder="00"
                    required
                  />
                </div>

                <div>
                  <TimeInput
                    label="Minute"
                    value={liquidationForm.liquidationMinute}
                    onChange={(value) => setLiquidationForm({ ...liquidationForm, liquidationMinute: value })}
                    max={59}
                    placeholder="00"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Liquidation Quotation</Label>
                  <Input
                    type="number"
                    step="any"
                    value={liquidationForm.liquidationQuotation}
                    onChange={(e) => setLiquidationForm({ ...liquidationForm, liquidationQuotation: parseFloat(e.target.value) ?? 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="Price"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Operation Risk (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="99"
                    value={liquidationForm.operationRisk}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value > 99) {
                        setLiquidationForm({ ...liquidationForm, operationRisk: '99' });
                      } else if (value < 0) {
                        setLiquidationForm({ ...liquidationForm, operationRisk: '0' });
                      } else {
                        setLiquidationForm({ ...liquidationForm, operationRisk: e.target.value });
                      }
                    }}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="1.00, 2.50, 0.50..."
                    required
                  />
                </div>
              </div>

              {/* Stop Loss Size, Balance in Pips, Risk/Reward Ratio and Profit/Loss in same row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-green-300 font-mono">Stop Loss Size</Label>
                    <span className="text-red-400/70 font-mono text-xs bg-red-900/20 px-2 py-1 rounded border border-red-500/30">
                      Pips from Database
                    </span>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/40 rounded px-3 py-2">
                    <span className="text-red-300 font-mono font-bold">
                      {liquidationForm.stopLossPips > 0 ? liquidationForm.stopLossPips : '--'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-green-300 font-mono">Balance in Pips</Label>
                    <span className="text-green-400/70 font-mono text-xs bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                      Auto-calculated
                    </span>
                  </div>
                  <div className="bg-green-900/10 border border-green-500/40 rounded px-3 py-2">
                    <span className="text-green-300 font-mono font-bold">
                      {liquidationForm.balanceInPips}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-green-300 font-mono">Risk/Reward Ratio</Label>
                    <span className="text-blue-400/70 font-mono text-xs bg-blue-900/20 px-2 py-1 rounded border border-blue-500/30">
                      Risk/Reward Ratio
                    </span>
                  </div>
                  <div className="bg-blue-900/10 border border-blue-500/40 rounded px-3 py-2">
                    <span className="text-blue-300 font-mono font-bold">
                      {liquidationForm.liquidationProportion ?? '--'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-green-300 font-mono">Profit or Loss</Label>
                    <span className="text-orange-400/70 font-mono text-xs bg-orange-900/20 px-2 py-1 rounded border border-orange-500/30">
                      Auto-calculated
                    </span>
                  </div>
                  <div className={`${
                    liquidationForm.profitOrLoss === "BREAK_EVEN"
                      ? "bg-yellow-900/10 border border-yellow-500/40"
                      : liquidationForm.profitOrLoss === "PROFIT"
                      ? "bg-green-900/10 border border-green-500/40"
                      : "bg-red-900/10 border border-red-500/40"
                  } rounded px-3 py-2`}>
                    <span className={`font-mono font-bold ${
                      liquidationForm.profitOrLoss === "BREAK_EVEN"
                        ? "text-yellow-300"
                        : liquidationForm.profitOrLoss === "PROFIT"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}>
                      {liquidationForm.profitOrLoss === "BREAK_EVEN" ? "BREAK EVEN" : liquidationForm.profitOrLoss}
                    </span>
                  </div>
                </div>
              </div>



              <div>
                <Label className="text-green-300 font-mono">Liquidation Reason</Label>
                <Input
                  type="text"
                  value={liquidationForm.liquidationReason}
                  onChange={(e) => setLiquidationForm({ ...liquidationForm, liquidationReason: e.target.value })}
                  className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  placeholder="Reason for liquidation..."
                  required
                />
              </div>

              <div>
                <Label className="text-green-300 font-mono">Liquidation Type</Label>
                <Input
                  type="text"
                  value={liquidationForm.liquidationType}
                  onChange={(e) => setLiquidationForm({ ...liquidationForm, liquidationType: e.target.value })}
                  className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  placeholder="Type of liquidation..."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={createLiquidation.isPending}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
              >
                {createLiquidation.isPending ? "CREATING..." : "CREATE LIQUIDATION"}
              </Button>
            </>
          )}

          {availableOperations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-green-400/70 font-mono">No operations available for liquidation</p>
              <p className="text-green-400/50 font-mono text-sm mt-2">All operations already have liquidation assigned</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LiquidationForm;