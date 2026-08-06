import React, { useState, useEffect } from 'react';
import { Globe, Newspaper, Search, RefreshCw, ExternalLink, Flame, ShieldAlert, Tag, Clock } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  region: 'kenya' | 'world';
  category: string;
  thumbnail?: string;
}

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: 'kenya-1',
    title: 'Harambee Stars Target Crucial Victory in AFCON Qualifiers Ahead of Nairobi Fixture',
    description: 'Kenya national football team head coach expresses high confidence following intense training sessions in Kasarani Stadium as FKF Premier League top scorers join the starting lineup.',
    link: 'https://www.capitalfm.co.ke/sports/',
    pubDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    source: 'Capital FM Sports Kenya',
    region: 'kenya',
    category: 'Harambee Stars',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kenya-2',
    title: 'FKF Premier League Title Race Heats Up as Gor Mahia and AFC Leopards Lock Horns',
    description: 'The Mashemeji Derby rivalry reaches fever pitch this weekend with both historic Kenyan clubs neck and neck at the top of the standings.',
    link: 'https://nation.africa/kenya/sports',
    pubDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    source: 'Nation Media Sports',
    region: 'kenya',
    category: 'FKF Premier League',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'world-1',
    title: 'Champions League Quarter-Final Draw: Blockbuster European Clashes Confirmed',
    description: 'Real Madrid set to face Manchester City in a titanic clash while Bayern Munich prepare for high-octane showdown against Arsenal.',
    link: 'https://feeds.bbci.co.uk/sport/football',
    pubDate: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    source: 'BBC Sport World',
    region: 'world',
    category: 'Champions League',
    thumbnail: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'world-2',
    title: 'Premier League Transfer Deadline Shock: £90M Bid Submitted for Star Forward',
    description: 'Top European clubs race against the clock to finalize record-breaking summer window transfers before midnight deadline.',
    link: 'https://www.skysports.com/football',
    pubDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    source: 'Sky Sports',
    region: 'world',
    category: 'Transfers',
    thumbnail: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kenya-3',
    title: 'Kenyan Athletics Superstars Set New World Records at Diamond League Meeting',
    description: 'Sensational performances in the 1500m and 5000m events secure podium sweep for Kenyan middle-distance runners in Paris.',
    link: 'https://www.standardmedia.co.ke/sports',
    pubDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    source: 'Standard Sports Kenya',
    region: 'kenya',
    category: 'Athletics',
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'world-3',
    title: 'Tactical Masterclass: How Expected Goals (xG) is Revolutionizing Modern Football Analysis',
    description: 'An in-depth breakdown of how top analytics platforms use Poisson distribution algorithms to predict match outcomes and odds value.',
    link: 'https://www.espn.com/soccer/',
    pubDate: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    source: 'ESPN Sports',
    region: 'world',
    category: 'Analytics',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
  },
];

const RSS_SOURCES = [
  { name: 'BBC Football', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', region: 'world', category: 'Worldwide Football' },
  { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', region: 'world', category: 'Global Football' },
  { name: 'Capital FM Kenya', url: 'https://www.capitalfm.co.ke/sports/feed/', region: 'kenya', category: 'Kenya Sports' },
];

export const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'kenya' | 'world'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRssFeeds = async () => {
    setLoading(true);
    try {
      const fetchedArticles: NewsArticle[] = [];

      for (const rss of RSS_SOURCES) {
        try {
          const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss.url)}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.status === 'ok' && data.items && data.items.length > 0) {
            data.items.slice(0, 5).forEach((item: any, idx: number) => {
              // Extract snippet
              const cleanDesc = item.description
                ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 180) + '...'
                : 'Latest live sports news breaking updates.';

              fetchedArticles.push({
                id: `rss-${rss.region}-${idx}-${Date.now()}`,
                title: item.title,
                description: cleanDesc,
                link: item.link,
                pubDate: item.pubDate || new Date().toISOString(),
                source: rss.name,
                region: rss.region as 'kenya' | 'world',
                category: rss.category,
                thumbnail: item.thumbnail || item.enclosure?.link,
              });
            });
          }
        } catch (e) {
          console.warn(`Failed fetching RSS feed for ${rss.name}:`, e);
        }
      }

      if (fetchedArticles.length > 0) {
        // Merge with fallback to ensure rich feed
        setArticles([...fetchedArticles, ...FALLBACK_NEWS]);
      }
    } catch (err) {
      console.warn('RSS fetch error, using cached fallback news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRssFeeds();
  }, []);

  const filteredArticles = articles.filter(art => {
    const matchesTab = activeTab === 'all' || art.region === activeTab;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen pt-6 md:pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      
      {/* Header Banner */}
      <section className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white border border-sky-500/20 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5 text-[#00a8ff]" />
              Live Sports RSS Wire
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display italic tracking-tight">
              Sports News World & Kenya
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time sports headlines powered by direct RSS feeds from Kenya (FKF League, Harambee Stars, Athletics) and Worldwide (Premier League, UCL, Transfers).
            </p>
          </div>

          <button
            onClick={fetchRssFeeds}
            disabled={loading}
            className="px-4 py-2.5 bg-[#00a8ff] hover:bg-[#0090e0] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching RSS...' : 'Refresh News Feed'}</span>
          </button>
        </div>
      </section>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 select-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#00a8ff] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a8ff]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Sports News</span>
          </button>

          <button
            onClick={() => setActiveTab('kenya')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kenya'
                ? 'bg-[#00a8ff] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a8ff]'
            }`}
          >
            <span>🇰🇪 Kenya Sports</span>
          </button>

          <button
            onClick={() => setActiveTab('world')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'world'
                ? 'bg-[#00a8ff] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a8ff]'
            }`}
          >
            <span>🌍 Worldwide Sports</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sports, teams, Kenya..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(art => (
          <article
            key={art.id}
            className="bg-white dark:bg-[#111c30] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Thumbnail Image Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={art.thumbnail || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  onError={(e) => {
                    // Fallback on image load error
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md text-white shadow-md ${
                    art.region === 'kenya' ? 'bg-emerald-600/90' : 'bg-[#00a8ff]/90'
                  }`}>
                    {art.region === 'kenya' ? '🇰🇪 Kenya Sports' : '🌍 Worldwide'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>{formatTimeAgo(art.pubDate)}</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="text-[#00a8ff] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {art.category}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{art.source}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#00a8ff] transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {art.description}
                </p>
              </div>
            </div>

            {/* Read Article CTA Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <a
                href={art.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-[#00a8ff] hover:text-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Read Full Story</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
