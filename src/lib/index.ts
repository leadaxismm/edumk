// =============================================
// ROUTES
// =============================================
export const ROUTE_PATHS = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  LECTURE: '/courses/:courseId/lecture/:lectureId',
  ASSESSMENT: '/assessment/:id',
  CERTIFICATE: '/certificate/:id',
  RESEARCH: '/research',
  TRAINING: '/training',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  ONBOARDING_MODULE: '/onboarding/module/:id',
  LIBRARY: '/library',
  LIBRARY_SEARCH: '/library/search',
  LIBRARY_ITEM: '/library/item/:id',
  ANNOUNCEMENTS: '/announcements',
};

// =============================================
// TYPES
// =============================================

export interface Specialization {
  id: string;
  name_ar: string;
  name_en?: string;
  icon?: string;
  color?: string;
}

export interface Course {
  id: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  thumbnail_url?: string;
  specialization_id?: string;
  specialization?: Specialization;
  instructor_name?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  is_free: boolean;
  price?: number;
  is_published: boolean;
  passing_score: number;
  total_lectures: number;
  enrolled_count: number;
  rating: number;
  rating_count: number;
  certificate_enabled: boolean;
  created_at: string;
}

export interface Lecture {
  id: string;
  course_id: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  video_url?: string;
  video_type: 'youtube' | 'vimeo' | 'upload';
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  is_published: boolean;
}

export interface Assessment {
  id: string;
  course_id: string;
  lecture_id?: string;
  title_ar: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  assessment_type: 'lecture' | 'course' | 'final';
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text_ar: string;
  question_type: 'mcq' | 'true_false';
  options: string[];
  correct_answer: number;
  explanation_ar?: string;
  points: number;
  order_index: number;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  score: number;
  course?: Course;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  specialization?: string;
  job_title?: string;
  organization?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  is_completed: boolean;
  course?: Course;
}

export interface ResearchPaper {
  id: string;
  title_ar: string;
  title_en?: string;
  abstract_ar?: string;
  authors: string[];
  specialization_id?: string;
  specialization?: Specialization;
  year?: number;
  journal?: string;
  file_url?: string;
  file_size_kb?: number;
  doi?: string;
  download_count: number;
  is_published: boolean;
  created_at: string;
}

export interface TrainingProgram {
  id: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  specialization_id?: string;
  specialization?: Specialization;
  program_type: 'medical' | 'administrative' | 'research';
  year: number;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  max_participants: number;
  enrolled_count: number;
  location: string;
  instructor_name?: string;
  is_published: boolean;
  certificate_enabled: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title_ar: string;
  message_ar: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'certificate' | 'assessment';
  is_read: boolean;
  link?: string;
  created_at: string;
}

// =============================================
// CONSTANTS
// =============================================

export const LEVEL_LABELS: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

export const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  medical: 'طبي',
  administrative: 'إداري',
  research: 'بحثي',
};

export const SPECIALIZATION_ICONS: Record<string, string> = {
  'التمريض': '🏥',
  'الطب': '⚕️',
  'المختبرات الطبية': '🧪',
  'إدارة الرعاية الصحية': '🏛️',
  'الصيدلة': '💊',
  'الأشعة': '🔬',
  'الطوارئ والإسعاف': '🚑',
  'البحث العلمي': '📊',
};
