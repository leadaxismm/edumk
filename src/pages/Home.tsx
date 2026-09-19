import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Award, Users, Clock, ChevronLeft, ChevronRight,
  GraduationCap, Shield, Star, PlayCircle, Stethoscope,
  FlaskConical, HeartPulse, Building2, Loader2, BookMarked, Sparkles
} from 'lucide-react';
import Layout, { EduMKLogo } from '@/components/Layout';
import SuggestionsBox from '@/components/SuggestionsBox';
import { ROUTE_PATHS } from '@/lib/index';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useLang } from '@/hooks/useLang';
import { getCourses } from '@/lib/supabase';

function mapDbCourse(row: Record<string, unknown>, idx: number) {
  const title = (row.title as string) || '';
  const [title_ar, title_en = ''] = title.split('|').map((s: string) => s.trim());
  return {
    id: row.id as string,
    title_ar,
    title_en,
    description_ar: (row.description as string) || '',
    is_free: true,
    rating: +(4.5 + Math.random() * 0.4).toFixed(1),
    enrolled_count: Math.floor(200 + Math.random() * 1500),
    duration_hours: Math.floor(6 + idx * 2),
    total_lectures: Math.floor(5 + idx),
    level: ['مبتدئ', 'متوسط', 'متقدم'][idx % 3],
    specialization: {
      name_ar: ['التمريض', 'الطب', 'الإسعاف', 'الإدارة', 'الصيدلة', 'الأشعة'][idx % 6],
    },
    created_at: (row.created_at as string) || '',
  };
}

const FEATURES = [
  { icon: GraduationCap, title: 'تعليم طبي معتمد',   desc: 'شهادات معتمدة رسمياً من إدارة مستشفى الولادة والأطفال', accent: 'moonstone' },
  { icon: BookOpen,      title: 'محتوى تفاعلي',      desc: 'دورات فيديو ومحاضرات مسجلة متاحة في أي وقت ومكان',     accent: 'plum' },
  { icon: Award,         title: 'شهادات فورية',       desc: 'إصدار تلقائي للشهادة فور اجتياز الاختبار بنجاح',        accent: 'vanilla' },
  { icon: Shield,        title: 'معايير دولية',        desc: 'محتوى يتوافق مع معايير التعليم الطبي المستمر CME',       accent: 'moonstone' },
  { icon: Users,         title: 'لجميع الموظفين',     desc: 'أطباء، تمريض، فنيون، وإداريون — منصة موحدة للجميع',    accent: 'plum' },
  { icon: Clock,         title: 'تتبع التقدم',         desc: 'لوحة تحكم شخصية لمتابعة إنجازاتك ودوراتك المسجلة',      accent: 'vanilla' },
];

