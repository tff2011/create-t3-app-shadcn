import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Check, X } from "lucide-react";
import { api } from "@/trpc/react";

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

interface RiskManagementFormProps {
  operations: Operation[] | undefined;
  selectedOperation: string;
  setSelectedOperation: (id: string) => void;
  onSuccess: () => void;
}

const RiskManagementForm = ({ operations, selectedOperation, setSelectedOperation, onSuccess }: RiskManagementFormProps) => {
  const [riskForm, setRiskForm] = useState({
    entryQuotation: 0,
    profitPotentialRef: "",
    profitPotentialQuotation: 0,
    profitPotentialSize: 0,
    stopReference: "",
    stopQuotation: 0,
    stopSize: 0,
  });

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('riskManagementForm');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setRiskForm(prev => ({
          ...prev,
          ...parsedData,
          profitPotentialRef: parsedData.profitPotentialRef || "",
          stopReference: parsedData.stopReference || "",
          // Remove accountBalance and lotQuantity as they're now in OperationForm
          accountBalance: undefined,
          lotQuantity: undefined
        }));
      } catch (error) {
        console.error('Error loading risk management form data:', error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      entryQuotation: riskForm.entryQuotation,
      profitPotentialRef: riskForm.profitPotentialRef,
      profitPotentialQuotation: riskForm.profitPotentialQuotation,
      profitPotentialSize: riskForm.profitPotentialSize,
      stopReference: riskForm.stopReference,
      stopQuotation: riskForm.stopQuotation,
      stopSize: riskForm.stopSize,
      // accountBalance and lotQuantity moved to OperationForm
    };
    localStorage.setItem('riskManagementForm', JSON.stringify(dataToSave));
  }, [riskForm]);

  // Estado para controlar edição do entry quotation
  const [isEditingEntryQuotation, setIsEditingEntryQuotation] = useState(false);
  const [tempEntryQuotation, setTempEntryQuotation] = useState(0);

  // Auto-fill entry quotation when operation is selected
  useEffect(() => {
    if (selectedOperation && operations) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp) {
        const entryPrice = Number(selectedOp.entryPrice);
        setRiskForm(prev => ({
          ...prev,
          entryQuotation: entryPrice
        }));
        setTempEntryQuotation(entryPrice);
        setIsEditingEntryQuotation(false); // Reset edit mode when new operation is selected
      }
    }
  }, [selectedOperation, operations]);

  // Auto-calculate profit potential size
  useEffect(() => {
    const { entryQuotation, profitPotentialQuotation } = riskForm;

    if (selectedOperation && operations && profitPotentialQuotation > 0) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp) {
        const isBuy = selectedOp.buySell === "C";
        const profitSize = isBuy
          ? profitPotentialQuotation - entryQuotation
          : entryQuotation - profitPotentialQuotation;

        setRiskForm(prev => ({
          ...prev,
          profitPotentialSize: Number(profitSize.toFixed(5))
        }));
      }
    }
  }, [riskForm.entryQuotation, riskForm.profitPotentialQuotation, selectedOperation, operations]);

  // Auto-calculate stop size in pips
  useEffect(() => {
    const { entryQuotation, stopQuotation } = riskForm;

    if (selectedOperation && operations && stopQuotation > 0 && entryQuotation > 0) {
      const selectedOp = operations.find(op => op.id === selectedOperation);
      if (selectedOp) {
        const isBuy = selectedOp.buySell === "C";
        const priceDifference = isBuy
          ? entryQuotation - stopQuotation
          : stopQuotation - entryQuotation;

        // Convert to pips (multiply by 10000 for currency pairs like EUR/USD)
        const stopSizeInPips = Math.abs(priceDifference) * 10000;

        setRiskForm(prev => ({
          ...prev,
          stopSize: Number(stopSizeInPips.toFixed(1))
        }));
      }
    }
  }, [riskForm.entryQuotation, riskForm.stopQuotation, selectedOperation, operations]);

  // Functions to handle entry quotation editing
  const startEditingEntryQuotation = () => {
    setTempEntryQuotation(riskForm.entryQuotation);
    setIsEditingEntryQuotation(true);
  };

  const saveEntryQuotation = () => {
    setRiskForm(prev => ({
      ...prev,
      entryQuotation: tempEntryQuotation
    }));
    setIsEditingEntryQuotation(false);
  };

  const cancelEditingEntryQuotation = () => {
    setTempEntryQuotation(riskForm.entryQuotation);
    setIsEditingEntryQuotation(false);
  };

  const utils = api.useUtils();
  const createRiskManagement = api.backtest.createRiskManagement.useMutation({
    onSuccess: () => {
      setRiskForm({
        entryQuotation: 0,
        profitPotentialRef: "",
        profitPotentialQuotation: 0,
        profitPotentialSize: 0,
        stopReference: "",
        stopQuotation: 0,
        stopSize: 0,
        // accountBalance and lotQuantity moved to OperationForm
      });
      // Clear localStorage after successful submission
      localStorage.removeItem('riskManagementForm');
      utils.backtest.getOperations.invalidate();
      utils.backtest.getStrategyStats.invalidate();
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperation) return;

    await createRiskManagement.mutateAsync({
      operationId: selectedOperation,
      entryQuotation: riskForm.entryQuotation,
      profitPotentialRef: riskForm.profitPotentialRef,
      profitPotentialQuotation: riskForm.profitPotentialQuotation,
      profitPotentialSize: riskForm.profitPotentialSize,
      stopReference: riskForm.stopReference,
      stopQuotation: riskForm.stopQuotation,
      stopSize: riskForm.stopSize,
      accountBalance: 0, // Will be set from OperationForm
      lotQuantity: 0,   // Will be set from OperationForm
    });
  };

  // Filter operations that don't have risk management yet
  const availableOperations = operations?.filter(op => !op.riskManagement) || [];

  return (
    <Card className="bg-black/90 border-green-500/60">
      <CardHeader>
        <CardTitle className="text-green-400 font-mono">Risk Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-green-300 font-mono">Select Operation</Label>
            <Select value={selectedOperation} onValueChange={setSelectedOperation}>
              <SelectTrigger className="bg-black/50 border-green-500/60 text-green-300 font-mono">
                <SelectValue placeholder="Choose operation to add risk management..." />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-green-500/60">
                {availableOperations.map((op) => (
                  <SelectItem key={op.id} value={op.id} className="text-green-300 font-mono">
                    #{op.operationNumber} - {op.currency} - {op.buySell} @ {Number(op.entryPrice).toFixed(5)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOperation && (
            <>
              {/* Entry Quotation - Account Balance and Lot Quantity moved to OperationForm */}
              <div className="grid grid-cols-1 gap-4">
                {/* Entry Quotation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-green-300 font-mono">Entry Quotation</Label>
                      <span className="text-green-400/70 font-mono text-xs bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                        Auto-filled from operation
                      </span>
                    </div>
                    {!isEditingEntryQuotation ? (
                      <Button
                        type="button"
                        onClick={startEditingEntryQuotation}
                        className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 font-mono text-xs px-2 py-1 h-auto"
                        size="sm"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          onClick={saveEntryQuotation}
                          className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-300 font-mono text-xs px-2 py-1 h-auto"
                          size="sm"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          onClick={cancelEditingEntryQuotation}
                          className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 font-mono text-xs px-2 py-1 h-auto"
                          size="sm"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingEntryQuotation ? (
                    <Input
                      type="number"
                      step="any"
                      value={tempEntryQuotation}
                      onChange={(e) => setTempEntryQuotation(parseFloat(e.target.value) || 0)}
                      className="bg-yellow-900/20 border-yellow-500/60 text-yellow-300 font-mono focus:border-yellow-400"
                      placeholder="Edit entry quotation"
                      required
                    />
                  ) : (
                    <div className="bg-green-900/10 border border-green-500/40 rounded px-3 py-2">
                      <span className="text-green-300 font-mono font-bold">
                        {riskForm.entryQuotation.toFixed(5)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Account Balance and Lot Quantity moved to OperationForm */}
              </div>

              {/* Profit Fields - Grouped in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Profit Potential Reference</Label>
                  <Input
                    type="text"
                    value={riskForm.profitPotentialRef}
                    onChange={(e) => setRiskForm({ ...riskForm, profitPotentialRef: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="Enter profit reference (text)"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Profit Potential Quotation</Label>
                  <Input
                    type="number"
                    step="any"
                    value={riskForm.profitPotentialQuotation}
                    onChange={(e) => setRiskForm({ ...riskForm, profitPotentialQuotation: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="Target price"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-green-300 font-mono">Profit Potential Size</Label>
                    <span className="text-green-400/70 font-mono text-xs bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                      Auto-calculated
                    </span>
                  </div>
                  <div className="bg-green-900/10 border border-green-500/40 rounded px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-300 font-mono font-bold">
                        {(Math.abs(riskForm.profitPotentialSize) * 10000).toFixed(1)} pips
                      </span>
                      {selectedOperation && operations && (
                        <span className="text-green-400/70 font-mono text-xs">
                          {operations.find(op => op.id === selectedOperation)?.buySell === "C"
                            ? "BUY: PP - Entry"
                            : "SELL: Entry - PP"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stop Fields - Grouped in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Stop Reference</Label>
                  <Input
                    type="text"
                    value={riskForm.stopReference}
                    onChange={(e) => setRiskForm({ ...riskForm, stopReference: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="Enter stop reference (text)"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Stop Quotation Line</Label>
                  <Input
                    type="number"
                    step="any"
                    value={riskForm.stopQuotation}
                    onChange={(e) => setRiskForm({ ...riskForm, stopQuotation: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="Stop loss price"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-green-300 font-mono">Stop Size (Pips)</Label>
                    <span className="text-red-400/70 font-mono text-xs bg-red-900/20 px-2 py-1 rounded border border-red-500/30">
                      Auto-calculated
                    </span>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/40 rounded px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 font-mono font-bold">
                        {riskForm.stopSize.toFixed(1)} pips
                      </span>
                      {selectedOperation && operations && (
                        <span className="text-red-400/70 font-mono text-xs">
                          {operations.find(op => op.id === selectedOperation)?.buySell === "C"
                            ? "BUY: Entry - Stop"
                            : "SELL: Stop - Entry"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>



              <Button
                type="submit"
                disabled={createRiskManagement.isPending}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
              >
                {createRiskManagement.isPending ? "CREATING..." : "CREATE RISK MANAGEMENT"}
              </Button>
            </>
          )}

          {availableOperations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-green-400/70 font-mono">No operations available for risk management</p>
              <p className="text-green-400/50 font-mono text-sm mt-2">All operations already have risk management assigned</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default RiskManagementForm;