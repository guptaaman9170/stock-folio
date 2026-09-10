import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(val: number, options?: { showSign?: boolean; decimals?: number }): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0.00';
  
  const decimals = options?.decimals ?? 2;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const parts = absVal.toFixed(decimals).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  // Indian currency numbering formatting (e.g. 12,34,567)
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  const sign = isNegative ? '-₹' : options?.showSign && val > 0 ? '+₹' : '₹';
  return `${sign}${integerPart}${decimalPart}`;
}

export function formatPercent(val: number, options?: { showSign?: boolean; decimals?: number }): string {
  if (isNaN(val) || val === null || val === undefined) return '0.00%';
  const decimals = options?.decimals ?? 2;
  const sign = options?.showSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

export function formatLakhCr(val: number): string {
  if (isNaN(val) || val === 0) return '₹0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  return formatINR(val, { decimals: 0 });
}
