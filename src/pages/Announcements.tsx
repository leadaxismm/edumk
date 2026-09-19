import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Bell, AlertTriangle, Info, CheckCircle2,
  Calendar, ChevronDown, ChevronUp, Search, Filter,
  Building2, Loader2, X, Pin, Star
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';

/* ────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Announcement {
  id: string;
  title_ar: string;
  title_en?: string;
  content_ar: string;
  content_en?: string;
  priority: 'urgent' | 'high' | 'normal' | 'info';
  department?: string;
  is_pinned: boolean;
  is_active: boolean;
  publish_date: string;
  expiry_date?: string;
  created_at: string;
  author_name?: string;
}

/* ────────────────────────────────────────────
   PRIORITY CONFIG
───────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  urgent: {
    label: 'عاجل',
    icon: AlertTriangle,
    bg: 'rgba(220,38,38,0.08)',
    border: '#DC2626',
    color: '#DC2626',
    badgeBg: '#DC2626',
  },
  high: {
    label: 'مهم',
    icon: Bell,
    bg: 'rgba(217,119,6,0.08)',
    border: '#D97706',
    color: '#D97706',
    badgeBg: '#D97706',
  },
  normal: {
    label: 'عادي',
    icon: Megaphone,
    bg: 'rgba(58,168,193,0.06)',
    border: 'var(--moonstone-300)',
    color: 'var(--moonstone-600)',
    badgeBg: 'var(--moonstone-500)',
  },
  info: {
    label: 'معلومة',
    icon: Info,
    bg: 'rgba(91,55,88,0.06)',
    border: 'var(--plum-300)',
    color: 'var(--plum-700)',
    badgeBg: 'var(--plum-700)',
  },
};

/* fallback demo data */
const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title_ar: 'إعلان هام: تحديث بروتوكول سلامة المرضى',
    content_ar: 'يُرجى التكرم بالاطلاع على التحديثات الجديدة لبروتوكول سلامة المرضى الصادرة عن إدارة الجودة. سيكون هناك اجتماع توعوي يوم الثلاثاء القادم الساعة العاشرة صباحاً في قاعة المؤتمرات الرئيسية. حضور جميع العاملين في الأقسام الطبية إلزامي.',
    priority: 'urgent',
    department: 'الجودة وسلامة المرضى',
    is_pinned: true,
    is_active: true,
    publish_date: '2026-06-10',
    author_name: 'إدارة الجودة',
    created_at: '2026-06-10T08:00:00Z',
  },
  {
    id: '2',
    title_ar: 'دورة BLS المنتهية الصلاحية — تجديد إلزامي',
    content_ar: 'تنبّه إدارة الشؤون الأكاديمية والتدريب جميع الكوادر الطبية الذين تنتهي صلاحية شهادة BLS الخاصة بهم خلال الثلاثة أشهر القادمة بضرورة التسجيل في جلسات التجديد المتاحة عبر منصة EduMK. الموعد النهائي للتسجيل: 30 يونيو 2026.',
    priority: 'high',
    department: 'الشؤون الأكاديمية والتدريب',
    is_pinned: true,
    is_active: true,
    publish_date: '2026-06-08',
    author_name: 'إدارة التدريب',
    created_at: '2026-06-08T09:00:00Z',
  },
  {
    id: '3',
    title_ar: 'فتح باب التسجيل في برنامج ACLS — الدفعة الثالثة',
    content_ar: 'يسعد إدارة التدريب إعلان فتح باب التسجيل في دورة ACLS للدفعة الثالثة من عام 2026. تبدأ الدورة في الخامس عشر من يوليو، مدتها يومان، وتُعقد في مركز تدريب مستشفى الولادة والأطفال.',
    priority: 'normal',
    department: 'الشؤون الأكاديمية والتدريب',
    is_pinned: false,
    is_active: true,
    publish_date: '2026-06-05',
    author_name: 'إدارة التدريب',
    created_at: '2026-06-05T10:00:00Z',
  },
  {
    id: '4',
    title_ar: 'إطلاق النسخة المحدّثة من منصة EduMK',
    content_ar: 'يسعدنا الإعلان عن إطلاق النسخة الجديدة من منصة EduMK بتصميم بصري محدّث ومكتبة طبية شاملة. يرجى من جميع المستخدمين تحديث تطبيقاتهم أو مسح الكاش للحصول على أفضل تجربة.',
    priority: 'info',
    department: 'تقنية المعلومات',
    is_pinned: false,
    is_active: true,
    publish_date: '2026-06-01',
    author_name: 'فريق التقنية',
    created_at: '2026-06-01T08:00:00Z',
  },
  {
    id: '5',
    title_ar: 'اجتماع مجلس الجودة الشهري — يونيو 2026',
    content_ar: 'يُعقد اجتماع مجلس الجودة الشهري يوم الأحد الموافق 22 يونيو 2026 الساعة الثانية عشرة ظهراً في قاعة الاجتماعات الكبرى، الطابق الثاني. يُرجى التأكد من حضور مديري الأقسام.',
    priority: 'normal',
    department: 'الجودة وسلامة المرضى',
    is_pinned: false,
    is_active: true,
    publish_date: '2026-05-28',
    author_name: 'إدارة الجودة',
    created_at: '2026-05-28T11:00:00Z',
  },
];

