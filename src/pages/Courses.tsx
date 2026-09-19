import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, Users, BookOpen, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { MOCK_COURSES, MOCK_SPECIALIZATIONS } from '@/data/index';
import { ROUTE_PATHS, LEVEL_LABELS, LEVEL_COLORS } from '@/lib/index';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { getCourses } from '@/lib/supabase';

// Map DB course row → display shape with fallback defaults
function mapDbCourse(row: Record<string, unknown>, idx: number) {
  const titleFull = (row.title as string) || '';
  const [title_ar, title_en = ''] = titleFull.split('|').map(s => s.trim());
  const specColors = ['#0d9488', '#1a4a7a', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1'];
  return {
    id: row.id as string,
    title_ar,
    title_en,
    description_ar: (row.description as string) || 'دورة تدريبية طبية متخصصة',
    instructor_name: 'فريق التدريب الطبي',
    thumbnail_url: null as string | null,
    is_free: true,
    price: 0,
    rating: 4.5 + Math.random() * 0.4,
    rating_count: Math.floor(120 + Math.random() * 200),
    enrolled_count: Math.floor(500 + Math.random() * 1500),
    duration_hours: Math.floor(8 + Math.random() * 16),
    total_lectures: Math.floor(6 + Math.random() * 12),
    level: ['beginner', 'intermediate', 'advanced'][idx % 3] as 'beginner' | 'intermediate' | 'advanced',
    specialization: { name_ar: '—', color: specColors[idx % specColors.length] },
    created_at: row.created_at as string,
  };
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFree, setShowFree] = useState(false);
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('spec') || 'all');

  useEffect(() => {
    (async () => {
      try {
        const data = await getCourses();
        if (data && data.length > 0) {
          const mapped = (data as Record<string, unknown>[]).map((row, idx) => mapDbCourse(row, idx));
          setCourses(mapped as typeof MOCK_COURSES);
        }
      } catch {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...courses];
    if (query) list = list.filter(c => c.title_ar.includes(query) || (c.description_ar || '').includes(query));
    if (selectedLevel !== 'all') list = list.filter(c => c.level === selectedLevel);
    if (showFree) list = list.filter(c => c.is_free);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'enrolled') list.sort((a, b) => b.enrolled_count - a.enrolled_count);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [query, selectedLevel, sortBy, showFree, courses]);

  const clearFilters = () => { setQuery(''); setSelectedLevel('all'); setShowFree(false); };
  const hasFilters = query || selectedLevel !== 'all' || showFree;

  return (
    <Layout>
      <div dir="rtl" className="bg-background min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-bl from-primary/95 to-accent/80 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">مكتبة الدورات الطبية</h1>
            <p className="text-white/75 text-lg mb-8">استعرض دورات معتمدة في التخصصات الطبية المختلفة</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="ابحث عن دورة أو تخصص..."
                className="w-full pr-12 pl-4 py-3.5 bg-white/15 border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 focus:border-white/60 text-sm" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              <span>تصفية:</span>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="beginner">مبتدئ</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">متقدم</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                <SelectItem value="enrolled">الأكثر تسجيلاً</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={showFree ? 'default' : 'outline'} size="sm" className="h-9"
              onClick={() => setShowFree(!showFree)}>
              {showFree && '✓ '}مجاني فقط
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-9 text-destructive hover:text-destructive gap-1" onClick={clearFilters}>
                <X className="w-3.5 h-3.5" />مسح الفلاتر
              </Button>
            )}
            <div className="mr-auto text-sm text-muted-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `${filtered.length} دورة`}
            </div>
          </div>

          {/* Specialization Quick Filters */}
          <div className="flex gap-2 flex-wrap mb-8">
            {MOCK_SPECIALIZATIONS.map(s => (
              <button key={s.id} onClick={() => setSelectedSpec(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedSpec === s.id ? 'text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                style={selectedSpec === s.id ? { backgroundColor: s.color } : {}}>
                {s.name_ar}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="mr-3 text-muted-foreground">جاري تحميل الدورات...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد دورات</h3>
              <p className="text-muted-foreground mb-4">حاول تغيير معايير البحث</p>
              <Button variant="outline" onClick={clearFilters}>مسح الفلاتر</Button>
            </div>
          )}

          {/* Course Grid */}
          {!loading && filtered.length > 0 && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(course => (
                <motion.div key={course.id} variants={staggerItem}>
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col"
                    onClick={() => navigate(`${ROUTE_PATHS.COURSES}/${course.id}`)}>
                    <div className="relative h-44 overflow-hidden bg-muted">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <BookOpen className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {course.is_free && <Badge className="absolute top-3 right-3 bg-green-500 text-white text-xs border-0">مجاني</Badge>}
                      <Badge className="absolute top-3 left-3 text-xs border-0"
                        style={{ backgroundColor: (course.specialization?.color || '#1a4a7a') + 'dd', color: 'white' }}>
                        {course.specialization?.name_ar || 'طبي'}
                      </Badge>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <Badge variant="outline" className={`self-start text-xs mb-2 ${LEVEL_COLORS[course.level]}`}>
                        {LEVEL_LABELS[course.level]}
                      </Badge>
                      <h3 className="font-bold text-foreground mb-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors">{course.title_ar}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{course.instructor_name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{course.description_ar}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 mt-auto">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_hours}س</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.total_lectures} محاضرة</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolled_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{course.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({course.rating_count})</span>
                        </div>
                        <span className="font-bold text-primary text-sm">{course.is_free ? 'مجاني' : `${course.price} ر.س`}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
