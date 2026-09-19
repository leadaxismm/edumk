import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, X, Clock, TrendingUp, BookOpen, Star, Eye, Download,
  Bookmark, Filter, ChevronLeft, Loader2, ArrowLeft, ExternalLink,
  FileText, Video, BookMarked, Shield, Microscope, Zap, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────
interface LibraryCategory {
  id: string; name_ar: string; name_en: string;
  icon: string; color: string; order_index: number;
  description_ar?: string; is_active: boolean;
}
interface LibraryItem {
  id: string; title_ar: string; title_en?: string;
  description_ar?: string; description_en?: string;
  content_type: string; category_id?: string;
  authors?: string[]; year?: number; journal?: string;
  file_url?: string; video_url?: string; thumbnail_url?: string;
  keywords_ar?: string[]; keywords_en?: string[];
  view_count: number; download_count: number; bookmark_count: number;
  rating?: number; rating_count: number;
  is_featured: boolean; is_published: boolean; language?: string;
  difficulty_level?: string; relevance_score?: number;
  category?: { name_ar: string; name_en: string; icon: string; color: string };
  created_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CONTENT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  protocol:      { label: 'بروتوكول',         icon: '📋', color: 'bg-blue-100 text-blue-700' },
  guideline:     { label: 'إرشادات',          icon: '📘', color: 'bg-teal-100 text-teal-700' },
  research_paper:{ label: 'بحث علمي',         icon: '🔬', color: 'bg-purple-100 text-purple-700' },
  book:          { label: 'كتاب',             icon: '📕', color: 'bg-red-100 text-red-700' },
  video:         { label: 'فيديو',            icon: '🎥', color: 'bg-orange-100 text-orange-700' },
  presentation:  { label: 'عرض تقديمي',       icon: '📊', color: 'bg-yellow-100 text-yellow-700' },
  article:       { label: 'مقالة',            icon: '📰', color: 'bg-green-100 text-green-700' },
  reference:     { label: 'مرجع',             icon: '📚', color: 'bg-indigo-100 text-indigo-700' },
  case_study:    { label: 'حالة دراسية',      icon: '🩺', color: 'bg-pink-100 text-pink-700' },
  webinar:       { label: 'ندوة إلكترونية',   icon: '💻', color: 'bg-cyan-100 text-cyan-700' },
};