const ACCENT_STYLES: Record<string, { icon: string; badge: string; border: string }> = {
  moonstone: {
    icon:  'color: var(--moonstone-600); background: var(--moonstone-50)',
    badge: 'background: var(--moonstone-50); color: var(--moonstone-700); border: 1px solid var(--moonstone-200)',
    border: 'var(--moonstone-200)',
  },
  plum: {
    icon:  'color: var(--plum-700); background: var(--plum-50)',
    badge: 'background: var(--plum-50); color: var(--plum-700); border: 1px solid var(--plum-200)',
    border: 'var(--plum-200)',
  },
  vanilla: {
    icon:  'color: var(--vanilla-700); background: var(--vanilla-100)',
    badge: 'background: var(--vanilla-100); color: var(--vanilla-800); border: 1px solid var(--vanilla-200)',
    border: 'var(--vanilla-300)',
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { t, lang, isRTL } = useLang();
  const [courses, setCourses] = useState<ReturnType<typeof mapDbCourse>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCourses() as Record<string, unknown>[];
        if (data?.length) setCourses(data.slice(0, 6).map((r, i) => mapDbCourse(r, i)));
      } catch { /* fallback */ }
      setLoading(false);
    })();
  }, []);

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const STATS = [
    { value: '24+',    label: t.home_stat_courses,      icon: BookOpen },
    { value: '1,200+', label: t.home_stat_employees,    icon: Users },
    { value: '850+',   label: t.home_stat_certificates, icon: Award },
    { value: '480+',   label: t.home_stat_hours,        icon: Clock },
  ];

  return (
    <Layout>

      {/* ════════════ HERO ════════════ */}
      <section
        className="relative overflow-hidden min-h-[88vh] flex items-center"
        style={{ background: 'linear-gradient(160deg, var(--vanilla-50) 0%, var(--neutral-0) 35%, var(--moonstone-50) 100%)' }}
      >
        {/* Medical dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(58,168,193,0.12) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            opacity: 0.7,
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-10 end-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--moonstone-100) 0%, transparent 70%)', opacity: 0.6 }} />
        <div className="absolute bottom-0 start-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--plum-100) 0%, transparent 70%)', opacity: 0.4 }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Text */}
            <motion.div initial={{ opacity: 0, x: isRTL ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>

              {/* Hospital pill */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-medium"
                style={{ background: 'var(--plum-50)', color: 'var(--plum-700)', border: '1px solid var(--plum-200)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--plum-500)' }} />
                {t.hospital_dept}
              </div>

              <h1
                className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4"
                style={{ color: 'var(--heading-color)' }}
              >
                {t.home_hero_title}
              </h1>
              <p
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--subtitle-color)' }}
              >
                {t.home_hero_subtitle}
              </p>
              <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: 'var(--neutral-600)' }}>
                {t.home_hero_desc}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(ROUTE_PATHS.COURSES)}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-white transition-all"
                  style={{ background: 'var(--btn-primary-bg)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-700)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(58,168,193,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-500)'; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <BookOpen className="w-5 h-5" />
                  {t.home_hero_btn_courses}
                  <ArrowIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold transition-all"
                  style={{ border: '1.5px solid var(--plum-700)', color: 'var(--plum-700)', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--plum-50)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <GraduationCap className="w-5 h-5" />
                  {t.home_hero_btn_register}
                </button>
              </div>
            </motion.div>

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:block"
            >
              <div
                className="rounded-3xl p-8"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid var(--moonstone-200)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 40px rgba(58,168,193,0.12)',
                }}
              >
                {/* Logo row */}
                <div className="flex items-center gap-4 mb-6">
                  <img src="/edumk-logo.svg" alt="EduMK" className="w-14 h-14" />
                  <div>
                    <div className="text-xl font-extrabold flex items-center gap-1">
                      <span style={{ color: 'var(--heading-color)' }}>EduMK</span>
                      <span className="mx-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--vanilla-500)' }} />
                      <span style={{ color: 'var(--subtitle-color)' }}>MCH</span>
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--neutral-500)' }}>
                      {lang === 'ar' ? 'منصة التعليم الإلكتروني الطبي' : 'Medical E-Learning Platform'}
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {STATS.map(s => (
                    <div
                      key={s.label}
                      className="rounded-xl p-3 text-center"
                      style={{ background: 'var(--vanilla-50)', border: '1px solid var(--vanilla-200)' }}
                    >
                      <div className="text-2xl font-extrabold" style={{ color: 'var(--heading-color)' }}>{s.value}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--neutral-500)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CME badge */}
                <div
                  className="flex items-center gap-2 rounded-xl p-3"
                  style={{ background: 'var(--moonstone-50)', border: '1px solid var(--moonstone-200)' }}
                >
                  <Shield className="w-4 h-4 shrink-0" style={{ color: 'var(--subtitle-color)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--moonstone-700)' }}>
                    {lang === 'ar' ? 'معتمد للتعليم الطبي المستمر (CME)' : 'Accredited for CME — Continuous Medical Education'}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════ STATS BAR ════════════ */}
      <section style={{ background: 'var(--plum-700)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--vanilla-300)' }} />
                <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section className="py-20" style={{ background: 'var(--neutral-0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: 'var(--moonstone-50)', color: 'var(--moonstone-700)', border: '1px solid var(--moonstone-200)' }}
            >
              {lang === 'ar' ? 'مميزات المنصة' : 'Platform Features'}
            </span>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--heading-color)' }}>
              {t.home_features_title}
            </h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: 'var(--neutral-500)' }}>
              {lang === 'ar'
                ? 'صُممت EduMK خصيصاً لتلبية احتياجات التدريب والتطوير المهني لموظفي قطاع الصحة'
                : 'EduMK is purpose-built for healthcare professionals\'s training and development needs'}
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((f) => {
              const a = ACCENT_STYLES[f.accent];
              return (
                <motion.div key={f.title} variants={staggerItem}>
                  <div
                    className="rounded-2xl p-6 h-full transition-all duration-200 cursor-default"
                    style={{
                      background: 'var(--neutral-0)',
                      border: '1px solid var(--neutral-200)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(58,168,193,0.12)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.borderColor = a.border;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-200)';
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ ...Object.fromEntries(a.icon.split(';').map(s => { const [k, v] = s.trim().split(':'); return [k?.trim(), v?.trim()]; }).filter(([k]) => k)) }}
                    >
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold mb-2" style={{ color: 'var(--neutral-800)' }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral-500)' }}>{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ════════════ COURSES ════════════ */}
      <section className="py-20" style={{ background: 'var(--neutral-50)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{ background: 'var(--moonstone-50)', color: 'var(--moonstone-700)', border: '1px solid var(--moonstone-200)' }}
              >
                {lang === 'ar' ? 'الدورات التدريبية' : 'Training Courses'}
              </span>
              <h2 className="text-3xl font-extrabold" style={{ color: 'var(--heading-color)' }}>
                {t.home_courses_title}
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--neutral-500)' }}>{t.home_courses_subtitle}</p>
            </div>
            <button
              onClick={() => navigate(ROUTE_PATHS.COURSES)}
              className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border transition-all"
              style={{ borderColor: 'var(--moonstone-300)', color: 'var(--moonstone-600)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-50)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {t.home_view_all}
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--moonstone-500)' }} />
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {courses.map((course) => (
                <motion.div key={course.id} variants={staggerItem}>
                  <div
                    className="rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-200"
                    style={{
                      background: 'var(--neutral-0)',
                      border: '1px solid var(--neutral-200)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => navigate(`${ROUTE_PATHS.COURSES}/${course.id}`)}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(58,168,193,0.14)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--moonstone-300)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-200)';
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="h-36 flex items-center justify-center relative"
                      style={{ background: 'linear-gradient(135deg, var(--moonstone-50) 0%, var(--plum-50) 100%)' }}
                    >
                      <BookOpen className="w-12 h-12" style={{ color: 'var(--moonstone-300)' }} />
                      {/* Spec badge */}
                      <span
                        className="absolute top-3 end-3 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--btn-primary-bg)', color: '#fff' }}
                      >
                        {course.specialization.name_ar}
                      </span>
                      {/* Free */}
                      <span
                        className="absolute top-3 start-3 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--success)', color: '#fff' }}
                      >
                        {lang === 'ar' ? 'مجاني' : 'Free'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2" style={{ color: 'var(--neutral-800)' }}>
                        {lang === 'ar' ? course.title_ar : (course.title_en || course.title_ar)}
                      </h3>
                      <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: 'var(--neutral-500)' }}>
                        {course.description_ar}
                      </p>
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: '1px solid var(--neutral-100)' }}
                      >
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold" style={{ color: 'var(--neutral-700)' }}>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--neutral-400)' }}>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />{course.duration_hours}{lang === 'ar' ? 'س' : 'h'}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3" />{course.enrolled_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <button
              onClick={() => navigate(ROUTE_PATHS.COURSES)}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--btn-primary-bg)' }}
            >
              {t.home_view_all}<ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ SPECIALTIES ════════════ */}
      <section className="py-16" style={{ background: 'var(--neutral-0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--heading-color)' }}>
              {lang === 'ar' ? 'تصفح حسب التخصص' : 'Browse by Specialty'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              {lang === 'ar' ? 'اختر مسارك التدريبي المناسب لمهنتك' : 'Choose the training path that suits your profession'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: '🩺',
                title: 'تدريب الأطباء',
                desc: 'بروتوكولات طبية، حالات سريرية، التعليم الطبي المستمر CME للأطباء',
                tags: ['طب الأطفال', 'النساء والتوليد', 'طوارئ', 'تخدير'],
                style: { background: 'linear-gradient(135deg, var(--moonstone-700) 0%, var(--moonstone-500) 100%)' },
              },
              {
                icon: '🏥',
                title: 'تدريب التمريض',
                desc: 'مهارات تمريضية، رعاية المرضى، إجراءات التمريض الأساسية والمتقدمة',
                tags: ['تمريض حديثي الولادة', 'رعاية المرضى', 'إسعافات أولية'],
                style: { background: 'linear-gradient(135deg, var(--plum-800) 0%, var(--plum-600) 100%)' },
              },
              {
                icon: '📋',
                title: 'السياسات العامة',
                desc: 'سياسات المستشفى، اللوائح الإدارية، معايير السلامة وجودة الرعاية',
                tags: ['سلامة المرضى', 'جودة الرعاية', 'إدارة المخاطر'],
                style: { background: 'linear-gradient(135deg, var(--vanilla-700) 0%, var(--vanilla-500) 100%)' },
              },
            ].map((cat) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl p-6 cursor-pointer text-white transition-all duration-200"
                style={cat.style}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                {/* Decorative circle */}
                <div className="absolute top-0 end-0 w-28 h-28 rounded-full translate-x-8 -translate-y-8"
                  style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="relative z-10">
                  <span className="text-4xl mb-4 block">{cat.icon}</span>
                  <h3 className="text-xl font-extrabold mb-2">{cat.title}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>{cat.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    استعرض الدورات
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, var(--plum-900) 0%, var(--plum-700) 50%, var(--moonstone-700) 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <img src="/edumk-logo.svg" alt="EduMK" className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            {lang === 'ar' ? 'ابدأ مسيرتك التعليمية اليوم' : 'Start Your Learning Journey Today'}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {lang === 'ar'
              ? 'انضم إلى آلاف الموظفين في مستشفى الولادة والأطفال الذين طوّروا مهاراتهم المهنية عبر EduMK'
              : 'Join thousands of staff who have upgraded their professional skills through EduMK'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-bold text-white transition-all"
              style={{ background: 'var(--btn-primary-bg)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-400)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-500)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              <GraduationCap className="w-5 h-5" />
              {lang === 'ar' ? 'إنشاء حساب مجاني' : 'Create Free Account'}
            </button>
            <button
              onClick={() => navigate(ROUTE_PATHS.COURSES)}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-semibold transition-all"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', background: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <PlayCircle className="w-5 h-5" />
              {lang === 'ar' ? 'استعرض الدورات' : 'Browse Courses'}
            </button>
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <SuggestionsBox />
    </Layout>
  );
}
