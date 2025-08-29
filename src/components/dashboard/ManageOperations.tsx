// useState removed - not used in this component
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, X } from "lucide-react";
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
  hour?: number;
  minute?: number;
  operationType?: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
}

interface ManageOperationsProps {
  strategies: Strategy[] | undefined;
  operations: Operation[] | undefined;
  selectedStrategy: string;
  showDeleteConfirm: { type: 'strategy' | 'operation'; id: string; name: string } | null;
  setShowDeleteConfirm: (value: { type: 'strategy' | 'operation'; id: string; name: string } | null) => void;
  editingOperation: any;
  setEditingOperation: (value: any) => void;
}

const ManageOperations = ({
  strategies,
  operations,
  selectedStrategy,
  showDeleteConfirm,
  setShowDeleteConfirm,
  editingOperation,
  setEditingOperation,
}: ManageOperationsProps) => {
  const utils = api.useUtils();
  
  const updateOperation = api.backtest.updateOperation.useMutation({
    onSuccess: () => {
      setEditingOperation(null);
      utils.backtest.getOperations.invalidate();
      utils.backtest.getStrategyStats.invalidate();
    },
  });

  const deleteOperation = api.backtest.deleteOperation.useMutation({
    onSuccess: () => {
      setShowDeleteConfirm(null);
      utils.backtest.getOperations.invalidate();
      utils.backtest.getStrategyStats.invalidate();
    },
  });

  const handleUpdateOperation = () => {
    if (!editingOperation) return;
    
    updateOperation.mutate({
      id: editingOperation.id,
      currency: editingOperation.currency,
      date: new Date(editingOperation.date),
      hour: editingOperation.hour,
      minute: editingOperation.minute,
      buySell: editingOperation.buySell,
      operationType: editingOperation.operationType,
      entryPrice: editingOperation.entryPrice,
      entrySignal: editingOperation.entrySignal,
      dailyAtrPercentPips: editingOperation.dailyAtrPercentPips,
    });
  };

  const handleDeleteOperation = (id: string) => {
    deleteOperation.mutate({ id });
  };

  if (!selectedStrategy) {
    return (
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-8 text-center">
          <p className="text-green-400/70 font-mono">Select a strategy above to manage operations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && showDeleteConfirm.type === 'operation' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-black/95 border-red-500/60 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-400 font-mono">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-300">
                Are you sure you want to delete "{showDeleteConfirm.name}"?
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDeleteOperation(showDeleteConfirm.id)}
                  className="bg-red-600/80 hover:bg-red-500 text-white font-mono border border-red-400/50 transition-all duration-200 hover:scale-105"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(null)}
                  variant="outline"
                  className="border-red-500/60 text-red-400 hover:bg-red-950/30 hover:border-red-400 hover:text-red-300 font-mono transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 bg-black/50 backdrop-blur-sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Operation Modal */}
      {editingOperation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-black/95 border-green-500/60 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">Edit Operation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Currency</Label>
                  <Input
                    type="text"
                    value={editingOperation.currency}
                    onChange={(e) => setEditingOperation({ ...editingOperation, currency: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
                <div>
                  <Label className="text-green-300 font-mono">Date</Label>
                  <Input
                    type="date"
                    value={editingOperation.date}
                    onChange={(e) => setEditingOperation({ ...editingOperation, date: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Hour</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={editingOperation.hour}
                    onChange={(e) => setEditingOperation({ ...editingOperation, hour: parseInt(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
                <div>
                  <Label className="text-green-300 font-mono">Minute</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={editingOperation.minute}
                    onChange={(e) => setEditingOperation({ ...editingOperation, minute: parseInt(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Buy/Sell</Label>
                  <Select 
                    value={editingOperation.buySell} 
                    onValueChange={(value) => setEditingOperation({ ...editingOperation, buySell: value })}
                  >
                    <SelectTrigger className="bg-black/50 border-green-500/60 text-green-300 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-green-500/60">
                      <SelectItem value="Buy" className="text-green-300 font-mono">Buy</SelectItem>
                      <SelectItem value="Sell" className="text-green-300 font-mono">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-green-300 font-mono">Operation Type</Label>
                  <Input
                    type="text"
                    value={editingOperation.operationType}
                    onChange={(e) => setEditingOperation({ ...editingOperation, operationType: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Entry Price</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingOperation.entryPrice}
                    onChange={(e) => setEditingOperation({ ...editingOperation, entryPrice: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
                <div>
                  <Label className="text-green-300 font-mono">Daily ATR % (Pips)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingOperation.dailyAtrPercentPips}
                    onChange={(e) => setEditingOperation({ ...editingOperation, dailyAtrPercentPips: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <Label className="text-green-300 font-mono">Entry Signal</Label>
                <Input
                  type="text"
                  value={editingOperation.entrySignal}
                  onChange={(e) => setEditingOperation({ ...editingOperation, entrySignal: e.target.value })}
                  className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateOperation}
                  disabled={updateOperation.isPending}
                  className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
                >
                  {updateOperation.isPending ? "UPDATING..." : "UPDATE"}
                </Button>
                <Button
                  onClick={() => setEditingOperation(null)}
                  variant="outline"
                  className="border-red-500/60 text-red-400 hover:bg-red-950/30 hover:border-red-400 hover:text-red-300 font-mono transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 bg-black/50 backdrop-blur-sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operations Management Table */}
      {operations && (
        <Card className="bg-black/90 border-green-500/60">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono">Manage Operations</CardTitle>
            <p className="text-green-400/70 font-mono text-sm">
              Strategy: {strategies?.find((s: Strategy) => s.id === selectedStrategy)?.name}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-green-300 font-mono text-sm">
                <thead>
                  <tr className="border-b border-green-500/30">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Currency</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">B/S</th>
                    <th className="text-left p-2">Entry</th>
                    <th className="text-left p-2">Signal</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op: Operation) => (
                    <tr key={op.id} className="border-b border-green-500/20 hover:bg-green-900/20">
                      <td className="p-2">{op.operationNumber}</td>
                      <td className="p-2">{op.currency}</td>
                      <td className="p-2">{new Date(op.date).toLocaleDateString()}</td>
                      <td className="p-2">{op.buySell === "C" ? "Buy" : "Sell"}</td>
                      <td className="p-2">{Number(op.entryPrice).toFixed(5)}</td>
                      <td className="p-2">{op.entrySignal || "-"}</td>
                      <td className="p-2">
                        {op.liquidation ? (
                          <span className="text-green-400">Liquidated</span>
                        ) : op.riskManagement ? (
                          <span className="text-yellow-400">At Risk</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingOperation({
                              id: op.id,
                              currency: op.currency,
                              date: new Date(op.date).toISOString().split('T')[0],
                              hour: op.hour || 0,
                              minute: op.minute || 0,
                              buySell: op.buySell,
                              operationType: op.operationType || "",
                              entryPrice: parseFloat(op.entryPrice.toString()),
                              entrySignal: op.entrySignal,
                              dailyAtrPercentPips: parseFloat(op.dailyAtrPercentPips?.toString() || "0")
                            })}
                            className="bg-green-600/80 hover:bg-green-500 text-black font-mono border border-green-400/50 transition-all duration-200 hover:scale-105"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowDeleteConfirm({
                              type: 'operation',
                              id: op.id,
                              name: `Operation #${op.operationNumber} - ${op.currency}`
                            })}
                            className="bg-red-600/80 hover:bg-red-500 text-white font-mono border border-red-400/50 transition-all duration-200 hover:scale-105"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ManageOperations;