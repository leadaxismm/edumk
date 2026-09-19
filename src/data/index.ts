import { Course, Lecture, ResearchPaper, TrainingProgram, Specialization, Assessment, Question, Certificate, UserProfile, Enrollment } from '@/lib/index';

// =============================================
// MOCK SPECIALIZATIONS
// =============================================
export const MOCK_SPECIALIZATIONS: Specialization[] = [
  { id: '1', name_ar: 'التمريض', name_en: 'Nursing', icon: 'stethoscope', color: '#0d9488' },
  { id: '2', name_ar: 'الطب', name_en: 'Medicine', icon: 'heart-pulse', color: '#1a4a7a' },
  { id: '3', name_ar: 'المختبرات الطبية', name_en: 'Medical Laboratory', icon: 'flask-conical', color: '#8b5cf6' },
  { id: '4', name_ar: 'إدارة الرعاية الصحية', name_en: 'Healthcare Management', icon: 'building-2', color: '#f59e0b' },
  { id: '5', name_ar: 'الصيدلة', name_en: 'Pharmacy', icon: 'pill', color: '#10b981' },
  { id: '6', name_ar: 'الأشعة', name_en: 'Radiology', icon: 'scan', color: '#6366f1' },
  { id: '7', name_ar: 'الطوارئ والإسعاف', name_en: 'Emergency', icon: 'ambulance', color: '#ef4444' },
  { id: '8', name_ar: 'البحث العلمي', name_en: 'Research', icon: 'microscope', color: '#8FAE8B' },
];

