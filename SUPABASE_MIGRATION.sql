-- ============================================================
-- COMPLETE MIGRATION: Run this in Supabase SQL Editor
-- Project: ugmkcidrhtzpoccnmphg
-- URL: https://supabase.com/dashboard/project/ugmkcidrhtzpoccnmphg/sql/new
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- NOTE: courses, questions, lessons, results tables already exist
-- This migration adds all missing tables for the full platform
-- ============================================================

-- PROFILES TABLE (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'مستخدم',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  specialization TEXT,
  job_title TEXT,
  organization TEXT,
  phone TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SPECIALIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.specializations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  icon TEXT,
  color TEXT DEFAULT '#1a4a7a',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.specializations (name_ar, name_en, icon, color) VALUES
  ('التمريض', 'Nursing', 'stethoscope', '#0d9488'),
  ('الطب', 'Medicine', 'heart-pulse', '#1a4a7a'),
  ('المختبرات الطبية', 'Medical Laboratory', 'flask-conical', '#8b5cf6'),
  ('إدارة الرعاية الصحية', 'Healthcare Management', 'building-2', '#f59e0b'),
  ('الصيدلة', 'Pharmacy', 'pill', '#10b981'),
  ('الأشعة', 'Radiology', 'scan', '#6366f1'),
  ('الطوارئ والإسعاف', 'Emergency & Paramedic', 'ambulance', '#ef4444'),
  ('البحث العلمي', 'Scientific Research', 'microscope', '#8FAE8B')
ON CONFLICT DO NOTHING;

-- ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, course_id)
);

-- ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  time_limit_minutes INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT true,
  assessment_type TEXT DEFAULT 'final' CHECK (assessment_type IN ('lecture', 'course', 'final')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ASSESSMENT ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  score DECIMAL(5,2) DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL DEFAULT '',
  issued_at TIMESTAMPTZ DEFAULT now(),
  score DECIMAL(5,2),
  is_valid BOOLEAN DEFAULT true,
  UNIQUE(user_id, course_id)
);

-- RESEARCH PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  abstract_ar TEXT,
  authors TEXT[],
  specialization_id UUID REFERENCES public.specializations(id),
  year INTEGER,
  journal TEXT,
  doi TEXT,
  file_url TEXT,
  file_size_kb INTEGER,
  download_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRAINING PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  specialization_id UUID REFERENCES public.specializations(id),
  program_type TEXT DEFAULT 'medical' CHECK (program_type IN ('medical', 'administrative', 'research')),
  year INTEGER DEFAULT 2026,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  max_participants INTEGER DEFAULT 50,
  enrolled_count INTEGER DEFAULT 0,
  location TEXT DEFAULT 'عبر الإنترنت',
  instructor_name TEXT,
  is_published BOOLEAN DEFAULT true,
  certificate_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "specializations_select" ON public.specializations FOR SELECT USING (true);
CREATE POLICY "enrollments_own" ON public.enrollments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "assessments_select" ON public.assessments FOR SELECT USING (is_published = true);
CREATE POLICY "attempts_own" ON public.assessment_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "certificates_own" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "certificates_insert_own" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "papers_select" ON public.research_papers FOR SELECT USING (is_published = true);
CREATE POLICY "programs_select" ON public.training_programs FOR SELECT USING (is_published = true);
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRIGGER: Auto-generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
      LPAD(CAST(FLOOR(RANDOM() * 999999) AS TEXT), 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_certificate_number ON public.certificates;
CREATE TRIGGER set_certificate_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.generate_certificate_number();

-- ============================================================
-- SEED DATA: Research papers
-- ============================================================
INSERT INTO public.research_papers (title_ar, title_en, abstract_ar, authors, year, journal, doi, file_size_kb, download_count, is_published)
VALUES
  ('فعالية برامج التمريض عن بُعد في تحسين جودة الرعاية', 'Effectiveness of Remote Nursing Programs',
   'دراسة مقارنة تحليلية تتناول تأثير التدريب الإلكتروني على جودة أداء الكوادر التمريضية.',
   ARRAY['د. أحمد محمد الطيب', 'د. سارة عبدالله'], 2026, 'المجلة السعودية للعلوم الصحية',
   '10.1234/sjhs.2026.001', 1240, 89, true),
  ('تحليل معدلات الخطأ الدوائي في المستشفيات وسُبل الوقاية', 'Medication Error Rates Analysis',
   'بحث تطبيقي يرصد الأخطاء الدوائية الشائعة ويقترح حلولاً منهجية للحد منها.',
   ARRAY['د. خالد الزهراني', 'د. عبدالرحمن العمري'], 2025, 'مجلة الصيدلة العربية',
   '10.1234/ajp.2025.118', 980, 156, true),
  ('دور الذكاء الاصطناعي في تشخيص الأشعة التشخيصية', 'AI Role in Diagnostic Radiology',
   'مراجعة منهجية لأحدث تطبيقات الذكاء الاصطناعي في تحليل الصور الإشعاعية.',
   ARRAY['د. محمد الغامدي', 'د. فاطمة الأحمدي'], 2026, 'مجلة الأشعة الطبية العربية',
   '10.1234/ajr.2026.045', 1890, 203, true),
  ('استراتيجيات إدارة الأزمات في مرافق الطوارئ الطبية', 'Crisis Management in Emergency Facilities',
   'دراسة حالة تحلل الاستجابة المؤسسية لأزمات الطوارئ الطبية.',
   ARRAY['أ. فهد القحطاني', 'د. منى الشهري'], 2025, 'المجلة العربية للطب الطارئ',
   '10.1234/ajem.2025.072', 756, 134, true)
ON CONFLICT DO NOTHING;

-- SEED DATA: Training programs
INSERT INTO public.training_programs (title_ar, title_en, description_ar, program_type, year, start_date, end_date, duration_days, max_participants, enrolled_count, location, instructor_name, is_published, certificate_enabled)
VALUES
  ('البرنامج التدريبي السنوي للتمريض 2026', 'Annual Nursing Training Program 2026',
   'برنامج تدريبي شامل للكوادر التمريضية يغطي المستجدات العلمية والمهارات التطبيقية.',
   'medical', 2026, '2026-02-01', '2026-04-30', 90, 100, 67, 'عبر الإنترنت', 'د. أحمد محمد الطيب', true, true),
  ('برنامج البحث العلمي الطبي 2026', 'Medical Research Program 2026',
   'برنامج متخصص في منهجية البحث العلمي وكتابة الأوراق البحثية في المجال الطبي.',
   'research', 2026, '2026-05-01', '2026-07-31', 90, 50, 23, 'عبر الإنترنت', 'د. محمد الغامدي', true, true),
  ('برنامج إدارة الجودة الصحية 2026', 'Healthcare Quality Management 2026',
   'برنامج إداري متقدم يركز على معايير الجودة وإدارة المستشفيات وفق المعايير الدولية.',
   'administrative', 2026, '2026-08-01', '2026-10-31', 90, 75, 0, 'عبر الإنترنت', 'أ. فهد القحطاني', true, true),
  ('برنامج تطوير كفاءات الصيدلة 2026', 'Pharmacy Competency Development 2026',
   'برنامج تدريبي متخصص لتطوير كفاءات الصيادلة في التعامل مع الأدوية الحديثة.',
   'medical', 2026, '2026-10-01', '2026-12-31', 90, 60, 0, 'عبر الإنترنت', 'د. عبدالرحمن العمري', true, true)
ON CONFLICT DO NOTHING;

SELECT 'Migration completed successfully! ✅' AS status;
