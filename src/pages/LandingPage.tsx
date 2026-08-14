import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Moon,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { INITIAL_TIPSTERS } from '../data/tipsters';
import { SUBSCRIPTION_PLANS } from '../data/predictions';

const LEAGUES = ['Premier League', 'La Liga', 'Champions League', 'Serie A', 'Bundesliga'];

const FEATURES = [
  {
    icon: Radar,
    title: 'Confidence-scored picks',
    description: 'Every tip ships with a 0-100 confidence rating built from form, xG and head-to-head data — not gut feeling.',
  },
  {
    icon: Users,
    title: 'Verified tipster marketplace',
    description: 'Follow independent, track-record-verified tipsters across every major league, or stick with our in-house AI picks.',
  },
  {
    icon: BarChart3,
    title: 'Live odds comparison',
    description: 'See how our picks stack up against real-time bookmaker odds before you commit a single shilling.',
  },
  {
    icon: Zap,
    title: 'Real-time score ticker',
    description: 'Live scores, half-time updates and full-time results streamed straight into your dashboard.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create your free account',
    description: 'One tap with Google — no forms, no passwords to remember.',
  },
  {
    step: '02',
    title: 'Browse free daily tips',
    description: 'Explore predictions across the Premier League, Champions League, La Liga and more.',
  },
  {
    step: '03',
    title: 'Upgrade for VIP accuracy',
    description: 'Unlock 85%+ confidence picks and premium tipsters whenever you’re ready.',
  },
];

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const topTipsters = [...INITIAL_TIPSTERS]
    .sort((a, b) => (b.winRate || 0) - (a.winRate || 0))
    .slice(0, 3);

  const previewPlans = SUBSCRIPTION_PLANS.slice(0, 3);

  return (
    <div style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-base) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center select-none flex-shrink-0 min-w-0">
            <span className="font-black italic text-sm sm:text-xl tracking-wider uppercase font-sans whitespace-nowrap">
              <span style={{ color: 'var(--brand)' }}>FALCON</span>
              <span style={{ color: 'var(--text-primary)' }} className="ml-1 sm:ml-1.5">FORECAST</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Tipsters', href: '#tipsters' },
              { label: 'Pricing', href: '#pricing' },
            ].map(link => (
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
              className="px-2 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
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
              <span className="hidden sm:inline">Create Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left: copy */}
            <div className="space-y-7">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--brand)', backgroundColor: 'var(--brand-light)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI models + verified human tipsters
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black font-display leading-[1.05] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Football tips that{' '}
                <span style={{ color: 'var(--brand)' }}>beat the bookmaker</span>,
                not just guess the score.
              </h1>

              <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                Falcon Forecast blends xG modeling with a marketplace of verified tipsters to deliver
                confidence-scored predictions across the Premier League, La Liga, Serie A, Bundesliga
                and the Champions League — free tips daily, VIP picks when you want an edge.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
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

              {/* Stat row */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                {[
                  { value: '88%', label: 'Avg. VIP win rate' },
                  { value: '1,200+', label: 'Active subscribers' },
                  { value: '5', label: 'Leagues covered' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mock prediction card stack */}
            <div className="relative hidden lg:block pb-10">
              <div className="relative mx-auto w-full max-w-sm">
                {/* Back card */}
                <div
                  className="absolute -top-6 -right-6 w-full rounded-2xl border rotate-3 opacity-60"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', height: '260px' }}
                />
                {/* Front card */}
                <div className="relative rounded-2xl p-5 pb-8 bet-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}
                    >
                      Champions League &middot; VIP
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      94% Confidence
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Real Madrid vs Bayern Munich</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Kickoff in 4h &middot; Bernab&eacute;u</div>
                  </div>

                  <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Tip</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Real Madrid to Qualify @ 2.10</div>
                  </div>

                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="h-full rounded-full" style={{ width: '94%', backgroundColor: 'var(--brand)' }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    <span>Falcon Forecast Platform</span>
                    <span className="flex items-center gap-1 text-emerald-500">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>

                {/* Floating badge */}
                <div
                  className="absolute -bottom-8 -left-8 rounded-xl px-4 py-3 border bet-card flex items-center gap-2.5"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-light)' }}>
                    <Trophy className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                  </div>
                  <div>
                    <div className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>342 tips settled</div>
                    <div className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Falcon Master AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* League strip */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-16 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[11px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              Coverage across
            </span>
            {LEAGUES.map(league => (
              <span key={league} className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                {league}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
        <div className="max-w-xl mb-12 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Why Falcon Forecast</p>
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Everything you need to bet smarter
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(feature => (
            <div key={feature.title} className="rounded-2xl p-5 bet-card space-y-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-light)' }}>
                <feature.icon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ backgroundColor: 'var(--bg-muted)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>How it works</p>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
              From sign up to VIP pick in under a minute
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map(step => (
              <div key={step.step} className="space-y-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--brand)', border: '1px solid var(--border-strong)' }}
                >
                  {step.step}
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP TIPSTERS ─── */}
      <section id="tipsters" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div className="max-w-xl space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Top tipsters</p>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
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
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topTipsters.map(tipster => (
            <div key={tipster.id} className="rounded-2xl p-5 bet-card space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={tipster.avatarUrl}
                  alt={tipster.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  style={{ border: '2px solid var(--border-strong)' }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{tipster.name}</span>
                    {tipster.verified && <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />}
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {(tipster.leagues || []).slice(0, 2).join(' & ')}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {tipster.bio}
              </p>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-lg font-black" style={{ color: 'var(--brand)' }}>{tipster.winRate}%</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Win rate</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{tipster.subscribersCount}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Subscribers</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING TEASER ─── */}
      <section id="pricing" style={{ backgroundColor: 'var(--bg-muted)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Start free. Upgrade when you want an edge.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {previewPlans.map(plan => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 space-y-4 relative ${plan.popular ? 'ring-2' : 'bet-card'}`}
                style={plan.popular ? { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow-h)', ['--tw-ring-color' as string]: 'var(--brand)' } : undefined}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white flex items-center gap-1"
                    style={{ backgroundColor: 'var(--brand)' }}
                  >
                    <Star className="w-3 h-3 fill-white" /> Most popular
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.slice(0, 3).map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-16 text-center space-y-6"
          style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b5fae 100%)' }}
        >
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

          <h2 className="relative text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Ready to out-predict the bookies?
          </h2>
          <p className="relative text-sm text-white/80 max-w-md mx-auto">
            Create your free account with Google in seconds and get today's picks instantly.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white transition-transform hover:scale-105"
              style={{ color: 'var(--brand)' }}
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
