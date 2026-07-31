import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Cookie, CheckCircle2, UserCheck, AlertCircle, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const personalDataList = [
    "Full name or username",
    "Email address",
    "Mobile number",
    "Login credentials"
  ];

  const autoDataList = [
    "Device information & browser specs",
    "Access logs and usage statistics",
    "Referrals and clickstream data",
    "Cookies and similar tracking technologies"
  ];

  const purposesList = [
    "Create and manage user accounts",
    "Provide access to predictions, live scores, and analytics",
    "Process payments and manage subscriptions",
    "Improve platform performance and personalize user experience",
    "Communicate important updates, promotions, and support messages",
    "Prevent fraud, unauthorized access, and misuse of the website",
    "Comply with legal, financial, and regulatory obligations"
  ];

  const securityMeasures = [
    "SSL encryption for data in transit and at rest",
    "Secure role-based access controls",
    "Periodic system security audits",
    "Strict data minimization and retention policies"
  ];

  const userRights = [
    "Access personal information stored on Falcon Forecast",
    "Request correction or deletion of personal data",
    "Withdraw consent for data processing at any time",
    "Object to the use of data for marketing purposes",
    "Request a portable copy of stored personal data"
  ];

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
          <ShieldCheck className="w-4 h-4" />
          Data Protection & Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-bold text-sky-400">Falcon Forecast</span> (FalconForecast.com) is committed to protecting the privacy and personal data of all its users. This policy explains how personal information is collected, processed, stored, and protected.
        </p>
      </section>

      {/* Main Content Sections */}
      <div className="space-y-8">
        
        {/* Section 1: Introduction */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            1. Introduction & Agreement
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            By accessing Falcon Forecast, you agree to the collection and use of information as described in this policy. The platform upholds the principles of data protection and aligns with global privacy standards under the Data Protection Act.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              2. Information We Collect
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">a. Personal Information</span>
              <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                {personalDataList.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">b. Automatically Collected Data</span>
              <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                {autoDataList.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">c. Analytical and Predictive Data</span>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              In connection with sports analytics, Falcon Forecast may collect anonymized usage patterns and aggregated statistics to enhance prediction accuracy and overall user experience.
            </p>
          </div>
        </section>

        {/* Section 3: Purpose of Data Collection */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            3. Purpose of Data Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {purposesList.map((p, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-xl border text-xs"
                   style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0"></span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 & 5: Cookies & Data Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Cookie className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                4. Cookies & Tracking
              </h2>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Falcon Forecast uses cookies to store user preferences, maintain login sessions, monitor traffic patterns, and measure marketing performance. Users can modify cookie preferences through browser settings.
            </p>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                5. Storage & Security
              </h2>
            </div>
            <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
              {securityMeasures.map((sec, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  <span>{sec}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Section 7 & 8: Data Sharing & User Rights */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              7. Data Sharing & User Rights
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong>Falcon Forecast does not sell, rent, or trade personal data.</strong> Information is shared only with trusted technical partners for hosting/analytics or when required by law.
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-sky-400">As per applicable privacy laws, users have the right to:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {userRights.map((right, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border text-xs"
                   style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-400" />
                <span>{right}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 10 & 11: Children's Privacy & Policy Updates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              10. Children's Privacy (18+)
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Falcon Forecast's services are intended strictly for users aged 18 years and above. The platform does not knowingly collect personal data from minors. Any such data discovered will be purged immediately.
            </p>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              11. Policy Updates & Contact
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              This Privacy Policy is updated periodically to reflect operational or legal changes. For data requests or complaints, contact us via the official contact page or email.
            </p>
          </section>
        </div>

        {/* Legal Declaration Footer */}
        <div className="text-center pt-2 text-xs font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
          © 2025 Falcon Forecast. All Rights Reserved.
        </div>

      </div>

    </div>
  );
};
