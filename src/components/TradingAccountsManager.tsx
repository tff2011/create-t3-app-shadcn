"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { Plus, Edit, Trash2, DollarSign, X } from "lucide-react";

interface TradingAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    operations: number;
  };
}

const TradingAccountsManager = () => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    balance: 0,
    currency: "USD",
  });

  // API calls
  const utils = api.useUtils();

  const { data: accountsData, isLoading } = api.tradingAccount.getAll.useQuery();

  const createAccount = api.tradingAccount.create.useMutation({
    onSuccess: () => {
      void utils.tradingAccount.getAll.invalidate();
      resetForm();
      setShowCreateForm(false);
    },
  });

  const updateAccount = api.tradingAccount.update.useMutation({
    onSuccess: () => {
      void utils.tradingAccount.getAll.invalidate();
      resetForm();
      setEditingAccount(null);
    },
  });

  const deleteAccount = api.tradingAccount.delete.useMutation({
    onSuccess: () => {
      void utils.tradingAccount.getAll.invalidate();
    },
  });

  const toggleAccountStatus = api.tradingAccount.toggleStatus.useMutation({
    onSuccess: () => {
      void utils.tradingAccount.getAll.invalidate();
    },
  });

  useEffect(() => {
    if (accountsData) {
      // Convert Decimal values to numbers for state
      const convertedAccounts = accountsData.map(account => ({
        ...account,
        balance: Number(account.balance),
      }));
      setAccounts(convertedAccounts);
    }
  }, [accountsData]);

  const resetForm = () => {
    setFormData({
      name: "",
      balance: 0,
      currency: "USD",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.balance > 0) {
      createAccount.mutate({
        name: formData.name.trim(),
        balance: formData.balance,
        currency: formData.currency,
      });
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount && formData.name.trim() && formData.balance > 0) {
      updateAccount.mutate({
        id: editingAccount.id,
        name: formData.name.trim(),
        balance: formData.balance,
        currency: formData.currency,
      });
    }
  };



  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trading account?")) {
      deleteAccount.mutate({ id });
    }
  };

  const startEdit = (account: TradingAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      balance: account.balance,
      currency: account.currency,
    });
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-8 text-center">
          <div className="text-green-400 font-mono">Loading trading accounts...</div>
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
            Your Trading Accounts
          </h2>
          <p className="text-green-300/70 font-mono text-sm">
            Manage multiple trading accounts with different balances
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-500 text-black font-mono transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
        >
          <Plus className="w-4 h-4 mr-2 text-black" />
          New Account
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingAccount) && (
        <Card className="bg-black/90 border-green-500/60">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono">
              {editingAccount ? "Edit Trading Account" : "Create New Trading Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingAccount ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-green-300 font-mono">Account Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="e.g., Main Account, Demo, Live"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Initial Balance (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                    placeholder="1000.00"
                    required
                  />
                </div>

                <div>
                  <Label className="text-green-300 font-mono">Currency</Label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-black/50 border border-green-500/60 text-green-300 font-mono focus:border-green-400 rounded px-3 py-2"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createAccount.isPending || updateAccount.isPending}
                  className="bg-green-600 hover:bg-green-500 text-black font-mono"
                >
                  {createAccount.isPending || updateAccount.isPending
                    ? "Saving..."
                    : editingAccount
                    ? "Update Account"
                    : "Create Account"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (editingAccount) {
                      cancelEdit();
                    } else {
                      setShowCreateForm(false);
                      resetForm();
                    }
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

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="bg-black/90 border-green-500/60">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-400 font-mono text-lg">
                    {account.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      account.isActive
                        ? "bg-green-900/20 text-green-400 border border-green-500/30"
                        : "bg-red-900/20 text-red-400 border border-red-500/30"
                    }`}>
                      {account.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => startEdit(account)}
                    size="sm"
                    variant="outline"
                    className="border-green-500/60 text-green-400 hover:bg-green-900/20 hover:border-green-400 hover:text-green-300 p-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <Edit className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(account.id)}
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
                  <span className="text-green-300/70 font-mono text-sm">Balance</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 font-mono font-bold">
                      {account.balance.toFixed(2)} {account.currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-green-300/70 font-mono text-sm">Operations</span>
                  <span className="text-green-300 font-mono">
                    {account._count?.operations || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-green-300/70 font-mono text-sm">Created</span>
                  <span className="text-green-300/70 font-mono text-xs">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => toggleAccountStatus.mutate({
                      id: account.id,
                      isActive: !account.isActive
                    })}
                    size="sm"
                    className={`w-full font-mono text-xs ${
                      account.isActive
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-green-600 hover:bg-green-500 text-black"
                    }`}
                  >
                    {account.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && !isLoading && (
        <Card className="bg-black/90 border-green-500/60">
          <CardContent className="p-8 text-center">
            <div className="text-green-400/70 font-mono mb-4">
              No trading accounts found
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-500 text-black font-mono transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
            >
              <Plus className="w-4 h-4 mr-2 text-black" />
              Create Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingAccountsManager;