// ─── Highlight helper ─────────────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return <>{parts.map((p, i) => p.toLowerCase() === query.toLowerCase()
    ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{p}</mark>
    : p)}</>;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="flex-1"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>
      </div>
      <div className="h-3 bg-muted rounded w-full mb-2" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function LibraryCard({ item, query, onBookmark, bookmarked }: {
  item: LibraryItem; query: string; onBookmark?: (id: string) => void; bookmarked?: boolean;
}) {
  const navigate = useNavigate();
  const ct = CONTENT_TYPES[item.content_type] || { label: item.content_type, icon: '📄', color: 'bg-gray-100 text-gray-700' };

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => navigate(`/library/item/${item.id}`)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${ct.color}`}>
            {ct.icon}
          </div>
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <Badge className={`text-[10px] border-0 ${ct.color}`}>{ct.label}</Badge>
              {item.category && (
                <Badge variant="outline" className="text-[10px]">
                  {item.category.icon} {item.category.name_ar}
                </Badge>
              )}
              {item.language && item.language !== 'ar' && (
                <Badge variant="outline" className="text-[10px]">
                  {item.language === 'en' ? '🇬🇧 EN' : '🌐 AR+EN'}
                </Badge>
              )}
              {item.is_featured && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0">⭐ مميز</Badge>}
            </div>
            {/* Title */}
            <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
              <Highlight text={item.title_ar} query={query} />
            </h3>
            {item.title_en && (
              <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{item.title_en}</p>
            )}
            {/* Description */}
            {item.description_ar && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                <Highlight text={item.description_ar} query={query} />
              </p>
            )}
            {/* Meta */}
            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
              {item.authors?.length ? (
                <span className="flex items-center gap-1">
                  <span>👤</span>{item.authors.slice(0,2).join('، ')}{item.authors.length > 2 ? ' ...' : ''}
                </span>
              ) : null}
              {item.year && <span>📅 {item.year}</span>}
              {item.journal && <span className="hidden sm:inline truncate max-w-32">📰 {item.journal}</span>}
            </div>
            {/* Stats + Actions */}
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {item.rating != null && <span>⭐ {Number(item.rating).toFixed(1)} ({item.rating_count})</span>}
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.view_count}</span>
                <span className="flex items-center gap-1"><Download className="w-3 h-3" />{item.download_count}</span>
              </div>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                {item.file_url && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2"
                    onClick={() => window.open(item.file_url, '_blank')}>
                    <Download className="w-3 h-3" />تحميل
                  </Button>
                )}
                <Button size="sm" variant={bookmarked ? 'default' : 'outline'}
                  className={`h-7 w-7 p-0 ${bookmarked ? 'bg-primary text-white' : ''}`}
                  onClick={() => onBookmark?.(item.id)}>
                  <Bookmark className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { supabaseUser, isAuthenticated } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<{ suggestion: string; count: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trending, setTrending] = useState<{ query: string; count: number }[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [featured, setFeatured] = useState<LibraryItem[]>([]);
  const [latest, setLatest] = useState<LibraryItem[]>([]);
  const [popular, setPopular] = useState<LibraryItem[]>([]);
  const [searchResults, setSearchResults] = useState<LibraryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});

  useEffect(() => { loadPage(); }, []);
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('edumk_search_history') || '[]');
    setSearchHistory(h.slice(0, 5));
  }, []);

  const loadPage = async () => {
    setLoading(true);
    try {
      let trendData: {query:string;count:number}[] = [];
      try {
        const trendRes = await supabase.rpc('get_trending_searches', { days_back: 30, results_limit: 8 });
        if (trendRes.data) trendData = trendRes.data as {query:string;count:number}[];
      } catch { /* ignore */ }
      setTrending(trendData);
      const [{ data: cats }, { data: items }] = await Promise.all([
        supabase.from('library_categories').select('*').eq('is_active', true).order('order_index'),
        supabase.from('medical_library').select('*, category:library_categories(name_ar,name_en,icon,color)').eq('is_published', true).order('created_at', { ascending: false }).limit(50),
      ]);
      if (cats) setCategories(cats as LibraryCategory[]);
      if (items) {
        const all = items as LibraryItem[];
        setFeatured(all.filter(i => i.is_featured));
        setLatest(all.slice(0, 6));
        setPopular([...all].sort((a, b) => b.view_count - a.view_count).slice(0, 6));
        // Category counts
        const counts: Record<string, number> = {};
        all.forEach(i => { if (i.category_id) counts[i.category_id] = (counts[i.category_id] || 0) + 1; });
        setCatCounts(counts);
      }
      // Load bookmarks
      if (supabaseUser) {
        const { data: bk } = await supabase.from('library_bookmarks').select('library_item_id').eq('user_id', supabaseUser.id);
        if (bk) setBookmarks(new Set(bk.map((b: { library_item_id: string }) => b.library_item_id)));
      }
    } finally { setLoading(false); }
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await supabase.rpc('search_medical_library', {
        search_query: q, results_limit: 20, results_offset: 0,
        filter_category_id: null, filter_content_type: null,
        filter_language: null, filter_year_from: null, filter_year_to: null,
      });
      const results = (data || []) as LibraryItem[];
      setSearchResults(results);
      // Save to history
      if (q.trim()) {
        const h = [q, ...searchHistory.filter(s => s !== q)].slice(0, 5);
        setSearchHistory(h);
        localStorage.setItem('edumk_search_history', JSON.stringify(h));
      }
      // Save to Supabase search_history
      if (supabaseUser) {
        supabase.from('search_history').insert({
          user_id: supabaseUser.id, search_query: q, results_count: results.length,
        }).then(() => {});
      }
    } finally { setSearching(false); }
  }, [supabaseUser, searchHistory]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    try {
      const { data } = await supabase.rpc('search_suggestions', { search_query: q, results_limit: 7 });
      setSuggestions(data || []);
    } catch { setSuggestions([]); }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
      if (val.trim().length >= 2) doSearch(val);
      else setSearchResults([]);
    }, 300);
  };

  const handleSearchSubmit = (q: string) => {
    if (!q.trim()) return;
    setShowSuggestions(false);
    doSearch(q);
    navigate(`/library/search?q=${encodeURIComponent(q)}`);
  };

  const toggleBookmark = async (itemId: string) => {
    if (!supabaseUser) { navigate('/login'); return; }
    const has = bookmarks.has(itemId);
    setBookmarks(prev => { const s = new Set(prev); has ? s.delete(itemId) : s.add(itemId); return s; });
    if (has) {
      await supabase.from('library_bookmarks').delete().eq('user_id', supabaseUser.id).eq('library_item_id', itemId);
    } else {
      await supabase.from('library_bookmarks').insert({ user_id: supabaseUser.id, library_item_id: itemId });
    }
  };

  const isSearching = query.trim().length >= 2;

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">

        {/* ── Hero Search Bar ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-bl from-[oklch(0.22_0.08_220)] via-primary to-teal-600 text-white py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/edumk-logo.svg" className="w-10 h-10" alt="EduMK" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">المكتبة الطبية</h1>
                <p className="text-teal-200 text-xs sm:text-sm">Medical Library — مستشفى الولادة والأطفال</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6 max-w-lg mx-auto">
              بحث ذكي في {5}+ مراجع طبية، بروتوكولات، إرشادات، وأبحاث علمية
            </p>

            {/* Search box */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Search className="absolute right-4 w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchSubmit(query)}
                  placeholder="ابحث: بروتوكول الولادة، جرعات الأدوية، مكافحة العدوى..."
                  className="w-full py-4 pr-12 pl-24 text-foreground text-sm sm:text-base outline-none bg-transparent"
                  dir="rtl"
                />
                {query && (
                  <button className="absolute left-14 text-muted-foreground hover:text-foreground" onClick={() => { setQuery(''); setSearchResults([]); }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSearchSubmit(query)}
                  className="absolute left-0 bg-primary hover:bg-primary/90 text-white px-4 py-4 text-sm font-bold transition-colors"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بحث'}
                </button>
              </div>

              {/* Dropdown: suggestions / history / trending */}
              {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-border z-50 text-right overflow-hidden">
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-3 py-1.5 font-semibold">💡 اقتراحات</p>
                      {suggestions.map((s, i) => (
                        <button key={i} className="w-full text-right px-3 py-2 hover:bg-muted rounded-lg text-sm flex items-center justify-between gap-2"
                          onMouseDown={() => { setQuery(s.suggestion); handleSearchSubmit(s.suggestion); }}>
                          <span className="flex items-center gap-2"><Search className="w-3.5 h-3.5 text-primary" />{s.suggestion}</span>
                          <span className="text-xs text-muted-foreground">{s.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {!suggestions.length && searchHistory.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-3 py-1.5 font-semibold">🕐 عمليات بحث سابقة</p>
                      {searchHistory.map((h, i) => (
                        <button key={i} className="w-full text-right px-3 py-2 hover:bg-muted rounded-lg text-sm flex items-center gap-2"
                          onMouseDown={() => { setQuery(h); handleSearchSubmit(h); }}>
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />{h}
                        </button>
                      ))}
                    </div>
                  )}
                  {!suggestions.length && !searchHistory.length && trending.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-3 py-1.5 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />الأكثر بحثاً
                      </p>
                      {trending.map((t, i) => (
                        <button key={i} className="w-full text-right px-3 py-2 hover:bg-muted rounded-lg text-sm flex items-center justify-between"
                          onMouseDown={() => { setQuery(t.query); handleSearchSubmit(t.query); }}>
                          <span>{t.query}</span>
                          <span className="text-xs text-primary font-semibold">{t.count}×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trending pills */}
            {trending.length > 0 && !isSearching && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-white/50 text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" />الأكثر بحثاً:</span>
                {trending.slice(0, 6).map((t, i) => (
                  <button key={i} onClick={() => handleSearchSubmit(t.query)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-full transition-colors">
                    {t.query}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Official Policies Banner */}
          <a href="https://mch-policy.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 bg-gradient-to-l from-amber-50 to-amber-100 border border-amber-300 rounded-2xl p-4 mb-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0">🏛️</div>
              <div>
                <h3 className="font-extrabold text-amber-900 text-sm sm:text-base">السياسات الرسمية للمستشفى</h3>
                <p className="text-xs text-amber-700">الدليل الرسمي لسياسات وإجراءات مستشفى الولادة والأطفال</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-amber-600 shrink-0" />
          </a>

          {/* ── Search Results ────────────────────────────────────────── */}
          {isSearching ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  نتائج: "{query}"
                </h2>
                {!searching && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{searchResults.length} نتيجة</Badge>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/library/search?q=${encodeURIComponent(query)}`)}
                      className="gap-1 text-xs">
                      بحث متقدم <Filter className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {searching ? (
                <div className="grid gap-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">لا توجد نتائج لـ "{query}"</h3>
                  <p className="text-muted-foreground text-sm mb-6">جرّب كلمات مفتاحية مختلفة أو تصفّح التصنيفات</p>
                  <Button onClick={() => { setQuery(''); setSearchResults([]); }}>مسح البحث</Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {searchResults.map(item => (
                    <LibraryCard key={item.id} item={item} query={query}
                      bookmarked={bookmarks.has(item.id)} onBookmark={toggleBookmark} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ── Categories Grid ──────────────────────────────────── */}
              <section className="mb-10">
                <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />التصنيفات الطبية
                </h2>
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[...Array(10)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {categories.map(cat => (
                      <button key={cat.id}
                        onClick={() => navigate(`/library/search?category=${cat.id}`)}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group text-right border border-transparent hover:border-primary/20">
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <div className="font-bold text-sm text-foreground leading-tight">{cat.name_ar}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{cat.name_en}</div>
                        {catCounts[cat.id] != null && (
                          <div className="mt-2 text-xs font-semibold" style={{ color: cat.color }}>
                            {catCounts[cat.id]} مرجع
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Featured ─────────────────────────────────────────── */}
              {featured.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />المحتوى المميز
                    </h2>
                    <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate('/library/search?featured=true')}>
                      عرض الكل <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map(item => (
                      <LibraryCard key={item.id} item={item} query=""
                        bookmarked={bookmarks.has(item.id)} onBookmark={toggleBookmark} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Latest + Popular ─────────────────────────────────── */}
              <div className="grid lg:grid-cols-2 gap-8">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />الأحدث
                    </h2>
                    <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs" onClick={() => navigate('/library/search')}>
                      عرض الكل <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
                      latest.slice(0, 4).map(item => (
                        <LibraryCard key={item.id} item={item} query=""
                          bookmarked={bookmarks.has(item.id)} onBookmark={toggleBookmark} />
                      ))}
                  </div>
                </section>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold flex items-center gap-2">
                      <Eye className="w-5 h-5 text-teal-500" />الأكثر مشاهدة
                    </h2>
                    <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs" onClick={() => navigate('/library/search?sort=views')}>
                      عرض الكل <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
                      popular.slice(0, 4).map(item => (
                        <LibraryCard key={item.id} item={item} query=""
                          bookmarked={bookmarks.has(item.id)} onBookmark={toggleBookmark} />
                      ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export { LibraryCard, CONTENT_TYPES, Highlight, SkeletonCard };
