import React from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Clock, Mail, CheckCircle2, FileText, Lock } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  const chargebackEvidence = [
    "Transaction records and payment authorization",
    "Customer account information",
    "Login history, IP address, and device information",
    "Subscription activation records",
    "Service usage logs",
    "Communications between the customer and our support team",
    "Acceptance of our Terms of Service and Refund Policy during checkout"
  ];

  const abusiveCriteria = [
    "Received or accessed the purchased service",
    "Failed to request assistance or a refund before disputing the payment",
    "Files multiple unjustified disputes",
    "Knowingly submits false or misleading information to the issuing bank"
  ];

  const merchantRights = [
    "Challenge chargebacks that are unsupported or fraudulent",
    "Recover any unpaid fees resulting from a reversed payment where legally permitted",
    "Restrict future card payments from accounts with repeated abusive chargeback activity"
  ];

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
             style={{ borderColor: 'var(--brand)', color: 'var(--brand)', backgroundColor: 'rgba(56,189,248,0.08)' }}>
          <CreditCard className="w-4 h-4" />
          Billing & Payment Terms
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Refund & Chargeback Policy
        </h1>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          At <span className="font-bold text-sky-400">FalconForecast.com</span>, we are committed to providing a transparent and fair payment experience. Customers are encouraged to contact our support team directly before initiating a chargeback with their card issuer.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-semibold"
             style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Billing issues? Please contact support within <strong>14 days</strong> of the transaction.</span>
        </div>
      </section>

      {/* Policy Sections */}
      <div className="space-y-8">
        
        {/* Section 1 & 2: Contact Before Filing & Refunds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                1. Contact Before Filing a Chargeback
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you believe a payment was made in error or you have experienced a billing issue, please contact our Customer Support within <strong>14 days</strong> of the transaction. We will make every reasonable effort to investigate and resolve the matter promptly.
            </p>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                2. Refunds Process
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Eligible refunds are processed in accordance with our Refund Policy. Where a refund is approved, it will be credited back to the original payment method. Once a refund has been processed, customers should not initiate a chargeback for the same transaction.
            </p>
          </section>
        </div>

        {/* Section 3: Chargeback Investigation */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--brand)' }}>
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              3. Chargeback Investigation
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            When a chargeback is initiated, FalconForecast.com reserves the right to contest invalid or fraudulent disputes by providing the payment processor or issuing bank with supporting evidence, including but not limited to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {chargebackEvidence.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border text-xs"
                   style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-sky-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed italic pt-2" style={{ color: 'var(--text-muted)' }}>
            Merchants typically respond to chargebacks by submitting evidence relevant to the dispute reason code within the deadlines set by the card network or payment processor.
          </p>
        </section>

        {/* Section 4 & 5: Fraudulent Chargebacks & Account Suspension */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                4. Fraudulent or Abusive Chargebacks
              </h2>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A chargeback may be considered abusive where a customer:
            </p>
            <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
              {abusiveCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed pt-2" style={{ color: 'var(--text-muted)' }}>
              Where permitted by law, FalconForecast.com may suspend or terminate access to services while the dispute is under investigation.
            </p>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                5. Account Suspension
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              During an active chargeback investigation, access to premium services, subscriptions, or digital content associated with the disputed payment may be suspended until the matter is resolved.
            </p>
          </section>
        </div>

        {/* Section 6 & 7: Merchant Rights & Resolution Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              6. Merchant Rights
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              FalconForecast.com reserves the right to:
            </p>
            <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
              {merchantRights.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="p-6 rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              7. Resolution Time
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Chargeback investigations are handled by the customer's card issuer and payment processor. Resolution timelines vary and may take several weeks or months depending on the card network and issuing bank.
            </p>
          </section>
        </div>

        {/* Section 8: Customer Support Contact */}
        <section className="p-6 sm:p-8 rounded-3xl border space-y-4 text-center"
                 style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--brand)' }}>
          <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            8. Need Help with a Payment?
          </h2>
          <p className="text-xs sm:text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Customers seeking assistance with billing or payment concerns should contact our support team before initiating a chargeback. Most billing issues can be resolved more quickly through direct communication than through the formal chargeback process.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="mailto:info@FalconForecast.com"
              className="px-5 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-sky-500/10 flex items-center gap-2"
              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
            >
              <Mail className="w-4 h-4" />
              info@FalconForecast.com
            </a>
            <a
              href="mailto:Falcon Forecast@gmail.com"
              className="px-5 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-sky-500/10 flex items-center gap-2"
              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
            >
              <Mail className="w-4 h-4" />
              Falcon Forecast@gmail.com
            </a>
          </div>
        </section>

      </div>

    </div>
  );
};
