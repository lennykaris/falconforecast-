import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTipsters } from '../context/TipstersContext';
import type { Advertisement } from '../types/advertisement';

type AdvertiserType = Advertisement['advertiser_type'];

const emptyForm = {
  advertiserType: 'bookmaker' as AdvertiserType,
  name: '',
  tagline: '',
  description: '',
  cta: 'Learn more',
  targetUrl: '',
  tipsterId: '',
  active: true,
};

const mapAdvertisement = (row: Record<string, any>): Advertisement => ({
  id: row.id,
  advertiser_type: row.advertiser_type,
  name: row.name,
  tagline: row.tagline,
  description: row.description,
  cta: row.cta,
  target_url: row.target_url,
  image_url: row.image_url,
  image_path: row.image_path,
  tipster_id: row.tipster_id,
  active: row.active,
  sort_order: row.sort_order,
});

export const AdminAdvertisements: React.FC = () => {
  const { user } = useAuth();
  const { tipsters } = useTipsters();
  const activeTipsters = tipsters
    .filter(t => t.role === 'tipster' && t.tipsterStatus === 'active')
    .sort((a, b) => (b.winRate || 0) - (a.winRate || 0));
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAdvertisements = async () => {
    setLoading(true);
    try {
      const { data, error: loadError } = await supabase
        .from('advertisements')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (loadError) throw loadError;
      setAdvertisements((data || []).map(mapAdvertisement));
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load adverts.';
      console.error('Failed to load advertisements:', loadError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingAd(null);
    setFormOpen(false);
  };

  const startEditing = (ad: Advertisement) => {
    setFormOpen(true);
    setEditingAd(ad);
    setForm({
      advertiserType: ad.advertiser_type,
      name: ad.name,
      tagline: ad.tagline,
      description: ad.description,
      cta: ad.cta,
      targetUrl: ad.target_url,
      tipsterId: ad.tipster_id || '',
      active: ad.active,
    });
    setImageFile(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setError(null);

    if (!form.name.trim() || !form.description.trim() || !form.cta.trim()) {
      setError('Enter an advertiser name, description, and button label.');
      return;
    }
    if (imageFile && (!imageFile.type.startsWith('image/') || imageFile.size > 5 * 1024 * 1024)) {
      setError('Choose an image file smaller than 5 MB.');
      return;
    }

    let targetUrl = form.targetUrl.trim();
    if (form.advertiserType === 'tipster') {
      if (!activeTipsters.some(t => t.id === form.tipsterId)) {
        setError('Choose an active tipster to promote.');
        return;
      }
      targetUrl = `/tipsters?subscribe=${encodeURIComponent(form.tipsterId)}`;
    } else {
      try {
        const parsedUrl = new URL(targetUrl);
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error();
      } catch {
        setError('Enter a valid http or https website link.');
        return;
      }
    }

    setSaving(true);
    let uploadedPath: string | undefined;
    try {
      let imageUrl = editingAd?.image_url || null;
      let imagePath = editingAd?.image_path || null;
      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        uploadedPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('advert-images')
          .upload(uploadedPath, imageFile, { contentType: imageFile.type });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from('advert-images').getPublicUrl(uploadedPath).data.publicUrl;
        imagePath = uploadedPath;
      }

      const payload = {
        advertiser_type: form.advertiserType,
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        cta: form.cta.trim(),
        target_url: targetUrl,
        image_url: imageUrl,
        image_path: imagePath,
        tipster_id: form.advertiserType === 'tipster' ? form.tipsterId : null,
        active: form.active,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };
      const result = editingAd
        ? await supabase.from('advertisements').update(payload).eq('id', editingAd.id).select('*').single()
        : await supabase.from('advertisements').insert(payload).select('*').single();
      if (result.error) throw result.error;
      if (!result.data) throw new Error('The advertisement was not saved.');

      if (uploadedPath && editingAd?.image_path && editingAd.image_path !== uploadedPath) {
        const { error: removeError } = await supabase.storage.from('advert-images').remove([editingAd.image_path]);
        if (removeError) setError(`Advertisement saved, but its previous image could not be removed: ${removeError.message}`);
      }
      setAdvertisements(current => {
        const saved = mapAdvertisement(result.data);
        return editingAd
          ? current.map(ad => ad.id === saved.id ? saved : ad)
          : [saved, ...current];
      });
      resetForm();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save advertisement.';
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from('advert-images').remove([uploadedPath]);
        setError(cleanupError ? `${message} Uploaded image cleanup also failed: ${cleanupError.message}` : message);
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!window.confirm(`Delete "${ad.name}"? This cannot be undone.`)) return;
    setError(null);
    const { error: deleteError } = await supabase.from('advertisements').delete().eq('id', ad.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setAdvertisements(current => current.filter(item => item.id !== ad.id));
    if (ad.image_path) {
      const { error: imageError } = await supabase.storage.from('advert-images').remove([ad.image_path]);
      if (imageError) setError(`Advertisement deleted, but its image could not be removed: ${imageError.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Advertisements</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Add bookmaker or business campaigns with photos, or feature an active tipster in the top advert carousel.
          </p>
        </div>
        {!formOpen && (loading || advertisements.length > 0) && (
          <button
            onClick={() => {
              setForm(emptyForm);
              setImageFile(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0EA5E9] px-4 py-2 text-xs font-bold text-white"
          >
            <Plus className="h-4 w-4" /> New advert
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>}

      {(formOpen || (!loading && advertisements.length === 0)) && (
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111c30]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{editingAd ? 'Edit advert' : 'Create advert'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Advert type
              <select
                value={form.advertiserType}
                onChange={event => setForm(current => ({ ...current, advertiserType: event.target.value as AdvertiserType }))}
                className="input-field mt-1 w-full text-xs"
              >
                <option value="bookmaker">Bookmaker</option>
                <option value="business">Business</option>
                <option value="tipster">Featured tipster</option>
              </select>
            </label>
            {form.advertiserType === 'tipster' ? (
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Active tipster
                <select
                  required
                  value={form.tipsterId}
                  onChange={event => {
                    const selected = activeTipsters.find(t => t.id === event.target.value);
                    setForm(current => ({ ...current, tipsterId: event.target.value, name: selected?.name || current.name }));
                  }}
                  className="input-field mt-1 w-full text-xs"
                >
                  <option value="">Select tipster</option>
                  {activeTipsters.map(t => <option key={t.id} value={t.id}>{t.name} · {t.winRate ?? 0}% wins</option>)}
                </select>
              </label>
            ) : (
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Business / bookmaker name
                <input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="input-field mt-1 w-full text-xs" />
              </label>
            )}
            {form.advertiserType === 'tipster' && (
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Display name
                <input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="input-field mt-1 w-full text-xs" />
              </label>
            )}
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Tagline
              <input value={form.tagline} onChange={event => setForm(current => ({ ...current, tagline: event.target.value }))} className="input-field mt-1 w-full text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Button label
              <input required value={form.cta} onChange={event => setForm(current => ({ ...current, cta: event.target.value }))} className="input-field mt-1 w-full text-xs" />
            </label>
            {form.advertiserType !== 'tipster' && (
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
                Website link
                <input required type="url" value={form.targetUrl} onChange={event => setForm(current => ({ ...current, targetUrl: event.target.value }))} placeholder="https://" className="input-field mt-1 w-full text-xs" />
              </label>
            )}
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
              Description
              <textarea required rows={3} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="input-field mt-1 w-full text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
              Photo / logo (up to 5 MB)
              <span className="mt-1 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={event => setImageFile(event.target.files?.[0] || null)} className="w-full text-xs" />
              </span>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.active} onChange={event => setForm(current => ({ ...current, active: event.target.checked }))} className="accent-[#0EA5E9]" />
              Show in advert carousel
            </label>
            <div className="flex gap-2">
              {editingAd && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700">Cancel</button>}
              <button disabled={saving} className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                {saving ? 'Saving...' : editingAd ? 'Save changes' : 'Create advert'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-xs text-slate-500">Loading adverts...</p>
      ) : advertisements.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500">No adverts yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {advertisements.map(ad => (
            <article key={ad.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              {ad.image_url ? <img src={ad.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{ad.name}</p>
                <p className="text-[10px] capitalize text-slate-500">{ad.advertiser_type} · {ad.active ? 'Active' : 'Paused'}</p>
              </div>
              <button onClick={() => startEditing(ad)} aria-label={`Edit ${ad.name}`} title="Edit advert" className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(ad)} aria-label={`Delete ${ad.name}`} title="Delete advert" className="rounded-lg border border-rose-200 p-2 text-rose-600 dark:border-rose-900"><Trash2 className="h-4 w-4" /></button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