// =============================================
// MOCK COURSES
// =============================================
export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title_ar: 'أساسيات التمريض السريري',
    title_en: 'Clinical Nursing Fundamentals',
    description_ar: 'دورة شاملة تغطي المهارات الأساسية في التمريض السريري، من الرعاية الأساسية إلى المهارات التقنية المتقدمة. تشمل الدورة التعامل مع المريض، وتقييم الحالة الصحية، والإجراءات التمريضية.',
    thumbnail_url: 'https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?w=400&q=80',
    specialization_id: '1',
    specialization: { id: '1', name_ar: 'التمريض', color: '#0d9488' },
    instructor_name: 'د. أحمد محمد الطيب',
    level: 'beginner',
    duration_hours: 24,
    is_free: true,
    price: 0,
    is_published: true,
    passing_score: 70,
    total_lectures: 12,
    enrolled_count: 1248,
    rating: 4.8,
    rating_count: 312,
    certificate_enabled: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '2',
    title_ar: 'الإسعافات الأولية والطوارئ',
    title_en: 'First Aid & Emergency Care',
    description_ar: 'تعلم تقديم الإسعافات الأولية والتعامل مع حالات الطوارئ الطبية بكفاءة واحترافية. دورة عملية تغطي الإنعاش القلبي الرئوي وإسعاف الحوادث والحالات الحرجة.',
    thumbnail_url: 'https://images.unsplash.com/photo-1758691461888-b74515208d7a?w=400&q=80',
    specialization_id: '7',
    specialization: { id: '7', name_ar: 'الطوارئ والإسعاف', color: '#ef4444' },
    instructor_name: 'د. سارة عبدالله',
    level: 'beginner',
    duration_hours: 16,
    is_free: true,
    price: 0,
    is_published: true,
    passing_score: 70,
    total_lectures: 8,
    enrolled_count: 987,
    rating: 4.9,
    rating_count: 245,
    certificate_enabled: true,
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: '3',
    title_ar: 'إدارة المختبرات الطبية',
    title_en: 'Medical Laboratory Management',
    description_ar: 'دورة متخصصة في إدارة وتشغيل المختبرات الطبية وفق أحدث المعايير الدولية. تشمل ضبط الجودة والسلامة المختبرية وإدارة العينات.',
    thumbnail_url: 'https://images.unsplash.com/photo-1721373421329-33e12aa1388c?w=400&q=80',
    specialization_id: '3',
    specialization: { id: '3', name_ar: 'المختبرات الطبية', color: '#8b5cf6' },
    instructor_name: 'د. خالد الزهراني',
    level: 'intermediate',
    duration_hours: 20,
    is_free: false,
    price: 299,
    is_published: true,
    passing_score: 70,
    total_lectures: 10,
    enrolled_count: 634,
    rating: 4.7,
    rating_count: 189,
    certificate_enabled: true,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '4',
    title_ar: 'قيادة فرق الرعاية الصحية',
    title_en: 'Healthcare Team Leadership',
    description_ar: 'برنامج تدريبي متكامل لتطوير مهارات القيادة وإدارة الفرق في بيئات الرعاية الصحية. يركز على اتخاذ القرار وإدارة الأزمات والتواصل الفعّال.',
    thumbnail_url: 'https://images.unsplash.com/photo-1758691462848-ba1e929da259?w=400&q=80',
    specialization_id: '4',
    specialization: { id: '4', name_ar: 'إدارة الرعاية الصحية', color: '#f59e0b' },
    instructor_name: 'أ. نورة السعيد',
    level: 'advanced',
    duration_hours: 30,
    is_free: false,
    price: 449,
    is_published: true,
    passing_score: 70,
    total_lectures: 15,
    enrolled_count: 421,
    rating: 4.6,
    rating_count: 134,
    certificate_enabled: true,
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: '5',
    title_ar: 'أساسيات الصيدلة السريرية',
    title_en: 'Clinical Pharmacy Fundamentals',
    description_ar: 'دورة أساسية في الصيدلة السريرية تغطي التفاعلات الدوائية وإدارة الأدوية وسلامة المريض.',
    thumbnail_url: 'https://images.unsplash.com/photo-1721369967228-759150528943?w=400&q=80',
    specialization_id: '5',
    specialization: { id: '5', name_ar: 'الصيدلة', color: '#10b981' },
    instructor_name: 'د. عبدالرحمن العمري',
    level: 'intermediate',
    duration_hours: 22,
    is_free: false,
    price: 349,
    is_published: true,
    passing_score: 70,
    total_lectures: 11,
    enrolled_count: 756,
    rating: 4.7,
    rating_count: 201,
    certificate_enabled: true,
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: '6',
    title_ar: 'منهجية البحث العلمي الطبي',
    title_en: 'Medical Research Methodology',
    description_ar: 'برنامج شامل في منهجية البحث العلمي وكتابة الأوراق البحثية وتحليل البيانات الإحصائية في المجال الطبي.',
    thumbnail_url: 'https://images.unsplash.com/photo-1758691463606-1493d79cc577?w=400&q=80',
    specialization_id: '8',
    specialization: { id: '8', name_ar: 'البحث العلمي', color: '#8FAE8B' },
    instructor_name: 'د. محمد الغامدي',
    level: 'advanced',
    duration_hours: 35,
    is_free: false,
    price: 499,
    is_published: true,
    passing_score: 70,
    total_lectures: 18,
    enrolled_count: 312,
    rating: 4.9,
    rating_count: 98,
    certificate_enabled: true,
    created_at: '2026-03-01T00:00:00Z',
  },
];

