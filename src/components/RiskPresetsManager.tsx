"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { Plus, Edit, Trash2, Star, Shield, Zap, X } from "lucide-react";

interface RiskPreset {
  id: string;
  name: string;
  riskPercentage: number;
  maxDrawdown: number;
  maxOperations: number;
  description?: string;
  isDefault: boolean;
  createdAt: Date;
}

const RiskPresetsManager = () => {
  const [presets, setPresets] = useState<RiskPreset[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState<RiskPreset | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    riskPercentage: 1.0,
    maxDrawdown: 5.0,
    maxOperations: 5,
    description: "",
  });

  // API calls
  const utils = api.useUtils();

  const { data: presetsData, isLoading } = api.riskPreset.getAll.useQuery();

  const createPreset = api.riskPreset.create.useMutation({
    onSuccess: () => {
      void utils.riskPreset.getAll.invalidate();
      resetForm();
      setShowCreateForm(false);
    },
  });

  const updatePreset = api.riskPreset.update.useMutation({
    onSuccess: () => {
      void utils.riskPreset.getAll.invalidate();
      resetForm();
      setEditingPreset(null);
    },
  });

  const deletePreset = api.riskPreset.delete.useMutation({
    onSuccess: () => {
      void utils.riskPreset.getAll.invalidate();
    },
  });

  const setDefaultPreset = api.riskPreset.setDefault.useMutation({
    onSuccess: () => {
      void utils.riskPreset.getAll.invalidate();
    },
  });

  useEffect(() => {
    if (presetsData) {
      // Convert Decimal values to numbers and handle null descriptions
      const convertedPresets = presetsData.map(preset => ({
        ...preset,
        riskPercentage: Number(preset.riskPercentage),
        maxDrawdown: Number(preset.maxDrawdown),
        description: preset.description ?? undefined,
      }));
      setPresets(convertedPresets);
    }
  }, [presetsData]);

  const resetForm = () => {
    setFormData({
      name: "",
      riskPercentage: 1.0,
      maxDrawdown: 5.0,
      maxOperations: 5,
      description: "",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.riskPercentage > 0) {
      createPreset.mutate({
        name: formData.name.trim(),
        riskPercentage: formData.riskPercentage,
        maxDrawdown: formData.maxDrawdown,
        maxOperations: formData.maxOperations,
        description: formData.description.trim() || undefined,
      });
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPreset && formData.name.trim() && formData.riskPercentage > 0) {
      updatePreset.mutate({
        id: editingPreset.id,
        name: formData.name.trim(),
        riskPercentage: formData.riskPercentage,
        maxDrawdown: formData.maxDrawdown,
        maxOperations: formData.maxOperations,
        description: formData.description.trim() || undefined,
      });
    }
  };

  const handleEdit = (preset: RiskPreset) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      riskPercentage: preset.riskPercentage,
      maxDrawdown: preset.maxDrawdown,
      maxOperations: preset.maxOperations,
      description: preset.description ?? "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this risk preset?")) {
      deletePreset.mutate({ id });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultPreset.mutate({ id });
  };

  const getRiskIcon = (riskPercentage: number) => {
    if (riskPercentage <= 1) return <Shield className="w-5 h-5 text-green-400 drop-shadow-lg" />;
    if (riskPercentage <= 2) return <Star className="w-5 h-5 text-yellow-400 drop-shadow-lg" />;
    return <Zap className="w-5 h-5 text-red-400 drop-shadow-lg" />;
  };

  const getRiskLevel = (riskPercentage: number) => {
    if (riskPercentage <= 1) return "Conservative";
    if (riskPercentage <= 2) return "Moderate";
    return "Aggressive";
  };

  if (isLoading) {
    return (
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-8 text-center">
          <div className="text-green-400 font-mono">Loading risk presets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-green-400 font-mono">
            Risk Management Presets
          </h2>
          <p className="text-green-300/70 font-mono text-sm">
            Configure different risk levels for your trading strategies
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-500 text-black font-mono transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
        >
          <Plus className="w-4 h-4 mr-2 text-black" />
          New Preset
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingPreset) && (
        <Card className="bg-black/90 border-green-500/60">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono">
              {editingPreset ? "Edit Risk Preset" : "Create New Risk Preset"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingPreset ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Preset Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="e.g., Conservative, Moderate, Aggressive"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Risk per Operation (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={formData.riskPercentage}
                    onChange={(e) => setFormData({ ...formData, riskPercentage: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="1.0"
                    required
                  />
                  <p className="text-green-300/50 font-mono text-xs mt-1">
                    Percentage of account balance to risk per trade
                  </p>
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Max Drawdown (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={formData.maxDrawdown}
                    onChange={(e) => setFormData({ ...formData, maxDrawdown: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="5.0"
                    required
                  />
                  <p className="text-green-300/50 font-mono text-xs mt-1">
                    Maximum allowed drawdown before stopping
                  </p>
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Max Operations</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxOperations}
                    onChange={(e) => setFormData({ ...formData, maxOperations: parseInt(e.target.value) || 1 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="5"
                    required
                  />
                  <p className="text-green-300/50 font-mono text-xs mt-1">
                    Maximum simultaneous open operations
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-green-300 font-mono">Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                  placeholder="Describe this risk preset strategy..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createPreset.isPending || updatePreset.isPending}
                  className="bg-green-600 hover:bg-green-500 text-black font-mono"
                >
                  {createPreset.isPending || updatePreset.isPending
                    ? "Saving..."
                    : editingPreset
                    ? "Update Preset"
                    : "Create Preset"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (editingPreset) {
                      setEditingPreset(null);
                    } else {
                      setShowCreateForm(false);
                    }
                    resetForm();
                  }}
                  variant="outline"
                  className="border-red-500/60 text-red-400 hover:bg-red-950/30 hover:border-red-400 hover:text-red-300 font-mono transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 bg-black/50 backdrop-blur-sm"
                >
                  <X className="w-4 h-4 mr-2 text-red-400" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Presets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <Card key={preset.id} className="bg-black/90 border-green-500/60">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getRiskIcon(preset.riskPercentage)}
                  <div>
                    <CardTitle className="text-green-400 font-mono text-lg">
                      {preset.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        preset.isDefault
                          ? "bg-yellow-900/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-green-900/20 text-green-400 border border-green-500/30"
                      }`}>
                        {preset.isDefault ? "Default" : "Active"}
                      </span>
                      <span className="text-xs font-mono text-green-300/70">
                        {getRiskLevel(preset.riskPercentage)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!preset.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(preset.id)}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500/60 text-yellow-400 hover:bg-yellow-950/30 hover:border-yellow-400 hover:text-yellow-300 p-2 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
                      title="Set as Default"
                    >
                      <Star className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEdit(preset)}
                    size="sm"
                    variant="outline"
                    className="border-green-500/60 text-green-400 hover:bg-green-900/20 hover:border-green-400 hover:text-green-300 p-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <Edit className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(preset.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/60 text-red-400 hover:bg-red-950/30 hover:border-red-400 hover:text-red-300 p-2 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-300/70 font-mono text-sm">Risk per Trade</span>
                  <span className="text-green-300 font-mono font-bold">
                    {preset.riskPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-green-300/70 font-mono text-sm">Max Drawdown</span>
                  <span className="text-green-300 font-mono">
                    {preset.maxDrawdown.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-green-300/70 font-mono text-sm">Max Operations</span>
                  <span className="text-green-300 font-mono">
                    {preset.maxOperations}
                  </span>
                </div>

                {preset.description && (
                  <div className="pt-2 border-t border-green-500/20">
                    <p className="text-green-300/70 font-mono text-xs">
                      {preset.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {presets.length === 0 && !isLoading && (
        <Card className="bg-black/90 border-green-500/60">
          <CardContent className="p-8 text-center">
            <div className="text-green-400/70 font-mono mb-4">
              No risk presets found
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-500 text-black font-mono transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
            >
              <Plus className="w-4 h-4 mr-2 text-black" />
              Create Your First Preset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiskPresetsManager;
