// Every real payment on this site (M-Pesa via Kentapay) is charged and paid out in Kenyan
// Shillings — that's a hard constraint of M-Pesa itself, not a choice this app makes. So the
// currency switcher is display-only: KSh stays the real, actual amount everywhere money
// actually changes hands; this just adds an approximate converted line ("≈ $11.60") for
// visitors who think in a different currency. Never used to compute what Kentapay is told to
// charge — see api/kentapay/collect.js and withdraw.js, which only ever deal in raw KES.

export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

// A curated, common-sense set rather than all ~160 ISO codes the rates endpoint returns —
// covers the currencies a visitor from a supported region is actually likely to want.
export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { code: 'TZS', label: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', label: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

// Maps a visitor's detected country to the currency they'd actually expect to think in —
// deliberately small; anything not listed here falls back to USD, which is also this
// feature's explicit default per the original request.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  KE: 'KES', TZ: 'TZS', UG: 'UGX', NG: 'NGN', GH: 'GHS', ZA: 'ZAR',
  GB: 'GBP', IN: 'INR', CA: 'CAD', AU: 'AUD', US: 'USD',
  // Eurozone
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR',
};

const RATES_CACHE_KEY = 'falconforecast_currency_rates_v1';
const RATES_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // exchange rates don't need to be fresher than daily for an approximate display line
const CURRENCY_PREF_KEY = 'falconforecast_display_currency';

/** KES-based exchange rates, cached in localStorage for a day so this doesn't hit the rates
 * API on every page load. Falls back to a small hardcoded table (clearly stale-tolerant,
 * since this is only ever an approximate display) if the fetch fails or localStorage is
 * unavailable — never lets a network hiccup break the page. */
export async function fetchRates(): Promise<Record<string, number>> {
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.rates && Date.now() - parsed.fetchedAt < RATES_CACHE_TTL_MS) {
        return parsed.rates;
      }
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — just refetch below.
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/KES');
    const data = await res.json();
    if (data?.result === 'success' && data.rates) {
      try {
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: data.rates, fetchedAt: Date.now() }));
      } catch {
        // Non-fatal — just means we refetch next load instead of using the cache.
      }
      return data.rates;
    }
  } catch {
    // Network/API failure — fall through to the static fallback below.
  }

  // Rough fallback rates (KES base) — only reached if the live fetch fails entirely. Approximate
  // and will drift over time, but this whole feature is explicitly "approximate" already.
  return {
    KES: 1, USD: 0.0077, GBP: 0.0058, EUR: 0.0067, NGN: 10.3, TZS: 20.1,
    UGX: 28.4, ZAR: 0.14, GHS: 0.115, INR: 0.68, CAD: 0.0107, AUD: 0.0118,
  };
}

/** Best-effort visitor country detection via a free, keyless IP-geolocation lookup — no
 * permission prompt, unlike browser geolocation, and more accurate than guessing from
 * navigator.language (which reflects OS/browser language settings, not location). Returns
 * null on any failure so the caller can fall back to the USD default. */
export async function detectCountryCurrency(): Promise<string | null> {
  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data?.success && data.country_code) {
      return COUNTRY_TO_CURRENCY[data.country_code] || null;
    }
  } catch {
    // Network failure, blocked request, etc. — caller falls back to USD.
  }
  return null;
}

export function getStoredCurrencyPreference(): string | null {
  try {
    return localStorage.getItem(CURRENCY_PREF_KEY);
  } catch {
    return null;
  }
}

export function storeCurrencyPreference(code: string): void {
  try {
    localStorage.setItem(CURRENCY_PREF_KEY, code);
  } catch {
    // Non-fatal — just won't be remembered on next visit.
  }
}

/** Converts a real KES amount into the display currency and formats it as "≈ $11.60" —
 * returns null when there's nothing meaningful to show (display currency IS KES, so the
 * primary KSh figure already says everything, or rates aren't loaded yet). */
export function formatConverted(kesAmount: number, currency: string, rates: Record<string, number> | null): string | null {
  if (currency === 'KES' || !rates || !rates[currency]) return null;
  const converted = kesAmount * rates[currency];
  const option = CURRENCY_OPTIONS.find(c => c.code === currency);
  const symbol = option?.symbol || currency;
  // Small amounts (most subscription tiers) read better with 2 decimals; anything sizeable
  // (e.g. a converted VIP annual plan, or a tipster's withdrawal balance) rounds to whole units.
  const formatted = converted < 100 ? converted.toFixed(2) : Math.round(converted).toLocaleString();
  return `≈ ${symbol}${formatted}`;
}
