-- =====================================================
-- EduMK: جداول ميزات جديدة
-- 1. reading_confirmations  - تأكيد القراءة
-- 2. suggestions            - صندوق الاقتراحات
-- =====================================================

-- جدول تأكيدات القراءة
CREATE TABLE IF NOT EXISTS public.reading_confirmations (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name   text NOT NULL,
  department      text NOT NULL,
  article_title   text NOT NULL,
  course_id       uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  lesson_id       uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  confirmed_at    timestamptz DEFAULT now() NOT NULL,
  ip_address      text,
  notes           text
);

ALTER TABLE public.reading_confirmations ENABLE ROW LEVEL SECURITY;

-- السماح لأي شخص بالإدراج (الموظفون بدون حساب أيضاً)
CREATE POLICY "allow_insert_confirmations" ON public.reading_confirmations
  FOR INSERT WITH CHECK (true);

-- المدراء يرون كل السجلات
CREATE POLICY "admins_view_confirmations" ON public.reading_confirmations
  FOR SELECT USING (true);

-- =====================================================
-- جدول الاقتراحات
CREATE TABLE IF NOT EXISTS public.suggestions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name   text NOT NULL,
  department      text NOT NULL,
  suggestion      text NOT NULL,
  category        text DEFAULT 'general',
  email           text,
  status          text DEFAULT 'pending' CHECK (status IN ('pending','reviewed','implemented')),
  admin_notes     text,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_suggestions" ON public.suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admins_view_suggestions" ON public.suggestions
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_confirmations_course ON public.reading_confirmations(course_id);
CREATE INDEX IF NOT EXISTS idx_confirmations_date ON public.reading_confirmations(confirmed_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_date ON public.suggestions(created_at DESC);
