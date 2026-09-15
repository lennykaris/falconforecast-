import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateAvatar } from '../lib/profile';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

// A fixed set of preset avatars generated on the fly by DiceBear's free public API — nothing
// is ever uploaded or stored as a file, just this short URL string in profiles.avatar_url, so
// picking one never grows the database the way accepting arbitrary image uploads would.
// Seeds are arbitrary strings (just deterministic inputs to the generator) picked for a mix
// of results within each style, not meaningful on their own.
const STYLES = ['adventurer', 'bottts', 'fun-emoji', 'thumbs', 'avataaars', 'micah'];
const SEEDS = ['Felix', 'Milo', 'Luna', 'Zoe', 'Max', 'Nova'];
const PRESETS = STYLES.flatMap((style) =>
  SEEDS.map((seed) => `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`)
);

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ isOpen, onClose }) => {
  const { user, refetchUser } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    const { error: err } = await updateAvatar(user.id, selected);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    await refetchUser();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0f1827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose an Avatar</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pick a preset — no file upload, keeps things simple and fast for everyone.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {PRESETS.map((url) => (
            <button
              key={url}
              onClick={() => setSelected(url)}
              className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                selected === url ? 'border-[#0EA5E9] ring-2 ring-[#0EA5E9]/30' : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover bg-slate-50 dark:bg-slate-800" />
              {selected === url && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>

        {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Avatar'}
        </button>
      </div>
    </div>
  );
};
