import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Prediction } from '../types/prediction';
import { INITIAL_PREDICTIONS } from '../data/predictions';
import { supabase } from '../lib/supabase';

interface PredictionsContextType {
  predictions: Prediction[];
  addPrediction: (newPred: Omit<Prediction, 'id'>) => void;
  updatePrediction: (id: string, updated: Partial<Prediction>) => void;
  deletePrediction: (id: string) => void;
  toggleTier: (id: string) => void;
  resetPredictions: () => void;
  refetchPredictions: () => Promise<void>;
}

const STORAGE_KEY = 'falconforecast_predictions_data';
const CACHE_TIME_KEY = 'falconforecast_predictions_cache_time';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache TTL to prevent egress spam

const PredictionsContext = createContext<PredictionsContextType | undefined>(undefined);

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

      if (!error && data && data.length > 0) {
        setPredictions(data as Prediction[]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    const created: Prediction = {
      ...newPred,
      id: `pred-${Date.now()}`,
    };
    setPredictions(prev => [created, ...prev]);

    try {
      await supabase.from('predictions').insert([created]);
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to insert prediction into Supabase:', e);
    }
  };

  const updatePrediction = async (id: string, updatedFields: Partial<Prediction>) => {
    setPredictions(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    try {
      await supabase.from('predictions').update(updatedFields).eq('id', id);
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to update prediction in Supabase:', e);
    }
  };

  const deletePrediction = async (id: string) => {
    setPredictions(prev => prev.filter(p => p.id !== id));

    try {
      await supabase.from('predictions').delete().eq('id', id);
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to delete prediction from Supabase:', e);
    }
  };

  const toggleTier = (id: string) => {
    const target = predictions.find(p => p.id === id);
    if (!target) return;
    const newTier = target.tier === 'free' ? 'vip' : 'free';
    updatePrediction(id, { tier: newTier });
  };

  const resetPredictions = () => {
    setPredictions(INITIAL_PREDICTIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PREDICTIONS));
    sessionStorage.removeItem(CACHE_TIME_KEY);
  };

  return (
    <PredictionsContext.Provider
      value={{
        predictions,
        addPrediction,
        updatePrediction,
        deletePrediction,
        toggleTier,
        resetPredictions,
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