// =============================================
// MOCK LECTURES
// =============================================
export const MOCK_LECTURES: Lecture[] = [
  { id: 'l1', course_id: '1', title_ar: 'مقدمة في التمريض السريري', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_type: 'youtube', duration_minutes: 45, order_index: 1, is_preview: true, is_published: true },
  { id: 'l2', course_id: '1', title_ar: 'تقييم حالة المريض', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_type: 'youtube', duration_minutes: 60, order_index: 2, is_preview: false, is_published: true },
  { id: 'l3', course_id: '1', title_ar: 'الإجراءات التمريضية الأساسية', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_type: 'youtube', duration_minutes: 75, order_index: 3, is_preview: false, is_published: true },
  { id: 'l4', course_id: '1', title_ar: 'إدارة الأدوية والجرعات', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_type: 'youtube', duration_minutes: 55, order_index: 4, is_preview: false, is_published: true },
  { id: 'l5', course_id: '1', title_ar: 'رعاية الجروح والضمادات', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', video_type: 'youtube', duration_minutes: 50, order_index: 5, is_preview: false, is_published: true },
];

// =============================================
// MOCK ASSESSMENTS & QUESTIONS
// =============================================
export const MOCK_ASSESSMENTS: Assessment[] = [
  { id: 'a1', course_id: '1', lecture_id: 'l1', title_ar: 'اختبار: مقدمة في التمريض', time_limit_minutes: 15, passing_score: 70, max_attempts: 3, assessment_type: 'lecture' },
  { id: 'a2', course_id: '1', title_ar: 'الاختبار النهائي - أساسيات التمريض', time_limit_minutes: 45, passing_score: 70, max_attempts: 3, assessment_type: 'final' },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1', assessment_id: 'a1', question_text_ar: 'ما هو الهدف الرئيسي لتقييم حالة المريض؟',
    question_type: 'mcq', options: ['جمع المعلومات الشخصية', 'تحديد الاحتياجات الصحية ووضع خطة الرعاية', 'توثيق السجلات الطبية فقط', 'التواصل مع أسرة المريض'],
    correct_answer: 1, explanation_ar: 'تقييم حالة المريض يهدف أساساً لتحديد احتياجاته الصحية ووضع خطة رعاية مناسبة.', points: 1, order_index: 1
  },
  {
    id: 'q2', assessment_id: 'a1', question_text_ar: 'كم مرة يجب قياس العلامات الحيوية للمريض في العناية المركزة؟',
    question_type: 'mcq', options: ['مرة كل 8 ساعات', 'مرة كل 4 ساعات', 'كل ساعة أو حسب الحالة', 'مرة يومياً'],
    correct_answer: 2, explanation_ar: 'في العناية المركزة تُقاس العلامات الحيوية كل ساعة أو أكثر حسب حالة المريض.', points: 1, order_index: 2
  },
  {
    id: 'q3', assessment_id: 'a1', question_text_ar: 'التمريض مهنة تتطلب الالتزام بأخلاقيات المهنة والحفاظ على سرية المريض.',
    question_type: 'true_false', options: ['صحيح', 'خطأ'],
    correct_answer: 0, explanation_ar: 'نعم، السرية المهنية من أساسيات أخلاقيات التمريض.', points: 1, order_index: 3
  },
  {
    id: 'q4', assessment_id: 'a1', question_text_ar: 'ما هو الإجراء الصحيح عند إعطاء دواء للمريض؟',
    question_type: 'mcq', options: ['التحقق من اسم الدواء فقط', 'التحقق من "6 صحيح": المريض، الدواء، الجرعة، الطريق، الوقت، التوثيق', 'التحقق من اسم المريض والدواء', 'اتباع تعليمات الطبيب دون مراجعة'],
    correct_answer: 1, explanation_ar: 'قاعدة "6 صحيح" هي المعيار الدولي لضمان سلامة إعطاء الأدوية.', points: 1, order_index: 4
  },
  {
    id: 'q5', assessment_id: 'a1', question_text_ar: 'ما أول شيء يجب فعله عند اكتشاف سقوط مريض؟',
    question_type: 'mcq', options: ['إبلاغ المشرف فوراً', 'تقييم حالة المريض وضمان سلامته أولاً', 'ملء تقرير الحادثة', 'نقل المريض إلى السرير'],
    correct_answer: 1, explanation_ar: 'سلامة المريض أولاً، ثم يتم التقييم والإبلاغ.', points: 1, order_index: 5
  },
];

