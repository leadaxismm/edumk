import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// AUTH
// ============================================================
export async function signUp(email: string, password: string, fullName: string, specialization?: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, specialization: specialization || '', role: 'student' } }
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

// ============================================================
// COURSES (maps to existing schema: id, title, description, created_at)
// ============================================================
export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCourseById(id: string) {
  const { data: course, error: ce } = await supabase.from('courses').select('*').eq('id', id).single();
  if (ce) throw ce;
  const { data: lessons } = await supabase.from('lessons').select('*').eq('course_id', id).order('created_at');
  const { data: questions } = await supabase.from('questions').select('*').eq('course_id', id);
  return { ...course, lessons: lessons || [], questions: questions || [] };
}

// ============================================================
// ENROLLMENTS
// ============================================================
export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .upsert({ user_id: userId, course_id: courseId }, { onConflict: 'user_id,course_id' })
    .select().single();
  if (error && !error.message.includes('duplicate')) throw error;
  return data;
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(id, title, description)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================================
// ASSESSMENTS & ATTEMPTS
// ============================================================
export async function getAssessmentForCourse(courseId: string) {
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, question, correct_answer, course_id')
    .eq('course_id', courseId);
  if (error) throw error;
  return questions || [];
}

export async function submitResult(userId: string, courseId: string, score: number, passed: boolean) {
  const { data, error } = await supabase
    .from('results')
    .upsert({ user_id: userId, course_id: courseId, score, passed }, { onConflict: 'user_id,course_id' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getUserResults(userId: string) {
  const { data, error } = await supabase
    .from('results')
    .select('*, course:courses(id, title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================================
// CERTIFICATES (after migration runs)
// ============================================================
export async function getUserCertificates(userId: string) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, course:courses(title)')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function issueCertificate(userId: string, courseId: string, score: number) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .upsert({ user_id: userId, course_id: courseId, score }, { onConflict: 'user_id,course_id' })
      .select().single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// ============================================================
// RESEARCH PAPERS (after migration runs)
// ============================================================
export async function getResearchPapers(filters?: { year?: number }) {
  try {
    let query = supabase.from('research_papers').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (filters?.year) query = query.eq('year', filters.year);
    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ============================================================
// TRAINING PROGRAMS (after migration runs)
// ============================================================
export async function getTrainingPrograms() {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('is_published', true)
      .order('start_date', { ascending: true });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ============================================================
// NOTIFICATIONS (after migration runs)
// ============================================================
export async function getUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
