import React, { createContext, useContext, useState } from 'react';

export interface BetSelection {
  id: string;
  matchId: string;
  matchTitle: string; // e.g. "Arsenal vs Tottenham"
  league: string;
  selection: string; // e.g. "Arsenal (1)" or "Draw (X)" or "Over 2.5 Goals"
  odds: number;
}

interface BetSlipContextType {
  selections: BetSelection[];
  stake: number;
  setStake: (stake: number) => void;
  toggleSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
  totalOdds: number;
  potentialPayout: number;
  placedSuccess: boolean;
  placeBet: () => void;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const BetSlipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(10);
  const [placedSuccess, setPlacedSuccess] = useState(false);

  const toggleSelection = (sel: BetSelection) => {
    setPlacedSuccess(false);
    setSelections(prev => {
      const exists = prev.some(item => item.id === sel.id);
      if (exists) {
        return prev.filter(item => item.id !== sel.id);
      } else {
        // Remove any existing selection for the same match to avoid contradictory bets
        const filtered = prev.filter(item => item.matchId !== sel.matchId);
        return [...filtered, sel];
      }
    });
  };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(item => item.id !== id));
  };

  const clearSlip = () => {
    setSelections([]);
  };

  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, selections.length > 0 ? 1 : 0);
  const potentialPayout = Math.round(stake * totalOdds * 100) / 100;

  const placeBet = () => {
    if (selections.length === 0) return;
    setPlacedSuccess(true);
    setTimeout(() => {
      setSelections([]);
      setPlacedSuccess(false);
    }, 4000);
  };

  return (
    <BetSlipContext.Provider
      value={{
        selections,
        stake,
        setStake,
        toggleSelection,
        removeSelection,
        clearSlip,
        totalOdds: Math.round(totalOdds * 100) / 100,
        potentialPayout,
        placedSuccess,
        placeBet,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  );
};

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return context;
};
