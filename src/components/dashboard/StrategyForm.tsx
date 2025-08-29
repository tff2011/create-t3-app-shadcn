import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import ListManager from "./ListManager";

interface StrategyFormProps {
  userId: string;
  onSuccess: () => void;
}

const StrategyForm = ({ userId, onSuccess }: StrategyFormProps) => {
  const [strategyForm, setStrategyForm] = useState({ 
    name: "", 
    description: "",
    operationTypes: [] as string[],
    entrySignals: [] as string[]
  });
  
  const utils = api.useUtils();
  const createStrategy = api.backtest.createStrategy.useMutation({
    onSuccess: () => {
      utils.backtest.getStrategies.invalidate();
      setStrategyForm({ 
        name: "", 
        description: "",
        operationTypes: [],
        entrySignals: []
      });
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategyForm.name) return;
    
    await createStrategy.mutateAsync({
      userId,
      name: strategyForm.name,
      description: strategyForm.description,
      operationTypes: strategyForm.operationTypes,
      entrySignals: strategyForm.entrySignals,
    });
  };

  return (
    <Card className="bg-black/90 border-green-500/60">
      <CardHeader>
        <CardTitle className="text-green-400 font-mono">Create New Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-green-300 font-mono">Strategy Name</Label>
            <Input
              type="text"
              value={strategyForm.name}
              onChange={(e) => setStrategyForm({ ...strategyForm, name: e.target.value })}
              className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
              placeholder="Enter strategy name..."
              required
            />
          </div>
          <div>
            <Label className="text-green-300 font-mono">Description</Label>
            <Input
              type="text"
              value={strategyForm.description}
              onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
              className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
              placeholder="Enter strategy description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListManager
              label="Operation Types"
              items={strategyForm.operationTypes}
              onItemsChange={(items) => setStrategyForm({ ...strategyForm, operationTypes: items })}
            />

            <ListManager
              label="Entry Signals"
              items={strategyForm.entrySignals}
              onItemsChange={(items) => setStrategyForm({ ...strategyForm, entrySignals: items })}
            />
          </div>

          <Button
            type="submit"
            disabled={createStrategy.isPending}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
          >
            {createStrategy.isPending ? "CREATING..." : "CREATE STRATEGY"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StrategyForm;