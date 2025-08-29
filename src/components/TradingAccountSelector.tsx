"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { ChevronDown, DollarSign } from "lucide-react";
import type { Decimal } from "@prisma/client/runtime/library";

interface TradingAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface DBTradingAccount {
  id: string;
  name: string;
  balance: Decimal;
  currency: string;
}

interface TradingAccountSelectorProps {
  value: string;
  onChange: (accountId: string, account?: TradingAccount) => void;
  required?: boolean;
  className?: string;
}

const TradingAccountSelector = ({
  value,
  onChange,
  required = false,
  className = ""
}: TradingAccountSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get active trading accounts
  const { data: accountsData, isLoading } = api.tradingAccount.getActive.useQuery();

  // Convert Decimal to number
  const accounts = accountsData?.map((account: DBTradingAccount) => ({
    ...account,
    balance: Number(account.balance)
  }));

  const selectedAccount = accounts?.find((account: TradingAccount) => account.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter accounts based on search term
  const filteredAccounts = accounts?.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const handleSelect = (account: TradingAccount) => {
    onChange(account.id, account);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Label className="text-green-300 font-mono">Trading Account</Label>
        <div className="bg-black/50 border border-green-500/60 text-green-300 font-mono rounded px-3 py-2">
          Loading accounts...
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Label className="text-green-300 font-mono">Trading Account</Label>

      {/* Input field */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={selectedAccount ? selectedAccount.name : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400 pr-10"
          placeholder="Select trading account..."
          required={required}
        />

        {/* Dropdown arrow */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Selected account info */}
      {selectedAccount && (
        <div className="mt-1 flex items-center gap-2 text-green-300/70 font-mono text-sm">
          <DollarSign className="w-4 h-4" />
          <span>Balance: {selectedAccount.balance.toFixed(2)} {selectedAccount.currency}</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black/95 border border-green-500/60 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {/* Clear option */}
          {selectedAccount && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full text-left px-3 py-2 text-red-400 font-mono hover:bg-red-900/20 focus:bg-red-900/20 focus:outline-none border-b border-green-500/20"
            >
              ❌ Clear Selection
            </button>
          )}

          {/* Account options */}
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleSelect(account)}
                className={`w-full text-left px-3 py-2 text-green-300 font-mono hover:bg-green-900/20 focus:bg-green-900/20 focus:outline-none ${
                  selectedAccount?.id === account.id ? 'bg-green-900/30 border-l-4 border-green-400' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-green-300/70 text-sm">
                    {account.balance.toFixed(2)} {account.currency}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-green-300/50 font-mono text-center">
              {searchTerm ? "No accounts found" : "No active accounts"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradingAccountSelector;
