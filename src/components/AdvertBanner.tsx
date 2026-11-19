import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, ExternalLink, Megaphone, Pause, Play, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTipsters } from '../context/TipstersContext';
import type { Advertisement } from '../types/advertisement';

interface AdvertBannerProps {
  sticky?: boolean;
}

export const AdvertBanner: React.FC<AdvertBannerProps> = ({ sticky = true }) => {
  const { tipsters } = useTipsters();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    const loadAdvertisements = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (!active) return;
        setAdvertisements((data || []).map((row: Record<string, any>) => ({
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
        })));
      } catch (error) {
        if (active) console.error('Failed to load advertisements:', error);
      }
    };
    loadAdvertisements();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (dismissed || isPaused || advertisements.length < 2) return;
    const timer = setInterval(() => {
      setCurrentIndex(index => (index + 1) % advertisements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [advertisements.length, dismissed, isPaused]);

  const ad = advertisements[currentIndex];
  const featuredTipster = ad?.tipster_id ? tipsters.find(t => t.id === ad.tipster_id) : undefined;

  if (dismissed || !ad) {
    return (
      <div className="bg-white dark:bg-[#111c30] border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
        <Megaphone className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-[10px] text-slate-400 font-medium">
          {dismissed ? 'Advert hidden' : 'Advertise here'}
        </p>
        {!dismissed && (
          <>
            <p className="text-[10px] text-slate-300 dark:text-slate-600">Promote your business or tipster profile</p>
            <a href="mailto:falconforecasts@gmail.com" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#00a8ff] hover:underline">
              Contact us <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>
    );
  }

  const isInternalLink = ad.target_url.startsWith('/');
  const adLabel = ad.advertiser_type === 'tipster'
    ? 'FEATURED TIPSTER'
    : ad.advertiser_type === 'bookmaker'
      ? 'BOOKMAKER'
      : 'BUSINESS PARTNER';

  return (
    <div className={sticky ? 'sticky top-24' : ''}>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-[#111c30]"
      >
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
              {adLabel}
            </span>
            {ad.advertiser_type === 'tipster' && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
            {isPaused && (
              <span className="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:bg-amber-900/40">
                <Pause className="h-2 w-2" /> Paused
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {advertisements.length > 1 && (
              <div className="flex items-center gap-1">
                {advertisements.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Show advert ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${index === currentIndex ? 'w-4 bg-[#00a8ff]' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
            )}
            {advertisements.length > 1 && (
              <button onClick={() => setIsPaused(value => !value)} aria-label={isPaused ? 'Resume adverts' : 'Pause adverts'} className="p-0.5 text-slate-400">
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </button>
            )}
            <button onClick={() => setDismissed(true)} aria-label="Dismiss advert" title="Dismiss advert" className="p-0.5 text-slate-300 transition-colors hover:text-slate-500">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div key={ad.id} className="space-y-2.5 px-3 pb-3">
          <div className="flex items-center gap-2">
            {ad.image_url || featuredTipster?.avatarUrl ? (
              <img
                src={ad.image_url || featuredTipster?.avatarUrl}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-black text-white">
                {ad.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                {ad.name}
                {ad.advertiser_type === 'tipster' && featuredTipster?.verified && <CheckCircle2 className="h-3 w-3 text-[#00a8ff]" />}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{ad.tagline}</p>
            </div>
          </div>

          <p className="min-h-8 text-[11px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
            {ad.description}
          </p>

          <a
            href={ad.target_url}
            target={isInternalLink ? undefined : '_blank'}
            rel={isInternalLink ? undefined : 'noopener noreferrer'}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {ad.cta} <ChevronRight className="h-3.5 w-3.5" />
          </a>

          {ad.advertiser_type === 'bookmaker' && (
            <p className="text-center text-[9px] leading-tight text-slate-400">18+ · T&Cs apply · Gamble responsibly</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/60 bg-slate-50/60 px-3 py-1.5 dark:border-slate-800/40 dark:bg-slate-800/20">
          <p className="text-[9px] text-slate-400">Want to advertise here?</p>
          <a href="mailto:falconforecasts@gmail.com" className="flex items-center gap-0.5 text-[9px] font-bold text-[#00a8ff] hover:underline">
            Contact us <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
