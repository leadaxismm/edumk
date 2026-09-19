import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { ROUTE_PATHS } from '@/lib/index';
import { springPresets } from '@/lib/motion';
import { EduMKLogo } from '@/components/Layout';

const DEPTS_AR = ['التمريض','الطب','المختبرات الطبية','الأشعة','الطوارئ والإسعاف','الصيدلة','إدارة الرعاية الصحية','البحث العلمي','الموارد البشرية','المالية والحسابات','تقنية المعلومات','أخرى'];
const DEPTS_EN = ['Nursing','Medicine','Medical Laboratory','Radiology','Emergency & EMS','Pharmacy','Healthcare Management','Scientific Research','Human Resources','Finance & Accounting','Information Technology','Other'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: doSignUp, isAuthenticated } = useAuth();
  const { t, lang, toggleLang, isRTL } = useLang();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', dept: '', job: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) { navigate(ROUTE_PATHS.DASHBOARD); return null; }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(lang === 'ar' ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields'); return;
    }
    if (form.password !== form.confirm) {
      setError(lang === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'); return;
    }
    setLoading(true); setError('');
    try {
      await doSignUp(form.name, form.email, form.password, form.dept);
      // Auto-redirect to onboarding after 2.5s
      setSuccess(true);
      setTimeout(() => navigate('/onboarding'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('already') ? (lang === 'ar' ? 'هذا البريد مسجّل مسبقاً' : 'Email already registered') : (lang === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account'));
    }
    setLoading(false);
  };

  const DEPTS = lang === 'ar' ? DEPTS_AR : DEPTS_EN;

  if (success) return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={springPresets.bouncy}
        className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          {lang === 'ar' ? '🎉 مرحباً بك في EduMK!' : '🎉 Welcome to EduMK!'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {lang === 'ar' ? 'يجب إكمال البرنامج التعريفي قبل الوصول للدورات. جاري التوجيه...' : 'You must complete the onboarding before accessing courses. Redirecting...'}
        </p>
        <Button className="w-full h-11 bg-primary font-bold gap-1.5" onClick={() => navigate('/onboarding')}>
          <Loader2 className="w-4 h-4 animate-spin" />
          {lang === 'ar' ? 'ابدأ البرنامج التعريفي' : 'Start Onboarding'}
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex">
      {/* Branding Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center w-5/12 bg-gradient-to-bl from-[oklch(0.28_0.08_220)] to-[oklch(0.42_0.10_180)] text-white p-10">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center max-w-xs">
          <img src="/edumk-logo.svg" alt="EduMK" className="w-24 h-24 mx-auto mb-5" />
          <h1 className="text-2xl font-extrabold mb-1">EduMK</h1>
          <p className="text-teal-300 text-sm mb-4">{lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}</p>
          <p className="text-white/70 text-sm leading-relaxed">
            {lang === 'ar' ? 'انضم إلى منصة التعليم الطبي المستمر الرسمية وطوّر مهاراتك المهنية' : 'Join the official CME platform and develop your professional skills'}
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/60">
            {(lang === 'ar'
              ? ['✅ دورات معتمدة CME', '✅ شهادات رسمية من المستشفى', '✅ وصول غير محدود', '✅ تتبع التقدم المهني']
              : ['✅ CME Accredited Courses', '✅ Official Hospital Certificates', '✅ Unlimited Access', '✅ Professional Progress Tracking']
            ).map(i => <div key={i}>{i}</div>)}
          </div>
        </motion.div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}
          className="w-full max-w-md py-6">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <EduMKLogo size="md" />
            <Button variant="ghost" size="sm" onClick={toggleLang} className="text-xs border border-border px-3">{t.general_language}</Button>
          </div>
          <div className="hidden lg:flex justify-end mb-3">
            <Button variant="ghost" size="sm" onClick={toggleLang} className="text-xs border border-border px-3">{t.general_language}</Button>
          </div>

          <h2 className="text-2xl font-extrabold text-foreground mb-1">{t.register_title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t.register_subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t.register_name} *</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.name} onChange={set('name')} className="pr-10 h-11"
                  placeholder={lang === 'ar' ? 'الاسم الرباعي' : 'Full Name'} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t.register_email} *</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={form.email} onChange={set('email')} className="pr-10 h-11"
                  placeholder="you@hospital.sa" dir="ltr" />
              </div>
            </div>

            {/* Dept + Job */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t.register_dept}</Label>
                <Select onValueChange={v => setForm(p => ({ ...p, dept: v }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={lang === 'ar' ? 'القسم' : 'Dept.'} />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t.register_job}</Label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={form.job} onChange={set('job')} className="pr-10 h-11"
                    placeholder={lang === 'ar' ? 'المسمى' : 'Title'} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t.register_password} *</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className="pr-10 pl-10 h-11" placeholder="••••••••" dir="ltr" />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t.register_confirm_password} *</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={form.confirm} onChange={set('confirm')}
                  className="pr-10 h-11" placeholder="••••••••" dir="ltr" />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-primary font-bold text-base" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.register_btn}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            {t.register_have_account}{' '}
            <button onClick={() => navigate(ROUTE_PATHS.LOGIN)} className="text-primary font-semibold hover:underline">
              {t.register_login_link}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
