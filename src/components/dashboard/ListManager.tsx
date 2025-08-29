import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ListManagerProps {
  label: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
}

const ListManager = ({ label, items, onItemsChange, placeholder = "Add new item..." }: ListManagerProps) => {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onItemsChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <Label className="text-green-300 font-mono">{label}</Label>
      
      {/* Add new item */}
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
          placeholder={placeholder}
        />
        <Button
          type="button"
          onClick={addItem}
          className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold px-4"
        >
          ADD
        </Button>
      </div>

      {/* Display current items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-black/30 border border-green-500/40 rounded px-3 py-2"
          >
            <span className="text-green-300 font-mono text-sm">{item}</span>
            <Button
              type="button"
              size="sm"
              onClick={() => removeItem(index)}
              className="bg-red-600/80 hover:bg-red-500 text-white font-mono border border-red-400/50 transition-all duration-200 hover:scale-105 p-1 h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-green-400/50 font-mono text-sm italic py-2">
            No items added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ListManager;