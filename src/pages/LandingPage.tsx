import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  Menu,
  Moon,
  Radar,
  Radio,
  ShieldCheck,
  Sun,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTipsters } from '../context/TipstersContext';
import { SUBSCRIPTION_PLANS } from '../data/predictions';
import { fetchMatches } from '../lib/matches';
import { supabase } from '../lib/supabase';
import type { Match } from '../types/prediction';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Tipsters', href: '#tipsters' },
  { label: 'Pricing', href: '#pricing' },
];

const LEAGUES = ['Premier League', 'La Liga', 'Champions League', 'Serie A', 'Bundesliga'];

const STEPS = [
  { step: '01', title: 'Create your free account', description: 'One tap with Google — no forms, no passwords to remember.' },
  { step: '02', title: 'Browse free daily tips', description: 'Explore predictions across the Premier League, Champions League, La Liga and more.' },
  { step: '03', title: 'Upgrade for VIP accuracy', description: 'Unlock 85%+ confidence picks and premium tipsters whenever you’re ready.' },
];

const tickerTimeLabel = (m: Match) => {
  switch (m.status) {
    case 'IN_PLAY': return 'Live';
    case 'PAUSED': return 'HT';
    case 'FINISHED': return 'FT';
    default: return '';
  }
};

/* Scroll-scrubbed frame sequence: every 3rd frame of a 300-frame source clip, for a lighter payload */
const HERO_FRAME_COUNT = 100;
const HERO_FRAME_URLS = Array.from({ length: HERO_FRAME_COUNT }, (_, i) => {
  const frameNumber = i * 3 + 1;
  return `/ezgif-273a42396ea5dadb-jpg/ezgif-frame-${String(frameNumber).padStart(3, '0')}.jpg`;
});
const HERO_SCROLL_RANGE = 900;

/* ─── Scroll-triggered visibility hook ─── */
function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─── Fade-up reveal wrapper ─── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ─── Count-up stat ─── */
const AnimatedStat: React.FC<{ target: number; suffix?: string; label: string }> = ({ target, suffix = '', label }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.6);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const duration = 1400;
    const start = performance.now();
    const step = (ts: number) => {
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <div ref={ref}>
      <div className="font-mono font-black text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        {value}<span style={{ color: 'var(--brand)' }}>{suffix}</span>
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
};

/* ─── Animated circular progress ─── */
const RadialGauge: React.FC<{ value: number; size?: number; strokeWidth?: number; color?: string }> = ({
  value, size = 88, strokeWidth = 7, color = 'var(--brand)',
}) => {
  const { ref, inView } = useInView<SVGSVGElement>(0.4);
  const r = (size - strokeWidth) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={c} cy={c} r={r} stroke="var(--border-strong)" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={c} cy={c} r={r} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          strokeDasharray: circumference,
          strokeDashoffset: inView ? offset : circumference,
          transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </svg>
  );
};

