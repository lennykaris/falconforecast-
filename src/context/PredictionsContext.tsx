import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Prediction } from '../types/prediction';
import { INITIAL_PREDICTIONS } from '../data/predictions';
import { supabase } from '../lib/supabase';

interface PredictionsContextType {
  predictions: Prediction[];
  addPrediction: (newPred: Omit<Prediction, 'id'>) => Promise<{ error: Error | null }>;
  updatePrediction: (id: string, updated: Partial<Prediction>) => Promise<{ error: Error | null }>;
  deletePrediction: (id: string) => Promise<{ error: Error | null }>;
  toggleTier: (id: string) => Promise<{ error: Error | null } | undefined>;
  refetchPredictions: () => Promise<void>;
}

const STORAGE_KEY = 'falconforecast_predictions_data';
const CACHE_TIME_KEY = 'falconforecast_predictions_cache_time';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache TTL to prevent egress spam

const PredictionsContext = createContext<PredictionsContextType | undefined>(undefined);

/** The `predictions` table uses snake_case columns; the app's Prediction type is camelCase. */
const fromRow = (row: any): Prediction => ({
  id: row.id,
  league: row.league,
  homeTeam: row.home_team,
  awayTeam: row.away_team,
  kickoff: row.match_time,
  tip: row.tip,
  odds: Number(row.odds),
  confidence: row.confidence,
  tier: row.tier,
  isPlatformTip: row.tipster_id == null,
  homeLogo: row.home_flag || undefined,
  awayLogo: row.away_flag || undefined,
  analysis: row.rationale || undefined,
  status: row.status,
  result: row.result || undefined,
  tipsterId: row.tipster_id || undefined,
  tipsterName: row.tipster_name || undefined,
  matchId: row.match_id || undefined,
});

const toRow = (p: Partial<Prediction>) => {
  const row: Record<string, any> = {};
  if (p.league !== undefined) row.league = p.league;
  if (p.homeTeam !== undefined) row.home_team = p.homeTeam;
  if (p.awayTeam !== undefined) row.away_team = p.awayTeam;
  if (p.kickoff !== undefined) row.match_time = p.kickoff;
  if (p.homeLogo !== undefined) row.home_flag = p.homeLogo || null;
  if (p.awayLogo !== undefined) row.away_flag = p.awayLogo || null;
  if (p.tip !== undefined) row.tip = p.tip;
  if (p.odds !== undefined) row.odds = p.odds;
  if (p.confidence !== undefined) row.confidence = p.confidence;
  if (p.tier !== undefined) row.tier = p.tier;
  if (p.status !== undefined) row.status = p.status;
  if (p.result !== undefined) row.result = p.result || null;
  if (p.analysis !== undefined) row.rationale = p.analysis || null;
  if (p.tipsterId !== undefined) row.tipster_id = p.tipsterId || null;
  if (p.tipsterName !== undefined) row.tipster_name = p.tipsterName || null;
  if (p.matchId !== undefined) row.match_id = p.matchId || null;
  return row;
};

export const PredictionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [predictions, setPredictions] = useState<Prediction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse predictions from local storage', e);
      }
    }
    return INITIAL_PREDICTIONS;
  });

  const fetchFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(fromRow);
        setPredictions(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      }
    } catch (e) {
      console.warn('Supabase fetch predictions error, using cached state:', e);
    }
  };

  // Egress-Optimized Fetch: Only query Supabase if cache is expired or missing
  useEffect(() => {
    const lastFetch = sessionStorage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (!lastFetch || now - Number(lastFetch) > CACHE_TTL_MS) {
      fetchFromSupabase();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  }, [predictions]);

  const addPrediction = async (newPred: Omit<Prediction, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .insert([toRow(newPred)])
        .select()
        .single();

      if (error || !data) {
        return { error: error ? new Error(error.message) : new Error('Failed to publish prediction.') };
      }

      const created = fromRow(data);
      setPredictions(prev => [created, ...prev]);
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Failed to publish prediction.') };
    }
  };

  // Both used to apply setPredictions optimistically before the write, so a rejected update
  // (a tipster editing a stale/foreign prediction id under "Tipsters update own predictions,
  // admins update any") looked like it succeeded until the 3-minute cache TTL silently
  // reverted it. Now writes first — the list only ever reflects what's actually in the DB.
  const updatePrediction = async (id: string, updatedFields: Partial<Prediction>) => {
    try {
      const { error } = await supabase.from('predictions').update(toRow(updatedFields)).eq('id', id);
      if (error) {
        console.error('Failed to update prediction in Supabase:', error);
        return { error: new Error(error.message) };
      }
      setPredictions(prev => prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p)));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return { error: null };
    } catch (e) {
      console.error('Failed to update prediction in Supabase:', e);
      return { error: e instanceof Error ? e : new Error('Failed to update prediction.') };
    }
  };

  const deletePrediction = async (id: string) => {
    try {
      const { error } = await supabase.from('predictions').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete prediction from Supabase:', error);
        return { error: new Error(error.message) };
      }
      setPredictions(prev => prev.filter(p => p.id !== id));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return { error: null };
    } catch (e) {
      console.error('Failed to delete prediction from Supabase:', e);
      return { error: e instanceof Error ? e : new Error('Failed to delete prediction.') };
    }
  };

  const toggleTier = async (id: string) => {
    const target = predictions.find(p => p.id === id);
    if (!target) return;
    const newTier = target.tier === 'free' ? 'vip' : 'free';
    return updatePrediction(id, { tier: newTier });
  };

  return (
    <PredictionsContext.Provider
      value={{
        predictions,
        addPrediction,
        updatePrediction,
        deletePrediction,
        toggleTier,
        refetchPredictions: fetchFromSupabase,
      }}
    >
      {children}
    </PredictionsContext.Provider>
  );
};

export const usePredictions = () => {
  const context = useContext(PredictionsContext);
  if (!context) {
    throw new Error('usePredictions must be used within a PredictionsProvider');
  }
  return context;
};