// =============================================
// MOCK RESEARCH PAPERS
// =============================================
export const MOCK_PAPERS: ResearchPaper[] = [
  {
    id: 'p1', title_ar: 'فعالية برامج التمريض عن بُعد في تحسين جودة الرعاية الصحية', title_en: 'Effectiveness of Remote Nursing Programs in Improving Healthcare Quality',
    abstract_ar: 'دراسة مقارنة تحليلية تتناول تأثير التدريب الإلكتروني على جودة أداء الكوادر التمريضية في مستشفيات القطاع الصحي السعودي خلال الفترة 2024-2026.',
    authors: ['د. أحمد محمد الطيب', 'د. سارة عبدالله', 'أ. نورة السعيد'],
    specialization_id: '1', specialization: { id: '1', name_ar: 'التمريض', color: '#0d9488' },
    year: 2026, journal: 'المجلة السعودية للعلوم الصحية', doi: '10.1234/sjhs.2026.001',
    file_url: '#', file_size_kb: 1240, download_count: 89, is_published: true, created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'p2', title_ar: 'تحليل معدلات الخطأ الدوائي في المستشفيات وسُبل الوقاية', title_en: 'Analysis of Medication Error Rates in Hospitals and Prevention Strategies',
    abstract_ar: 'بحث تطبيقي يرصد الأخطاء الدوائية الشائعة في بيئات الرعاية الصحية ويقترح حلولاً منهجية للحد منها وتحسين سلامة المريض.',
    authors: ['د. خالد الزهراني', 'د. عبدالرحمن العمري'],
    specialization_id: '5', specialization: { id: '5', name_ar: 'الصيدلة', color: '#10b981' },
    year: 2025, journal: 'مجلة الصيدلة العربية', doi: '10.1234/ajp.2025.118',
    file_url: '#', file_size_kb: 980, download_count: 156, is_published: true, created_at: '2025-11-20T00:00:00Z'
  },
  {
    id: 'p3', title_ar: 'دور الذكاء الاصطناعي في تشخيص الأشعة التشخيصية', title_en: 'Role of Artificial Intelligence in Diagnostic Radiology',
    abstract_ar: 'مراجعة منهجية لأحدث تطبيقات الذكاء الاصطناعي في تحليل الصور الإشعاعية وتأثيرها على دقة التشخيص وزمن الاستجابة.',
    authors: ['د. محمد الغامدي', 'د. فاطمة الأحمدي'],
    specialization_id: '6', specialization: { id: '6', name_ar: 'الأشعة', color: '#6366f1' },
    year: 2026, journal: 'مجلة الأشعة الطبية العربية', doi: '10.1234/ajr.2026.045',
    file_url: '#', file_size_kb: 1890, download_count: 203, is_published: true, created_at: '2026-02-05T00:00:00Z'
  },
  {
    id: 'p4', title_ar: 'استراتيجيات إدارة الأزمات في مرافق الطوارئ الطبية', title_en: 'Crisis Management Strategies in Emergency Medical Facilities',
    abstract_ar: 'دراسة حالة تحلل الاستجابة المؤسسية لأزمات الطوارئ الطبية وتقييم فعالية البروتوكولات المعتمدة في مستشفيات المنطقة العربية.',
    authors: ['أ. فهد القحطاني', 'د. منى الشهري'],
    specialization_id: '7', specialization: { id: '7', name_ar: 'الطوارئ والإسعاف', color: '#ef4444' },
    year: 2025, journal: 'المجلة العربية للطب الطارئ', doi: '10.1234/ajem.2025.072',
    file_url: '#', file_size_kb: 756, download_count: 134, is_published: true, created_at: '2025-09-15T00:00:00Z'
  },
];