const DEPTS_FILTER = ['الكل', 'الجودة وسلامة المرضى', 'الشؤون الأكاديمية والتدريب', 'تقنية المعلومات', 'الموارد البشرية', 'التمريض', 'الطب'];
const PRIORITY_FILTER = ['الكل', 'عاجل', 'مهم', 'عادي', 'معلومة'];

const PMAP: Record<string, Announcement['priority']> = {
  'عاجل': 'urgent', 'مهم': 'high', 'عادي': 'normal', 'معلومة': 'info',
};

/* ────────────────────────────────────────────
   CARD COMPONENT
───────────────────────────────────────────── */
function AnnouncementCard({ item }: { item: Announcement }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[item.priority];
  const Icon = cfg.icon;

  const isLong = item.content_ar.length > 200;
  const displayed = expanded || !isLong ? item.content_ar : item.content_ar.slice(0, 200) + '…';

  const dateStr = new Date(item.publish_date).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--neutral-0)',
        border: `1.5px solid ${cfg.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px rgba(0,0,0,0.08)`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
    >
      {/* Accent top strip */}
      <div className="h-1" style={{ background: cfg.badgeBg }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: cfg.bg }}>
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                style={{ background: cfg.badgeBg }}>
                {cfg.label}
              </span>
              {item.is_pinned && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: 'var(--vanilla-100)', color: 'var(--vanilla-800)', border: '1px solid var(--vanilla-300)' }}>
                  <Pin className="w-3 h-3" /> مثبّت
                </span>
              )}
              {item.department && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: 'var(--neutral-100)', color: 'var(--neutral-600)' }}>
                  {item.department}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--heading-color)' }}>
              {item.title_ar}
            </h3>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-3 ms-13" style={{ color: 'var(--neutral-600)' }}>
          {displayed}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-1 text-xs font-semibold mb-3 transition-colors ms-13"
            style={{ color: 'var(--moonstone-600)' }}
          >
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" />عرض أقل</> : <><ChevronDown className="w-3.5 h-3.5" />قراءة المزيد</>}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-3 text-xs"
          style={{ borderTop: '1px solid var(--neutral-100)', color: 'var(--neutral-400)' }}>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {dateStr}
          </span>
          {item.author_name && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {item.author_name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AnnouncementsPage() {
  const { lang } = useLang();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedDemo, setUsedDemo] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('الكل');
  const [priorityFilter, setPriorityFilter] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('is_pinned', { ascending: false })
          .order('publish_date', { ascending: false });

        if (error || !data?.length) {
          setItems(DEMO_ANNOUNCEMENTS);
          setUsedDemo(true);
        } else {
          setItems(data as Announcement[]);
        }
      } catch {
        setItems(DEMO_ANNOUNCEMENTS);
        setUsedDemo(true);
      }
      setLoading(false);
    })();
  }, []);

  /* ── Filter ── */
  const filtered = items.filter(a => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || a.title_ar.toLowerCase().includes(q) || a.content_ar.toLowerCase().includes(q);
    const matchDept = deptFilter === 'الكل' || a.department === deptFilter;
    const matchPriority = priorityFilter === 'الكل' || a.priority === PMAP[priorityFilter];
    return matchSearch && matchDept && matchPriority;
  });

  const pinned  = filtered.filter(a => a.is_pinned);
  const regular = filtered.filter(a => !a.is_pinned);

  const urgentCount = items.filter(a => a.priority === 'urgent' && a.is_active).length;

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen" style={{ background: 'var(--neutral-50)' }}>

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden py-12"
          style={{ background: 'linear-gradient(135deg, var(--plum-900) 0%, var(--plum-700) 55%, var(--moonstone-700) 100%)' }}>
          {/* Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {lang === 'ar' ? 'الإعلانات والتنبيهات' : 'Announcements'}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {lang === 'ar' ? 'مستشفى الولادة والأطفال — إعلانات رسمية وتنبيهات مهمة' : "Maternity & Children's Hospital — Official Announcements"}
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { v: items.length,    l: 'إجمالي الإعلانات' },
                { v: urgentCount,     l: 'إعلانات عاجلة',   urgent: true },
                { v: pinned.length,   l: 'مثبّتة' },
              ].map(s => (
                <div key={s.l} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="font-bold text-white text-lg">{s.v}</span>
                  <span className={s.urgent ? 'text-red-300' : ''}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SEARCH + FILTERS ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-5 relative z-10 mb-6">
          <div className="rounded-2xl p-4 shadow-md"
            style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)' }}>
            <div className="flex gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--neutral-400)', right: '12px' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث في الإعلانات..."
                  className="w-full h-10 rounded-xl text-sm outline-none pr-10 ps-4"
                  style={{ border: '1.5px solid var(--neutral-200)', background: 'var(--neutral-50)' }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--moonstone-500)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(58,168,193,0.10)'; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-200)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute top-1/2 -translate-y-1/2" style={{ left: '10px' }}>
                    <X className="w-3.5 h-3.5" style={{ color: 'var(--neutral-400)' }} />
                  </button>
                )}
              </div>
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(p => !p)}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium border transition-colors"
                style={showFilters
                  ? { background: 'var(--moonstone-50)', borderColor: 'var(--moonstone-400)', color: 'var(--moonstone-700)' }
                  : { borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
              >
                <Filter className="w-4 h-4" />
                فلترة
              </button>
            </div>

            {/* Expanded filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    style={{ borderTop: '1px solid var(--neutral-100)' }}>
                    {/* Dept filter */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--neutral-500)' }}>القسم</label>
                      <div className="flex flex-wrap gap-1.5">
                        {DEPTS_FILTER.map(d => (
                          <button key={d} onClick={() => setDeptFilter(d)}
                            className="text-xs px-3 py-1 rounded-full border transition-colors"
                            style={deptFilter === d
                              ? { background: 'var(--moonstone-500)', color: '#fff', borderColor: 'var(--moonstone-500)' }
                              : { borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Priority filter */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--neutral-500)' }}>الأولوية</label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRIORITY_FILTER.map(p => (
                          <button key={p} onClick={() => setPriorityFilter(p)}
                            className="text-xs px-3 py-1 rounded-full border transition-colors"
                            style={priorityFilter === p
                              ? { background: 'var(--plum-700)', color: '#fff', borderColor: 'var(--plum-700)' }
                              : { borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--moonstone-500)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-2xl"
              style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--neutral-100)' }}>
                <Megaphone className="w-8 h-8" style={{ color: 'var(--neutral-400)' }} />
              </div>
              <p className="font-semibold" style={{ color: 'var(--neutral-700)' }}>لا توجد إعلانات تطابق البحث</p>
              <p className="text-sm mt-1" style={{ color: 'var(--neutral-400)' }}>جرّب تغيير الفلاتر أو كلمة البحث</p>
            </div>
          ) : (
            <>
              {/* Demo notice */}
              {usedDemo && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                  style={{ background: 'var(--vanilla-50)', border: '1px solid var(--vanilla-300)', color: 'var(--vanilla-800)' }}>
                  <Info className="w-4 h-4 shrink-0" />
                  هذه إعلانات تجريبية — سيتم استبدالها بالإعلانات الرسمية من قاعدة البيانات عند الرفع.
                </div>
              )}

              {/* Pinned */}
              {pinned.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-4 h-4" style={{ color: 'var(--vanilla-700)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--neutral-600)' }}>مثبّتة</span>
                  </div>
                  <div className="space-y-3">
                    {pinned.map(a => <AnnouncementCard key={a.id} item={a} />)}
                  </div>
                </div>
              )}

              {/* Regular */}
              {regular.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Megaphone className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--neutral-600)' }}>جميع الإعلانات</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {regular.map(a => <AnnouncementCard key={a.id} item={a} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
