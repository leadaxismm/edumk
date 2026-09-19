import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Download, Bookmark, Star, Eye, Share2,
  Loader2, ExternalLink, BookOpen, Calendar, User, Tag, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { LibraryCard, CONTENT_TYPES } from './Library';

interface LibraryItem {
  id: string; title_ar: string; title_en?: string;
  description_ar?: string; description_en?: string;
  abstract_ar?: string; abstract_en?: string;
  full_content_ar?: string;
  content_type: string; category_id?: string;
  authors?: string[]; affiliation?: string; publisher?: string;
  year?: number; journal?: string; doi?: string; isbn?: string; source_url?: string;
  file_url?: string; file_type?: string; file_size_kb?: number;
  thumbnail_url?: string; video_url?: string; video_duration_minutes?: number;
  keywords_ar?: string[]; keywords_en?: string[]; tags?: string[];
  difficulty_level?: string; target_audience?: string[]; language?: string;
  view_count: number; download_count: number; bookmark_count: number;
  rating?: number; rating_count: number;
  is_featured: boolean; is_published: boolean; created_at: string;
  category?: { name_ar: string; name_en: string; icon: string; color: string };
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n}
          className={`text-xl transition-transform hover:scale-110 ${n <= (hovered || value) ? 'text-amber-400' : 'text-muted-foreground/30'}`}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange?.(n)}
        >★</button>
      ))}
    </div>
  );
}

