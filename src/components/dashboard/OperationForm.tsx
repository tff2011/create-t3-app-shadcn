import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api } from "@/trpc/react";
import SearchableDropdown from "./SearchableDropdown";
import TradingAccountSelector from "../TradingAccountSelector";
import TimeInput from "./TimeInput";

// Function to get week number in English format
const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `Week ${weekNumber}`;
};

interface Strategy {
  id: string;
  name: string;
  description: string;
  operationTypes?: string[];
  entrySignals?: string[];
}

interface OperationFormProps {
  selectedStrategy: string;
  operations: any[] | undefined;
  strategies: Strategy[] | undefined;
  onSuccess: () => void;
}

const OperationForm = ({ selectedStrategy, operations, strategies, onSuccess }: OperationFormProps) => {
  // Get operation types and entry signals from the selected strategy
  const getStrategyOperationTypes = () => {
    const strategy = strategies?.find(s => s.id === selectedStrategy);
    return strategy?.operationTypes || [];
  };

  const getStrategyEntrySignals = () => {
    const strategy = strategies?.find(s => s.id === selectedStrategy);
    return strategy?.entrySignals || [];
  };
  const [operationForm, setOperationForm] = useState({
    currency: "",
    date: "",
    hour: 0,
    minute: 0,
    buySell: "Buy" as "Buy" | "Sell",
    operationType: "",
    entryPrice: 0,
    entrySignal: "",
    dailyAtrPercentPips: 0,
    accountBalance: 0,
    lotQuantity: 0,
    tradingAccountId: "",
    operationRisk: "",
  });

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('operationForm');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setOperationForm(prev => ({
          ...prev,
          ...parsedData,
          buySell: parsedData.buySell || "Buy",
          accountBalance: parsedData.accountBalance || 0,
          lotQuantity: parsedData.lotQuantity || 0,
          tradingAccountId: parsedData.tradingAccountId || "",
          operationRisk: parsedData.operationRisk || ""
        }));
      } catch (error) {
        console.error('Error loading operation form data:', error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      ...operationForm,
      currency: operationForm.currency,
      date: operationForm.date,
      hour: operationForm.hour,
      minute: operationForm.minute,
      buySell: operationForm.buySell,
      operationType: operationForm.operationType,
      entryPrice: operationForm.entryPrice,
      entrySignal: operationForm.entrySignal,
      dailyAtrPercentPips: operationForm.dailyAtrPercentPips,
      accountBalance: operationForm.accountBalance,
      lotQuantity: operationForm.lotQuantity,
      tradingAccountId: operationForm.tradingAccountId,
      operationRisk: operationForm.operationRisk,
    };
    localStorage.setItem('operationForm', JSON.stringify(dataToSave));
  }, [operationForm]);

  // Currency search state
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyInputRef = useRef<HTMLInputElement>(null);

  // Get default risk preset
  const { data: defaultPreset } = api.riskPreset.getDefault.useQuery();

  // Calculate risk when account is selected
  useEffect(() => {
    if (operationForm.tradingAccountId && operationForm.accountBalance && defaultPreset) {
      const accountBalance = parseFloat(operationForm.accountBalance.toString());
      const riskPercentage = parseFloat(defaultPreset.riskPercentage.toString());

      if (accountBalance > 0 && riskPercentage > 0) {
        const riskAmount = (accountBalance * riskPercentage) / 100;
        const riskPercent = riskPercentage.toFixed(2);

        setOperationForm(prev => ({
          ...prev,
          operationRisk: riskPercent,
        }));
      }
    }
  }, [operationForm.tradingAccountId, operationForm.accountBalance, defaultPreset]);
  

  // Predefined currency options
  const currencyOptions = [
    { category: "Forex Major Pairs", pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD"] },
    { category: "Forex Minor Pairs", pairs: ["EUR/GBP", "EUR/JPY", "GBP/JPY"] },
    { category: "Cryptocurrencies", pairs: ["BTC/USD", "ETH/USD"] },
    { category: "Commodities", pairs: ["XAU/USD"] }
  ];

  const utils = api.useUtils();
  const createOperation = api.backtest.createOperation.useMutation({
    onSuccess: () => {
      setOperationForm({
        currency: "",
        date: "",
        hour: 0,
        minute: 0,
        buySell: "Buy",
        operationType: "",
        entryPrice: 0,
        entrySignal: "",
        dailyAtrPercentPips: 0,
        accountBalance: 0,
        lotQuantity: 0,
        tradingAccountId: "",
        operationRisk: "",
      });
      // Clear localStorage after successful submission
      localStorage.removeItem('operationForm');
      utils.backtest.getOperations.invalidate();
      utils.backtest.getStrategyStats.invalidate();
      utils.backtest.getStrategies.invalidate();
      onSuccess();
    },
  });

  // Filter currencies based on input value
  const getFilteredCurrencies = () => {
    if (!operationForm.currency) return currencyOptions;
    
    const filtered = currencyOptions.map(category => ({
      ...category,
      pairs: category.pairs.filter(pair => 
        pair.toLowerCase().includes(operationForm.currency.toLowerCase())
      )
    })).filter(category => category.pairs.length > 0);
    
    return filtered;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyInputRef.current && !currencyInputRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStrategy || !operationForm.currency) return;

    const operationNumber = (operations?.length || 0) + 1;

    await createOperation.mutateAsync({
      strategyId: selectedStrategy,
      operationNumber,
      ...operationForm,
      date: new Date(operationForm.date),
      tradingAccountId: operationForm.tradingAccountId,
    });
  };

  if (!selectedStrategy) {
    return (
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-8 text-center">
          <p className="text-green-400 font-mono">Please select a strategy first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/90 border-green-500/60">
      <CardHeader>
        <CardTitle className="text-green-400 font-mono">New Operation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trading Account Selection */}
          <div className="grid grid-cols-1 gap-4">
            <TradingAccountSelector
              value={operationForm.tradingAccountId}
              onChange={(accountId, account) => {
                setOperationForm(prev => ({
                  ...prev,
                  tradingAccountId: accountId,
                  accountBalance: account?.balance || 0,
                }));
              }}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative" ref={currencyInputRef}>
              <Label className="text-green-300 font-mono">Currency Pair</Label>
              <Input
                type="text"
                value={operationForm.currency}
                onChange={(e) => {
                  setOperationForm({ ...operationForm, currency: e.target.value });
                  setShowCurrencyDropdown(true);
                }}
                onFocus={() => setShowCurrencyDropdown(true)}
                className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                placeholder="Type or select currency pair..."
                required
              />
              {showCurrencyDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-black/95 border border-green-500/60 rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {getFilteredCurrencies().map((category) => (
                    <div key={category.category}>
                      <div className="px-3 py-2 text-xs text-green-500/70 font-mono uppercase tracking-wider border-b border-green-500/20">
                        {category.category}
                      </div>
                      {category.pairs.map((pair) => (
                        <button
                          key={pair}
                          type="button"
                          className="w-full text-left px-3 py-2 text-green-300 font-mono hover:bg-green-900/20 focus:bg-green-900/20 focus:outline-none"
                          onClick={() => {
                            setOperationForm({ ...operationForm, currency: pair });
                            setShowCurrencyDropdown(false);
                          }}
                        >
                          {pair}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-green-300 font-mono">Account Balance (USD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={operationForm.accountBalance}
                className="bg-black/30 border-green-500/40 text-green-300/70 font-mono cursor-not-allowed"
                placeholder="1000.00"
                readOnly
                disabled
              />
            </div>

            <div>
              <Label className="text-green-300 font-mono">Lot Quantity</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={operationForm.lotQuantity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value <= 0) {
                    setOperationForm({ ...operationForm, lotQuantity: 0.01 });
                  } else {
                    setOperationForm({ ...operationForm, lotQuantity: value });
                  }
                }}
                className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                placeholder="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div>
              <Label className="text-green-300 font-mono">Date</Label>
              <Input
                type="date"
                value={operationForm.date}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  // Validate that year is not more than 4 digits
                  if (dateValue) {
                    const year = new Date(dateValue).getFullYear();
                    if (year > 9999) {
                      return; // Don't update if year exceeds 4 digits
                    }
                  }
                  setOperationForm({ ...operationForm, date: dateValue });
                }}
                className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                min="1900-01-01"
                max="9999-12-31"
                required
              />
            </div>
            <div>
              <Label className="text-green-300 font-mono">Week</Label>
              <Input
                type="text"
                value={operationForm.date ? getWeekNumber(new Date(operationForm.date)) : ''}
                className="bg-black/30 border-green-500/40 text-green-300/70 font-mono cursor-not-allowed"
                placeholder="Week"
                readOnly
                disabled
              />
            </div>
            <TimeInput
              label="Hour (24h)"
              value={operationForm.hour}
              onChange={(value) => setOperationForm({ ...operationForm, hour: value })}
              max={23}
              placeholder="00"
              required
            />
            <TimeInput
              label="Minute"
              value={operationForm.minute}
              onChange={(value) => setOperationForm({ ...operationForm, minute: value })}
              max={59}
              placeholder="00"
              required
            />
            <div>
              <Label className="text-green-300 font-mono">Buy/Sell</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  onClick={() => setOperationForm({ ...operationForm, buySell: "Buy" })}
                  className={`flex-1 font-mono text-xs transition-all duration-200 ${
                    operationForm.buySell === "Buy"
                      ? "bg-green-600 hover:bg-green-500 text-black border-green-400"
                      : "bg-black/50 hover:bg-green-900/20 text-green-400 border-green-500/60"
                  } border`}
                >
                  BUY
                </Button>
                <Button
                  type="button"
                  onClick={() => setOperationForm({ ...operationForm, buySell: "Sell" })}
                  className={`flex-1 font-mono text-xs transition-all duration-200 ${
                    operationForm.buySell === "Sell"
                      ? "bg-red-600 hover:bg-red-500 text-white border-red-400"
                      : "bg-black/50 hover:bg-red-900/20 text-red-400 border-red-500/60"
                  } border`}
                >
                  SELL
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <SearchableDropdown
              label="Operation Type"
              value={operationForm.operationType}
              onChange={(value) => setOperationForm({ ...operationForm, operationType: value })}
              options={getStrategyOperationTypes()}
              required={false}
            />

            <SearchableDropdown
              label="Entry Signal"
              value={operationForm.entrySignal}
              onChange={(value) => setOperationForm({ ...operationForm, entrySignal: value })}
              options={getStrategyEntrySignals()}
              required={true}
            />

            <div>
              <Label className="text-green-300 font-mono">Entry Price</Label>
              <Input
                type="number"
                step="any"
                value={operationForm.entryPrice}
                onChange={(e) => setOperationForm({ ...operationForm, entryPrice: parseFloat(e.target.value) || 0 })}
                className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                required
              />
            </div>

            <div>
              <Label className="text-green-300 font-mono">Daily ATR % (Pips)</Label>
              <Input
                type="number"
                step="any"
                value={operationForm.dailyAtrPercentPips}
                onChange={(e) => setOperationForm({ ...operationForm, dailyAtrPercentPips: parseFloat(e.target.value) || 0 })}
                className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
                required
              />
            </div>
          </div>



          <Button
            type="submit"
            disabled={createOperation.isPending}
            className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
          >
            {createOperation.isPending ? "CREATING..." : "CREATE OPERATION"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OperationForm;