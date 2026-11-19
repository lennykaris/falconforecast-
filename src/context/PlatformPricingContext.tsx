import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SubscriptionPlan } from '../types/prediction';
import { SUBSCRIPTION_PLANS } from '../data/predictions';
import { supabase } from '../lib/supabase';

interface PlatformPricingContextType {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  updatePrice: (planId: string, price: number) => Promise<Error | null>;
}

const PlatformPricingContext = createContext<PlatformPricingContextType | undefined>(undefined);

export const PlatformPricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadPrices = async () => {
      try {
        const { data, error: queryError } = await supabase.from('platform_vip_prices').select('plan_id, price');
        if (cancelled) return;
        if (queryError) {
          console.error('Failed to load platform VIP prices:', queryError);
          setError(queryError.message);
          return;
        }
        setPrices(Object.fromEntries((data || []).map(row => [row.plan_id, Number(row.price)])));
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load platform VIP prices:', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load VIP prices.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPrices();
    return () => { cancelled = true; };
  }, []);

  const plans = useMemo(() => SUBSCRIPTION_PLANS.map(plan => {
    const rawPrice = prices[plan.id] ?? plan.rawPrice;
    return { ...plan, rawPrice, price: `KSh ${rawPrice.toLocaleString('en-KE')}` };
  }), [prices]);

  const updatePrice = async (planId: string, price: number) => {
    if (!SUBSCRIPTION_PLANS.some(plan => plan.id === planId)) {
      return new Error('Unknown VIP plan.');
    }
    if (!Number.isSafeInteger(price) || price < 1) {
      return new Error('Enter a whole-number price greater than zero.');
    }
    try {
      const { error: saveError } = await supabase
        .from('platform_vip_prices')
        .upsert({ plan_id: planId, price, updated_at: new Date().toISOString() })
        .select('plan_id')
        .single();
      if (saveError) throw saveError;
      setPrices(current => ({ ...current, [planId]: price }));
      setError(null);
      return null;
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to update VIP price.';
      console.error('Failed to update platform VIP price:', saveError);
      setError(message);
      return new Error(message);
    }
  };

  return (
    <PlatformPricingContext.Provider value={{ plans, loading, error, updatePrice }}>
      {children}
    </PlatformPricingContext.Provider>
  );
};

export const usePlatformPricing = () => {
  const context = useContext(PlatformPricingContext);
  if (!context) throw new Error('usePlatformPricing must be used within a PlatformPricingProvider');
  return context;
};