export default function LibraryItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supabaseUser, isAuthenticated } = useAuth();

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [related, setRelated] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (id) loadItem(); }, [id]);

  const loadItem = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('medical_library')
        .select('*, category:library_categories(name_ar,name_en,icon,color)')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setItem(data as LibraryItem);
        // Increment view_count
        supabase.from('medical_library').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id).then(() => {});
        // Load related (same category)
        if (data.category_id) {
          const { data: rel } = await supabase
            .from('medical_library')
            .select('*, category:library_categories(name_ar,name_en,icon,color)')
            .eq('is_published', true)
            .eq('category_id', data.category_id)
            .neq('id', id)
            .limit(4);
          if (rel) setRelated(rel as LibraryItem[]);
        }
        // Check bookmark
        if (supabaseUser) {
          const { data: bk } = await supabase.from('library_bookmarks')
            .select('id').eq('user_id', supabaseUser.id).eq('library_item_id', id).maybeSingle();
          setBookmarked(!!bk);
          // Check rating
          const { data: rt } = await supabase.from('library_ratings')
            .select('rating').eq('user_id', supabaseUser.id).eq('library_item_id', id).maybeSingle();
          if (rt) { setUserRating(rt.rating); setRatingSubmitted(true); }
        }
      }
    } finally { setLoading(false); }
  };

  const toggleBookmark = async () => {
    if (!supabaseUser) { navigate('/login'); return; }
    setSaving(true);
    if (bookmarked) {
      await supabase.from('library_bookmarks').delete().eq('user_id', supabaseUser.id).eq('library_item_id', id!);
      setBookmarked(false);
    } else {
      await supabase.from('library_bookmarks').insert({ user_id: supabaseUser.id, library_item_id: id! });
      setBookmarked(true);
    }
    setSaving(false);
  };

  const submitRating = async (rating: number) => {
    if (!supabaseUser) { navigate('/login'); return; }
    setUserRating(rating);
    await supabase.from('library_ratings').upsert(
      { user_id: supabaseUser.id, library_item_id: id!, rating },
      { onConflict: 'user_id,library_item_id' }
    );
    setRatingSubmitted(true);
  };

  const handleDownload = async () => {
    if (!item?.file_url) return;
    window.open(item.file_url, '_blank');
    await supabase.from('medical_library').update({ download_count: (item.download_count || 0) + 1 }).eq('id', id!);
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    </Layout>
  );

  if (!item) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-bold mb-2">العنصر غير موجود</h2>
        <Button onClick={() => navigate('/library')}>العودة للمكتبة</Button>
      </div>
    </Layout>
  );

  const ct = CONTENT_TYPES[item.content_type] || { label: item.content_type, icon: '📄', color: 'bg-gray-100 text-gray-700' };

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen bg-muted/20">
        {/* Header */}
        <div className="bg-gradient-to-bl from-[oklch(0.22_0.08_220)] to-primary text-white py-5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1 mb-3 -mr-2 px-2"
              onClick={() => navigate('/library')}>
              <ArrowRight className="w-4 h-4" />المكتبة الطبية
            </Button>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-white/20`}>
                {ct.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`border-0 text-xs ${ct.color}`}>{ct.label}</Badge>
                  {item.category && (
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {item.category.icon} {item.category.name_ar}
                    </Badge>
                  )}
                  {item.is_featured && <Badge className="bg-amber-500 text-white border-0 text-xs">⭐ مميز</Badge>}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold leading-snug">{item.title_ar}</h1>
                {item.title_en && <p className="text-white/70 text-sm mt-1" dir="ltr">{item.title_en}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Main Content ───────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Video */}
              {item.video_url && (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className="aspect-video">
                    <iframe src={item.video_url} className="w-full h-full" allowFullScreen
                      title={item.title_ar} allow="accelerometer; autoplay; encrypted-media" />
                  </div>
                </Card>
              )}

              {/* Description */}
              {item.description_ar && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h2 className="font-extrabold text-base mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />الوصف
                    </h2>
                    <p className="text-sm leading-relaxed text-foreground">{item.description_ar}</p>
                    {item.description_en && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed" dir="ltr">{item.description_en}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Abstract */}
              {item.abstract_ar && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h2 className="font-extrabold text-base mb-2">الملخص</h2>
                    <p className="text-sm leading-relaxed">{item.abstract_ar}</p>
                  </CardContent>
                </Card>
              )}

              {/* Full content */}
              {item.full_content_ar && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h2 className="font-extrabold text-base mb-3">المحتوى الكامل</h2>
                    <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-line">
                      {item.full_content_ar}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Keywords */}
              {(item.keywords_ar?.length || item.keywords_en?.length || item.tags?.length) ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <h2 className="font-extrabold text-base mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />الكلمات المفتاحية
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {item.keywords_ar?.map((k, i) => (
                        <button key={i} onClick={() => navigate(`/library/search?q=${encodeURIComponent(k)}`)}
                          className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
                          {k}
                        </button>
                      ))}
                      {item.keywords_en?.map((k, i) => (
                        <button key={i} onClick={() => navigate(`/library/search?q=${encodeURIComponent(k)}`)}
                          className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full hover:bg-muted/70" dir="ltr">
                          {k}
                        </button>
                      ))}
                      {item.tags?.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Rating */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h2 className="font-extrabold text-base mb-3">تقييمك</h2>
                  {!isAuthenticated ? (
                    <p className="text-sm text-muted-foreground">
                      <button className="text-primary underline" onClick={() => navigate('/login')}>سجّل دخولك</button> لتقييم هذا المحتوى
                    </p>
                  ) : ratingSubmitted ? (
                    <div className="flex items-center gap-2">
                      <StarRating value={userRating} />
                      <span className="text-sm text-green-600">✅ تم تقييمك بـ {userRating}/5</span>
                    </div>
                  ) : (
                    <div>
                      <StarRating value={userRating} onChange={submitRating} />
                      <p className="text-xs text-muted-foreground mt-1">اضغط على نجمة للتقييم</p>
                    </div>
                  )}
                  {item.rating != null && (
                    <div className="mt-3 flex items-center gap-2">
                      <StarRating value={Math.round(item.rating)} />
                      <span className="text-sm font-bold">{Number(item.rating).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({item.rating_count} تقييم)</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related */}
              {related.length > 0 && (
                <div>
                  <h2 className="font-extrabold text-base mb-3">محتوى ذو صلة</h2>
                  <div className="space-y-3">
                    {related.map(r => <LibraryCard key={r.id} item={r} query="" />)}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Actions */}
              <Card className="border-0 shadow-md sticky top-20">
                <CardContent className="p-5 space-y-3">
                  {item.file_url ? (
                    <Button className="w-full bg-primary gap-2" onClick={handleDownload}>
                      <Download className="w-4 h-4" />تحميل الملف
                      {item.file_size_kb && <span className="text-xs opacity-70">({Math.round(item.file_size_kb/1024*10)/10} MB)</span>}
                    </Button>
                  ) : item.source_url ? (
                    <Button className="w-full bg-primary gap-2" onClick={() => window.open(item.source_url, '_blank')}>
                      <ExternalLink className="w-4 h-4" />فتح المصدر الأصلي
                    </Button>
                  ) : null}

                  <Button variant="outline" className={`w-full gap-2 ${bookmarked ? 'bg-primary/10 border-primary text-primary' : ''}`}
                    onClick={toggleBookmark} disabled={saving}>
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-primary' : ''}`} />
                    {bookmarked ? 'تم الحفظ' : 'حفظ للمراجعة'}
                  </Button>

                  <Button variant="outline" className="w-full gap-2" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}>
                    <Share2 className="w-4 h-4" />مشاركة الرابط
                  </Button>
                </CardContent>
              </Card>

              {/* Details */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-extrabold text-sm mb-3">تفاصيل المرجع</h3>
                  <div className="space-y-2.5 text-sm">
                    {item.authors?.length ? (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">المؤلفون</p>
                          <p className="font-medium text-xs">{item.authors.join('، ')}</p>
                        </div>
                      </div>
                    ) : null}
                    {item.year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">سنة النشر</p>
                          <p className="font-medium text-xs">{item.year}</p>
                        </div>
                      </div>
                    )}
                    {item.journal && (
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">المجلة / المصدر</p>
                          <p className="font-medium text-xs">{item.journal}</p>
                        </div>
                      </div>
                    )}
                    {item.doi && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">DOI</p>
                          <p className="font-medium text-xs font-mono" dir="ltr">{item.doi}</p>
                        </div>
                      </div>
                    )}
                    {item.language && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">اللغة</p>
                          <p className="font-medium text-xs">{{ar:'عربي',en:'إنجليزي',both:'عربي + إنجليزي'}[item.language] || item.language}</p>
                        </div>
                      </div>
                    )}
                    {item.difficulty_level && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">المستوى</p>
                          <Badge variant="outline" className="text-xs">
                            {{beginner:'مبتدئ',intermediate:'متوسط',advanced:'متقدم',expert:'خبير'}[item.difficulty_level] || item.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xl font-extrabold text-primary">{item.view_count}</div>
                      <div className="text-[10px] text-muted-foreground">مشاهدة</div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-teal-600">{item.download_count}</div>
                      <div className="text-[10px] text-muted-foreground">تحميل</div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-amber-500">{item.bookmark_count}</div>
                      <div className="text-[10px] text-muted-foreground">حُفظ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
