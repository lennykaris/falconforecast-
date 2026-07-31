import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Prediction } from '../types/prediction';
import { INITIAL_PREDICTIONS } from '../data/predictions';

interface PredictionsContextType {
  predictions: Prediction[];
  addPrediction: (newPred: Omit<Prediction, 'id'>) => void;
  updatePrediction: (id: string, updated: Partial<Prediction>) => void;
  deletePrediction: (id: string) => void;
  toggleTier: (id: string) => void;
  resetPredictions: () => void;
}

const STORAGE_KEY = 'falconforecast_predictions_data';

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  }, [predictions]);

  const addPrediction = (newPred: Omit<Prediction, 'id'>) => {
    const created: Prediction = {
      ...newPred,
      id: `pred-${Date.now()}`,
    };
    setPredictions(prev => [created, ...prev]);
  };

  const updatePrediction = (id: string, updatedFields: Partial<Prediction>) => {
    setPredictions(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deletePrediction = (id: string) => {
    setPredictions(prev => prev.filter(p => p.id !== id));
  };

  const toggleTier = (id: string) => {
    setPredictions(prev =>
      prev.map(p =>
        p.id === id ? { ...p, tier: p.tier === 'free' ? 'vip' : 'free' } : p
      )
    );
  };

  const resetPredictions = () => {
    setPredictions(INITIAL_PREDICTIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PREDICTIONS));
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
