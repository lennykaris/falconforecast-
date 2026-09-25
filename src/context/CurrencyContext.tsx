import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchRates,
  detectCountryCurrency,
  getStoredCurrencyPreference,
  storeCurrencyPreference,
  formatConverted,
  CURRENCY_OPTIONS,
} from '../lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  /** null while rates haven't loaded yet, or nothing meaningful to show (display currency is
   * already KES). Never affects what's actually charged — see lib/currency.ts's top comment. */
  convert: (kesAmount: number) => string | null;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState('USD');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // An explicit past choice always wins over auto-detection — otherwise switching once
      // and reloading the page would silently flip back to a guess.
      const stored = getStoredCurrencyPreference();
      if (stored && CURRENCY_OPTIONS.some(c => c.code === stored)) {
        if (!cancelled) setCurrencyState(stored);
      } else {
        const detected = await detectCountryCurrency();
        // Re-check localStorage here, not just at the top of this effect — this fetch can take
        // a few hundred ms, and if the user manually picked a currency from the dropdown while
        // it was in flight, setCurrency() already wrote that choice to localStorage. Without
        // this check, applying `detected` below would silently overwrite their pick right after
        // they made it, which is exactly what looked like "the dropdown isn't working".
        if (!cancelled && detected && !getStoredCurrencyPreference()) setCurrencyState(detected);
        // No detection → stays at the USD default already set above.
      }

      const liveRates = await fetchRates();
      if (!cancelled) {
        setRates(liveRates);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const setCurrency = (code: string) => {
    setCurrencyState(code);
    storeCurrencyPreference(code);
  };

  const convert = (kesAmount: number) => formatConverted(kesAmount, currency, rates);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
