import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, Users, Star, BookOpen, Award, CheckCircle, PlayCircle, Lock,
  ChevronLeft, Shield, BarChart2, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import ReadingConfirmation from '@/components/ReadingConfirmation';
import { ROUTE_PATHS, LEVEL_LABELS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { springPresets } from '@/lib/motion';
import { getCourseById, enrollInCourse, getUserEnrollments } from '@/lib/supabase';
import { MOCK_COURSES, MOCK_LECTURES } from '@/data/index';

function mapDbCourseDetail(row: Record<string, unknown>) {
  const titleFull = (row.title as string) || '';
  const [title_ar] = titleFull.split('|').map((s: string) => s.trim());
  const specColors = ['#0d9488', '#1a4a7a', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1'];
  const lessons = (row.lessons as Record<string, unknown>[]) || [];
  return {
    id: row.id as string,
    title_ar,
    description_ar: (row.description as string) || 'دورة تدريبية طبية متخصصة',
    instructor_name: 'فريق التدريب الطبي',
    thumbnail_url: null as string | null,
    is_free: true,
    price: 0,
    rating: 4.7,
    rating_count: 245,
    enrolled_count: 1200,
    duration_hours: Math.max(lessons.length * 1, 8),
    total_lectures: lessons.length || 6,
    level: 'intermediate' as const,
    specialization: { name_ar: 'طبي', color: specColors[0] },
    created_at: row.created_at as string,
    lessons: lessons.map((l: Record<string, unknown>, idx: number) => ({
      id: l.id as string,
      title_ar: (l.title as string) || `المحاضرة ${idx + 1}`,
      description_ar: (l.content as string) || '',
      duration_minutes: 45,
      is_preview: idx === 0,
      course_id: row.id as string,
    })),
  };
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ReturnType<typeof mapDbCourseDetail> | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await getCourseById(id) as Record<string, unknown>;
        if (data) setCourse(mapDbCourseDetail(data));
        else {
          const mock = MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
          setCourse({ ...mock, lessons: MOCK_LECTURES.filter(l => l.course_id === mock.id).map((l, idx) => ({
            ...l, description_ar: l.description_ar || '', is_preview: idx === 0, duration_minutes: 45,
          })) } as ReturnType<typeof mapDbCourseDetail>);
        }
      } catch {
        const mock = MOCK_COURSES[0];
        setCourse({ ...mock, lessons: [] } as ReturnType<typeof mapDbCourseDetail>);
      }

      // Check enrollment
      if (user) {
        try {
          const enrollments = await getUserEnrollments(user.id);
          setIsEnrolled(enrollments.some((e: Record<string, unknown>) => e.course_id === id));
        } catch { /* not enrolled */ }
      }
      setLoading(false);
    })();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate(ROUTE_PATHS.LOGIN); return; }
    if (!user || !id) return;
    setEnrolling(true);
    try {
      await enrollInCourse(user.id, id);
      setIsEnrolled(true);
    } catch { /* ignore dup */ }
    setEnrolling(false);
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </Layout>
  );

  const c = course!;

  return (
    <Layout>
      <div dir="rtl" className="bg-background min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-bl from-primary via-primary/95 to-accent/80 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => navigate(ROUTE_PATHS.COURSES)} className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">
                    <ChevronLeft className="w-4 h-4 rotate-180" />الدورات
                  </button>
                  <span className="text-white/40">/</span>
                  <span className="text-white/80 text-sm truncate">{c.title_ar}</span>
                </div>
                <Badge className="mb-3 text-xs border-0" style={{ backgroundColor: c.specialization.color + 'cc', color: 'white' }}>
                  {c.specialization.name_ar}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">{c.title_ar}</h1>
                <p className="text-white/75 text-sm leading-relaxed mb-5 max-w-2xl">{c.description_ar}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><strong className="text-white">{c.rating}</strong> ({c.rating_count} تقييم)</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /><strong className="text-white">{c.enrolled_count.toLocaleString()}</strong> متدرب</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><strong className="text-white">{c.duration_hours}</strong> ساعة</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /><strong className="text-white">{c.total_lectures}</strong> محاضرة</span>
                </div>
                <p className="mt-4 text-sm text-white/60">المدرب: <span className="text-white font-medium">{c.instructor_name}</span></p>
              </div>

              {/* Enrollment Card */}
              <div className="w-full lg:w-80">
                <Card className="shadow-2xl border-0 overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/40" />
                  </div>
                  <CardContent className="p-5">
                    <div className="text-2xl font-bold text-foreground mb-4">
                      {c.is_free ? <span className="text-green-600">مجاني</span> : `${c.price} ر.س`}
                    </div>
                    {isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">التقدم</span>
                          <span className="font-bold text-primary">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                        <Button className="w-full bg-primary text-primary-foreground font-bold"
                          onClick={() => navigate(`${ROUTE_PATHS.ASSESSMENT}/${id}`)}>
                          <PlayCircle className="w-4 h-4 ml-2" />ابدأ الاختبار
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
                          لوحة التحكم
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full bg-primary text-primary-foreground font-bold mb-3"
                        onClick={handleEnroll} disabled={enrolling}>
                        {enrolling ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                        {c.is_free ? 'التسجيل مجاناً' : 'التسجيل في الدورة'}
                      </Button>
                    )}
                    <ul className="space-y-2 text-sm text-muted-foreground mt-4">
                      {[
                        [`${c.duration_hours} ساعة محتوى`, Clock],
                        [`${c.total_lectures} محاضرة مسجلة`, BookOpen],
                        ['شهادة معتمدة عند الإتمام', Award],
                        ['وصول مدى الحياة', Shield],
                        ['تقييمات واختبارات', BarChart2],
                        ['تنزيل المواد التدريبية', Download],
                      ].map(([text, Icon]) => (
                        <li key={text as string} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{text as string}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="lg:max-w-2xl">
            <Tabs defaultValue="content">
              <TabsList className="mb-6 bg-muted h-11">
                <TabsTrigger value="content" className="text-sm">محتوى الدورة</TabsTrigger>
                <TabsTrigger value="about" className="text-sm">نبذة عن الدورة</TabsTrigger>
                <TabsTrigger value="reviews" className="text-sm">التقييمات</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <h2 className="text-xl font-bold mb-4">محاضرات الدورة ({c.lessons.length})</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {c.lessons.length > 0 ? c.lessons.map((lec, idx) => (
                    <AccordionItem key={lec.id} value={lec.id} className="border border-border rounded-xl overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center gap-3 text-right w-full">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{lec.title_ar}</p>
                            <p className="text-xs text-muted-foreground">{lec.duration_minutes} دقيقة</p>
                          </div>
                          {lec.is_preview
                            ? <Badge className="text-xs bg-green-100 text-green-700 border-0">معاينة</Badge>
                            : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {lec.description_ar || 'محاضرة تفصيلية تغطي هذا الموضوع بالكامل مع أمثلة تطبيقية.'}
                        </p>
                        {(lec.is_preview || isEnrolled) && (
                          <Button size="sm" variant="outline" className="mt-3 gap-2">
                            <PlayCircle className="w-4 h-4 text-primary" />مشاهدة المحاضرة
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )) : Array.from({ length: 5 }, (_, i) => (
                    <AccordionItem key={i} value={`def-${i}`} className="border border-border rounded-xl overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center gap-3 text-right w-full">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                          <div className="flex-1"><p className="font-medium text-sm">المحاضرة {i + 1}</p><p className="text-xs text-muted-foreground">45 دقيقة</p></div>
                          {i === 0 ? <Badge className="text-xs bg-green-100 text-green-700 border-0">معاينة</Badge> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <p className="text-sm text-muted-foreground">محاضرة تفصيلية.</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="about">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">وصف الدورة</h3>
                    <p className="text-muted-foreground leading-relaxed">{c.description_ar}</p>
                  </div>
                  <ReadingConfirmation
                    articleTitle={c.title_ar}
                    courseId={id}
                  />
                  <div>
                    <h3 className="font-bold text-lg mb-3">ماذا ستتعلم؟</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['فهم الأساسيات النظرية والتطبيقية', 'تطبيق المعايير الدولية المعتمدة', 'التعامل مع الحالات العملية الواقعية', 'اكتساب مهارات احترافية', 'الاستعداد للاختبارات المهنية', 'الحصول على شهادة معتمدة'].map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="flex items-center gap-6 mb-8 p-5 bg-muted/50 rounded-2xl">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-foreground">{c.rating}</div>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(c.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{c.rating_count} تقييم</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map(n => (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{n}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Progress value={n === 5 ? 72 : n === 4 ? 20 : n === 3 ? 5 : 3} className="flex-1 h-1.5" />
                        <span className="w-8 text-muted-foreground">{n === 5 ? '72%' : n === 4 ? '20%' : n === 3 ? '5%' : '3%'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {[
                  { name: 'محمد العتيبي', rating: 5, date: 'قبل أسبوع', text: 'دورة رائعة ومحتوى ممتاز. تعلمت الكثير وأنصح بها بشدة.' },
                  { name: 'نورة السالم', rating: 5, date: 'قبل شهر', text: 'المدرب محترف والشرح واضح. حصلت على الشهادة وساعدتني مهنياً.' },
                  { name: 'عبدالله الشمري', rating: 4, date: 'قبل شهرين', text: 'محتوى قيّم وشامل. أتمنى المزيد من التمارين التطبيقية.' },
                ].map(r => (
                  <div key={r.name} className="border-b border-border pb-5 mb-5 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{r.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: r.rating }, (_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                          <span className="text-xs text-muted-foreground mr-1">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.text}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
