import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const SearchableDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Type or select...",
  required = false,
  className = ""
}: SearchableDropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input value
  const getFilteredOptions = () => {
    if (!value) return options;
    return options.filter(option => 
      option.toLowerCase().includes(value.toLowerCase())
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = getFilteredOptions();

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <Label className="text-green-300 font-mono">{label}</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400"
        placeholder={placeholder}
        required={required}
      />
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-black/95 border border-green-500/60 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 text-green-300 font-mono hover:bg-green-900/20 focus:bg-green-900/20 focus:outline-none transition-colors duration-150"
                onClick={() => {
                  onChange(option);
                  setShowDropdown(false);
                }}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-green-400/70 font-mono text-sm">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;