"use client";
import React, { useState, useEffect } from 'react';

export const formatVND = (val: number | string | null | undefined): string => {
  if (val === '' || val === null || val === undefined) return '';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/\D/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
};

export const parseVND = (str: string): number => {
  if (!str) return 0;
  const digits = str.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (val: number) => void;
  suffix?: string;
  showZero?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  suffix = 'đ',
  showZero = false,
  className = '',
  placeholder = '0',
  disabled = false,
  required = false,
  ...rest
}) => {
  const getInitialDisplay = (v: number) => {
    if (!v && !showZero) return '';
    return v ? v.toLocaleString('vi-VN') : '0';
  };

  const [displayValue, setDisplayValue] = useState<string>(getInitialDisplay(value));

  useEffect(() => {
    setDisplayValue(getInitialDisplay(value));
  }, [value, showZero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleanDigits = raw.replace(/\D/g, '');
    const num = cleanDigits ? parseInt(cleanDigits, 10) : 0;

    setDisplayValue(cleanDigits ? num.toLocaleString('vi-VN') : '');
    onChange(num);
  };

  return (
    <div className="relative w-full flex items-center">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${className} ${suffix ? 'pr-7' : ''} font-mono`}
        {...rest}
      />
      {suffix && (
        <span className="absolute right-2.5 text-xs text-slate-400 font-semibold pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};
