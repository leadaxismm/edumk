
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
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
  description_ar TEXT,
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

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  thumbnail_url TEXT,
  specialization_id UUID REFERENCES public.specializations(id),
  instructor_id UUID REFERENCES public.profiles(id),
  instructor_name TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  passing_score INTEGER DEFAULT 70,
  total_lectures INTEGER DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  certificate_enabled BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LECTURES TABLE
CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  video_url TEXT,
  video_type TEXT DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'upload')),
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- LECTURE PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.lecture_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lecture_id)
);

-- ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  time_limit_minutes INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT true,
  assessment_type TEXT DEFAULT 'lecture' CHECK (assessment_type IN ('lecture', 'course', 'final')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text_ar TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false')),
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation_ar TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ASSESSMENT ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  score DECIMAL(5,2) DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  time_taken_seconds INTEGER DEFAULT 0
);

-- CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.assessment_attempts(id),
  certificate_number TEXT UNIQUE NOT NULL DEFAULT '',
  issued_at TIMESTAMPTZ DEFAULT now(),
  score DECIMAL(5,2),
  pdf_url TEXT,
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
  uploaded_by UUID REFERENCES public.profiles(id),
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
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error','course','certificate','assessment')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COURSE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "specializations_select" ON public.specializations FOR SELECT USING (true);

CREATE POLICY "courses_select" ON public.courses FOR SELECT USING (is_published = true OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "courses_admin" ON public.courses FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','instructor'));

CREATE POLICY "lectures_select" ON public.lectures FOR SELECT USING (is_published = true OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "lectures_admin" ON public.lectures FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','instructor'));

CREATE POLICY "enrollments_own" ON public.enrollments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "lecture_progress_own" ON public.lecture_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "assessments_select" ON public.assessments FOR SELECT USING (is_published = true);
CREATE POLICY "assessments_admin" ON public.assessments FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "questions_select" ON public.questions FOR SELECT USING (true);
CREATE POLICY "questions_admin" ON public.questions FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "attempts_own" ON public.assessment_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "certificates_insert_own" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "certificates_admin" ON public.certificates FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "papers_select" ON public.research_papers FOR SELECT USING (is_published = true);
CREATE POLICY "papers_admin" ON public.research_papers FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "programs_select" ON public.training_programs FOR SELECT USING (is_published = true);
CREATE POLICY "programs_admin" ON public.training_programs FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reviews_select" ON public.course_reviews FOR SELECT USING (is_published = true);
CREATE POLICY "reviews_own" ON public.course_reviews FOR ALL USING (auth.uid() = user_id);

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(CAST(FLOOR(RANDOM() * 999999) AS TEXT), 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_certificate_number ON public.certificates;
CREATE TRIGGER set_certificate_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.generate_certificate_number();
