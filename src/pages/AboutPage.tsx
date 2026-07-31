import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, ShieldCheck, Zap, Globe, Award, TrendingUp, BarChart3 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const corePillars = [
    {
      icon: Target,
      title: "Our Mission",
      desc: "To bring clarity, confidence, and smarter decision-making to the sports community by offering instant score updates, broad match statistics, historical records, team and player details, and prediction models based on observed trends and performance patterns.",
      accent: "#38bdf8"
    },
    {
      icon: Eye,
      title: "Our Vision",
      desc: "To become the leading global sports data hub by introducing new features, strengthening our platform, and creating better ways for users to explore sports information. We are committed to transparency, user trust, platform stability, and providing tools that support informed sports following.",
      accent: "#818cf8"
    },
    {
      icon: ShieldCheck,
      title: "Integrity & Trust",
      desc: "Falcon Forecast continues to evolve, while consistently upgrading our systems to enhance value for every visitor, ensuring that anyone exploring live scores, data, predictions, insights, or analytics can rely on a well-organized and dependable sports information experience.",
      accent: "#34d399"
    }
  ];

  const highlights = [
    { icon: Globe, title: "Global Coverage", detail: "Major and minor leagues worldwide" },
    { icon: Zap, title: "Real-Time Updates", detail: "Instant live scores and data updates" },
    { icon: BarChart3, title: "Data Insights", detail: "Statistical modeling & trend analytics" },
    { icon: Award, title: "Trusted Sources", detail: "Verified data providers & algorithms" }
  ];

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12" style={{ backgroundColor: 'var(--bg-base)' }}>
      
      {/* Header Banner */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
          <TrendingUp className="w-3.5 h-3.5" />
          About Falcon Forecast
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Empowering Fans & Analysts with Data Precision
        </h1>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Falcon Forecast is a modern sports platform built to provide sports information by combining live scores, real-time updates, and well-organized data insights to help fans, analysts, and enthusiasts stay informed throughout every match.
        </p>
      </section>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {highlights.map((h, i) => {
          const Icon = h.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl border transition-all duration-300 hover:border-sky-500/40 text-center space-y-2"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{h.title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Core Mission & Vision Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {corePillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${pillar.accent}15`, color: pillar.accent }}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                  {pillar.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {pillar.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Detailed Overview Section */}
      <section className="p-8 sm:p-10 rounded-3xl border space-y-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
          Comprehensive Sports Data Coverage
        </h2>
        <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4" style={{ color: 'var(--text-secondary)' }}>
          <p>
            With global coverage across major and minor leagues, Falcon Forecast sources its data from trusted providers and presents it through a clean, user-friendly interface created for both everyday fans and professionals.
          </p>
          <p>
            Falcon Forecast continues to evolve, while consistently upgrading our systems to enhance value for every visitor, ensuring that anyone exploring live scores, data, predictions, insights, or analytics can rely on a well-organized and dependable sports information experience.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-6 text-xs">
            <div>
              <span className="block font-black text-lg" style={{ color: 'var(--brand)' }}>10,000+</span>
              <span style={{ color: 'var(--text-muted)' }}>Matches Modeled</span>
            </div>
            <div>
              <span className="block font-black text-lg" style={{ color: 'var(--brand)' }}>87.4%</span>
              <span style={{ color: 'var(--text-muted)' }}>Model Accuracy</span>
            </div>
            <div>
              <span className="block font-black text-lg" style={{ color: 'var(--brand)' }}>24/7</span>
              <span style={{ color: 'var(--text-muted)' }}>Real-Time Data</span>
            </div>
          </div>
          <Link
            to="/tips"
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 transition-all hover:brightness-110 shadow-lg"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Explore Free Daily Predictions →
          </Link>
        </div>
      </section>

    </div>
  );
};
