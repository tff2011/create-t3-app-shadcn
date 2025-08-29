// useState removed - not used in this component
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, X } from "lucide-react";
import { api } from "@/trpc/react";
import ListManager from "./ListManager";

interface Strategy {
  id: string;
  name: string;
  description: string;
  createdAt?: Date;
  operations?: any[];
  operationTypes?: string[];
  entrySignals?: string[];
}

interface ManageStrategiesProps {
  strategies: Strategy[] | undefined;
  showDeleteConfirm: { type: 'strategy' | 'operation'; id: string; name: string } | null;
  setShowDeleteConfirm: (value: { type: 'strategy' | 'operation'; id: string; name: string } | null) => void;
  editingStrategy: { id: string; name: string; description: string; operationTypes: string[]; entrySignals: string[] } | null;
  setEditingStrategy: (value: { id: string; name: string; description: string; operationTypes: string[]; entrySignals: string[] } | null) => void;
  deleteConfirmationText: string;
  setDeleteConfirmationText: (value: string) => void;
  selectedStrategy: string;
  setSelectedStrategy: (id: string) => void;
}

const ManageStrategies = ({
  strategies,
  showDeleteConfirm,
  setShowDeleteConfirm,
  editingStrategy,
  setEditingStrategy,
  deleteConfirmationText,
  setDeleteConfirmationText,
  selectedStrategy,
  setSelectedStrategy,
}: ManageStrategiesProps) => {
  const utils = api.useUtils();
  
  const updateStrategy = api.backtest.updateStrategy.useMutation({
    onSuccess: () => {
      setEditingStrategy(null);
      utils.backtest.getStrategies.invalidate();
    },
  });

  const deleteStrategy = api.backtest.deleteStrategy.useMutation({
    onSuccess: () => {
      setShowDeleteConfirm(null);
      setDeleteConfirmationText("");
      if (selectedStrategy === showDeleteConfirm?.id) {
        setSelectedStrategy("");
      }
      utils.backtest.getStrategies.invalidate();
      utils.backtest.getOperations.invalidate();
      utils.backtest.getStrategyStats.invalidate();
    },
  });

  const handleUpdateStrategy = () => {
    if (!editingStrategy) return;
    
    updateStrategy.mutate({
      id: editingStrategy.id,
      name: editingStrategy.name,
      description: editingStrategy.description,
      operationTypes: editingStrategy.operationTypes,
      entrySignals: editingStrategy.entrySignals,
    });
  };

  const handleDeleteStrategy = (id: string) => {
    deleteStrategy.mutate({ id });
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && showDeleteConfirm.type === 'strategy' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-black/95 border-red-500/60 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-400 font-mono">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-300">
                Are you sure you want to delete strategy "{showDeleteConfirm.name}"?
                This will also delete all associated operations.
              </p>
              
              <div className="space-y-2">
                <Label className="text-green-300 font-mono text-sm">
                  Type the strategy name "{showDeleteConfirm.name}" to confirm deletion:
                </Label>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="bg-black/60 border-red-500/60 text-green-300"
                  placeholder="Enter strategy name..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDeleteStrategy(showDeleteConfirm.id)}
                  disabled={deleteConfirmationText !== showDeleteConfirm.name}
                  className="bg-red-600/80 hover:bg-red-500 text-white font-mono border border-red-400/50 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setDeleteConfirmationText("");
                  }}
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

      {/* Edit Strategy Modal */}
      {editingStrategy && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-black/95 border-green-500/60 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">Edit Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Strategy Name</Label>
                  <Input
                    type="text"
                    value={editingStrategy.name}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
                <div>
                  <Label className="text-green-300 font-mono">Description</Label>
                  <Input
                    type="text"
                    value={editingStrategy.description}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, description: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListManager
                  label="Operation Types"
                  items={editingStrategy.operationTypes}
                  onItemsChange={(items) => setEditingStrategy({ ...editingStrategy, operationTypes: items })}
                />

                <ListManager
                  label="Entry Signals"
                  items={editingStrategy.entrySignals}
                  onItemsChange={(items) => setEditingStrategy({ ...editingStrategy, entrySignals: items })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateStrategy}
                  disabled={updateStrategy.isPending}
                  className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
                >
                  {updateStrategy.isPending ? "UPDATING..." : "UPDATE"}
                </Button>
                <Button
                  onClick={() => setEditingStrategy(null)}
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

      {/* Strategies Management Table */}
      <Card className="bg-black/90 border-green-500/60">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono">Manage Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-green-300 font-mono text-sm">
              <thead>
                <tr className="border-b border-green-500/30">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Operations</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {strategies?.map((strategy: Strategy) => (
                  <tr key={strategy.id} className="border-b border-green-500/20 hover:bg-green-900/20">
                    <td className="p-2">{strategy.name}</td>
                    <td className="p-2">{strategy.description || "-"}</td>
                    <td className="p-2">{strategy.createdAt ? new Date(strategy.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="p-2">{strategy.operations?.length || 0}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingStrategy({
                            id: strategy.id,
                            name: strategy.name,
                            description: strategy.description || "",
                            operationTypes: strategy.operationTypes || [],
                            entrySignals: strategy.entrySignals || []
                          })}
                          className="bg-green-600/80 hover:bg-green-500 text-black font-mono border border-green-400/50 transition-all duration-200 hover:scale-105"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowDeleteConfirm({
                            type: 'strategy',
                            id: strategy.id,
                            name: strategy.name
                          })}
                          className="bg-red-600/80 hover:bg-red-500 text-white font-mono border border-red-400/50 transition-all duration-200 hover:scale-105"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-green-400/70">No strategies found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ManageStrategies;