/* ─── Scroll-scrubbed image sequence used as the hero's background ─── */
const HeroFrameSequence: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const [loadedCount, setLoadedCount] = useState(0);

  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
  };

  // Preload every sampled frame
  useEffect(() => {
    let cancelled = false;
    const images = HERO_FRAME_URLS.map(src => {
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setLoadedCount(c => c + 1);
      };
      img.src = src;
      return img;
    });
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, []);

  // Draw the current frame as soon as it becomes available (covers first paint)
  useEffect(() => {
    draw(frameIndexRef.current);
  }, [loadedCount]);

  // Keep the canvas sized to its container
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw(frameIndexRef.current);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Map page scroll position to a frame index
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const progress = Math.min(Math.max(window.scrollY / HERO_SCROLL_RANGE, 0), 1);
        const index = Math.min(HERO_FRAME_COUNT - 1, Math.floor(progress * HERO_FRAME_COUNT));
        if (index !== frameIndexRef.current) {
          frameIndexRef.current = index;
          draw(index);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ filter: 'blur(1px) saturate(1.1)' }} />;
};

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Real platform-wide numbers via a SECURITY DEFINER RPC (see supabase_schema.sql) — an
  // anonymous visitor can never see individual subscription rows, only this safe aggregate.
  const [platformStats, setPlatformStats] = useState({ activeSubscribers: 0, avgWinRate: 0 });
  useEffect(() => {
    supabase.rpc('platform_stats').then(({ data, error }) => {
      if (!error && data && data[0]) {
        setPlatformStats({
          activeSubscribers: Number(data[0].active_subscribers) || 0,
          avgWinRate: Number(data[0].avg_win_rate) || 0,
        });
      }
    });
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const denom = h.scrollHeight - h.clientHeight;
        setScrollPct(denom > 0 ? (h.scrollTop / denom) * 100 : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const { tipsters } = useTipsters();
  const topTipsters = [...tipsters]
    .filter(t => t.tipsterStatus === 'active')
    .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
    .slice(0, 3);

  const [tickerScores, setTickerScores] = useState<{ time: string; match: string }[]>([]);
  useEffect(() => {
    fetchMatches()
      .then(matches => {
        const withScores = matches
          .filter((m: Match) => (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') && m.homeScore != null && m.awayScore != null)
          .slice(0, 8)
          .map((m: Match) => ({
            time: tickerTimeLabel(m),
            match: `${m.homeTla || m.homeTeam.slice(0, 3).toUpperCase()} ${m.homeScore}-${m.awayScore} ${m.awayTla || m.awayTeam.slice(0, 3).toUpperCase()}`,
          }));
        setTickerScores(withScores);
      })
      .catch(() => setTickerScores([]));
  }, []);

  const previewPlans = SUBSCRIPTION_PLANS.slice(0, 3);

  return (
    <div style={{ backgroundColor: 'var(--bg-base)' }}>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-xs focus:font-bold focus:text-white"
        style={{ backgroundColor: 'var(--brand)' }}
      >
        Skip to content
      </a>

      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 h-[2px] z-[60]"
        style={{ width: `${scrollPct}%`, background: 'linear-gradient(90deg, var(--brand), var(--brand-sky))', transition: 'width 80ms linear' }}
      />

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-base) 82%, transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 select-none flex-shrink-0 min-w-0">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-light)' }}>
              <Radar className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            </span>
            <span className="font-black italic text-sm sm:text-lg tracking-wider uppercase font-display whitespace-nowrap">
              <span style={{ color: 'var(--brand)' }}>FALCON</span>
              <span style={{ color: 'var(--text-primary)' }} className="ml-1">FORECAST</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border transition-colors flex-shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
              style={{ color: 'var(--text-primary)' }}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg text-white transition-all hover:brightness-110 shadow-sm whitespace-nowrap"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <span className="sm:hidden">Sign Up</span>
              <span className="hidden sm:inline">Create free account</span>
            </Link>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border flex-shrink-0"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t px-4 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-1 py-2.5 text-sm font-semibold border-b"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-1 py-2.5 text-sm font-semibold"
              style={{ color: 'var(--brand)' }}
            >
              Log In
            </Link>
          </div>
        )}
      </header>

      <main id="main-content">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden">
          {/* Ambient background: scroll-scrubbed frame sequence, full-bleed behind the whole hero */}
          <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
            <HeroFrameSequence />
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-base)', opacity: 0.4 }} />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: 'var(--bg-base)',
                maskImage: 'radial-gradient(ellipse 50% 75% at 50% 40%, black 30%, transparent 85%)',
                WebkitMaskImage: 'radial-gradient(ellipse 50% 75% at 50% 40%, black 30%, transparent 85%)',
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-[0.14]"
              style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }}
            />
            <div
              className="absolute top-52 -left-32 w-96 h-96 rounded-full blur-3xl opacity-[0.1]"
              style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-16 lg:pt-20 lg:pb-20">
            <div className="relative">

              <div className="relative z-10 max-w-2xl mx-auto text-center space-y-7">
                <Reveal delay={80}>
                  <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black font-display leading-[1.04] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Football tips that{' '}
                    <span style={{ color: 'var(--brand)' }}>beat the bookmaker</span>,
                    not just guess the score.
                  </h1>
                </Reveal>

                <Reveal delay={140}>
                  <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Falcon Forecast blends xG modeling with a marketplace of verified tipsters to deliver
                    confidence-scored predictions across the Premier League, La Liga, Serie A, Bundesliga
                    and the Champions League — free tips daily, VIP picks when you want an edge.
                  </p>
                </Reveal>

                <Reveal delay={200}>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg"
                      style={{ backgroundColor: 'var(--brand)', boxShadow: '0 8px 24px -6px rgba(0,168,255,0.45)' }}
                    >
                      Create free account
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/matches"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border transition-colors"
                      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}
                    >
                      See today's tips
                    </Link>
                  </div>
                </Reveal>

                <Reveal delay={260}>
                  <div className="flex flex-wrap gap-x-10 gap-y-4 pt-2 justify-center">
                    <AnimatedStat target={platformStats.avgWinRate} suffix="%" label="Avg. tipster win rate" />
                    <AnimatedStat target={platformStats.activeSubscribers} suffix="" label="Active subscribers" />
                    <AnimatedStat target={5} suffix="" label="Leagues covered" />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          {/* League strip — static row, shares the hero's background so there's no hard cutoff */}
          <div className="relative border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 px-5">
              {LEAGUES.map(l => (
                <span key={l} className="flex items-center gap-2 flex-shrink-0 text-sm font-bold whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES (bento) ─── */}
        <section id="features" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
          <Reveal className="max-w-xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Why Falcon Forecast</p>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3" style={{ color: 'var(--text-primary)' }}>
              Everything you need to bet smarter
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {/* Large card: confidence gauge */}
            <Reveal className="sm:col-span-2 sm:row-span-2">
              <div className="h-full rounded-2xl p-6 bet-card flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--brand-light)' }}>
                    <Target className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  </div>
                  <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Confidence-scored picks</h3>
                  <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
                    Every tip ships with a 0-100 confidence rating built from form, xG and head-to-head data — not gut feeling.
                  </p>
                </div>
                <div className="flex items-center gap-5 mt-6">
                  <RadialGauge value={94} />
                  <div>
                    <div className="font-mono font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
                      94<span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <div className="text-[11px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
                      Real Madrid vs Bayern<br />confidence score
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Verified tipster marketplace */}
            <Reveal delay={90} className="sm:col-span-2">
              <div className="h-full rounded-2xl p-6 bet-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(16,185,129,0.14)' }}>
                  <Users className="w-5 h-5" style={{ color: '#10b981' }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Verified tipster marketplace</h3>
                <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
                  Follow independent, track-record-verified tipsters across every major league, or stick with our in-house AI picks.
                </p>
              </div>
            </Reveal>

            {/* Live odds comparison */}
            <Reveal delay={150} className="sm:col-span-2">
              <div className="h-full rounded-2xl p-6 bet-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(245,158,11,0.16)' }}>
                  <BarChart3 className="w-5 h-5" style={{ color: '#d97706' }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Live odds comparison</h3>
                <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
                  See how our picks stack up against real-time bookmaker odds before you commit a single shilling.
                </p>
                <OddsCompareBars />
              </div>
            </Reveal>

            {/* Real-time score ticker */}
            <Reveal delay={210} className="sm:col-span-2">
              <div className="h-full rounded-2xl p-6 bet-card overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(56,189,248,0.16)' }}>
                  <Radio className="w-5 h-5" style={{ color: '#0284c7' }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Real-time score ticker</h3>
                <p className="text-xs leading-relaxed mt-2 mb-4" style={{ color: 'var(--text-muted)' }}>
                  Live scores, half-time updates and full-time results streamed straight into your dashboard.
                </p>
                <div className="border-t pt-3 overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {tickerScores.length > 0 ? (
                    <div className="animate-ticker-fast">
                      {[...tickerScores, ...tickerScores].map((t, i) => (
                        <span key={i} className="flex items-center gap-1.5 flex-shrink-0 px-3 text-[11px] font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          {t.match} <em className="not-italic font-bold text-emerald-500">{t.time}</em>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>No live results right now — check back during matchday.</p>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" style={{ backgroundColor: 'var(--bg-muted)' }} className="py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="max-w-xl mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>How it works</p>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3" style={{ color: 'var(--text-primary)' }}>
                From sign up to VIP pick in under a minute
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-8 relative">
              <StepConnector />
              {STEPS.map((step, i) => (
                <Reveal key={step.step} delay={i * 90} className="relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black font-mono relative z-10"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--brand)', border: '1px solid var(--border-strong)' }}
                  >
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold mt-4" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed mt-1.5 max-w-xs" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TOP TIPSTERS ─── */}
        <section id="tipsters" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
          <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-14">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Top tipsters</p>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3" style={{ color: 'var(--text-primary)' }}>
                Follow verified, track-record-checked experts
              </h2>
            </div>
            <Link
              to="/tipsters"
              className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
              style={{ color: 'var(--brand)' }}
            >
              Browse all tipsters <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Reveal>

          {topTipsters.length === 0 ? (
            <div className="rounded-2xl p-10 text-center bet-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                We're onboarding our first verified tipsters right now.
              </p>
              <Link
                to="/apply-tipster"
                className="inline-flex items-center gap-1.5 text-xs font-bold mt-3"
                style={{ color: 'var(--brand)' }}
              >
                Be one of the first to apply <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
          <div className="grid sm:grid-cols-3 gap-5">
            {topTipsters.map((tipster, i) => (
              <Reveal key={tipster.id} delay={i * 90}>
                <div className="h-full rounded-2xl p-6 bet-card transition-transform hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <RadialGauge value={tipster.winRate || 0} size={64} strokeWidth={5} color="#10b981" />
                      <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {Math.round(tipster.winRate || 0)}%
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{tipster.name}</span>
                        {tipster.verified && <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />}
                      </div>
                      <div className="text-[11px] font-mono font-semibold" style={{ color: 'var(--brand)' }}>
                        {(tipster.leagues || []).slice(0, 2).join(' & ')}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed line-clamp-2 mb-5" style={{ color: 'var(--text-secondary)' }}>
                    {tipster.bio}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t text-[11px]" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <strong className="block font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{tipster.winRate}%</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Win rate</span>
                    </div>
                    <div className="text-right">
                      <strong className="block font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{tipster.subscribersCount}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Subscribers</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          )}
        </section>

        {/* ─── PRICING ─── */}
        <section id="pricing" style={{ backgroundColor: 'var(--bg-muted)' }} className="py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="max-w-xl mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3" style={{ color: 'var(--text-primary)' }}>
                Start free. Upgrade when you want an edge.
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-6 items-stretch">
              {previewPlans.map((plan, i) => (
                <Reveal key={plan.id} delay={i * 90} className="h-full">
                  <div
                    className={`relative h-full flex flex-col rounded-2xl p-7 ${plan.popular ? 'sm:scale-105' : ''}`}
                    style={
                      plan.popular
                        ? { background: 'linear-gradient(180deg, var(--brand-light), var(--bg-surface) 45%)', border: '1px solid var(--brand)', boxShadow: 'var(--card-shadow-h)' }
                        : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }
                    }
                  >
                    {plan.popular && (
                      <span
                        className="absolute -top-3 left-7 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: 'var(--brand)' }}
                      >
                        Most popular
                      </span>
                    )}
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                    <p className="text-xs mt-2 min-h-[34px]" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                    <div className="font-mono font-black text-2xl mt-4 mb-6" style={{ color: 'var(--text-primary)' }}>
                      {plan.price}
                      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                    </div>
                    <ul className="space-y-2.5 mb-7 flex-1">
                      {plan.features.slice(0, 3).map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${plan.popular ? 'text-white hover:brightness-110' : 'hover:brightness-105'}`}
                      style={plan.popular ? { backgroundColor: 'var(--brand)' } : { border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
                    >
                      Get started
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-3xl px-8 py-16 sm:px-16 text-center border"
              style={{
                background: 'radial-gradient(ellipse 80% 100% at 50% 0%, var(--brand-light), transparent 70%), var(--bg-surface)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Ready to out-predict the bookies?
              </h2>
              <p className="text-sm mt-4 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Create your free account with Google in seconds and get today's picks instantly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: 'var(--brand)', boxShadow: '0 8px 24px -6px rgba(0,168,255,0.45)' }}
                >
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border transition-colors"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
};

/* ─── Odds comparison mini-visual ─── */
const OddsCompareBars: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const rows = [
    { label: 'Falcon', width: 82, value: '2.10', color: 'var(--brand)' },
    { label: 'Book', width: 58, value: '1.85', color: 'var(--text-muted)' },
  ];
  return (
    <div ref={ref} className="mt-5 space-y-2.5">
      {rows.map(row => (
        <div key={row.label} className="flex items-center gap-2.5 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span className="w-11 flex-shrink-0">{row.label}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: inView ? `${row.width}%` : '0%', backgroundColor: row.color, transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }}
            />
          </div>
          <span className="w-9 text-right flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Connecting line for "How it works" steps ─── */
const StepConnector: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div className="hidden sm:block absolute top-[22px] left-[16%] right-[16%] h-px overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
      <div
        ref={ref}
        className="h-full"
        style={{
          width: inView ? '100%' : '0%',
          background: 'linear-gradient(90deg, var(--brand), var(--brand-sky))',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </div>
  );
};
