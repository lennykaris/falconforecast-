import React from 'react';
import { FileText, ShieldAlert, CheckCircle, Scale, AlertCircle, HelpCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const termsSections = [
    {
      num: 1,
      title: "Introduction",
      content: [
        "Welcome to Falcon Forecast (FalconForecast.com)— a digital platform that provides sports-related data, forecast and prediction, live scores, player insights, and analytical information.",
        "By accessing or using this website, you agree to comply with and be legally bound by these Terms of Use (“Terms”). These Terms govern your access, interaction, and use of all services and features available on Falcon Forecast.",
        "If you do not agree with any part of these Terms, you must not use the website or its services."
      ]
    },
    {
      num: 2,
      title: "Definition of Services",
      content: [
        "Falcon Forecast provides digital information, including but not limited to:",
        "• Real-time and historical sports data",
        "• Live scores, match results, and player statistics",
        "• Analytical insights, predictions, and trend reports",
        "• Interactive dashboards and analytical tools",
        "The services are designed for informational and entertainment purposes and are not intended as financial or betting advice."
      ]
    },
    {
      num: 3,
      title: "Eligibility",
      content: [
        "Access to Falcon Forecast is restricted to individuals aged 18 years and above.",
        "By using this website, you confirm that you meet the age requirement and have the legal capacity to enter into a binding agreement."
      ]
    },
    {
      num: 4,
      title: "Account Registration",
      content: [
        "To access certain features, users may be required to create an account. You agree to:",
        "• Provide accurate and up-to-date information",
        "• Maintain confidentiality of login credentials",
        "• Take responsibility for all activities under your account",
        "Falcon Forecast reserves the right to suspend or terminate accounts found to be in violation of these Terms."
      ]
    },
    {
      num: 5,
      title: "Subscription",
      content: [
        "Some features and content may require subscription.",
        "By subscribing, you agree to the applicable plans and renewal terms as displayed on the website.",
        "All subscription are processed securely. Falcon Forecast does not store sensitive payment details and is not liable for transaction errors arising from third-party processors.",
        "Subscription fees are generally non-refundable and are done willingly."
      ]
    },
    {
      num: 6,
      title: "Use of Website and Content",
      content: [
        "Users may access and use the website’s content for personal, non-commercial purposes only. You agree not to:",
        "• Copy, reproduce, distribute, or resell content from Falcon Forecast",
        "• Use automated scripts, bots, or scraping tools",
        "• Disrupt or attempt to compromise the website’s security",
        "• Reverse engineer or attempt to extract source code",
        "• Impersonate another user or provide false information",
        "Violation of these terms may lead to account termination and possible legal action."
      ]
    },
    {
      num: 7,
      title: "Data Accuracy and Disclaimer",
      content: [
        "Falcon Forecast strives to ensure the accuracy and timeliness of its data. However, due to the dynamic nature of sports, live scores, and external data feeds, no warranty is given regarding completeness, reliability, or error-free performance.",
        "All predictions, analytics, and insights provided are for informational purposes only and do not guarantee any outcome or result.",
        "Users are encouraged to exercise independent judgment when interpreting data or using the information provided."
      ]
    },
    {
      num: 8,
      title: "Intellectual Property Rights",
      content: [
        "All intellectual property rights, including text, design, software, graphics, and analytical tools, are the exclusive property of Falcon Forecast.",
        "You may not reproduce, modify, or redistribute any material from the website without prior written consent.",
        "Unauthorized use of any content or system may result in legal action under the Copyright Acts and other applicable laws."
      ]
    },
    {
      num: 9,
      title: "Third-Party Content and Links",
      content: [
        "The website may include links or references to external sources or partner for additional sports data or functionality.",
        "These are provided for user convenience only. Falcon Forecast does not control or endorse external content and assumes no responsibility for any damages resulting from their use."
      ]
    },
    {
      num: 10,
      title: "Privacy and Data Protection",
      content: [
        "User data is collected and processed in accordance with the Falcon Forecast Privacy Policy, which forms an integral part of these Terms.",
        "By using the website, you consent to the collection and use of your data as outlined in that policy."
      ]
    },
    {
      num: 11,
      title: "Limitation of Liability",
      content: [
        "Falcon Forecast, its administrators, or affiliates shall not be held liable for:",
        "• Any direct or indirect damages arising from website use",
        "• Financial loss resulting from interpretation or misuse of predictions",
        "• Data interruption, downtime, or system failures",
        "• Loss of profit, data, or goodwill",
        "Users assume full responsibility for decisions made based on content or information obtained through the platform."
      ]
    },
    {
      num: 12,
      title: "Indemnification",
      content: [
        "By using Falcon Forecast, you agree to indemnify and hold harmless the platform and its representatives from any claims, damages, or liabilities arising from:",
        "• Violation of these Terms",
        "• Misuse of the website or data",
        "• Breach of applicable laws or third-party rights"
      ]
    },
    {
      num: 13,
      title: "Termination of Access",
      content: [
        "Falcon Forecast reserves the right to suspend, restrict, or permanently terminate user access if:",
        "• Misuse or breach of terms is detected",
        "• Fraudulent or unauthorized activity occurs",
        "• Legal or technical issues require immediate action",
        "Termination does not affect accrued rights or obligations prior to the termination date."
      ]
    },
    {
      num: 14,
      title: "Modifications and Updates",
      content: [
        "These Terms may be updated or modified periodically.",
        "Any significant changes will be reflected on this page, and continued use of the platform after such updates constitutes acceptance of the revised Terms."
      ]
    },
    {
      num: 15,
      title: "Governing Law and Jurisdiction",
      content: [
        "These Terms shall be governed by and interpreted in accordance with generally accepted international laws and principles.",
        "Any disputes, claims, or proceedings arising out of or in connection with the use of this website shall be resolved under the exclusive jurisdiction of competent international legal frameworks and authorities."
      ]
    },
    {
      num: 16,
      title: "Contact Information",
      content: [
        "For legal or policy-related inquiries, users may reach out through the official contact form on the Falcon Forecast website, and the website email."
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Hero Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
          <Scale className="w-4 h-4" />
          Legal Terms of Service
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Please review the binding agreement governing your access, interaction, and use of all services and features available on Falcon Forecast (FalconForecast.com).
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border text-xs font-semibold"
             style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--brand)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Restricted to individuals aged 18 years and above (18+)
        </div>
      </section>

      {/* Sections List */}
      <div className="space-y-6">
        {termsSections.map((sec) => (
          <section
            key={sec.num}
            id={`term-sec-${sec.num}`}
            className="p-6 sm:p-8 rounded-3xl border space-y-4 transition-all hover:border-sky-500/30"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(56,189,248,0.12)', color: 'var(--brand)' }}>
                {sec.num}
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                {sec.title}
              </h2>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {sec.content.map((paragraph, pIdx) => (
                <p key={pIdx} className={paragraph.startsWith('•') ? 'pl-3 text-xs text-sky-200/90 font-medium' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

    </div>
  );
};
