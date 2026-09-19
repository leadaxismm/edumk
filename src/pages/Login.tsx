import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, Shield, Award, Users, BookOpen, Globe } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { ROUTE_PATHS } from '@/lib/index';
import { EduMKLogo } from '@/components/Layout';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: doSignIn, isAuthenticated, isAdmin, onboardingCompleted } = useAuth();
  const { t, lang, toggleLang, isRTL } = useLang();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    if (isAdmin) navigate(ROUTE_PATHS.DASHBOARD);
    else if (!onboardingCompleted) navigate('/onboarding');
    else navigate(ROUTE_PATHS.DASHBOARD);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(lang === 'ar' ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }
    setLoading(true); setError('');
    try {
      await doSignIn(email, password);
      const { data: { user: u } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
      if (u?.email === 'admin@edumk-mch.com') {
        navigate(ROUTE_PATHS.DASHBOARD);
      } else if (u) {
        const { supabase } = await import('@/lib/supabase');
        const { data: prof } = await supabase.from('profiles').select('onboarding_completed').eq('id', u.id).maybeSingle();
        if (prof?.onboarding_completed) navigate(ROUTE_PATHS.DASHBOARD);
        else navigate('/onboarding');
      } else {
        navigate(ROUTE_PATHS.DASHBOARD);
      }
    } catch {
      setError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
    }
    setLoading(false);
  };

  const QUICK_STATS = [
    { icon: BookOpen,  value: '24+',    label: lang === 'ar' ? 'دورة تدريبية' : 'Courses' },
    { icon: Users,     value: '1.2K+',  label: lang === 'ar' ? 'موظف مسجل' : 'Staff' },
    { icon: Award,     value: '850+',   label: lang === 'ar' ? 'شهادة معتمدة' : 'Certs' },
    { icon: Shield,    value: 'CME',    label: lang === 'ar' ? 'معتمد دولياً' : 'Accredited' },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex" style={{ background: 'var(--neutral-50)' }}>

      {/* ── LEFT BRANDING PANEL ── */}
      <div
        className="hidden lg:flex flex-col justify-center w-[46%] shrink-0 p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--plum-900) 0%, var(--plum-700) 55%, var(--moonstone-700) 100%)' }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Blob decorations */}
        <div className="absolute top-0 end-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(58,168,193,0.25) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 start-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(243,229,171,0.15) 0%, transparent 65%)', transform: 'translate(-30%, 30%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-sm"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <img src="/edumk-logo.svg" alt="EduMK" className="w-20 h-20" />
            <div>
              <div className="text-3xl font-extrabold flex items-center gap-1.5">
                <span style={{ color: 'var(--vanilla-300)' }}>EduMK</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--moonstone-400)' }} />
                <span style={{ color: 'var(--moonstone-300)' }}>MCH</span>
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-white leading-snug">
            {lang === 'ar'
              ? 'منصة التعليم الطبي المستمر الرسمية'
              : 'Official Continuous Medical Education Platform'}
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {lang === 'ar'
              ? 'طوّر مهاراتك المهنية، احصل على شهادات معتمدة، وتابع تقدمك من أي مكان وفي أي وقت.'
              : 'Develop your professional skills, earn accredited certificates, and track progress anytime.'}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {QUICK_STATS.map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3.5 text-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <s.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: 'var(--vanilla-300)' }} />
                <div className="font-bold text-lg text-white">{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CME badge */}
          <div
            className="mt-5 flex items-center gap-2.5 rounded-xl p-3"
            style={{ background: 'rgba(58,168,193,0.2)', border: '1px solid rgba(58,168,193,0.35)' }}
          >
            <Shield className="w-4 h-4 shrink-0" style={{ color: 'var(--moonstone-300)' }} />
            <span className="text-xs" style={{ color: 'var(--moonstone-200)' }}>
              {lang === 'ar'
                ? 'معتمد للتعليم الطبي المستمر — هيئة التخصصات الصحية'
                : 'Accredited CME — Saudi Commission for Health Specialties'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--neutral-0)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile: logo + lang */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <button onClick={() => navigate(ROUTE_PATHS.HOME)}>
              <EduMKLogo size="md" />
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border"
              style={{ borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
            >
              <Globe className="w-3.5 h-3.5" />
              {t.general_language}
            </button>
          </div>

          {/* Desktop: lang only */}
          <div className="hidden lg:flex justify-end mb-6">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border"
              style={{ borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
            >
              <Globe className="w-3.5 h-3.5" />
              {t.general_language}
            </button>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-extrabold mb-1.5" style={{ color: 'var(--heading-color)' }}>
            {t.login_title}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--neutral-500)' }}>{t.login_subtitle}</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                {t.login_email}
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--neutral-400)', [isRTL ? 'right' : 'left']: '12px' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid var(--neutral-200)',
                    paddingRight: isRTL ? '40px' : '14px',
                    paddingLeft: isRTL ? '14px' : '40px',
                    background: 'var(--neutral-0)',
                    color: 'var(--neutral-800)',
                  }}
                  onFocus={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--moonstone-500)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(58,168,193,0.12)';
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-200)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                  placeholder={lang === 'ar' ? 'example@hospital.sa' : 'you@hospital.sa'}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                {t.login_password}
              </label>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--neutral-400)', [isRTL ? 'right' : 'left']: '12px' }}
                />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid var(--neutral-200)',
                    paddingRight: isRTL ? '40px' : '40px',
                    paddingLeft: isRTL ? '40px' : '40px',
                    background: 'var(--neutral-0)',
                    color: 'var(--neutral-800)',
                  }}
                  onFocus={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--moonstone-500)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(58,168,193,0.12)';
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--neutral-200)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute top-1/2 -translate-y-1/2 transition-colors"
                  style={{ [isRTL ? 'left' : 'right']: '12px', color: 'var(--neutral-400)' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium transition-colors hover:underline"
                style={{ color: 'var(--moonstone-600)' }}>
                {t.login_forgot}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'var(--btn-primary-bg)' }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-700)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-500)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : t.login_btn}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm mt-6" style={{ color: 'var(--neutral-500)' }}>
            {t.login_no_account}{' '}
            <button
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              className="font-semibold hover:underline"
              style={{ color: 'var(--heading-color)' }}
            >
              {t.login_register_link}
            </button>
          </p>

          {/* Footer note */}
          <div className="mt-10 text-center text-xs" style={{ color: 'var(--neutral-400)' }}>
            {lang === 'ar'
              ? 'منصة EduMK الرسمية — مستشفى الولادة والأطفال، حفر الباطن'
              : "EduMK Official Platform — Maternity & Children's Hospital, Hafr Al-Batin"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
