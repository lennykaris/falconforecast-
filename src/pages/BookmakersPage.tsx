import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';

const bookmakers = [
  { name: 'Betika', url: 'https://www.betika.com/' },
  { name: 'SportPesa', url: 'https://ke.sportpesa.com/' },
  { name: 'Odibets', url: 'https://odibets.com/' },
];

export const BookmakersPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const visibleBookmakers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return bookmakers.filter(bookmaker => bookmaker.name.toLowerCase().includes(search));
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0b1320] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400">Kenya</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Betting Sites</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Visit sportsbook websites directly. Falcon Forecast does not take bets or manage these accounts.
            </p>
          </div>
          <label className="relative w-full sm:max-w-xs">
            <span className="sr-only">Search betting sites</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search betting sites"
              className="min-h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-[#111c30] dark:text-white"
            />
          </label>
        </header>

        {visibleBookmakers.length > 0 ? (
          <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#111c30]">
            {visibleBookmakers.map(bookmaker => (
              <li key={bookmaker.name} className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {bookmaker.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{bookmaker.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">External sportsbook</p>
                  </div>
                </div>
                <a
                  href={bookmaker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-sky-500 hover:text-sky-700 dark:border-slate-700 dark:text-slate-200 dark:hover:text-sky-300"
                >
                  Visit site <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-y border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-[#111c30] dark:text-slate-400">
            No betting sites match that search.
          </p>
        )}

        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          18+ only. Check local laws, eligibility, licensing, and each operator&apos;s terms before using an external site. Gamble responsibly.
        </p>
      </main>
    </div>
  );
};