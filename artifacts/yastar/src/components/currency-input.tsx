import * as React from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
}

function formatDigits(digits: string): string {
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(BigInt(digits));
}

/**
 * Number input that auto-formats with Indonesian thousand separators as the
 * user types (e.g. typing "100000" displays "100.000"). Reports the plain
 * numeric value to the parent via onValueChange.
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => formatDigits(String(value || '')));
    const isFocused = React.useRef(false);

    React.useEffect(() => {
      if (!isFocused.current) {
        setDisplay(formatDigits(String(value || '')));
      }
    }, [value]);

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onFocus={(e) => {
          isFocused.current = true;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          isFocused.current = false;
          setDisplay(formatDigits(String(value || '')));
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '');
          setDisplay(formatDigits(digits));
          onValueChange(digits ? Number(digits) : 0);
        }}
      />
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';
