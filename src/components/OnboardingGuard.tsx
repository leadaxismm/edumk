import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * حارس البرنامج التعريفي
 * يُحوِّل المستخدمين الذين لم يُكملوا البرنامج تلقائياً إلى صفحة /onboarding
 * استثناءات: صفحات المصادقة، البرنامج نفسه، ومسؤولو النظام.
 */
export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, onboardingCompleted, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // مسارات مستثناة من الحارس
  const exemptPaths = ['/login', '/register', '/onboarding'];
  const isExempt = exemptPaths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (loading) return;
    // غير مسجل أو مستثنى أو أدمن → لا تدخّل
    if (!isAuthenticated || isExempt || isAdmin) return;
    // مسجل دخول لكن لم يُكمل البرنامج → حوّله
    if (!onboardingCompleted) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, isAdmin, onboardingCompleted, loading, location.pathname, isExempt, navigate]);

  return <>{children}</>;
}