// =============================================
// MOCK TRAINING PROGRAMS
// =============================================
export const MOCK_PROGRAMS: TrainingProgram[] = [
  {
    id: 'tp1', title_ar: 'البرنامج التدريبي السنوي للتمريض 2026', title_en: 'Annual Nursing Training Program 2026',
    description_ar: 'برنامج تدريبي شامل للكوادر التمريضية يغطي المستجدات العلمية والمهارات التطبيقية وأحدث بروتوكولات الرعاية.',
    specialization_id: '1', specialization: { id: '1', name_ar: 'التمريض', color: '#0d9488' },
    program_type: 'medical', year: 2026, start_date: '2026-02-01', end_date: '2026-04-30', duration_days: 90,
    max_participants: 100, enrolled_count: 67, location: 'عبر الإنترنت', instructor_name: 'د. أحمد محمد الطيب',
    is_published: true, certificate_enabled: true
  },
  {
    id: 'tp2', title_ar: 'برنامج البحث العلمي الطبي 2026', title_en: 'Medical Research Program 2026',
    description_ar: 'برنامج متخصص في منهجية البحث العلمي وكتابة الأوراق البحثية وتحليل البيانات الإحصائية في المجال الطبي.',
    specialization_id: '8', specialization: { id: '8', name_ar: 'البحث العلمي', color: '#8FAE8B' },
    program_type: 'research', year: 2026, start_date: '2026-05-01', end_date: '2026-07-31', duration_days: 90,
    max_participants: 50, enrolled_count: 23, location: 'عبر الإنترنت', instructor_name: 'د. محمد الغامدي',
    is_published: true, certificate_enabled: true
  },
  {
    id: 'tp3', title_ar: 'برنامج إدارة الجودة الصحية 2026', title_en: 'Healthcare Quality Management 2026',
    description_ar: 'برنامج إداري متقدم يركز على معايير الجودة وإدارة المستشفيات وفق المعايير الدولية كـ JCI وISO.',
    specialization_id: '4', specialization: { id: '4', name_ar: 'إدارة الرعاية الصحية', color: '#f59e0b' },
    program_type: 'administrative', year: 2026, start_date: '2026-08-01', end_date: '2026-10-31', duration_days: 90,
    max_participants: 75, enrolled_count: 0, location: 'عبر الإنترنت', instructor_name: 'أ. فهد القحطاني',
    is_published: true, certificate_enabled: true
  },
  {
    id: 'tp4', title_ar: 'برنامج تطوير كفاءات الصيدلة 2026', title_en: 'Pharmacy Competency Development 2026',
    description_ar: 'برنامج تدريبي متخصص لتطوير كفاءات الصيادلة في التعامل مع الأدوية الحديثة وإدارة الدواء المؤسسي.',
    specialization_id: '5', specialization: { id: '5', name_ar: 'الصيدلة', color: '#10b981' },
    program_type: 'medical', year: 2026, start_date: '2026-10-01', end_date: '2026-12-31', duration_days: 90,
    max_participants: 60, enrolled_count: 0, location: 'عبر الإنترنت', instructor_name: 'د. عبدالرحمن العمري',
    is_published: true, certificate_enabled: true
  },
];

// =============================================
// MOCK USER DATA
// =============================================
export const MOCK_USER: UserProfile = {
  id: 'user1', full_name: 'أحمد عبدالله المطيري', email: 'ahmed@example.com',
  role: 'student', specialization: 'التمريض', job_title: 'ممرض أول', organization: 'مستشفى الملك فهد',
  created_at: '2026-01-01T00:00:00Z'
};

export const MOCK_ENROLLMENTS: Enrollment[] = [
  { id: 'e1', user_id: 'user1', course_id: '1', enrolled_at: '2026-01-20T00:00:00Z', progress_percentage: 75, is_completed: false, course: MOCK_COURSES[0] },
  { id: 'e2', user_id: 'user1', course_id: '2', enrolled_at: '2026-02-01T00:00:00Z', progress_percentage: 100, is_completed: true, course: MOCK_COURSES[1] },
  { id: 'e3', user_id: 'user1', course_id: '3', enrolled_at: '2026-03-10T00:00:00Z', progress_percentage: 30, is_completed: false, course: MOCK_COURSES[2] },
];

export const MOCK_CERTIFICATES: Certificate[] = [
  { id: 'cert1', user_id: 'user1', course_id: '2', certificate_number: 'CERT-2026-001847', issued_at: '2026-03-15T00:00:00Z', score: 88, course: MOCK_COURSES[1], user: MOCK_USER },
];
