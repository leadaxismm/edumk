import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { LangProvider } from '@/hooks/useLang';
import { ROUTE_PATHS } from '@/lib/index';
import OnboardingGuard from '@/components/OnboardingGuard';

import HomePage from '@/pages/Home';
import CoursesPage from '@/pages/Courses';
import CourseDetailPage from '@/pages/CourseDetail';
import AssessmentPage from '@/pages/Assessment';
import CertificatePage from '@/pages/Certificate';
import ResearchPage from '@/pages/Research';
import TrainingPage from '@/pages/Training';
import DashboardPage from '@/pages/Dashboard';
import AdminPage from '@/pages/Admin';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import OnboardingPage from '@/pages/Onboarding';
import OnboardingModulePage from '@/pages/OnboardingModule';
import LibraryPage from '@/pages/Library';
import LibrarySearchPage from '@/pages/LibrarySearch';
import LibraryItemPage from '@/pages/LibraryItem';
import AnnouncementsPage from '@/pages/Announcements';

export default function App() {
  return (
    <LangProvider>
    <AuthProvider>
      <Router>
        <OnboardingGuard>
          <Routes>
            <Route path={ROUTE_PATHS.HOME} element={<HomePage />} />
            <Route path={ROUTE_PATHS.COURSES} element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/lecture/:lectureId" element={<CourseDetailPage />} />
            <Route path="/assessment/:id" element={<AssessmentPage />} />
            <Route path="/certificate/:id" element={<CertificatePage />} />
            <Route path={ROUTE_PATHS.RESEARCH} element={<ResearchPage />} />
            <Route path={ROUTE_PATHS.TRAINING} element={<TrainingPage />} />
            <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTE_PATHS.ADMIN} element={<AdminPage />} />
            <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
            <Route path={ROUTE_PATHS.REGISTER} element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/module/:id" element={<OnboardingModulePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/search" element={<LibrarySearchPage />} />
            <Route path="/library/item/:id" element={<LibraryItemPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </OnboardingGuard>
        <Toaster position="top-center" expand richColors />
      </Router>
    </AuthProvider>
    </LangProvider>
  );
}
