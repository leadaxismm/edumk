import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Printer, Download, Shield, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { getUserCertificates, getCourseById } from '@/lib/supabase';
import { springPresets } from '@/lib/motion';

interface CertData {
  id: string;
  course_id?: string;
  score: number;
  issued_at: string;
  certificate_number?: string;
  course?: { title: string };
}

export default function CertificatePage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang, isRTL } = useLang();
  const [cert, setCert] = useState<CertData | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user || !courseId) { setLoading(false); return; }
      try {
        const [certs, courseData] = await Promise.all([
          getUserCertificates(user.id) as Promise<CertData[]>,
          getCourseById(courseId) as Promise<Record<string, unknown>>,
        ]);
        const found = certs.find((c: CertData) => c.course_id === courseId || !courseId) || certs[0];
        if (found) setCert(found);
        if (courseData?.title) {
          const title = (courseData.title as string).split('|')[0].trim();
          setCourseTitle(title);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [user, courseId]);

  const certNumber = cert?.certificate_number || `MCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
  const score = cert?.score ?? 85;
  const issuedDate = cert?.issued_at ? new Date(cert.issued_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const displayName = (user as unknown as Record<string, unknown>)?.full_name as string
    || ((user as unknown as Record<string, unknown>)?.user_metadata as Record<string, string> | undefined)?.full_name
    || (lang === 'ar' ? 'الموظف المتدرب' : 'Trained Employee');

  const title = courseTitle || cert?.course?.title?.split('|')[0] || (lang === 'ar' ? 'التعليم الطبي المستمر' : 'Continuous Medical Education');

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-muted/30 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.DASHBOARD)} className="gap-1.5 text-sm">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="w-4 h-4" />{t.cert_print}
              </Button>
              <Button size="sm" className="gap-1.5 bg-primary text-white">
                <Download className="w-4 h-4" />{t.cert_download}
              </Button>
            </div>
          </div>

          {/* CERTIFICATE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none" id="certificate-print">

            {/* Top Gold Bar */}
            <div className="h-3 bg-gradient-to-r from-[#1a3a5c] via-[#0d9488] to-[#1a3a5c]" />

            {/* Cert Body */}
            <div className="p-8 sm:p-12 relative"
              style={{ background: 'linear-gradient(135deg, #fefefe 0%, #f8faff 50%, #f0f7f6 100%)' }}>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <div className="text-[200px] font-black text-primary select-none">MCH</div>
              </div>

              {/* Corner Ornaments */}
              <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-primary/20 rounded-tr-2xl" />
              <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-primary/20 rounded-tl-2xl" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-primary/20 rounded-br-2xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-primary/20 rounded-bl-2xl" />

              <div className="relative z-10 text-center">
                {/* Header: Hospital + Platform */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <img src="/edumk-logo.svg" alt="EduMK" className="w-16 h-16" />
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="text-2xl font-extrabold text-[#1a3a5c] tracking-wide">EduMK</div>
                    <div className="text-sm text-[#0d9488] font-semibold">
                      {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lang === 'ar' ? 'إدارة الشؤون الأكاديمية والتدريب' : 'Academic Affairs & Training Dept.'}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1a3a5c]/30 to-transparent" />
                  <Award className="w-6 h-6 text-amber-500" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1a3a5c]/30 to-transparent" />
                </div>

                {/* CERTIFICATE TITLE */}
                <div className="text-4xl sm:text-5xl font-black text-[#1a3a5c] mb-1 tracking-wide"
                  style={{ fontFamily: lang === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>
                  {t.cert_title}
                </div>
                <div className="text-sm text-gray-400 mb-8 font-medium tracking-widest uppercase">
                  {lang === 'ar' ? 'Certificate of Completion' : 'شهادة إتمام'}
                </div>

                {/* Issued To */}
                <p className="text-gray-500 text-base mb-2">{t.cert_issued_to}</p>
                <div className="inline-block mb-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a3a5c] pb-2 border-b-2 border-[#0d9488] px-4">
                    {displayName}
                  </h2>
                </div>

                {/* Completed */}
                <p className="text-gray-500 text-base mt-5 mb-2">{t.cert_completed}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0d9488] mb-6 px-4">{title}</h3>

                {/* Score + Date */}
                <div className="flex items-center justify-center gap-8 my-6">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-[#1a3a5c]">{score}%</div>
                    <div className="text-xs text-gray-400 mt-1">{t.cert_score}</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <div className="text-base font-bold text-[#1a3a5c]">{issuedDate}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.cert_date}</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <div className="text-xs font-mono font-bold text-[#1a3a5c]">{certNumber}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.cert_number}</div>
                  </div>
                </div>

                {/* Official Seal */}
                <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2 mb-8 inline-flex mx-auto">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{t.cert_official}</span>
                </div>

                {/* Signatures */}
                <div className="flex items-end justify-around mt-8 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-32 h-px bg-[#1a3a5c]/30 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 font-semibold">{t.cert_signature_dept}</p>
                    <p className="text-xs text-gray-400">{t.cert_signature_hospital}</p>
                  </div>
                  {/* QR placeholder */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-2 border-[#1a3a5c]/20 rounded-lg flex items-center justify-center bg-white">
                      <div className="grid grid-cols-3 gap-0.5 p-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className={`w-3 h-3 rounded-sm ${[0,1,3,5,7,8].includes(i) ? 'bg-[#1a3a5c]' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{t.cert_verify}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-px bg-[#1a3a5c]/30 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 font-semibold">
                      {lang === 'ar' ? 'المدير الطبي' : 'Medical Director'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-3 bg-gradient-to-r from-[#1a3a5c] via-[#0d9488] to-[#1a3a5c]" />
          </motion.div>

          {/* Verification info */}
          <div className="mt-6 flex items-center gap-3 bg-background border border-border rounded-xl p-4 text-sm text-muted-foreground print:hidden">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <span>
              {lang === 'ar'
                ? `هذه الشهادة معتمدة رسمياً برقم: ${certNumber} — يمكن التحقق منها عبر إدارة الشؤون الأكاديمية والتدريب في مستشفى الولادة والأطفال.`
                : `This certificate is officially accredited. No.: ${certNumber} — Verifiable through Academic Affairs & Training at Maternity & Children's Hospital.`}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
