import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, Filter, X, ChevronLeft, ChevronDown, Loader2,
  SlidersHorizontal, ArrowUpDown, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { LibraryCard, CONTENT_TYPES, SkeletonCard } from './Library';

interface LibraryCategory { id: string; name_ar: string; icon: string; color: string; }
interface LibraryItem {
  id: string; title_ar: string; title_en?: string; description_ar?: string;
  content_type: string; category_id?: string; authors?: string[]; year?: number;
  journal?: string; file_url?: string; video_url?: string; thumbnail_url?: string;
  view_count: number; download_count: number; bookmark_count: number;
  rating?: number; rating_count: number; is_featured: boolean; is_published: boolean;
  language?: string; difficulty_level?: string; relevance_score?: number;
  category?: { name_ar: string; name_en: string; icon: string; color: string };
  created_at: string;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'الأكثر صلة' },
  { value: 'newest',    label: 'الأحدث' },
  { value: 'views',     label: 'الأكثر مشاهدة' },
  { value: 'downloads', label: 'الأكثر تحميلاً' },
  { value: 'rating',    label: 'الأعلى تقييماً' },
];

const DIFFICULTY = [
  { value: 'beginner',     label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced',     label: 'متقدم' },
  { value: 'expert',       label: 'خبير' },
];

export default function LibrarySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { supabaseUser } = useAuth();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('relevance');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const PAGE_SIZE = 15;

  useEffect(() => {
    loadCategories();
    loadBookmarks();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    setQuery(q); setSelectedCategory(cat);
    doSearch(q, cat, selectedTypes, selectedLang, yearFrom, yearTo, 0, true);
  }, [searchParams]);

  const loadCategories = async () => {
    const { data } = await supabase.from('library_categories').select('id,name_ar,icon,color').eq('is_active', true).order('order_index');
    if (data) setCategories(data as LibraryCategory[]);
  };

  const loadBookmarks = async () => {
    if (!supabaseUser) return;
    const { data } = await supabase.from('library_bookmarks').select('library_item_id').eq('user_id', supabaseUser.id);
    if (data) setBookmarks(new Set(data.map((b: { library_item_id: string }) => b.library_item_id)));
  };

  const doSearch = useCallback(async (
    q: string, cat: string, types: string[], lang: string,
    yfrom: string, yto: string, offset: number, reset = false
  ) => {
    setLoading(true);
    try {
      let data: LibraryItem[] | null = null;
      if (q.trim() || cat || types.length || lang || yfrom || yto) {
        const res = await supabase.rpc('search_medical_library', {
          search_query: q || '',
          filter_category_id: cat || null,
          filter_content_type: types.length === 1 ? types[0] : null,
          filter_language: lang || null,
          filter_year_from: yfrom ? parseInt(yfrom) : null,
          filter_year_to: yto ? parseInt(yto) : null,
          results_limit: PAGE_SIZE + 1,
          results_offset: offset,
        });
        data = res.data || [];
      } else {
        // No filters → load all published
        const res = await supabase.from('medical_library')
          .select('*, category:library_categories(name_ar,name_en,icon,color)')
          .eq('is_published', true)
          .range(offset, offset + PAGE_SIZE)
          .order('created_at', { ascending: false });
        data = (res.data || []) as LibraryItem[];
      }
      const hasMore = (data?.length || 0) > PAGE_SIZE;
      const pageData = (data || []).slice(0, PAGE_SIZE);

      // Sort client-side
      let sorted = [...pageData];
      if (sort === 'newest') sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      else if (sort === 'views') sorted.sort((a, b) => b.view_count - a.view_count);
      else if (sort === 'downloads') sorted.sort((a, b) => b.download_count - a.download_count);
      else if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      if (reset) { setResults(sorted); setPage(0); }
      else setResults(prev => [...prev, ...sorted]);
      setHasMore(hasMore);
      setTotal(reset ? sorted.length : results.length + sorted.length);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [sort, results.length]);

  const applyFilters = () => {
    doSearch(query, selectedCategory, selectedTypes, selectedLang, yearFrom, yearTo, 0, true);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedCategory(''); setSelectedTypes([]); setSelectedLang('');
    setSelectedDifficulty(''); setYearFrom(''); setYearTo('');
    doSearch(query, '', [], '', '', '', 0, true);
  };

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleBookmark = async (itemId: string) => {
    if (!supabaseUser) { navigate('/login'); return; }
    const has = bookmarks.has(itemId);
    setBookmarks(prev => { const s = new Set(prev); has ? s.delete(itemId) : s.add(itemId); return s; });
    if (has) await supabase.from('library_bookmarks').delete().eq('user_id', supabaseUser.id).eq('library_item_id', itemId);
    else await supabase.from('library_bookmarks').insert({ user_id: supabaseUser.id, library_item_id: itemId });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, selectedCategory, selectedTypes, selectedLang, yearFrom, yearTo, nextPage * PAGE_SIZE, false);
  };

  const activeFilterCount = [selectedCategory, selectedLang, selectedDifficulty, yearFrom, yearTo].filter(Boolean).length + selectedTypes.length;

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen bg-muted/20">
        {/* Top search bar */}
        <div className="bg-gradient-to-bl from-[oklch(0.22_0.08_220)] to-primary text-white py-4 sm:py-5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1 shrink-0 px-2"
                onClick={() => navigate('/library')}>
                <ChevronLeft className="w-4 h-4 rotate-180" />المكتبة
              </Button>
              <div className="relative flex-1 flex items-center bg-white/10 rounded-xl overflow-hidden">
                <Search className="absolute right-3 w-4 h-4 text-white/60" />
                <input
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (e.target.value) newParams.set('q', e.target.value);
                      else newParams.delete('q');
                      setSearchParams(newParams);
                    }, 400);
                  }}
                  onKeyDown={e => e.key === 'Enter' && doSearch(query, selectedCategory, selectedTypes, selectedLang, yearFrom, yearTo, 0, true)}
                  placeholder="ابحث في المكتبة الطبية..."
                  className="w-full py-2.5 pr-9 pl-3 bg-transparent text-white placeholder-white/50 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6">

            {/* ── Filters Sidebar (desktop) ──────────────────────── */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-sm">الفلاتر</h3>
                  {activeFilterCount > 0 && (
                    <button className="text-xs text-destructive hover:underline" onClick={clearFilters}>
                      مسح ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="mb-4">
                  <Label className="text-xs font-bold text-muted-foreground mb-2 block">التصنيف</Label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    <button onClick={() => setSelectedCategory('')}
                      className={`w-full text-right text-xs px-2 py-1.5 rounded-lg transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'}`}>
                      جميع التصنيفات
                    </button>
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                        className={`w-full text-right text-xs px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${selectedCategory === cat.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'}`}>
                        <span>{cat.icon}</span><span>{cat.name_ar}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Type */}
                <div className="mb-4">
                  <Label className="text-xs font-bold text-muted-foreground mb-2 block">نوع المحتوى</Label>
                  <div className="space-y-1">
                    {Object.entries(CONTENT_TYPES).map(([v, t]) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer py-1">
                        <Checkbox checked={selectedTypes.includes(v)} onCheckedChange={() => toggleType(v)} className="w-3.5 h-3.5" />
                        <span className="text-xs">{t.icon} {t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="mb-4">
                  <Label className="text-xs font-bold text-muted-foreground mb-2 block">اللغة</Label>
                  {[['', 'الكل'], ['ar', 'عربي'], ['en', 'إنجليزي'], ['both', 'كلاهما']].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer py-1">
                      <input type="radio" name="lang" value={v} checked={selectedLang === v} onChange={() => setSelectedLang(v)} className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs">{l}</span>
                    </label>
                  ))}
                </div>

                {/* Year Range */}
                <div className="mb-4">
                  <Label className="text-xs font-bold text-muted-foreground mb-2 block">السنة</Label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="من" min="2000" max="2030" value={yearFrom}
                      onChange={e => setYearFrom(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary" />
                    <span className="text-xs">-</span>
                    <input type="number" placeholder="إلى" min="2000" max="2030" value={yearTo}
                      onChange={e => setYearTo(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <Button className="w-full bg-primary text-xs h-9" onClick={applyFilters}>
                  تطبيق الفلاتر
                </Button>
              </div>
            </aside>

            {/* ── Results ───────────────────────────────────────── */}
            <main className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base">
                    {query ? `نتائج: "${query}"` : 'كل المحتوى'}
                  </h2>
                  {!loading && <Badge variant="outline" className="text-xs">{results.length} نتيجة</Badge>}
                  {activeFilterCount > 0 && (
                    <Badge className="bg-primary/10 text-primary border-0 text-xs gap-1">
                      <Filter className="w-3 h-3" />{activeFilterCount} فلتر
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Mobile filters */}
                  <Button size="sm" variant="outline" className="lg:hidden gap-1 text-xs h-8"
                    onClick={() => setShowFilters(!showFilters)}>
                    <SlidersHorizontal className="w-3.5 h-3.5" />فلاتر
                    {activeFilterCount > 0 && <span className="bg-primary text-white text-[9px] rounded-full px-1">{activeFilterCount}</span>}
                  </Button>
                  {/* Sort */}
                  <select value={sort} onChange={e => setSort(e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1.5 outline-none bg-white h-8">
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Mobile filter panel */}
              {showFilters && (
                <Card className="border-0 shadow-md mb-4 lg:hidden">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-bold mb-1 block">التصنيف</Label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                          className="w-full text-xs border rounded-lg px-2 py-1.5 outline-none">
                          <option value="">الكل</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs font-bold mb-1 block">اللغة</Label>
                        <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                          className="w-full text-xs border rounded-lg px-2 py-1.5 outline-none">
                          <option value="">الكل</option>
                          <option value="ar">عربي</option>
                          <option value="en">إنجليزي</option>
                          <option value="both">كلاهما</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 bg-primary text-xs h-8" onClick={applyFilters}>تطبيق</Button>
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={clearFilters}>مسح</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results list */}
              {loading && results.length === 0 ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : results.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
                  <p className="text-muted-foreground text-sm mb-4">جرّب كلمات مختلفة أو امسح الفلاتر</p>
                  <Button variant="outline" onClick={clearFilters}>مسح الفلاتر</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {results.map(item => (
                      <LibraryCard key={item.id} item={item} query={query}
                        bookmarked={bookmarks.has(item.id)} onBookmark={toggleBookmark} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="text-center mt-6">
                      <Button variant="outline" onClick={loadMore} disabled={loading} className="gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        تحميل المزيد
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
