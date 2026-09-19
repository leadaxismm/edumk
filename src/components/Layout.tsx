import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, Megaphone,
  BookOpen, FlaskConical, Calendar, Shield, Globe, BookMarked, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { ROUTE_PATHS } from '@/lib/index';

/* ── EduMK Logo ── */
export function EduMKLogo({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const { lang } = useLang();
  const sizes = { sm: 30, md: 38, lg: 52 };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <img src="/edumk-logo.svg" alt="EduMK Logo" width={s} height={s} className="shrink-0" />
      {showText && (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          {/* EduMK Plum · MCH Moonstone · dot Vanilla */}
          <div className="font-extrabold leading-none text-base tracking-wide flex items-center gap-0.5">
            <span style={{ color: 'var(--plum-700)' }}>EduMK</span>
            <span className="mx-1 w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--vanilla-500)' }} />
            <span style={{ color: 'var(--moonstone-600)' }}>MCH</span>
          </div>
          <div className="text-[10px] leading-tight mt-0.5 font-medium" style={{ color: 'var(--neutral-400)' }}>
            {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}
          </div>
        </div>
      )}
    </div>
  );
}

interface LayoutProps { children: React.ReactNode }

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isAdmin, onboardingCompleted, logout } = useAuth();
  const { t, lang, toggleLang, isRTL } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contentUnlocked = !isAuthenticated || isAdmin || onboardingCompleted;

  const navLinks = [
    { label: t.nav_home,     path: ROUTE_PATHS.HOME,     icon: null,        locked: false },
    { label: t.nav_courses,  path: ROUTE_PATHS.COURSES,  icon: BookOpen,    locked: !contentUnlocked },
    { label: 'الإعلانات', path: ROUTE_PATHS.ANNOUNCEMENTS, icon: Megaphone, locked: false },
    { label: 'المكتبة',       path: '/library',           icon: BookMarked,  locked: !contentUnlocked },
    { label: t.nav_research, path: ROUTE_PATHS.RESEARCH, icon: FlaskConical,locked: !contentUnlocked },
    { label: t.nav_training, path: ROUTE_PATHS.TRAINING, icon: Calendar,    locked: !contentUnlocked },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const displayName: string = (() => {
    const u = user as unknown as Record<string, unknown> | null;
    if (!u) return '';
    if (typeof u.full_name === 'string') return u.full_name;
    const meta = u.user_metadata as Record<string, unknown> | undefined;
    return (meta?.full_name as string) || (u.email as string) || '';
  })();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-background">

      {/* ── TOP BAR ── */}
      <div
        className="hidden sm:block text-xs py-1.5 px-4"
        style={{ background: 'var(--plum-800)', color: 'rgba(255,255,255,0.85)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span style={{ color: 'var(--vanilla-300)' }}>
            {lang === 'ar'
              ? 'المنصة الرسمية للتعليم الطبي المستمر — مستشفى الولادة والأطفال، حفر الباطن'
              : "Official CME Platform — Maternity & Children's Hospital, Hafr Al-Batin"}
          </span>
          <span style={{ color: 'var(--moonstone-300)' }}>📧 edumk@hospital.sa</span>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav
        className="sticky top-0 z-50 transition-shadow duration-200"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'var(--neutral-0)',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: `1px solid var(--neutral-200)`,
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
          height: 64,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center h-full gap-4">

            {/* Logo */}
            <button onClick={() => navigate(ROUTE_PATHS.HOME)} className="shrink-0 hover:opacity-80 transition-opacity">
              <EduMKLogo size="md" />
            </button>

            {/* Desktop Nav Links */}
            <div className={`hidden md:flex items-center gap-0.5 ${isRTL ? 'mr-4' : 'ml-4'} flex-1`}>
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => link.locked ? navigate('/onboarding') : navigate(link.path)}
                  title={link.locked ? 'أكمل البرنامج التعريفي أولاً' : ''}
                  className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-150"
                  style={
                    link.locked
                      ? { color: 'var(--neutral-400)', cursor: 'not-allowed' }
                      : isActive(link.path)
                      ? { color: 'var(--moonstone-600)', background: 'var(--moonstone-50)', fontWeight: 600 }
                      : { color: 'var(--neutral-600)' }
                  }
                  onMouseEnter={e => {
                    if (!link.locked && !isActive(link.path)) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-50)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--moonstone-700)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!link.locked && !isActive(link.path)) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--neutral-600)';
                    }
                  }}
                >
                  {link.label}
                  {link.locked && <span className="text-[10px]">🔒</span>}
                  {isActive(link.path) && (
                    <span className="block h-0.5 w-full absolute bottom-0 left-0 rounded-full"
                      style={{ background: 'var(--moonstone-500)' }} />
                  )}
                </button>
              ))}

              {/* Onboarding CTA */}
              {isAuthenticated && !isAdmin && !onboardingCompleted && (
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 ms-2"
                  style={{ background: 'var(--vanilla-100)', color: 'var(--vanilla-800)', border: '1px solid var(--vanilla-300)' }}
                >
                  <GraduationCap className="w-4 h-4" />
                  البرنامج التعريفي
                </button>
              )}
            </div>

            {/* Right controls */}
            <div className={`flex items-center gap-2 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>

              {/* Lang Toggle */}
              <button
                onClick={toggleLang}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
                style={{ color: 'var(--neutral-500)', borderColor: 'var(--neutral-200)' }}
              >
                <Globe className="w-3.5 h-3.5" />
                {t.general_language}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Dashboard shortcut */}
                  <button
                    onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
                    className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm transition-colors"
                    style={{ color: 'var(--neutral-600)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-50)'; (e.currentTarget as HTMLElement).style.color = 'var(--moonstone-700)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--neutral-600)'; }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t.nav_dashboard}
                  </button>

                  {/* Bell */}
                  <button className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                    <Bell className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                  </button>

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
                        style={{ border: '1px solid var(--neutral-200)' }}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback
                            className="text-xs font-bold text-white"
                            style={{ background: 'var(--moonstone-500)' }}
                          >
                            {displayName.charAt(0) || 'م'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-medium max-w-24 truncate" style={{ color: 'var(--neutral-700)' }}>
                          {displayName}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--neutral-400)' }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-52">
                      <div className="px-2 py-1.5 text-xs" style={{ color: 'var(--neutral-500)' }}>{displayName}</div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
                        <LayoutDashboard className="w-4 h-4 mx-2" />{t.nav_dashboard}
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.ADMIN)}>
                          <Shield className="w-4 h-4 mx-2" />{t.nav_admin}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                        <LogOut className="w-4 h-4 mx-2" />{t.nav_logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(ROUTE_PATHS.LOGIN)}
                    className="h-9 px-4 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--neutral-700)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--neutral-100)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {t.nav_login}
                  </button>
                  <button
                    onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                    className="h-9 px-5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: 'var(--moonstone-500)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-700)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--moonstone-500)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                  >
                    {t.nav_register}
                  </button>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(o => !o)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid var(--neutral-200)', background: 'var(--neutral-0)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => { link.locked ? navigate('/onboarding') : navigate(link.path); setMenuOpen(false); }}
                    className={`w-full text-${isRTL ? 'right' : 'left'} px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors`}
                    style={
                      link.locked
                        ? { color: 'var(--neutral-400)' }
                        : isActive(link.path)
                        ? { color: 'var(--moonstone-600)', background: 'var(--moonstone-50)', fontWeight: 600 }
                        : { color: 'var(--neutral-600)' }
                    }
                  >
                    {link.label}
                    {link.locked && <span className="text-[10px] ms-auto">🔒</span>}
                  </button>
                ))}
                <div className="pt-2 flex gap-2" style={{ borderTop: '1px solid var(--neutral-200)' }}>
                  <button
                    onClick={toggleLang}
                    className="flex-1 h-9 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5"
                    style={{ borderColor: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
                  >
                    <Globe className="w-3.5 h-3.5" />{t.general_language}
                  </button>
                  {isAuthenticated ? (
                    <button
                      onClick={logout}
                      className="flex-1 h-9 rounded-lg text-xs font-medium border flex items-center justify-center"
                      style={{ borderColor: '#DC2626', color: '#DC2626' }}
                    >
                      {t.nav_logout}
                    </button>
                  ) : (
                    <button
                      onClick={() => { navigate(ROUTE_PATHS.LOGIN); setMenuOpen(false); }}
                      className="flex-1 h-9 rounded-lg text-xs font-semibold text-white flex items-center justify-center"
                      style={{ background: 'var(--moonstone-500)' }}
                    >
                      {t.nav_login}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1">{children}</main>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--plum-900)', color: 'rgba(255,255,255,0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/edumk-logo.svg" alt="EduMK" width={44} height={44} />
                <div>
                  <div className="font-bold text-lg flex items-center gap-1">
                    <span style={{ color: 'var(--vanilla-300)' }}>EduMK</span>
                    <span className="mx-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--moonstone-400)' }} />
                    <span style={{ color: 'var(--moonstone-300)' }}>MCH</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {lang === 'ar'
                  ? 'المنصة الرسمية للتعليم الطبي المستمر وتطوير الكفاءات المهنية لجميع موظفي المستشفى.'
                  : 'The official platform for Continuous Medical Education and professional development for all hospital staff.'}
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--vanilla-200)' }}>
                {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h4>
              <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {[
                  [t.nav_courses, ROUTE_PATHS.COURSES],
                  [t.nav_training, ROUTE_PATHS.TRAINING],
                  [t.nav_research, ROUTE_PATHS.RESEARCH],
                  ['المكتبة الطبية', '/library'],
                ].map(([label, path]) => (
                  <li key={path}>
                    <button
                      onClick={() => navigate(path)}
                      className="hover:text-white transition-colors hover:underline"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--vanilla-200)' }}>
                {lang === 'ar' ? 'التواصل' : 'Contact'}
              </h4>
              <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <li className="flex items-center gap-2">
                  <span>📧</span> edumk@hospital.sa
                </li>
                <li className="flex items-center gap-2">
                  <span>🏥</span>
                  {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}
                </li>
                <li className="flex items-center gap-2">
                  <span>🏢</span>
                  {lang === 'ar' ? 'إدارة الشؤون الأكاديمية والتدريب' : 'Academic Affairs & Training'}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
          >
            <span>© 2026 EduMK — {lang === 'ar' ? 'مستشفى الولادة والأطفال' : "Maternity & Children's Hospital"}</span>
            <span>{lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
