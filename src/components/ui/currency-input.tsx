import { forwardRef, useState, useEffect, useRef } from 'react';
import type { ComponentProps } from 'react';
import { Input } from './input';

interface CurrencyInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [digits, setDigits] = useState(() =>
      value > 0 ? Math.round(value * 100).toString() : '',
    );
    const prevValueRef = useRef(value);

    // Sync when form resets or switches to a different record
    useEffect(() => {
      if (value === prevValueRef.current) return;
      prevValueRef.current = value;
      setDigits(value > 0 ? Math.round(value * 100).toString() : '');
    }, [value]);

    const display = digits
      ? (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
      setDigits(raw);
      onChange(parseInt(raw || '0', 10) / 100);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="0,00"
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';
