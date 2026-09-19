import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, Award, Plus, Edit, Trash2, Eye,
  Loader2, RefreshCw, Shield, Save, Search, Video,
  FileQuestion, ChevronRight, ChevronLeft, ArrowRight,
  CheckCircle2, X, Lightbulb, CheckCheck, Download,
  PlayCircle, GraduationCap, Calendar, Star, Upload, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Types ───────────────────────────────────────
interface Course { id: string; title: string; description: string; created_at: string; }
interface Lesson { id: string; course_id: string; title: string; content: string; created_at: string; }
interface Question { id: string; course_id: string; question: string; correct_answer: number; }
interface Certificate { id: string; user_id: string; course_id: string; score: number; issued_at: string; certificate_number?: string; course?: { title: string }; }
interface Suggestion { id: string; employee_name: string; department: string; suggestion: string; category: string; status: string; created_at: string; email?: string; }
interface ReadingConf { id: string; employee_name: string; department: string; article_title: string; confirmed_at: string; }
interface Enrollment { id: string; user_id: string; course_id: string; enrolled_at: string; course?: { title: string }; }
interface OnboardingUser { id: string; full_name: string; email: string; role: string; onboarding_completed: boolean; onboarding_completed_at?: string; onboarding_score?: number; }
interface OBModule { id: string; title_ar: string; description_ar?: string; order_index: number; video_url?: string; video_duration_minutes?: number; passing_score: number; requires_policy_acceptance: boolean; is_active: boolean; module_type: string; }
interface LibItem { id: string; title_ar: string; title_en?: string; content_type: string; category_id?: string; year?: number; view_count: number; download_count: number; is_published: boolean; is_featured: boolean; created_at: string; category?: { name_ar: string; icon: string }; }
interface LibItemForm { title_ar: string; title_en: string; description_ar: string; content_type: string; category_id: string; authors: string; year: string; journal: string; doi: string; source_url: string; file_url: string; video_url: string; keywords_ar: string; language: string; difficulty_level: string; is_published: boolean; is_featured: boolean; }

interface Announcement { id: string; title_ar: string; content_ar: string; priority: string; department: string; author_name: string; is_pinned: boolean; is_active: boolean; publish_date: string; expiry_date?: string; }
interface AnnForm { title_ar: string; content_ar: string; priority: string; department: string; author_name: string; is_pinned: boolean; publish_date: string; expiry_date: string; }

const DEPTS = ['التمريض','الطب','المختبرات الطبية','الأشعة','الطوارئ','الصيدلة','إدارة الرعاية','البحث العلمي','الموارد البشرية','أخرى'];

// ─── Helper: extract YouTube/Vimeo embed ─────────
function toEmbed(url: string): string {
  if (!url) return '';
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return url;
}

