import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Award, Clock, TrendingUp, Bell, Download, PlayCircle,
  CheckCircle2, BarChart2, GraduationCap, Calendar, User, Loader2,
  BookMarked
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import { MOCK_USER } from '@/data/index';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { getUserEnrollments, getUserCertificates } from '@/lib/supabase';

interface EnrollmentItem {
  id: string;
  course_id: string;
  is_completed?: boolean;
  progress_percentage?: number;
  course?: { id: string; title: string; title_ar?: string };
}

interface CertItem {
  id: string;
  course_id: string;
  score: number;
  issued_at: string;
  certificate_number?: string;
  course?: { title: string };
}

const STATIC_NOTIFICATIONS = [
  { id: 1, title: 'مرحباً بك في المنصة', msg: 'استعرض الدورات المتاحة وابدأ رحلتك التعليمية', time: 'اليوم', read: false },
  { id: 2, title: 'دورات جديدة متاحة', msg: 'تم إضافة دورات جديدة في التمريض والصيدلة', time: 'منذ يومين', read: true },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [certificates, setCertificates] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = user || MOCK_USER;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const [enrs, certs] = await Promise.all([
          getUserEnrollments(user.id) as Promise<EnrollmentItem[]>,
          getUserCertificates(user.id) as Promise<CertItem[]>,
        ]);
        setEnrollments(enrs || []);
        setCertificates(certs || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [user]);

  const displayName =
    (user as unknown as Record<string, unknown>)?.full_name as string ||
    ((user as unknown as Record<string, unknown>)?.user_metadata as Record<string, string> | undefined)?.full_name ||
    currentUser.full_name;

  const STATS = [
    {
      label: 'دوراتي',
      value: loading ? '...' : String(enrollments.length),
      icon: BookOpen,
      accentColor: 'var(--moonstone-600)',
      accentBg: 'var(--moonstone-50)',
    },
    {
      label: 'مكتملة',
      value: loading ? '...' : String(enrollments.filter(e => e.is_completed).length),
      icon: CheckCircle2,
      accentColor: 'var(--success)',
      accentBg: 'rgba(5,150,105,0.08)',
    },
    {
      label: 'شهاداتي',
      value: loading ? '...' : String(certificates.length),
      icon: Award,
      accentColor: 'var(--vanilla-700)',
      accentBg: 'var(--vanilla-100)',
    },
    {
      label: 'ساعات تدريبية',
      value: loading ? '...' : String(enrollments.length * 8),
      icon: Clock,
      accentColor: 'var(--plum-700)',
      accentBg: 'var(--plum-50)',
    },
  ];

  const QUICK_ACTIONS = [
    { label: 'استعرض الدورات',    icon: BookOpen,      path: ROUTE_PATHS.COURSES },
    { label: 'البرامج التدريبية', icon: Calendar,      path: ROUTE_PATHS.TRAINING },
    { label: 'المكتبة الطبية',   icon: BookMarked,    path: '/library' },
    { label: 'مكتبة البحوث',     icon: GraduationCap, path: ROUTE_PATHS.RESEARCH },
  ];

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen" style={{ background: 'var(--neutral-50)' }}>

        {/* ── HEADER BANNER ── */}
        <div
          className="py-10"
          style={{ background: 'linear-gradient(135deg, var(--plum-800) 0%, var(--plum-700) 50%, var(--moonstone-700) 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14" style={{ border: '2px solid rgba(255,255,255,0.4)' }}>
                <AvatarFallback
                  className="text-xl font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  {String(displayName || 'م').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm mb-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>مرحباً بك،</p>
                <h1 className="text-2xl font-bold text-white">{String(displayName || currentUser.full_name)}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--vanilla-200)' }}>
                  {user?.email || currentUser.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ── STATS CARDS ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {STATS.map(s => (
              <motion.div key={s.label} variants={staggerItem}>
                <div
                  className="rounded-2xl p-5 transition-all duration-200"
                  style={{
                    background: 'var(--neutral-0)',
                    border: '1px solid var(--neutral-200)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: s.accentBg }}
                    >
                      <s.icon className="w-5 h-5" style={{ color: s.accentColor }} />
                    </div>
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: s.accentColor }}>{s.value}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--neutral-500)' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="courses">
                <TabsList
                  className="mb-5 h-11 w-full"
                  style={{ background: 'var(--neutral-100)', border: '1px solid var(--neutral-200)' }}
                >
                  <TabsTrigger value="courses"      className="text-sm flex-1 data-[state=active]:text-white" style={{ '--tw-shadow': 'none' } as React.CSSProperties}>دوراتي</TabsTrigger>
                  <TabsTrigger value="certificates" className="text-sm flex-1 data-[state=active]:text-white">شهاداتي</TabsTrigger>
                  <TabsTrigger value="profile"      className="text-sm flex-1 data-[state=active]:text-white">ملفي</TabsTrigger>
                </TabsList>

                {/* ── Courses ── */}
                <TabsContent value="courses">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin me-2" style={{ color: 'var(--moonstone-500)' }} />
                      <span className="text-sm" style={{ color: 'var(--neutral-500)' }}>جاري التحميل...</span>
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--moonstone-50)' }}>
                        <BookOpen className="w-8 h-8" style={{ color: 'var(--moonstone-400)' }} />
                      </div>
                      <h3 className="font-bold mb-2" style={{ color: 'var(--neutral-800)' }}>لم تسجل في أي دورة بعد</h3>
                      <p className="text-sm mb-5" style={{ color: 'var(--neutral-500)' }}>استعرض الدورات المتاحة وابدأ رحلتك التعليمية</p>
                      <button
                        onClick={() => navigate(ROUTE_PATHS.COURSES)}
                        className="h-10 px-6 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'var(--btn-primary-bg)' }}
                      >
                        استعرض الدورات
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.map(en => {
                        const title = en.course?.title?.split('|')[0] || en.course?.title_ar || 'دورة طبية';
                        const progress = en.progress_percentage || 0;
                        return (
                          <div
                            key={en.id}
                            className="rounded-2xl p-4 transition-all duration-200"
                            style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                          >
                            <div className="flex gap-4">
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'linear-gradient(135deg, var(--moonstone-50) 0%, var(--plum-50) 100%)' }}
                              >
                                <BookOpen className="w-6 h-6" style={{ color: 'var(--moonstone-400)' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <h3 className="font-bold text-sm line-clamp-2" style={{ color: 'var(--neutral-800)' }}>{title}</h3>
                                  <span
                                    className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={
                                      en.is_completed
                                        ? { background: 'rgba(5,150,105,0.1)', color: 'var(--success)' }
                                        : { background: 'var(--moonstone-50)', color: 'var(--moonstone-700)' }
                                    }
                                  >
                                    {en.is_completed ? '✓ مكتمل' : 'جارٍ'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--neutral-200)' }}>
                                    <div
                                      className="h-1.5 rounded-full transition-all"
                                      style={{ width: `${progress}%`, background: 'var(--btn-primary-bg)' }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: 'var(--moonstone-600)' }}>{progress}%</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`${ROUTE_PATHS.COURSES}/${en.course_id}`)}
                                    className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors"
                                    style={{ borderColor: 'var(--moonstone-300)', color: 'var(--moonstone-700)' }}
                                  >
                                    <PlayCircle className="w-3 h-3" />متابعة
                                  </button>
                                  <button
                                    onClick={() => navigate(`${ROUTE_PATHS.ASSESSMENT}/${en.course_id}`)}
                                    className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1 text-white"
                                    style={{ background: 'var(--btn-primary-bg)' }}
                                  >
                                    <Award className="w-3 h-3" />الاختبار
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => navigate(ROUTE_PATHS.COURSES)}
                        className="w-full h-10 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-colors"
                        style={{ borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-50)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--moonstone-300)'; (e.currentTarget as HTMLElement).style.color = 'var(--moonstone-700)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-200)'; (e.currentTarget as HTMLElement).style.color = 'var(--neutral-600)'; }}
                      >
                        <BookOpen className="w-4 h-4" />استعرض المزيد
                      </button>
                    </div>
                  )}
                </TabsContent>

                {/* ── Certificates ── */}
                <TabsContent value="certificates">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin me-2" style={{ color: 'var(--moonstone-500)' }} />
                    </div>
                  ) : certificates.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--vanilla-100)' }}>
                        <Award className="w-8 h-8" style={{ color: 'var(--vanilla-700)' }} />
                      </div>
                      <h3 className="font-bold mb-2" style={{ color: 'var(--neutral-800)' }}>لا توجد شهادات بعد</h3>
                      <p className="text-sm mb-5" style={{ color: 'var(--neutral-500)' }}>أكمل دورة واجتز اختبارها للحصول على شهادتك المعتمدة</p>
                      <button
                        onClick={() => navigate(ROUTE_PATHS.COURSES)}
                        className="h-10 px-6 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'var(--btn-primary-bg)' }}
                      >
                        استعرض الدورات
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certificates.map(cert => (
                        <div
                          key={cert.id}
                          className="rounded-2xl overflow-hidden"
                          style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          {/* Top accent bar */}
                          <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--plum-700), var(--moonstone-500))' }} />
                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--vanilla-100)' }}>
                                <Award className="w-6 h-6" style={{ color: 'var(--vanilla-700)' }} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold mb-1" style={{ color: 'var(--neutral-800)' }}>
                                  {cert.course?.title?.split('|')[0] || 'دورة طبية'}
                                </h3>
                                <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: 'var(--neutral-500)' }}>
                                  <span>🏆 {cert.score}%</span>
                                  <span>📅 {new Date(cert.issued_at).toLocaleDateString('ar-SA')}</span>
                                  {cert.certificate_number && (
                                    <span className="font-mono">{cert.certificate_number}</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`${ROUTE_PATHS.CERTIFICATE}/${cert.course_id}`)}
                                    className="h-8 px-3 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
                                    style={{ background: 'var(--plum-700)' }}
                                  >
                                    <Award className="w-3 h-3" />عرض الشهادة
                                  </button>
                                  <button
                                    className="h-8 px-3 rounded-lg text-xs font-medium border flex items-center gap-1"
                                    style={{ borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
                                  >
                                    <Download className="w-3 h-3" />تحميل
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── Profile ── */}
                <TabsContent value="profile">
                  <div className="rounded-2xl p-6" style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)' }}>
                    <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--heading-color)' }}>
                      <User className="w-5 h-5" />بيانات الملف الشخصي
                    </h3>
                    {[
                      { label: 'الاسم الكامل',     value: String(displayName || currentUser.full_name) },
                      { label: 'البريد الإلكتروني', value: user?.email || currentUser.email },
                    ].map(field => (
                      <div
                        key={field.label}
                        className="flex justify-between items-center py-3"
                        style={{ borderBottom: '1px solid var(--neutral-100)' }}
                      >
                        <span className="text-sm" style={{ color: 'var(--neutral-500)' }}>{field.label}</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--neutral-800)' }}>{field.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-5">

              {/* Quick Actions */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--vanilla-50)', border: '1px solid var(--vanilla-200)' }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--neutral-700)' }}>
                  <BarChart2 className="w-4 h-4" style={{ color: 'var(--moonstone-600)' }} />
                  إجراءات سريعة
                </h3>
                <div className="space-y-2">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all duration-150"
                      style={{ color: 'var(--neutral-700)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-50)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--moonstone-700)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--neutral-700)';
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--moonstone-100)' }}>
                        <action.icon className="w-4 h-4" style={{ color: 'var(--moonstone-600)' }} />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--neutral-700)' }}>
                    <Bell className="w-4 h-4" style={{ color: 'var(--moonstone-600)' }} />الإشعارات
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
                    style={{ background: 'var(--error)' }}
                  >
                    {STATIC_NOTIFICATIONS.filter(n => !n.read).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {STATIC_NOTIFICATIONS.map(n => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl transition-colors"
                      style={
                        n.read
                          ? { background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)' }
                          : { background: 'var(--moonstone-50)', border: '1px solid var(--moonstone-200)' }
                      }
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: n.read ? 'var(--neutral-300)' : 'var(--moonstone-500)' }}
                        />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--neutral-800)' }}>{n.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--neutral-500)' }}>{n.msg}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--neutral-400)' }}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
