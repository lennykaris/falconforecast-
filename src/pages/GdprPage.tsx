import React from 'react';
import { ShieldCheck, Lock, Mail, FileText, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

export const GdprPage: React.FC = () => {
  const journalisticItems = [
    "Match previews and reviews",
    "Player and team statistics",
    "Injury reports",
    "Transfer news and rumors",
    "Editorial opinions and analysis",
    "Predictive data models and probability insights"
  ];

  const publicInterestData = [
    "Player names",
    "Club affiliations",
    "Match performance statistics",
    "Disciplinary records",
    "Injury status where publicly reported"
  ];

  const userDataPrinciples = [
    "Lawfulness and transparency",
    "Data minimization",
    "Security and confidentiality",
    "User rights of access, correction, and deletion"
  ];

  const processedDataTypes = [
    "Email addresses",
    "Usernames",
    "IP addresses",
    "Cookies and device identifiers",
    "Billing and subscription details"
  ];

  const userRightsList = [
    "Access to their personal data",
    "Correction of inaccurate data",
    "Deletion of their account information",
    "Restriction of certain processing activities"
  ];

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Title */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
          <ShieldCheck className="w-4 h-4" />
          Data Protection & Legal Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
          GDPR and Journalism Policy
        </h1>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          At <span className="font-bold text-sky-400">Falcon Forecast</span>, we are committed to protecting the privacy of our users while preserving the right to freedom of expression and information in relation to sports reporting, editorial analysis, and statistical publications.
        </p>
      </section>

      {/* Main Content Sections */}
      <div className="space-y-8">
        
        {/* Section 1: Editorial & Journalistic Content */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              1. Editorial and Journalistic Content
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Falcon Forecast publishes sports-related information including, but not limited to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {journalisticItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl border text-xs"
                   style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed pt-2" style={{ color: 'var(--text-muted)' }}>
            Such content may involve the processing of publicly available personal data relating to professional athletes, coaches, clubs, and public sporting figures. Where applicable, this processing is carried out for journalistic and informational purposes in accordance with applicable international data protection, privacy, and freedom of expression laws, including laws relating to journalistic and public-interest publication Regulation (GDPR), which provides for the reconciliation of data protection rights with freedom of expression and information.
          </p>
        </section>

        {/* Section 2: Public Interest & Sports Reporting */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              2. Public Interest and Sports Reporting
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Information published on Falcon Forecast is intended to inform the public on matters of legitimate sporting interest. This includes the use of:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
            {publicInterestData.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed italic pt-2" style={{ color: 'var(--text-muted)' }}>
            Such information is published in good faith for editorial and sports journalism purposes.
          </p>
        </section>

        {/* Section 3: User Data and Platform Services */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              3. User Data and Platform Services
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The journalistic exemption does <strong>not</strong> apply to personal data collected from our users.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            For account creation, subscriptions, newsletters, analytics, and support services, Falcon Forecast processes user data in accordance with GDPR principles, including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">GDPR Principles</span>
              <ul className="space-y-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                {userDataPrinciples.map((p, i) => <li key={i}>• {p}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">User Data Processed</span>
              <ul className="space-y-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                {processedDataTypes.map((d, i) => <li key={i}>• {d}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 & 5: Cookies, Analytics, and User Rights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              4. Cookies and Analytics
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We may use cookies and similar technologies to improve platform functionality, measure performance, and personalize user experience. Where required by applicable law, consent will be requested before non-essential cookies are activated.
            </p>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              5. User Rights
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Users may request:
            </p>
            <ul className="space-y-1 text-xs" style={{ color: 'var(--text-primary)' }}>
              {userRightsList.map((r, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--brand)' }}>
              <Mail className="w-4 h-4" />
              <span>Contact: info@FalconForecast.com</span>
            </div>
          </section>
        </div>

        {/* Section 6: Disclaimer on Predictions */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-3 border-amber-500/30" style={{ backgroundColor: 'rgba(245, 158, 11, 0.04)' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-display text-amber-300">
              6. Disclaimer on Predictions
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-200/90">
            All forecasts, probabilities, and predictive insights provided by Falcon Forecast are statistical in nature and are for informational purposes only. They do not constitute guarantees, financial advice, or betting advice.
          </p>
        </section>

      </div>

    </div>
  );
};
