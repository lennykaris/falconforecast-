import React, { useState } from 'react';
import { 
  Crown, 
  Zap, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  MinusCircle
} from 'lucide-react';
import type { Prediction } from '../types/prediction';
import { usePredictions } from '../context/PredictionsContext';
import { LEAGUE_OPTIONS } from '../data/predictions';

interface AdminTableProps {
  onOpenAddModal: () => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({ onOpenAddModal }) => {
  const { predictions, updatePrediction, deletePrediction, toggleTier, resetPredictions } = usePredictions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('All Leagues');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form temporary state
  const [editTip, setEditTip] = useState('');
  const [editOdds, setEditOdds] = useState<number>(1.80);
  const [editConfidence, setEditConfidence] = useState<number>(85);

  const filteredPredictions = predictions.filter(p => {
    const matchesLeague = selectedLeague === 'All Leagues' || p.league === selectedLeague;
    const matchesSearch =
      p.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLeague && matchesSearch;
  });

  const handleStartEdit = (p: Prediction) => {
    setEditingId(p.id);
    setEditTip(p.tip);
    setEditOdds(p.odds);
    setEditConfidence(p.confidence);
  };

  const handleSaveEdit = (id: string) => {
    updatePrediction(id, {
      tip: editTip,
      odds: editOdds,
      confidence: editConfidence,
    });
    setEditingId(null);
  };

  const handleStatusChange = (id: string, status: 'pending' | 'won' | 'lost' | 'void') => {
    updatePrediction(id, { status });
  };

  return (
    <div className="space-y-6">
      
      {/* CMS Controls & Filters Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-grow max-w-2xl">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search teams or tips..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0EA5E9]"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={selectedLeague}
              onChange={e => setSelectedLeague(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 appearance-none focus:outline-none focus:border-[#0EA5E9]"
            >
              {LEAGUE_OPTIONS.map(league => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 justify-end">
          <button
            onClick={resetPredictions}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5"
            title="Reset predictions to original default mock data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prediction</span>
          </button>
        </div>

      </div>

      {/* Predictions Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            
            {/* Table Head */}
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Match / Fixture</th>
                <th className="py-3.5 px-4">League</th>
                <th className="py-3.5 px-4">Recommended Tip</th>
                <th className="py-3.5 px-4 text-center">Odds</th>
                <th className="py-3.5 px-4 text-center">Status Outcome</th>
                <th className="py-3.5 px-4 text-center">Tier Toggle</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No predictions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPredictions.map(p => {
                  const isEditing = editingId === p.id;
                  const currentStatus = p.status || 'pending';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Match Fixture */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span>{p.homeTeam}</span>
                          <span className="text-slate-400 text-[10px]">vs</span>
                          <span>{p.awayTeam}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                          {new Date(p.kickoff).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* League */}
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {p.league}
                        </span>
                      </td>

                      {/* Tip */}
                      <td className="py-3.5 px-4 font-bold text-[#0EA5E9]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTip}
                            onChange={e => setEditTip(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 w-full focus:outline-none focus:border-[#0EA5E9]"
                          />
                        ) : (
                          p.tip
                        )}
                      </td>

                      {/* Odds */}
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.05"
                            value={editOdds}
                            onChange={e => setEditOdds(parseFloat(e.target.value) || 1.0)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 w-16 text-center focus:outline-none focus:border-[#0EA5E9]"
                          />
                        ) : (
                          <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-900">
                            @{p.odds.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Status Outcome */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={currentStatus}
                          onChange={e => handleStatusChange(p.id, e.target.value as any)}
                          className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            currentStatus === 'won'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : currentStatus === 'lost'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : currentStatus === 'void'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="won">✅ WON</option>
                          <option value="lost">❌ LOST</option>
                          <option value="void">⚪ VOID</option>
                        </select>
                      </td>

                      {/* Tier Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleTier(p.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1 mx-auto transition-all ${
                            p.tier === 'vip'
                              ? 'bg-sky-50 text-[#0EA5E9] border border-sky-300 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.tier === 'vip' ? (
                            <>
                              <Crown className="w-3 h-3 fill-[#0EA5E9]" />
                              <span>VIP Tier</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3" />
                              <span>Free Tier</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleSaveEdit(p.id)}
                              className="p-1.5 bg-sky-50 text-[#0EA5E9] hover:bg-sky-100 rounded border border-sky-200"
                              title="Save changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded border border-slate-200"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 text-slate-500 hover:text-[#0EA5E9] hover:bg-slate-100 rounded transition-colors"
                              title="Edit prediction"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePrediction(p.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                              title="Delete prediction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

