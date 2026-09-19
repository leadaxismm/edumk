-- =========================================================
-- إصلاح سياسات RLS للبرنامج التعريفي
-- يحل مشكلة infinite recursion في جدول profiles
-- =========================================================

-- 1) جدول onboarding_modules: قراءة للجميع المسجلين
ALTER TABLE onboarding_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_modules_read" ON onboarding_modules;
CREATE POLICY "onboarding_modules_read" ON onboarding_modules
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "onboarding_modules_admin_write" ON onboarding_modules;
CREATE POLICY "onboarding_modules_admin_write" ON onboarding_modules
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@edumk-mch.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@edumk-mch.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2) جدول onboarding_questions: قراءة للجميع المسجلين
ALTER TABLE onboarding_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_questions_read" ON onboarding_questions;
CREATE POLICY "onboarding_questions_read" ON onboarding_questions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "onboarding_questions_admin_write" ON onboarding_questions;
CREATE POLICY "onboarding_questions_admin_write" ON onboarding_questions
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@edumk-mch.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@edumk-mch.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3) جدول onboarding_progress: كل مستخدم يقرأ ويكتب سجلاته فقط
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_progress_own_read" ON onboarding_progress;
CREATE POLICY "onboarding_progress_own_read" ON onboarding_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id
    OR (auth.jwt() ->> 'email') = 'admin@edumk-mch.com');

DROP POLICY IF EXISTS "onboarding_progress_own_insert" ON onboarding_progress;
CREATE POLICY "onboarding_progress_own_insert" ON onboarding_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "onboarding_progress_own_update" ON onboarding_progress;
CREATE POLICY "onboarding_progress_own_update" ON onboarding_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) إصلاح infinite recursion في جدول profiles
-- الخطأ: السياسة السابقة تستعلم profiles من داخل profiles → recursion
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_own_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- قراءة: المستخدم يقرأ ملفه، والأدمن يقرأ الكل (بدون استعلام على profiles)
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id
    OR (auth.jwt() ->> 'email') = 'admin@edumk-mch.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id
    OR (auth.jwt() ->> 'email') = 'admin@edumk-mch.com')
  WITH CHECK (auth.uid() = id
    OR (auth.jwt() ->> 'email') = 'admin@edumk-mch.com');

-- =========================================================
-- تم الإصلاح. بعد تشغيل هذا السكريبت، الجداول ستقرأ طبيعياً
-- =========================================================
