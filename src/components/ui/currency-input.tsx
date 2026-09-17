import * as React from 'react';

import { Input } from '@/components/ui/input';
import { formatCurrencyInput } from '@/lib/currency';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange' | 'inputMode'> {
  value: string;
  onValueChange: (formatted: string) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, placeholder = '0,00', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        className={cn(className)}
        onChange={(e) => onValueChange(formatCurrencyInput(e.target.value))}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
