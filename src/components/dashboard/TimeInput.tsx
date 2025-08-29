import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number; // 23 for hours, 59 for minutes
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const TimeInput = ({
  label,
  value,
  onChange,
  max,
  placeholder = "00",
  required = false,
  className = ""
}: TimeInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(
    value === 0 ? '' : value.toString().padStart(2, '0')
  );
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when prop value changes (only when not focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : value.toString().padStart(2, '0'));
    }
  }, [value, isFocused]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value;
    const numeric = inputValue.replace(/\D/g, '');

    // Allow up to 2 digits
    if (numeric.length <= 2) {
      const num = parseInt(numeric) || 0;
      
      // Only update if within valid range
      if (num <= max) {
        setDisplayValue(numeric); // Keep raw numeric without padding during typing
        onChange(num);
      } else if (numeric.length === 1) {
        // Allow single digit that might be part of a valid two-digit number
        setDisplayValue(numeric);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validate and format on blur
    const numeric = displayValue.replace(/\D/g, '');
    const num = parseInt(numeric) || 0;

    if (numeric === '') {
      // Empty - set to 00
      setDisplayValue('00');
      onChange(0);
    } else if (num > max) {
      // Invalid number - set to max
      const validValue = max.toString().padStart(2, '0');
      setDisplayValue(validValue);
      onChange(max);
    } else {
      // Valid number - pad with zero if single digit
      const formattedValue = num.toString().padStart(2, '0');
      setDisplayValue(formattedValue);
      onChange(num);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Remove padding when focused to allow easy typing
    const numeric = displayValue.replace(/^0+/, '') || displayValue;
    if (numeric !== displayValue) {
      setDisplayValue(numeric);
    }
    // Select all text on focus for easy replacement
    setTimeout(() => {
      e.target.select();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, etc.
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Block non-numeric keys (except allowed navigation keys)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={className}>
      <Label className="text-green-300 font-mono">{label}</Label>
      <Input
        type="text"
        value={displayValue}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="bg-black/50 border-green-500/60 text-green-300 font-mono focus:border-green-400 text-center text-lg"
        placeholder={placeholder}
        required={required}
        maxLength={2}
        style={{ letterSpacing: '0.1em' }}
      />
    </div>
  );
};

export default TimeInput;