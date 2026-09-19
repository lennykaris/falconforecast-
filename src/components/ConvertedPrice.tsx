import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

/** The small "≈ $11.60" line shown next to a real KSh price — purely informational, never
 * the actual amount charged (M-Pesa only ever processes in KES; see lib/currency.ts). Renders
 * nothing while rates are loading or when the display currency is already KES, so it never
 * leaves an awkward gap. */
export const ConvertedPrice: React.FC<{ kes: number; className?: string; style?: React.CSSProperties }> = ({ kes, className, style }) => {
  const { convert } = useCurrency();
  const converted = convert(kes);
  if (!converted) return null;
  return <span className={className || 'text-[10px] text-slate-400 dark:text-slate-500'} style={style}>{converted}</span>;
};
