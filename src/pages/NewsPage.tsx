import React, { useState, useEffect } from 'react';
import { Globe, Newspaper, Search, ExternalLink, Tag, Clock, Plus, Pencil, Trash2, X, Upload, Share2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  source: string;
  region: 'kenya' | 'world';
  category: string;
  thumbnail?: string;
  content?: string;
  imagePath?: string;
  externalUrl?: string;
  isEditorial?: boolean;
  published?: boolean;
}

const mapEditorialArticle = (row: Record<string, any>): NewsArticle => ({
  id: row.id,
  title: row.title,
  description: row.summary || row.content.slice(0, 180),
  pubDate: row.published_at || row.created_at,
  source: row.source || 'Falcon Forecast',
  region: row.region,
  category: row.category,
  thumbnail: row.image_url || undefined,
  content: row.content,
  imagePath: row.image_path || undefined,
  externalUrl: row.external_url || undefined,
  isEditorial: true,
  published: row.published,
});

export const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManageNews = user?.role === 'admin' || user?.canManageNews === true;
  const [editorialArticles, setEditorialArticles] = useState<NewsArticle[]>([]);
  const [editorialError, setEditorialError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'kenya' | 'world'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleCategory, setArticleCategory] = useState('');
  const [articleRegion, setArticleRegion] = useState<'kenya' | 'world'>('kenya');
  const [articleSource, setArticleSource] = useState('Falcon Forecast');
  const [articleExternalUrl, setArticleExternalUrl] = useState('');
  const [articlePublished, setArticlePublished] = useState(true);
  const [articleImage, setArticleImage] = useState<File | null>(null);
  const [savingArticle, setSavingArticle] = useState(false);

  const loadEditorialArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEditorialError(null);
      setEditorialArticles((data || []).map(mapEditorialArticle));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load articles.';
      console.error('Failed to load editorial articles:', error);
      setEditorialError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditorialArticles();
  }, [canManageNews]);

  useEffect(() => {
    const articleId = searchParams.get('article');
    const article = editorialArticles.find(item => item.id === articleId);
    if (article) setReadingArticle(article);
  }, [editorialArticles, searchParams]);

  const resetArticleForm = () => {
    setEditingArticle(null);
    setArticleTitle('');
    setArticleSummary('');
    setArticleContent('');
    setArticleCategory('');
    setArticleRegion('kenya');
    setArticleSource('Falcon Forecast');
    setArticleExternalUrl('');
    setArticlePublished(true);
    setArticleImage(null);
  };

  const startEditingArticle = (article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article);
      setArticleTitle(article.title);
      setArticleSummary(article.description);
      setArticleContent(article.content || '');
      setArticleCategory(article.category);
      setArticleRegion(article.region);
      setArticleSource(article.source);
      setArticleExternalUrl(article.externalUrl || '');
      setArticlePublished(article.published === true);
      setArticleImage(null);
    } else {
      resetArticleForm();
    }
    setEditorOpen(true);
  };

  const handleSaveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !canManageNews) return;
    if (!articleTitle.trim() || !articleContent.trim()) {
      setEditorialError('Article title and full information are required.');
      return;
    }
    if (articleImage && (!articleImage.type.startsWith('image/') || articleImage.size > 5 * 1024 * 1024)) {
      setEditorialError('Choose an image file smaller than 5 MB.');
      return;
    }

    setSavingArticle(true);
    setEditorialError(null);
    let uploadedPath: string | undefined;
    try {
      let imageUrl = editingArticle?.thumbnail || null;
      let imagePath = editingArticle?.imagePath || null;
      if (articleImage) {
        const safeName = articleImage.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        uploadedPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(uploadedPath, articleImage, { contentType: articleImage.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('news-images').getPublicUrl(uploadedPath);
        imageUrl = data.publicUrl;
        imagePath = uploadedPath;
      }

      const payload = {
        title: articleTitle.trim(),
        summary: articleSummary.trim(),
        content: articleContent.trim(),
        category: articleCategory.trim() || 'General',
        region: articleRegion,
        source: articleSource.trim() || 'Falcon Forecast',
        external_url: articleExternalUrl.trim() || null,
        image_url: imageUrl,
        image_path: imagePath,
        author_id: user.id,
        published: articlePublished,
        published_at: articlePublished
          ? editingArticle?.published ? editingArticle.pubDate : new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };
      const { error: saveError } = editingArticle
        ? await supabase.from('news_articles').update(payload).eq('id', editingArticle.id).select('id').single()
        : await supabase.from('news_articles').insert(payload).select('id').single();
      if (saveError) throw saveError;

      let cleanupWarning: string | null = null;
      if (uploadedPath && editingArticle?.imagePath && editingArticle.imagePath !== uploadedPath) {
        const { error: removeError } = await supabase.storage.from('news-images').remove([editingArticle.imagePath]);
        if (removeError) cleanupWarning = `Article saved, but its previous image could not be removed: ${removeError.message}`;
      }
      await loadEditorialArticles();
      resetArticleForm();
      setEditorOpen(false);
      if (cleanupWarning) setEditorialError(cleanupWarning);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save the article.';
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from('news-images').remove([uploadedPath]);
        setEditorialError(cleanupError
          ? `${message} Uploaded image cleanup also failed: ${cleanupError.message}`
          : message);
      } else {
        setEditorialError(message);
      }
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (article: NewsArticle) => {
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    setEditorialError(null);
    const { error } = await supabase.from('news_articles').delete().eq('id', article.id);
    if (error) {
      setEditorialError(error.message);
      return;
    }
    setEditorialArticles(current => current.filter(item => item.id !== article.id));
    if (article.imagePath) {
      const { error: imageError } = await supabase.storage.from('news-images').remove([article.imagePath]);
      if (imageError) setEditorialError(`Article deleted, but its image could not be removed: ${imageError.message}`);
    }
  };

  const handleShareArticle = async (article: NewsArticle) => {
    const url = new URL('/news', window.location.origin);
    url.searchParams.set('article', article.id);
    setShareMessage(null);
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.description, url: url.toString() });
      } else {
        await navigator.clipboard.writeText(url.toString());
        setShareMessage('Article link copied. Share it on your social channels.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareMessage(error instanceof Error ? `Could not share article: ${error.message}` : 'Could not share article.');
    }
  };

  const closeReadingArticle = () => {
    setReadingArticle(null);
    if (searchParams.has('article')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('article');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const allArticles = editorialArticles;
  const filteredArticles = allArticles.filter(art => {
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
              Falcon Forecast Editorial
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display italic tracking-tight">
              Sports News World & Kenya
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Original sports news and analysis, written and published by our editorial team.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canManageNews && (
              <button
                onClick={() => startEditingArticle()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Write Article</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {editorialError && (
        <p role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {editorialError}
        </p>
      )}

      {editorOpen && canManageNews && (
        <form onSubmit={handleSaveArticle} className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111c30] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingArticle ? 'Edit article' : 'Write a news article'}
            </h2>
            <button type="button" onClick={() => { setEditorOpen(false); resetArticleForm(); }} aria-label="Close editor" className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
              Headline
              <input required maxLength={180} value={articleTitle} onChange={e => setArticleTitle(e.target.value)} className="mt-1 w-full input-field text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
              Short summary
              <textarea rows={2} maxLength={500} value={articleSummary} onChange={e => setArticleSummary(e.target.value)} className="mt-1 w-full input-field text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
              Article information
              <textarea required rows={7} value={articleContent} onChange={e => setArticleContent(e.target.value)} className="mt-1 w-full input-field text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Category
              <input value={articleCategory} onChange={e => setArticleCategory(e.target.value)} placeholder="e.g. Premier League" className="mt-1 w-full input-field text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Region
              <select value={articleRegion} onChange={e => setArticleRegion(e.target.value as 'kenya' | 'world')} className="mt-1 w-full input-field text-xs">
                <option value="kenya">Kenya</option>
                <option value="world">Worldwide</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Source / author
              <input value={articleSource} onChange={e => setArticleSource(e.target.value)} className="mt-1 w-full input-field text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Optional reference/source link
              <input type="url" value={articleExternalUrl} onChange={e => setArticleExternalUrl(e.target.value)} placeholder="https://" className="mt-1 w-full input-field text-xs" />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">
              Article photo (up to 5 MB)
              <span className="mt-1 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={e => setArticleImage(e.target.files?.[0] || null)} className="w-full text-xs" />
              </span>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={articlePublished} onChange={e => setArticlePublished(e.target.checked)} className="accent-[#00a8ff]" />
              Publish now
            </label>
            <button disabled={savingArticle} className="px-5 py-2.5 bg-[#00a8ff] text-white text-xs font-bold rounded-xl disabled:opacity-50">
              {savingArticle ? 'Saving...' : editingArticle ? 'Save changes' : 'Save article'}
            </button>
          </div>
        </form>
      )}

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
                  {art.isEditorial && !art.published && (
                    <span className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold">DRAFT</span>
                  )}
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
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex gap-2">
              <button
                onClick={() => setReadingArticle(art)}
                className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-[#00a8ff] hover:text-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                Read Full Story
              </button>
              {art.published && (
                <button
                  onClick={() => handleShareArticle(art)}
                  title="Share article link"
                  aria-label={`Share ${art.title}`}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              {canManageNews && (
                <>
                  <button onClick={() => startEditingArticle(art)} title="Edit article" aria-label="Edit article" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteArticle(art)} title="Delete article" aria-label="Delete article" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {shareMessage && (
        <p role="status" className="text-center text-xs text-slate-500 dark:text-slate-400">{shareMessage}</p>
      )}
      {filteredArticles.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">
          {loading ? 'Loading articles...' : 'No news articles match your filters.'}
        </p>
      )}

      {readingArticle && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center" onClick={closeReadingArticle}>
          <article className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111c30] rounded-2xl shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex justify-end p-3">
              <button onClick={closeReadingArticle} aria-label="Close article" className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {readingArticle.thumbnail && <img src={readingArticle.thumbnail} alt="" className="w-full max-h-80 object-cover" />}
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-[#00a8ff]">{readingArticle.category} · {readingArticle.source}</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{readingArticle.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{readingArticle.content}</p>
              {readingArticle.externalUrl && <a href={readingArticle.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#00a8ff]">Source <ExternalLink className="w-4 h-4" /></a>}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