export default function AdminPage() {
  const { user, isAdmin, supabaseUser, loading: authLoading } = useAuth();
  const { isRTL } = useLang();
  const navigate = useNavigate();

  // ─── Data ─────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [readings, setReadings] = useState<ReadingConf[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [obUsers, setObUsers] = useState<OnboardingUser[]>([]);
  const [obModules, setObModules] = useState<OBModule[]>([]);
  const [libItems, setLibItems] = useState<LibItem[]>([]);
  const [libCategories, setLibCategories] = useState<{id:string;name_ar:string;icon:string}[]>([]);
  const [showLibForm, setShowLibForm] = useState(false);
  const [editingLibItem, setEditingLibItem] = useState<LibItem | null>(null);
  const [libForm, setLibForm] = useState<LibItemForm>({ title_ar:'',title_en:'',description_ar:'',content_type:'protocol',category_id:'',authors:'',year:'',journal:'',doi:'',source_url:'',file_url:'',video_url:'',keywords_ar:'',language:'ar',difficulty_level:'intermediate',is_published:true,is_featured:false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  // ─── Course Form ───────────────────────────────
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ title_ar: '', title_en: '', description: '' });

  // ─── Lesson Form ───────────────────────────────
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ course_id: '', title: '', video_url: '', content: '' });
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState('__all__');

  // ─── Question Form ─────────────────────────────
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qForm, setQForm] = useState({ course_id: '', text: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: '1' });
  const [selectedCourseForQ, setSelectedCourseForQ] = useState('__all__');

  // ─── Certificate Form ──────────────────────────
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ user_id: '', course_id: '', score: '85', issued_at: new Date().toISOString().split('T')[0], employee_name: '', cert_number: '' });

  const [saving, setSaving] = useState(false);

  // ─── Announcements ───────────────────────────
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const EMPTY_ANN: AnnForm = { title_ar:'', content_ar:'', priority:'normal', department:'', author_name:'', is_pinned:false, publish_date: new Date().toISOString().split('T')[0], expiry_date:'' };
  const [annForm, setAnnForm] = useState<AnnForm>(EMPTY_ANN);

  // ─── Load ──────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      // Safe fetch: one failure won't crash the whole page
      const safe = async (q: ReturnType<typeof supabase.from>) => {
        try { const r = await (q as unknown as Promise<{data: unknown[] | null}>); return r.data || []; } catch { return []; }
      };
      const [c, l, q, cert, enr, obm, obu] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('lessons').select('*').order('created_at', { ascending: true }),
        supabase.from('questions').select('*'),
        supabase.from('certificates').select('*, course:courses(title)').order('issued_at', { ascending: false }).limit(100),
        supabase.from('enrollments').select('*, course:courses(title)').order('enrolled_at', { ascending: false }).limit(100),
        supabase.from('onboarding_modules').select('*').order('order_index'),
        supabase.from('profiles').select('id,full_name,email,role,onboarding_completed,onboarding_completed_at,onboarding_score').limit(500),
      ]);
      if (c.data) setCourses(c.data as Course[]);
      if (l.data) setLessons(l.data as Lesson[]);
      if (q.data) setQuestions(q.data as Question[]);
      if (cert.data) setCertificates(cert.data as Certificate[]);
      if (enr.data) setEnrollments(enr.data as Enrollment[]);
      if (obm.data) setObModules(obm.data as OBModule[]);
      if (obu.data) setObUsers(obu.data as OnboardingUser[]);
      // Library
      try {
        const [{ data: li }, { data: lc }] = await Promise.all([
          supabase.from('medical_library').select('id,title_ar,title_en,content_type,year,view_count,download_count,is_published,is_featured,created_at,category:library_categories(name_ar,icon)').order('created_at',{ascending:false}).limit(200),
          supabase.from('library_categories').select('id,name_ar,icon').eq('is_active',true).order('order_index'),
        ]);
        if (li) setLibItems(li as unknown as LibItem[]);
        if (lc) setLibCategories(lc as {id:string;name_ar:string;icon:string}[]);
      } catch { setLibItems([]); setLibCategories([]); }
      // Announcements
      try {
        const { data: ann } = await supabase.from('announcements').select('*').order('is_pinned',{ascending:false}).order('publish_date',{ascending:false});
        if (ann) setAnnouncements(ann as Announcement[]);
      } catch { setAnnouncements([]); }
      // Load optional tables gracefully
      try {
        const { data: sug } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
        if (sug) setSuggestions(sug as Suggestion[]);
      } catch { setSuggestions([]); }
      try {
        const { data: read } = await supabase.from('reading_confirmations').select('*').order('confirmed_at', { ascending: false }).limit(100);
        if (read) setReadings(read as ReadingConf[]);
      } catch { setReadings([]); }
    } catch (e) { console.error('Admin loadData error:', e); }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  // ─── COURSE CRUD ───────────────────────────────
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({ title_ar: '', title_en: '', description: '' });
    setShowCourseForm(true);
  };
  const openEditCourse = (c: Course) => {
    const parts = c.title.split('|');
    setEditingCourse(c);
    setCourseForm({ title_ar: parts[0]?.trim() || '', title_en: parts[1]?.trim() || '', description: c.description || '' });
    setShowCourseForm(true);
  };
  const saveCourse = async () => {
    if (!courseForm.title_ar.trim()) return;
    setSaving(true);
    const title = courseForm.title_en.trim() ? `${courseForm.title_ar.trim()} | ${courseForm.title_en.trim()}` : courseForm.title_ar.trim();
    if (editingCourse) {
      await supabase.from('courses').update({ title, description: courseForm.description }).eq('id', editingCourse.id);
    } else {
      await supabase.from('courses').insert({ title, description: courseForm.description });
    }
    setSaving(false); setShowCourseForm(false); loadData();
  };
  const deleteCourse = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الدورة وجميع محتوياتها؟')) return;
    await supabase.from('lessons').delete().eq('course_id', id);
    await supabase.from('questions').delete().eq('course_id', id);
    await supabase.from('courses').delete().eq('id', id);
    loadData();
  };

  // ─── LESSON CRUD ───────────────────────────────
  const openAddLesson = (courseId = '') => {
    setEditingLesson(null);
    setLessonForm({ course_id: courseId, title: '', video_url: '', content: '' });
    setShowLessonForm(true);
  };
  const openEditLesson = (l: Lesson) => {
    const videoMatch = l.content?.match(/\[فيديو\]\s*(https?:\/\/\S+)/);
    const textContent = l.content?.replace(/\[فيديو\]\s*https?:\/\/\S+/g, '').trim() || '';
    setEditingLesson(l);
    setLessonForm({ course_id: l.course_id, title: l.title, video_url: videoMatch?.[1] || '', content: textContent });
    setShowLessonForm(true);
  };
  const saveLesson = async () => {
    if (!lessonForm.title.trim() || !lessonForm.course_id) return;
    setSaving(true);
    const embedUrl = lessonForm.video_url ? toEmbed(lessonForm.video_url) : '';
    const content = [lessonForm.content.trim(), embedUrl ? `[فيديو] ${embedUrl}` : ''].filter(Boolean).join('\n');
    if (editingLesson) {
      await supabase.from('lessons').update({ title: lessonForm.title, content }).eq('id', editingLesson.id);
    } else {
      await supabase.from('lessons').insert({ course_id: lessonForm.course_id, title: lessonForm.title, content });
    }
    setSaving(false); setShowLessonForm(false); loadData();
  };
  const deleteLesson = async (id: string) => {
    if (!confirm('هل تريد حذف هذه المحاضرة؟')) return;
    await supabase.from('lessons').delete().eq('id', id);
    loadData();
  };

  // ─── QUESTION CRUD ─────────────────────────────
  const openAddQuestion = (courseId = '') => {
    setEditingQuestion(null);
    setQForm({ course_id: courseId, text: '', opt1: '', opt2: '', opt3: '', opt4: '', correct: '1' });
    setShowQuestionForm(true);
  };
  const openEditQuestion = (q: Question) => {
    const parts = q.question.split('|||');
    setEditingQuestion(q);
    setQForm({ course_id: q.course_id, text: parts[0] || '', opt1: parts[1] || '', opt2: parts[2] || '', opt3: parts[3] || '', opt4: parts[4] || '', correct: String(q.correct_answer) });
    setShowQuestionForm(true);
  };
  const saveQuestion = async () => {
    if (!qForm.text.trim() || !qForm.course_id || !qForm.opt1 || !qForm.opt2) return;
    setSaving(true);
    const question = `${qForm.text}|||${qForm.opt1}|||${qForm.opt2}|||${qForm.opt3 || qForm.opt2}|||${qForm.opt4 || qForm.opt2}`;
    const correct_answer = parseInt(qForm.correct);
    if (editingQuestion) {
      await supabase.from('questions').update({ question, correct_answer }).eq('id', editingQuestion.id);
    } else {
      await supabase.from('questions').insert({ course_id: qForm.course_id, question, correct_answer });
    }
    setSaving(false); setShowQuestionForm(false); loadData();
  };
  const deleteQuestion = async (id: string) => {
    if (!confirm('هل تريد حذف هذا السؤال؟')) return;
    await supabase.from('questions').delete().eq('id', id);
    loadData();
  };

  // ─── CERTIFICATE ISSUE ─────────────────────────
  const issueCertificate = async () => {
    if (!certForm.course_id || !certForm.employee_name) return;
    setSaving(true);
    const certNum = certForm.cert_number || `MCH-${new Date().getFullYear()}-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;
    await supabase.from('certificates').insert({
      user_id: certForm.user_id || (supabaseUser?.id || '00000000-0000-0000-0000-000000000000'),
      course_id: certForm.course_id,
      score: parseInt(certForm.score),
      issued_at: new Date(certForm.issued_at).toISOString(),
      certificate_number: certNum,
    });
    setSaving(false); setShowCertForm(false); loadData();
    alert(`✅ تم إصدار الشهادة!\nرقم الشهادة: ${certNum}`);
  };
  const updateSuggestionStatus = async (id: string, status: string) => {
    await supabase.from('suggestions').update({ status }).eq('id', id);
    loadData();
  };

  const stats = [
    { label: 'الدورات', value: courses.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'المحاضرات', value: lessons.length, icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'الأسئلة', value: questions.length, icon: FileQuestion, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'الشهادات', value: certificates.length, icon: Award, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'التسجيلات', value: enrollments.length, icon: Users, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'الاقتراحات', value: suggestions.filter(s=>s.status==='pending').length, icon: Lightbulb, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const isAdminUser = isAdmin ||
    supabaseUser?.user_metadata?.role === 'admin' ||
    (supabaseUser?.app_metadata as Record<string,unknown>)?.role === 'admin' ||
    supabaseUser?.email === 'admin@edumk-mch.com';

  // Still loading auth — show spinner, don't flash "غير مصرح"
  if (authLoading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    </Layout>
  );

  if (!isAdminUser) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
          <p className="text-muted-foreground mb-4">هذه الصفحة للمديرين فقط</p>
          <Button onClick={() => navigate(ROUTE_PATHS.HOME)}>الرئيسية</Button>
        </div>
      </div>
    </Layout>
  );

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const filteredLessons = lessons.filter(l =>
    (selectedCourseForLesson && selectedCourseForLesson !== '__all__' ? l.course_id === selectedCourseForLesson : true) &&
    l.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredQuestions = questions.filter(q =>
    (selectedCourseForQ && selectedCourseForQ !== '__all__' ? q.course_id === selectedCourseForQ : true)
  );

  return (
    <Layout>
      <div dir="rtl" className="bg-muted/30 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-bl from-[oklch(0.22_0.08_220)] to-primary text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src="/edumk-logo.svg" className="w-7 h-7" alt="EduMK" />
                <span className="text-white/60 text-xs">EduMK — لوحة التحكم</span>
              </div>
              <h1 className="text-xl font-extrabold">مركز إدارة المنصة</h1>
            </div>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1.5" onClick={loadData}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />تحديث
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            {stats.map(s => (
              <Card key={s.label} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {loading ? '—' : s.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-5 bg-background border border-border h-auto flex-wrap gap-1 p-1">
              {[
                { v: 'courses', icon: BookOpen, label: 'الدورات' },
                { v: 'lessons', icon: PlayCircle, label: 'المحاضرات والفيديو' },
                { v: 'questions', icon: FileQuestion, label: 'الأسئلة والاختبارات' },
                { v: 'certificates', icon: Award, label: 'الشهادات' },
                { v: 'readings', icon: CheckCheck, label: 'تأكيدات القراءة' },
                { v: 'suggestions', icon: Lightbulb, label: 'الاقتراحات' },
                { v: 'onboarding', icon: GraduationCap, label: 'البرنامج التعريفي' },
                { v: 'library', icon: BookOpen, label: 'المكتبة الطبية' },
                { v: 'announcements', icon: Megaphone, label: 'الإعلانات' },
              ].map(t => (
                <TabsTrigger key={t.v} value={t.v} className="gap-1.5 text-xs h-9">
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                  {t.v === 'suggestions' && suggestions.filter(s=>s.status==='pending').length > 0 &&
                    <span className="bg-destructive text-white text-[9px] rounded-full px-1.5">{suggestions.filter(s=>s.status==='pending').length}</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══════ COURSES ═══════ */}
            <TabsContent value="courses">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} className="pr-9 h-9" placeholder="بحث في الدورات..." />
                </div>
                <Button onClick={openAddCourse} className="bg-primary gap-1.5 h-9">
                  <Plus className="w-4 h-4" />إضافة دورة جديدة
                </Button>
              </div>
              <Card className="border-0 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/50">
                    <TableHead className="font-bold">اسم الدورة</TableHead>
                    <TableHead className="font-bold hidden sm:table-cell">الوصف</TableHead>
                    <TableHead className="font-bold text-center">المحاضرات</TableHead>
                    <TableHead className="font-bold text-center">الأسئلة</TableHead>
                    <TableHead className="font-bold text-center">إجراءات</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    : filteredCourses.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد دورات</TableCell></TableRow>
                    : filteredCourses.map(c => (
                      <TableRow key={c.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm">{c.title.split('|')[0].trim()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-xs truncate">{c.description}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">{lessons.filter(l=>l.course_id===c.id).length}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">{questions.filter(q=>q.course_id===c.id).length}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-blue-600" onClick={() => { setSelectedCourseForLesson(c.id); setActiveTab('lessons'); }}>
                              <PlayCircle className="w-3.5 h-3.5 ml-1" />فيديو
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-purple-600" onClick={() => { setSelectedCourseForQ(c.id); setActiveTab('questions'); }}>
                              <FileQuestion className="w-3.5 h-3.5 ml-1" />أسئلة
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditCourse(c)}>
                              <Edit className="w-3.5 h-3.5 text-amber-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteCourse(c.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* ═══════ LESSONS / VIDEO ═══════ */}
            <TabsContent value="lessons">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Select value={selectedCourseForLesson} onValueChange={setSelectedCourseForLesson}>
                  <SelectTrigger className="w-56 h-9 text-sm">
                    <SelectValue placeholder="فلتر حسب الدورة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">كل الدورات</SelectItem>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title.split('|')[0].trim()}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => openAddLesson(selectedCourseForLesson === '__all__' ? '' : selectedCourseForLesson)} className="bg-primary gap-1.5 h-9">
                  <Plus className="w-4 h-4" />إضافة محاضرة / فيديو
                </Button>
              </div>
              <div className="space-y-3">
                {loading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
                : filteredLessons.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="mb-3">لا توجد محاضرات بعد</p>
                    <Button onClick={() => openAddLesson(selectedCourseForLesson)} size="sm" className="gap-1.5"><Plus className="w-4 h-4" />أضف أول محاضرة</Button>
                  </div>
                ) : filteredLessons.map((l, idx) => {
                  const videoMatch = l.content?.match(/\[فيديو\]\s*(https?:\/\/\S+)/);
                  const hasVideo = !!videoMatch;
                  const courseName = courses.find(c => c.id === l.course_id)?.title?.split('|')[0] || '—';
                  return (
                    <Card key={l.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${hasVideo ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {hasVideo ? <PlayCircle className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{l.title}</span>
                              {hasVideo && <Badge className="text-[10px] bg-red-100 text-red-600 border-0">YouTube</Badge>}
                              <Badge variant="outline" className="text-[10px]">{courseName}</Badge>
                            </div>
                            {hasVideo && <p className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">{videoMatch?.[1]}</p>}
                            {!hasVideo && l.content && <p className="text-xs text-muted-foreground truncate mt-0.5">{l.content.slice(0,80)}</p>}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditLesson(l)}>
                              <Edit className="w-3.5 h-3.5 text-amber-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteLesson(l.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ═══════ QUESTIONS ═══════ */}
            <TabsContent value="questions">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Select value={selectedCourseForQ} onValueChange={setSelectedCourseForQ}>
                  <SelectTrigger className="w-56 h-9 text-sm">
                    <SelectValue placeholder="فلتر حسب الدورة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">كل الدورات</SelectItem>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title.split('|')[0].trim()}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => openAddQuestion(selectedCourseForQ === '__all__' ? '' : selectedCourseForQ)} className="bg-primary gap-1.5 h-9">
                  <Plus className="w-4 h-4" />إضافة سؤال
                </Button>
              </div>
              <div className="space-y-3">
                {loading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
                : filteredQuestions.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="mb-3">لا توجد أسئلة بعد</p>
                    <Button onClick={() => openAddQuestion(selectedCourseForQ)} size="sm" className="gap-1.5"><Plus className="w-4 h-4" />أضف أول سؤال</Button>
                  </div>
                ) : filteredQuestions.map((q, idx) => {
                  const parts = q.question.split('|||');
                  const courseName = courses.find(c => c.id === q.course_id)?.title?.split('|')[0] || '—';
                  return (
                    <Card key={q.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 shrink-0">{idx+1}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-semibold text-sm">{parts[0]}</span>
                              <Badge variant="outline" className="text-[10px]">{courseName}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {parts.slice(1,5).map((opt, i) => (
                                <div key={i} className={`text-xs px-2 py-1 rounded-lg ${i+1 === q.correct_answer ? 'bg-green-100 text-green-700 font-semibold' : 'bg-muted text-muted-foreground'}`}>
                                  {['أ','ب','ج','د'][i]}. {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditQuestion(q)}>
                              <Edit className="w-3.5 h-3.5 text-amber-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteQuestion(q.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ═══════ CERTIFICATES ═══════ */}
            <TabsContent value="certificates">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">الشهادات الصادرة ({certificates.length})</h2>
                <Button onClick={() => setShowCertForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5">
                  <Award className="w-4 h-4" />إصدار شهادة يدوياً
                </Button>
              </div>
              <Card className="border-0 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/50">
                    <TableHead className="font-bold">رقم الشهادة</TableHead>
                    <TableHead className="font-bold">الدورة</TableHead>
                    <TableHead className="font-bold">الدرجة</TableHead>
                    <TableHead className="font-bold hidden md:table-cell">تاريخ الإصدار</TableHead>
                    <TableHead className="font-bold text-center">عرض</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    : certificates.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد شهادات بعد</TableCell></TableRow>
                    : certificates.map(cert => (
                      <TableRow key={cert.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-xs text-primary">{cert.certificate_number || cert.id.slice(0,8)}</TableCell>
                        <TableCell className="text-sm">{cert.course?.title?.split('|')[0] || '—'}</TableCell>
                        <TableCell><Badge className={`text-xs border-0 ${cert.score>=90?'bg-green-100 text-green-700':cert.score>=70?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{cert.score}%</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{new Date(cert.issued_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate(`${ROUTE_PATHS.CERTIFICATE}/${cert.course_id}`)}>
                            <Eye className="w-3.5 h-3.5 text-primary" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* ═══════ READINGS ═══════ */}
            <TabsContent value="readings">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">تأكيدات القراءة ({readings.length})</h2>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="w-4 h-4" />تصدير Excel
                </Button>
              </div>
              <Card className="border-0 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/50">
                    <TableHead className="font-bold">اسم الموظف</TableHead>
                    <TableHead className="font-bold">القسم</TableHead>
                    <TableHead className="font-bold hidden sm:table-cell">الدورة / المقال</TableHead>
                    <TableHead className="font-bold hidden md:table-cell">التاريخ والوقت</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    : readings.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد تأكيدات بعد</TableCell></TableRow>
                    : readings.map(r => (
                      <TableRow key={r.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm">{r.employee_name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{r.department}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-xs truncate">{r.article_title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{new Date(r.confirmed_at).toLocaleString('ar-SA')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* ═══════ SUGGESTIONS ═══════ */}
            <TabsContent value="suggestions">
              <h2 className="font-bold text-lg mb-4">الاقتراحات ({suggestions.length})</h2>
              <div className="space-y-3">
                {loading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
                : suggestions.length === 0 ? <div className="text-center py-16 text-muted-foreground"><Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد اقتراحات بعد</p></div>
                : suggestions.map(s => (
                  <Card key={s.id} className={`border-0 shadow-sm border-r-4 ${s.status==='pending'?'border-r-amber-400':s.status==='implemented'?'border-r-green-500':'border-r-blue-400'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-bold text-sm">{s.employee_name}</span>
                            <Badge variant="outline" className="text-xs">{s.department}</Badge>
                            {s.category && <Badge className="text-xs bg-primary/10 text-primary border-0">{s.category}</Badge>}
                            <Badge className={`text-xs border-0 ${s.status==='pending'?'bg-amber-100 text-amber-700':s.status==='implemented'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>
                              {s.status==='pending'?'جديد':s.status==='implemented'?'✅ تم التطبيق':'تمت المراجعة'}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{s.suggestion}</p>
                          {s.email && <p className="text-xs text-muted-foreground mt-1" dir="ltr">{s.email}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateSuggestionStatus(s.id,'reviewed')}>مراجعة</Button>
                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => updateSuggestionStatus(s.id,'implemented')}>تم ✅</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ═══════ ONBOARDING ═══════ */}
            <TabsContent value="onboarding">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {(() => {
                  const students = obUsers.filter(u => u.role !== 'admin' && u.email !== 'admin@edumk-mch.com');
                  const completed = students.filter(u => u.onboarding_completed);
                  const pending = students.filter(u => !u.onboarding_completed);
                  const avg = completed.length > 0 ? Math.round(completed.reduce((s, u) => s + (Number(u.onboarding_score) || 0), 0) / completed.length) : 0;
                  return (
                    <>
                      <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                        <Users className="w-5 h-5 text-primary mx-auto mb-1.5" />
                        <div className="text-xl font-extrabold">{students.length}</div>
                        <div className="text-[10px] text-muted-foreground">إجمالي المستخدمين</div>
                      </CardContent></Card>
                      <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1.5" />
                        <div className="text-xl font-extrabold text-green-700">{completed.length}</div>
                        <div className="text-[10px] text-muted-foreground">أكملوا البرنامج</div>
                      </CardContent></Card>
                      <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                        <Loader2 className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                        <div className="text-xl font-extrabold text-amber-700">{pending.length}</div>
                        <div className="text-[10px] text-muted-foreground">لم يُكملوا بعد</div>
                      </CardContent></Card>
                      <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                        <Star className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                        <div className="text-xl font-extrabold">{avg}%</div>
                        <div className="text-[10px] text-muted-foreground">متوسط الدرجات</div>
                      </CardContent></Card>
                    </>
                  );
                })()}
              </div>

              {/* Modules overview */}
              <Card className="border-0 shadow-sm mb-5">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />وحدات البرنامج ({obModules.length})
                </CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {obModules.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">{m.order_index}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{m.title_ar}</span>
                            {m.requires_policy_acceptance && <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">📋 سياسات</Badge>}
                            <Badge variant="outline" className="text-[10px]">{m.video_duration_minutes || 0} دقيقة</Badge>
                            <Badge variant="outline" className="text-[10px]">درجة النجاح: {m.passing_score}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{m.description_ar}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary">
                    💡 لإضافة أو تعديل وحدات البرنامج التعريفي أو أسئلته، يُرجى إدارتها مباشرة من قاعدة بيانات Supabase (جداول: onboarding_modules, onboarding_questions)
                  </div>
                </CardContent>
              </Card>

              {/* Users progress table */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />حالة إكمال المستخدمين
                </CardTitle></CardHeader>
                <Table>
                  <TableHeader><TableRow className="bg-muted/50">
                    <TableHead className="font-bold">الاسم</TableHead>
                    <TableHead className="font-bold hidden sm:table-cell">البريد</TableHead>
                    <TableHead className="font-bold text-center">الحالة</TableHead>
                    <TableHead className="font-bold text-center hidden md:table-cell">الدرجة</TableHead>
                    <TableHead className="font-bold hidden lg:table-cell">تاريخ الإكمال</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    : obUsers.filter(u => u.role !== 'admin' && u.email !== 'admin@edumk-mch.com').length === 0
                      ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد مستخدمون</TableCell></TableRow>
                    : obUsers.filter(u => u.role !== 'admin' && u.email !== 'admin@edumk-mch.com').map(u => (
                      <TableRow key={u.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm">{u.full_name || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{u.email}</TableCell>
                        <TableCell className="text-center">
                          {u.onboarding_completed
                            ? <Badge className="bg-green-100 text-green-700 border-0 text-xs">✅ مكتمل</Badge>
                            : <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">⏳ قيد التنفيذ</Badge>}
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          {u.onboarding_score != null
                            ? <span className="text-sm font-bold text-primary">{Math.round(Number(u.onboarding_score))}%</span>
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {u.onboarding_completed_at ? new Date(u.onboarding_completed_at).toLocaleDateString('ar-SA') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* ═══════ LIBRARY ═══════ */}
            <TabsContent value="library">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />المكتبة الطبية ({libItems.length})
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate('/library')}>
                    <Eye className="w-3.5 h-3.5" />معاينة
                  </Button>
                  <Button size="sm" className="bg-primary gap-1.5 text-xs" onClick={() => { setEditingLibItem(null); setLibForm({title_ar:'',title_en:'',description_ar:'',content_type:'protocol',category_id:'',authors:'',year:'',journal:'',doi:'',source_url:'',file_url:'',video_url:'',keywords_ar:'',language:'ar',difficulty_level:'intermediate',is_published:true,is_featured:false}); setShowLibForm(true); }}>
                    <Plus className="w-4 h-4" />إضافة مرجع
                  </Button>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  {label:'إجمالي',value:libItems.length,color:'text-primary'},
                  {label:'منشور',value:libItems.filter(l=>l.is_published).length,color:'text-green-600'},
                  {label:'مميز',value:libItems.filter(l=>l.is_featured).length,color:'text-amber-600'},
                  {label:'مشاهدات',value:libItems.reduce((s,l)=>s+l.view_count,0),color:'text-teal-600'},
                ].map(s => (
                  <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                    <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </CardContent></Card>
                ))}
              </div>
              <Card className="border-0 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-muted/50">
                    <TableHead className="font-bold">العنوان</TableHead>
                    <TableHead className="font-bold hidden sm:table-cell">النوع</TableHead>
                    <TableHead className="font-bold hidden md:table-cell">التصنيف</TableHead>
                    <TableHead className="font-bold text-center hidden md:table-cell">مشاهدات</TableHead>
                    <TableHead className="font-bold text-center">الحالة</TableHead>
                    <TableHead className="font-bold text-center">إجراءات</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                    : libItems.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد عناصر بعد</TableCell></TableRow>
                    : libItems.map(item => (
                      <TableRow key={item.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="font-medium text-xs sm:text-sm">{item.title_ar}</div>
                          {item.title_en && <div className="text-[10px] text-muted-foreground" dir="ltr">{item.title_en}</div>}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-[10px]">{item.content_type}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {(item.category as {name_ar?:string;icon?:string} | undefined)?.icon} {(item.category as {name_ar?:string;icon?:string} | undefined)?.name_ar || '—'}
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          <span className="text-xs">{item.view_count}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-0.5 items-center">
                            {item.is_published ? <Badge className="bg-green-100 text-green-700 border-0 text-[9px]">منشور</Badge> : <Badge variant="outline" className="text-[9px]">مسودة</Badge>}
                            {item.is_featured && <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px]">مميز</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate(`/library/item/${item.id}`)}>
                              <Eye className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                              setEditingLibItem(item);
                              setLibForm({
                                title_ar: item.title_ar || '', title_en: item.title_en || '',
                                description_ar: '', content_type: item.content_type,
                                category_id: item.category_id || '', authors: '',
                                year: String(item.year || ''), journal: '', doi: '', source_url: '',
                                file_url: '', video_url: '', keywords_ar: '', language: 'ar',
                                difficulty_level: 'intermediate', is_published: item.is_published,
                                is_featured: item.is_featured,
                              });
                              setShowLibForm(true);
                            }}>
                              <Edit className="w-3.5 h-3.5 text-amber-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={async () => {
                              if (!confirm('حذف هذا المرجع؟')) return;
                              await supabase.from('medical_library').delete().eq('id', item.id);
                              loadData();
                            }}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* ═══════ ANNOUNCEMENTS ═══════ */}
            <TabsContent value="announcements">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="text-base font-bold flex items-center gap-2 flex-1" style={{color:'var(--heading-color)'}}>
                  <Megaphone className="w-5 h-5" style={{color:'var(--moonstone-600)'}} />الإعلانات ({announcements.length})
                </h3>
                <Button onClick={()=>{setEditingAnn(null);setAnnForm({title_ar:'',content_ar:'',priority:'normal',department:'',author_name:'',is_pinned:false,publish_date:new Date().toISOString().split('T')[0],expiry_date:''});setShowAnnForm(true);}} className="gap-1.5 h-9" style={{background:'var(--moonstone-500)'}}>
                  <Plus className="w-4 h-4"/>إضافة إعلان
                </Button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  {label:'الكل',value:announcements.length,color:'var(--moonstone-600)',bg:'var(--moonstone-50)'},
                  {label:'مثبّتة',value:announcements.filter(a=>a.is_pinned).length,color:'var(--vanilla-700)',bg:'var(--vanilla-100)'},
                  {label:'عاجل',value:announcements.filter(a=>a.priority==='urgent').length,color:'#DC2626',bg:'rgba(220,38,38,0.08)'},
                  {label:'نشطة',value:announcements.filter(a=>a.is_active).length,color:'var(--success)',bg:'rgba(5,150,105,0.08)'},
                ].map(s=>(
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{background:s.bg,border:`1px solid ${s.color}22`}}>
                    <div className="text-xl font-bold" style={{color:s.color}}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--neutral-500)'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* List */}
              <div className="space-y-3">
                {announcements.length===0 ? (
                  <div className="text-center py-10 rounded-2xl" style={{background:'var(--neutral-50)',border:'1px solid var(--neutral-200)'}}>
                    <Megaphone className="w-10 h-10 mx-auto mb-2" style={{color:'var(--neutral-300)'}}/>
                    <p className="text-sm" style={{color:'var(--neutral-500)'}}>لا توجد إعلانات بعد</p>
                  </div>
                ) : announcements.map(ann=>{
                  const PCFG:{[k:string]:{label:string;color:string;bg:string}} = {
                    urgent:{label:'عاجل',color:'#DC2626',bg:'rgba(220,38,38,0.08)'},
                    high:{label:'مهم',color:'#D97706',bg:'rgba(217,119,6,0.08)'},
                    normal:{label:'عادي',color:'var(--moonstone-600)',bg:'var(--moonstone-50)'},
                    info:{label:'معلومة',color:'var(--plum-700)',bg:'var(--plum-50)'},
                  };
                  const p=PCFG[ann.priority]||PCFG.normal;
                  return (
                    <div key={ann.id} className="rounded-2xl p-4 flex items-start gap-4" style={{background:'var(--neutral-0)',border:'1px solid var(--neutral-200)',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-1.5">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{background:p.color}}>{p.label}</span>
                          {ann.is_pinned&&<span className="text-xs px-2.5 py-0.5 rounded-full" style={{background:'var(--vanilla-100)',color:'var(--vanilla-800)',border:'1px solid var(--vanilla-300)'}}>📌 مثبّت</span>}
                          {ann.department&&<span className="text-xs px-2.5 py-0.5 rounded-full" style={{background:'var(--neutral-100)',color:'var(--neutral-600)'}}>{ann.department}</span>}
                          <span className={`text-xs px-2.5 py-0.5 rounded-full ${ann.is_active?'':'opacity-50'}`} style={{background:ann.is_active?'rgba(5,150,105,0.1)':'rgba(0,0,0,0.05)',color:ann.is_active?'var(--success)':'var(--neutral-500)'}}>{ann.is_active?'نشط':'موقوف'}</span>
                        </div>
                        <h4 className="font-bold text-sm" style={{color:'var(--heading-color)'}}>{ann.title_ar}</h4>
                        <p className="text-xs mt-1 line-clamp-2" style={{color:'var(--neutral-500)'}}>{ann.content_ar}</p>
                        <p className="text-xs mt-1.5" style={{color:'var(--neutral-400)'}}>📅 {ann.publish_date}{ann.author_name&&` · ${ann.author_name}`}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={()=>{setEditingAnn(ann);setAnnForm({title_ar:ann.title_ar,content_ar:ann.content_ar,priority:ann.priority,department:ann.department||'',author_name:ann.author_name||'',is_pinned:ann.is_pinned,publish_date:ann.publish_date,expiry_date:ann.expiry_date||''});setShowAnnForm(true);}}>
                          <Edit className="w-3.5 h-3.5"/>
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive" onClick={async()=>{if(!confirm('حذف هذا الإعلان؟'))return;await supabase.from('announcements').delete().eq('id',ann.id);loadData();}}>
                          <Trash2 className="w-3.5 h-3.5"/>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Dialog */}
              <Dialog open={showAnnForm} onOpenChange={setShowAnnForm}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
                  <DialogHeader><DialogTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" style={{color:'var(--moonstone-600)'}}/>{editingAnn?'تعديل الإعلان':'إضافة إعلان جديد'}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5"><Label>عنوان الإعلان *</Label><Input value={annForm.title_ar} onChange={e=>setAnnForm(p=>({...p,title_ar:e.target.value}))} placeholder="عنوان الإعلان بالعربية" /></div>
                    <div className="space-y-1.5"><Label>محتوى الإعلان *</Label><Textarea value={annForm.content_ar} onChange={e=>setAnnForm(p=>({...p,content_ar:e.target.value}))} placeholder="تفاصيل الإعلان..." rows={4} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>الأولوية</Label>
                        <Select value={annForm.priority} onValueChange={v=>setAnnForm(p=>({...p,priority:v}))}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">🔴 عاجل</SelectItem>
                            <SelectItem value="high">🟠 مهم</SelectItem>
                            <SelectItem value="normal">🔵 عادي</SelectItem>
                            <SelectItem value="info">🟣 معلومة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label>القسم</Label>
                        <Select value={annForm.department||'__none__'} onValueChange={v=>setAnnForm(p=>({...p,department:v==='__none__'?'':v}))}>
                          <SelectTrigger><SelectValue placeholder="اختر القسم"/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— لا يوجد —</SelectItem>
                            {['الجودة وسلامة المرضى','الشؤون الأكاديمية والتدريب','تقنية المعلومات','الموارد البشرية','التمريض','الطب','الإدارة العامة'].map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>اسم الجهة / الكاتب</Label><Input value={annForm.author_name} onChange={e=>setAnnForm(p=>({...p,author_name:e.target.value}))} placeholder="مثال: إدارة التدريب" /></div>
                      <div className="space-y-1.5"><Label>تاريخ النشر</Label><Input type="date" value={annForm.publish_date} onChange={e=>setAnnForm(p=>({...p,publish_date:e.target.value}))} dir="ltr"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>تاريخ انتهاء الإعلان (اختياري)</Label><Input type="date" value={annForm.expiry_date} onChange={e=>setAnnForm(p=>({...p,expiry_date:e.target.value}))} dir="ltr"/></div>
                      <div className="flex items-center gap-3 pt-6"><input type="checkbox" id="pin_chk" checked={annForm.is_pinned} onChange={e=>setAnnForm(p=>({...p,is_pinned:e.target.checked}))} className="w-4 h-4 rounded"/><Label htmlFor="pin_chk">📌 تثبيت الإعلان</Label></div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={()=>setShowAnnForm(false)}>إلغاء</Button>
                    <Button disabled={saving||!annForm.title_ar||!annForm.content_ar} onClick={async()=>{
                      setSaving(true);
                      const payload={title_ar:annForm.title_ar,content_ar:annForm.content_ar,priority:annForm.priority,department:annForm.department||null,author_name:annForm.author_name||null,is_pinned:annForm.is_pinned,is_active:true,publish_date:annForm.publish_date,expiry_date:annForm.expiry_date||null};
                      if(editingAnn){await supabase.from('announcements').update(payload).eq('id',editingAnn.id);}
                      else{await supabase.from('announcements').insert(payload);}
                      setSaving(false);setShowAnnForm(false);loadData();
                    }} style={{background:'var(--moonstone-500)'}} className="text-white gap-1.5">
                      {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}{editingAnn?'حفظ التعديلات':'نشر الإعلان'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ═══ LIBRARY FORM DIALOG ═══ */}
      <Dialog open={showLibForm} onOpenChange={setShowLibForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {editingLibItem ? 'تعديل المرجع' : 'إضافة مرجع جديد للمكتبة'}
          </DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Step 1: Basic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>العنوان بالعربي *</Label>
                <Input value={libForm.title_ar} onChange={e=>setLibForm(p=>({...p,title_ar:e.target.value}))} placeholder="عنوان المرجع" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>العنوان بالإنجليزي</Label>
                <Input value={libForm.title_en} onChange={e=>setLibForm(p=>({...p,title_en:e.target.value}))} placeholder="Title in English" dir="ltr" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>الوصف</Label>
                <Textarea value={libForm.description_ar} onChange={e=>setLibForm(p=>({...p,description_ar:e.target.value}))} rows={2} placeholder="وصف مختصر..." />
              </div>
              <div className="space-y-1.5">
                <Label>نوع المحتوى *</Label>
                <Select value={libForm.content_type} onValueChange={v=>setLibForm(p=>({...p,content_type:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[['protocol','📋 بروتوكول'],['guideline','📘 إرشادات'],['research_paper','🔬 بحث علمي'],['book','📕 كتاب'],['video','🎥 فيديو'],['presentation','📊 عرض'],['article','📰 مقالة'],['reference','📚 مرجع'],['case_study','🩺 حالة دراسية'],['webinar','💻 ندوة']].map(([v,l])=>(
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>التصنيف</Label>
                <Select value={libForm.category_id || '__none__'} onValueChange={v=>setLibForm(p=>({...p,category_id:v==='__none__'?'':v}))}>
                  <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">بدون تصنيف</SelectItem>
                    {libCategories.map(c=><SelectItem key={c.id} value={c.id}>{c.icon} {c.name_ar}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Step 2: Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>المؤلفون (مفصولون بفاصلة)</Label>
                <Input value={libForm.authors} onChange={e=>setLibForm(p=>({...p,authors:e.target.value}))} placeholder="د. محمد، د. سارة" />
              </div>
              <div className="space-y-1.5">
                <Label>السنة</Label>
                <Input type="number" value={libForm.year} onChange={e=>setLibForm(p=>({...p,year:e.target.value}))} placeholder="2025" />
              </div>
              <div className="space-y-1.5">
                <Label>المجلة / المصدر</Label>
                <Input value={libForm.journal} onChange={e=>setLibForm(p=>({...p,journal:e.target.value}))} placeholder="WHO Guidelines" />
              </div>
              <div className="space-y-1.5">
                <Label>اللغة</Label>
                <Select value={libForm.language} onValueChange={v=>setLibForm(p=>({...p,language:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">عربي</SelectItem>
                    <SelectItem value="en">إنجليزي</SelectItem>
                    <SelectItem value="both">كلاهما</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>رابط الملف (PDF)</Label>
                <Input value={libForm.file_url} onChange={e=>setLibForm(p=>({...p,file_url:e.target.value}))} placeholder="https://..." dir="ltr" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>رابط الفيديو (YouTube/Vimeo)</Label>
                <Input value={libForm.video_url} onChange={e=>setLibForm(p=>({...p,video_url:e.target.value}))} placeholder="https://youtube.com/..." dir="ltr" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>الكلمات المفتاحية (مفصولة بفاصلة)</Label>
                <Input value={libForm.keywords_ar} onChange={e=>setLibForm(p=>({...p,keywords_ar:e.target.value}))} placeholder="ولادة، بروتوكول، سلامة" />
              </div>
            </div>
            {/* Step 3: Publish */}
            <div className="flex items-center gap-6 p-3 bg-muted/30 rounded-xl flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={libForm.is_published} onChange={e=>setLibForm(p=>({...p,is_published:e.target.checked}))} className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">نشر فوراً</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={libForm.is_featured} onChange={e=>setLibForm(p=>({...p,is_featured:e.target.checked}))} className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">⭐ محتوى مميز</span>
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setShowLibForm(false)}>إلغاء</Button>
            <Button disabled={saving||!libForm.title_ar.trim()} className="bg-primary gap-1.5" onClick={async () => {
              if (!libForm.title_ar.trim()) return;
              setSaving(true);
              const payload = {
                title_ar: libForm.title_ar, title_en: libForm.title_en || null,
                description_ar: libForm.description_ar || null,
                content_type: libForm.content_type,
                category_id: libForm.category_id || null,
                authors: libForm.authors ? libForm.authors.split('،').map(a=>a.trim()) : [],
                year: libForm.year ? parseInt(libForm.year) : null,
                journal: libForm.journal || null, doi: libForm.doi || null,
                source_url: libForm.source_url || null,
                file_url: libForm.file_url || null,
                video_url: libForm.video_url ? toEmbed(libForm.video_url) : null,
                keywords_ar: libForm.keywords_ar ? libForm.keywords_ar.split('،').map(k=>k.trim()) : [],
                language: libForm.language, difficulty_level: libForm.difficulty_level,
                is_published: libForm.is_published, is_featured: libForm.is_featured,
              };
              if (editingLibItem) { await supabase.from('medical_library').update(payload).eq('id', editingLibItem.id); }
              else { await supabase.from('medical_library').insert(payload); }
              setSaving(false); setShowLibForm(false); loadData();
            }}>
              {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />{editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>اسم الدورة بالعربي *</Label>
              <Input value={courseForm.title_ar} onChange={e=>setCourseForm(p=>({...p,title_ar:e.target.value}))} placeholder="مثال: أساسيات رعاية المواليد" />
            </div>
            <div className="space-y-1.5">
              <Label>اسم الدورة بالإنجليزي (اختياري)</Label>
              <Input value={courseForm.title_en} onChange={e=>setCourseForm(p=>({...p,title_en:e.target.value}))} placeholder="Neonatal Care Basics" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>وصف الدورة</Label>
              <Textarea value={courseForm.description} onChange={e=>setCourseForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="وصف مختصر للدورة وأهدافها..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setShowCourseForm(false)}>إلغاء</Button>
            <Button onClick={saveCourse} disabled={saving||!courseForm.title_ar.trim()} className="bg-primary gap-1.5">
              {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ LESSON DIALOG ═══ */}
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><PlayCircle className="w-5 h-5 text-primary" />{editingLesson ? 'تعديل المحاضرة' : 'إضافة محاضرة / فيديو'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الدورة *</Label>
              <Select value={lessonForm.course_id} onValueChange={v=>setLessonForm(p=>({...p,course_id:v}))}>
                <SelectTrigger><SelectValue placeholder="اختر الدورة" /></SelectTrigger>
                <SelectContent>{courses.map(c=><SelectItem key={c.id} value={c.id}>{c.title.split('|')[0].trim()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>عنوان المحاضرة *</Label>
              <Input value={lessonForm.title} onChange={e=>setLessonForm(p=>({...p,title:e.target.value}))} placeholder="مثال: المحاضرة 1 — مقدمة في رعاية المواليد" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2"><Video className="w-4 h-4 text-red-500" />رابط الفيديو (YouTube / Vimeo)</Label>
              <Input value={lessonForm.video_url} onChange={e=>setLessonForm(p=>({...p,video_url:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." dir="ltr" />
              <p className="text-xs text-muted-foreground">الصق رابط YouTube أو Vimeo مباشرة</p>
            </div>
            <div className="space-y-1.5">
              <Label>محتوى المحاضرة النصي (اختياري)</Label>
              <Textarea value={lessonForm.content} onChange={e=>setLessonForm(p=>({...p,content:e.target.value}))} rows={3} placeholder="اكتب ملاحظات أو ملخص المحاضرة هنا..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setShowLessonForm(false)}>إلغاء</Button>
            <Button onClick={saveLesson} disabled={saving||!lessonForm.title.trim()||!lessonForm.course_id} className="bg-primary gap-1.5">
              {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ QUESTION DIALOG ═══ */}
      <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileQuestion className="w-5 h-5 text-primary" />{editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الدورة *</Label>
              <Select value={qForm.course_id} onValueChange={v=>setQForm(p=>({...p,course_id:v}))}>
                <SelectTrigger><SelectValue placeholder="اختر الدورة" /></SelectTrigger>
                <SelectContent>{courses.map(c=><SelectItem key={c.id} value={c.id}>{c.title.split('|')[0].trim()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>نص السؤال *</Label>
              <Textarea value={qForm.text} onChange={e=>setQForm(p=>({...p,text:e.target.value}))} rows={2} placeholder="اكتب السؤال هنا..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['opt1','opt2','opt3','opt4'] as const).map((k,i)=>(
                <div key={k} className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${parseInt(qForm.correct)===i+1?'bg-green-500 text-white':'bg-muted text-muted-foreground'}`}>{['أ','ب','ج','د'][i]}</span>
                    الخيار {['الأول','الثاني','الثالث','الرابع'][i]} {i<2?'*':''}
                  </Label>
                  <Input value={qForm[k]} onChange={e=>setQForm(p=>({...p,[k]:e.target.value}))} placeholder={`الخيار ${i+1}`} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>الإجابة الصحيحة *</Label>
              <Select value={qForm.correct} onValueChange={v=>setQForm(p=>({...p,correct:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">أ — {qForm.opt1 || 'الخيار الأول'}</SelectItem>
                  <SelectItem value="2">ب — {qForm.opt2 || 'الخيار الثاني'}</SelectItem>
                  <SelectItem value="3">ج — {qForm.opt3 || 'الخيار الثالث'}</SelectItem>
                  <SelectItem value="4">د — {qForm.opt4 || 'الخيار الرابع'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setShowQuestionForm(false)}>إلغاء</Button>
            <Button onClick={saveQuestion} disabled={saving||!qForm.text.trim()||!qForm.course_id||!qForm.opt1||!qForm.opt2} className="bg-primary gap-1.5">
              {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ CERTIFICATE DIALOG ═══ */}
      <Dialog open={showCertForm} onOpenChange={setShowCertForm}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-amber-600" />إصدار شهادة يدوياً</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
              ⚠️ يمكنك إصدار شهادة لأي موظف بتحديد التفاصيل يدوياً
            </div>
            <div className="space-y-1.5">
              <Label>اسم الموظف *</Label>
              <Input value={certForm.employee_name} onChange={e=>setCertForm(p=>({...p,employee_name:e.target.value}))} placeholder="الاسم الكامل للموظف" />
            </div>
            <div className="space-y-1.5">
              <Label>الدورة *</Label>
              <Select value={certForm.course_id} onValueChange={v=>setCertForm(p=>({...p,course_id:v}))}>
                <SelectTrigger><SelectValue placeholder="اختر الدورة" /></SelectTrigger>
                <SelectContent>{courses.map(c=><SelectItem key={c.id} value={c.id}>{c.title.split('|')[0].trim()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الدرجة المحققة (%)</Label>
                <Input type="number" min="0" max="100" value={certForm.score} onChange={e=>setCertForm(p=>({...p,score:e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <Label>تاريخ الإصدار</Label>
                <Input type="date" value={certForm.issued_at} onChange={e=>setCertForm(p=>({...p,issued_at:e.target.value}))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>رقم الشهادة (اختياري — سيُولَّد تلقائياً)</Label>
              <Input value={certForm.cert_number} onChange={e=>setCertForm(p=>({...p,cert_number:e.target.value}))} placeholder="MCH-2026-00001" dir="ltr" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setShowCertForm(false)}>إلغاء</Button>
            <Button onClick={issueCertificate} disabled={saving||!certForm.course_id||!certForm.employee_name} className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5">
              {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Award className="w-4 h-4"/>}إصدار الشهادة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
