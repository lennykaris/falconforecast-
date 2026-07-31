import React from 'react';
import { Copyright, ShieldAlert, Lock, Award, FileText, Mail, CheckCircle2 } from 'lucide-react';

export const CopyrightPage: React.FC = () => {
  const ownedAssets = [
    "Sports predictions and analytical reports",
    "Match statistics and performance insights",
    "Visual dashboards, charts, and databases",
    "Web design, structure, and layout",
    "Custom-developed algorithms and analytical models"
  ];

  const prohibitedUses = [
    "Copied, modified, or distributed without written authorization",
    "Reverse-engineered or extracted from the platform for reuse",
    "Used commercially or integrated into other services or websites",
    "Reproduced, mirrored, or resold without prior consent"
  ];

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
          <Copyright className="w-4 h-4" />
          Intellectual Property & Legal Protection
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Copyright Notice & Ownership
        </h1>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Official copyright, intellectual property statement, and usage guidelines for <span className="font-bold text-sky-400">Falcon Forecast</span> (falconforecast.com).
        </p>
      </section>

      {/* Sections */}
      <div className="space-y-8">
        
        {/* Section 1: Ownership of Content */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              1. Ownership of Content
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            All materials published on this website, including text, graphics, data visualizations, software code, layout, and digital assets, are the exclusive property of Falcon Forecast (falconforecast.com).
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-sky-400">This includes but is not limited to:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ownedAssets.map((asset, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border text-xs"
                   style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-400" />
                <span>{asset}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            <p>
              All rights are reserved and protected under the competent international laws on intellectual property protection.
            </p>
            <p>
              Falcon Forecast may have third-party partnerships. All raw data provided on the website remain the intellectual property of their respective licensors. However, the collection, organization, formatting, display, and analysis of such data on the Falcon Forecast platform constitute original intellectual work fully owned by Falcon Forecast.
            </p>
            <p>
              Unauthorized access, scraping, duplication, or redistribution of this data or system output is strictly prohibited. All user data collected are managed in compliance with the Data Protection Act applicable under the exclusive jurisdiction of competent international legal frameworks and authorities and international privacy standards.
            </p>
          </div>
        </section>

        {/* Section 2: Prohibited Uses */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4 border-rose-500/20" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl text-rose-400 bg-rose-400/10">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              2. Prohibited Uses
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            No content or component of the Falcon Forecast website may be:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {prohibitedUses.map((use, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border text-xs"
                   style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
                <span>{use}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-rose-300/90 font-medium pt-1">
            Violation of these conditions constitutes a breach of copyright and may result in both civil and criminal penalties as provided by law.
          </p>
        </section>

        {/* Section 3 & 4: User Rights & Trademarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                3. User Rights and Limitations
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Users are granted a limited, non-transferable right to access and use Falcon Forecast for personal, non-commercial purposes. Premium or subscription-based content is strictly for authorized subscribers and must not be shared, copied, or redistributed.
            </p>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                4. Trademarks and Branding
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The name <strong>Falcon Forecast</strong>, its logo, design elements, and associated brand identifiers are trademarks and service marks owned by the website. No right or license is granted to use these marks without prior written approval.
            </p>
          </section>
        </div>

        {/* Section 5: Enforcement and Claims */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4 text-center"
                 style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--brand)' }}>
          <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            5. Enforcement & Legal Inquiries
          </h2>
          <p className="text-xs sm:text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Any unauthorized use, duplication, or redistribution of website content, structure, or systems may be subject to immediate legal action and claims for damages under applicable laws. For all copyright-related inquiries or permissions, please contact our support channel.
          </p>
          
          <div className="pt-2 text-xs font-mono font-bold" style={{ color: 'var(--brand)' }}>
            © 2025 Falcon Forecast. All Rights Reserved.
          </div>
        </section>

      </div>

    </div>
  );
};
