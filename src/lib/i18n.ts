// EduMK i18n Translation System
// Arabic (primary) + English (secondary)

export type Lang = 'ar' | 'en';

export interface Translations {
  // Navigation
  nav_home: string;
  nav_courses: string;
  nav_research: string;
  nav_training: string;
  nav_dashboard: string;
  nav_admin: string;
  nav_login: string;
  nav_register: string;
  nav_logout: string;
  nav_profile: string;

  // Platform
  platform_name: string;
  platform_name_full: string;
  hospital_name: string;
  hospital_dept: string;

  // Home
  home_hero_title: string;
  home_hero_subtitle: string;
  home_hero_desc: string;
  home_hero_btn_courses: string;
  home_hero_btn_register: string;
  home_stat_courses: string;
  home_stat_employees: string;
  home_stat_certificates: string;
  home_stat_hours: string;
  home_features_title: string;
  home_courses_title: string;
  home_courses_subtitle: string;
  home_view_all: string;

  // Courses
  courses_title: string;
  courses_subtitle: string;
  courses_search_placeholder: string;
  courses_filter_level: string;
  courses_filter_all_levels: string;
  courses_level_beginner: string;
  courses_level_intermediate: string;
  courses_level_advanced: string;
  courses_sort_newest: string;
  courses_sort_rating: string;
  courses_sort_enrolled: string;
  courses_free_only: string;
  courses_free: string;
  courses_count_label: string;
  courses_empty: string;
  courses_clear_filters: string;
  courses_loading: string;

  // Course Card
  course_lectures: string;
  course_hours: string;
  course_students: string;
  course_rating: string;
  course_enroll_free: string;
  course_enroll_paid: string;
  course_continue: string;
  course_progress: string;
  course_instructor: string;

  // Course Detail
  course_content_tab: string;
  course_about_tab: string;
  course_reviews_tab: string;
  course_enroll_btn: string;
  course_lifetime_access: string;
  course_certificate: string;
  course_what_learn: string;
  course_prerequisites: string;
  course_preview_label: string;

  // Assessment
  assessment_title: string;
  assessment_subtitle: string;
  assessment_questions: string;
  assessment_time: string;
  assessment_passing: string;
  assessment_type: string;
  assessment_start: string;
  assessment_mcq: string;
  assessment_instructions: string;
  assessment_instr_1: string;
  assessment_instr_2: string;
  assessment_instr_3: string;
  assessment_instr_4: string;
  assessment_question_label: string;
  assessment_answered: string;
  assessment_next: string;
  assessment_result_pass: string;
  assessment_result_fail: string;
  assessment_correct: string;
  assessment_wrong: string;
  assessment_score: string;
  assessment_retry: string;
  assessment_view_cert: string;
  assessment_loading: string;
  assessment_no_questions: string;
  assessment_issuing_cert: string;
  assessment_cert_ready: string;
  assessment_cert_number: string;
  assessment_need_score: string;
  assessment_login_hint: string;

  // Certificate
  cert_title: string;
  cert_issued_to: string;
  cert_completed: string;
  cert_course: string;
  cert_score: string;
  cert_issued_by: string;
  cert_official: string;
  cert_verify: string;
  cert_print: string;
  cert_download: string;
  cert_number: string;
  cert_date: string;
  cert_signature_dept: string;
  cert_signature_hospital: string;

  // Auth
  login_title: string;
  login_subtitle: string;
  login_email: string;
  login_password: string;
  login_btn: string;
  login_no_account: string;
  login_register_link: string;
  login_forgot: string;
  register_title: string;
  register_subtitle: string;
  register_name: string;
  register_email: string;
  register_password: string;
  register_confirm_password: string;
  register_dept: string;
  register_job: string;
  register_btn: string;
  register_have_account: string;
  register_login_link: string;

  // Dashboard
  dash_welcome: string;
  dash_my_courses: string;
  dash_certificates: string;
  dash_hours: string;
  dash_completed: string;
  dash_courses_tab: string;
  dash_certs_tab: string;
  dash_profile_tab: string;
  dash_no_courses: string;
  dash_no_certs: string;
  dash_continue_btn: string;
  dash_test_btn: string;
  dash_view_cert: string;
  dash_download: string;
  dash_browse_courses: string;

  // Training
  training_title: string;
  training_subtitle: string;

  // Research
  research_title: string;
  research_subtitle: string;
  research_download: string;
  research_papers: string;

  // General
  general_loading: string;
  general_error: string;
  general_back: string;
  general_save: string;
  general_cancel: string;
  general_edit: string;
  general_delete: string;
  general_search: string;
  general_all: string;
  general_free: string;
  general_paid: string;
  general_new: string;
  general_in_progress: string;
  general_completed: string;
  general_minutes: string;
  general_hours: string;
  general_days: string;
  general_online: string;
  general_onsite: string;
  general_yes: string;
  general_no: string;
  general_language: string;
}

const ar: Translations = {
  nav_home: 'الرئيسية',
  nav_courses: 'الدورات',
  nav_research: 'البحوث',
  nav_training: 'التدريب',
  nav_dashboard: 'لوحتي',
  nav_admin: 'الإدارة',
  nav_login: 'تسجيل الدخول',
  nav_register: 'إنشاء حساب',
  nav_logout: 'تسجيل الخروج',
  nav_profile: 'ملفي الشخصي',

  platform_name: 'EduMK',
  platform_name_full: 'منصة EduMK للتعليم الإلكتروني',
  hospital_name: 'مستشفى الولادة والأطفال',
  hospital_dept: 'إدارة الشؤون الأكاديمية والتدريب',

  home_hero_title: 'منصة EduMK للتعليم الإلكتروني',
  home_hero_subtitle: 'مستشفى الولادة والأطفال',
  home_hero_desc: 'المنصة الرسمية للتعليم الطبي المستمر وتطوير الكفاءات المهنية لموظفي المستشفى — أطباء، تمريض، فنيين، وإداريين',
  home_hero_btn_courses: 'استعرض الدورات',
  home_hero_btn_register: 'انضم الآن',
  home_stat_courses: 'دورة تدريبية',
  home_stat_employees: 'موظف مسجّل',
  home_stat_certificates: 'شهادة معتمدة',
  home_stat_hours: 'ساعة تدريبية',
  home_features_title: 'لماذا EduMK؟',
  home_courses_title: 'أحدث الدورات التدريبية',
  home_courses_subtitle: 'دورات معتمدة من إدارة المستشفى في مختلف التخصصات',
  home_view_all: 'عرض جميع الدورات',

  courses_title: 'مكتبة الدورات التدريبية',
  courses_subtitle: 'دورات معتمدة في التخصصات الطبية والإدارية',
  courses_search_placeholder: 'ابحث عن دورة أو تخصص...',
  courses_filter_level: 'المستوى',
  courses_filter_all_levels: 'جميع المستويات',
  courses_level_beginner: 'مبتدئ',
  courses_level_intermediate: 'متوسط',
  courses_level_advanced: 'متقدم',
  courses_sort_newest: 'الأحدث',
  courses_sort_rating: 'الأعلى تقييماً',
  courses_sort_enrolled: 'الأكثر تسجيلاً',
  courses_free_only: 'مجاني فقط',
  courses_free: 'مجاني',
  courses_count_label: 'دورة',
  courses_empty: 'لا توجد دورات تطابق بحثك',
  courses_clear_filters: 'مسح الفلاتر',
  courses_loading: 'جاري تحميل الدورات...',

  course_lectures: 'محاضرة',
  course_hours: 'ساعة',
  course_students: 'متدرب',
  course_rating: 'تقييم',
  course_enroll_free: 'التسجيل مجاناً',
  course_enroll_paid: 'التسجيل في الدورة',
  course_continue: 'متابعة التعلم',
  course_progress: 'التقدم',
  course_instructor: 'المدرب',
  course_content_tab: 'محتوى الدورة',
  course_about_tab: 'نبذة',
  course_reviews_tab: 'التقييمات',
  course_enroll_btn: 'سجّل الآن',
  course_lifetime_access: 'وصول مدى الحياة',
  course_certificate: 'شهادة معتمدة عند الإتمام',
  course_what_learn: 'ماذا ستتعلم؟',
  course_prerequisites: 'المتطلبات',
  course_preview_label: 'معاينة',

  assessment_title: 'اختبار الدورة',
  assessment_subtitle: 'اختبر معلوماتك واحصل على شهادتك',
  assessment_questions: 'عدد الأسئلة',
  assessment_time: 'الوقت المتاح',
  assessment_passing: 'درجة النجاح',
  assessment_type: 'نوع الأسئلة',
  assessment_start: 'ابدأ الاختبار الآن',
  assessment_mcq: 'اختيار متعدد',
  assessment_instructions: 'تعليمات مهمة',
  assessment_instr_1: 'اقرأ كل سؤال بعناية قبل الإجابة',
  assessment_instr_2: 'لا يمكن تغيير إجابتك بعد الاختيار',
  assessment_instr_3: 'يتقدم الاختبار تلقائياً للسؤال التالي',
  assessment_instr_4: 'ستحصل على الشهادة عند تحقيق 70% أو أكثر',
  assessment_question_label: 'سؤال',
  assessment_answered: 'تمت الإجابة',
  assessment_next: 'السؤال التالي',
  assessment_result_pass: 'أحسنت! لقد اجتزت الاختبار 🎉',
  assessment_result_fail: 'لم تتمكن من الاجتياز هذه المرة',
  assessment_correct: 'إجابات صحيحة',
  assessment_wrong: 'إجابات خاطئة',
  assessment_score: 'درجتك النهائية',
  assessment_retry: 'إعادة الاختبار',
  assessment_view_cert: 'عرض الشهادة',
  assessment_loading: 'جاري تحميل الاختبار...',
  assessment_no_questions: 'لا توجد أسئلة لهذه الدورة بعد',
  assessment_issuing_cert: 'جارٍ إصدار شهادتك...',
  assessment_cert_ready: 'مبروك! شهادتك جاهزة',
  assessment_cert_number: 'رقم الشهادة',
  assessment_need_score: 'تحتاج إلى 70% للنجاح',
  assessment_login_hint: 'سجّل دخولك لحفظ نتائجك وإصدار شهادتك',

  cert_title: 'شهادة إتمام',
  cert_issued_to: 'تُمنح هذه الشهادة إلى',
  cert_completed: 'لإتمامه بنجاح دورة',
  cert_course: 'اسم الدورة',
  cert_score: 'الدرجة المحققة',
  cert_issued_by: 'صادرة من',
  cert_official: 'معتمدة رسمياً من إدارة المستشفى',
  cert_verify: 'التحقق من الشهادة',
  cert_print: 'طباعة',
  cert_download: 'تحميل PDF',
  cert_number: 'رقم الشهادة',
  cert_date: 'تاريخ الإصدار',
  cert_signature_dept: 'مدير إدارة الشؤون الأكاديمية والتدريب',
  cert_signature_hospital: 'مستشفى الولادة والأطفال',

  login_title: 'تسجيل الدخول',
  login_subtitle: 'أدخل بياناتك للوصول إلى منصة EduMK',
  login_email: 'البريد الإلكتروني',
  login_password: 'كلمة المرور',
  login_btn: 'دخول',
  login_no_account: 'ليس لديك حساب؟',
  login_register_link: 'إنشاء حساب جديد',
  login_forgot: 'نسيت كلمة المرور؟',
  register_title: 'إنشاء حساب جديد',
  register_subtitle: 'انضم إلى منصة EduMK لموظفي مستشفى الولادة والأطفال',
  register_name: 'الاسم الكامل',
  register_email: 'البريد الإلكتروني المؤسسي',
  register_password: 'كلمة المرور',
  register_confirm_password: 'تأكيد كلمة المرور',
  register_dept: 'القسم / التخصص',
  register_job: 'المسمى الوظيفي',
  register_btn: 'إنشاء الحساب',
  register_have_account: 'لديك حساب بالفعل؟',
  register_login_link: 'تسجيل الدخول',

  dash_welcome: 'مرحباً بك،',
  dash_my_courses: 'دوراتي',
  dash_certificates: 'شهاداتي',
  dash_hours: 'ساعات تدريبية',
  dash_completed: 'مكتملة',
  dash_courses_tab: 'دوراتي',
  dash_certs_tab: 'شهاداتي',
  dash_profile_tab: 'ملفي',
  dash_no_courses: 'لم تسجل في أي دورة بعد',
  dash_no_certs: 'لا توجد شهادات بعد',
  dash_continue_btn: 'متابعة',
  dash_test_btn: 'الاختبار',
  dash_view_cert: 'عرض الشهادة',
  dash_download: 'تحميل',
  dash_browse_courses: 'استعرض الدورات',

  training_title: 'البرامج التدريبية السنوية 2026',
  training_subtitle: 'برامج تدريبية معتمدة على مدار العام',

  research_title: 'مكتبة البحوث العلمية',
  research_subtitle: 'أبحاث ودراسات في المجالات الطبية والصحية',
  research_download: 'تحميل PDF',
  research_papers: 'بحث منشور',

  general_loading: 'جاري التحميل...',
  general_error: 'حدث خطأ',
  general_back: 'رجوع',
  general_save: 'حفظ',
  general_cancel: 'إلغاء',
  general_edit: 'تعديل',
  general_delete: 'حذف',
  general_search: 'بحث',
  general_all: 'الكل',
  general_free: 'مجاني',
  general_paid: 'مدفوع',
  general_new: 'جديد',
  general_in_progress: 'جارٍ',
  general_completed: 'مكتمل',
  general_minutes: 'دقيقة',
  general_hours: 'ساعة',
  general_days: 'يوم',
  general_online: 'عن بُعد',
  general_onsite: 'حضوري',
  general_yes: 'نعم',
  general_no: 'لا',
  general_language: 'English',
};

const en: Translations = {
  nav_home: 'Home',
  nav_courses: 'Courses',
  nav_research: 'Research',
  nav_training: 'Training',
  nav_dashboard: 'My Dashboard',
  nav_admin: 'Admin',
  nav_login: 'Sign In',
  nav_register: 'Register',
  nav_logout: 'Sign Out',
  nav_profile: 'My Profile',

  platform_name: 'EduMK',
  platform_name_full: 'EduMK E-Learning Platform',
  hospital_name: 'Maternity & Children\'s Hospital',
  hospital_dept: 'Academic Affairs & Training Dept.',

  home_hero_title: 'EduMK E-Learning Platform',
  home_hero_subtitle: 'Maternity & Children\'s Hospital',
  home_hero_desc: 'The official platform for Continuous Medical Education and professional development for all hospital staff — physicians, nurses, technicians, and administrators',
  home_hero_btn_courses: 'Browse Courses',
  home_hero_btn_register: 'Join Now',
  home_stat_courses: 'Courses',
  home_stat_employees: 'Enrolled Staff',
  home_stat_certificates: 'Certificates',
  home_stat_hours: 'Training Hours',
  home_features_title: 'Why EduMK?',
  home_courses_title: 'Latest Training Courses',
  home_courses_subtitle: 'Hospital-accredited courses across medical specialties',
  home_view_all: 'View All Courses',

  courses_title: 'Course Library',
  courses_subtitle: 'Accredited courses in medical and administrative specialties',
  courses_search_placeholder: 'Search for a course or specialty...',
  courses_filter_level: 'Level',
  courses_filter_all_levels: 'All Levels',
  courses_level_beginner: 'Beginner',
  courses_level_intermediate: 'Intermediate',
  courses_level_advanced: 'Advanced',
  courses_sort_newest: 'Newest',
  courses_sort_rating: 'Top Rated',
  courses_sort_enrolled: 'Most Enrolled',
  courses_free_only: 'Free Only',
  courses_free: 'Free',
  courses_count_label: 'courses',
  courses_empty: 'No courses match your search',
  courses_clear_filters: 'Clear Filters',
  courses_loading: 'Loading courses...',

  course_lectures: 'lectures',
  course_hours: 'hrs',
  course_students: 'students',
  course_rating: 'rating',
  course_enroll_free: 'Enroll Free',
  course_enroll_paid: 'Enroll Now',
  course_continue: 'Continue Learning',
  course_progress: 'Progress',
  course_instructor: 'Instructor',
  course_content_tab: 'Course Content',
  course_about_tab: 'About',
  course_reviews_tab: 'Reviews',
  course_enroll_btn: 'Enroll Now',
  course_lifetime_access: 'Lifetime Access',
  course_certificate: 'Certificate upon completion',
  course_what_learn: 'What You\'ll Learn',
  course_prerequisites: 'Prerequisites',
  course_preview_label: 'Preview',

  assessment_title: 'Course Assessment',
  assessment_subtitle: 'Test your knowledge and earn your certificate',
  assessment_questions: 'Questions',
  assessment_time: 'Time Allowed',
  assessment_passing: 'Passing Score',
  assessment_type: 'Question Type',
  assessment_start: 'Start Assessment',
  assessment_mcq: 'Multiple Choice',
  assessment_instructions: 'Important Instructions',
  assessment_instr_1: 'Read each question carefully before answering',
  assessment_instr_2: 'You cannot change your answer after selecting',
  assessment_instr_3: 'Assessment auto-advances to next question',
  assessment_instr_4: 'You need 70% or above to receive your certificate',
  assessment_question_label: 'Question',
  assessment_answered: 'Answered',
  assessment_next: 'Next Question',
  assessment_result_pass: 'Congratulations! You passed! 🎉',
  assessment_result_fail: 'You did not pass this time',
  assessment_correct: 'Correct Answers',
  assessment_wrong: 'Wrong Answers',
  assessment_score: 'Final Score',
  assessment_retry: 'Retry Assessment',
  assessment_view_cert: 'View Certificate',
  assessment_loading: 'Loading assessment...',
  assessment_no_questions: 'No questions available for this course yet',
  assessment_issuing_cert: 'Issuing your certificate...',
  assessment_cert_ready: 'Congratulations! Your certificate is ready',
  assessment_cert_number: 'Certificate Number',
  assessment_need_score: 'You need 70% to pass',
  assessment_login_hint: 'Sign in to save your results and issue your certificate',

  cert_title: 'Certificate of Completion',
  cert_issued_to: 'This is to certify that',
  cert_completed: 'has successfully completed',
  cert_course: 'Course',
  cert_score: 'Score Achieved',
  cert_issued_by: 'Issued by',
  cert_official: 'Officially Accredited by Hospital Administration',
  cert_verify: 'Verify Certificate',
  cert_print: 'Print',
  cert_download: 'Download PDF',
  cert_number: 'Certificate No.',
  cert_date: 'Issue Date',
  cert_signature_dept: 'Director, Academic Affairs & Training',
  cert_signature_hospital: 'Maternity & Children\'s Hospital',

  login_title: 'Sign In',
  login_subtitle: 'Enter your credentials to access EduMK platform',
  login_email: 'Email Address',
  login_password: 'Password',
  login_btn: 'Sign In',
  login_no_account: "Don't have an account?",
  login_register_link: 'Create Account',
  login_forgot: 'Forgot password?',
  register_title: 'Create Account',
  register_subtitle: 'Join EduMK platform for Maternity & Children\'s Hospital staff',
  register_name: 'Full Name',
  register_email: 'Institutional Email',
  register_password: 'Password',
  register_confirm_password: 'Confirm Password',
  register_dept: 'Department / Specialty',
  register_job: 'Job Title',
  register_btn: 'Create Account',
  register_have_account: 'Already have an account?',
  register_login_link: 'Sign In',

  dash_welcome: 'Welcome,',
  dash_my_courses: 'My Courses',
  dash_certificates: 'Certificates',
  dash_hours: 'Training Hours',
  dash_completed: 'Completed',
  dash_courses_tab: 'My Courses',
  dash_certs_tab: 'Certificates',
  dash_profile_tab: 'Profile',
  dash_no_courses: 'No courses enrolled yet',
  dash_no_certs: 'No certificates yet',
  dash_continue_btn: 'Continue',
  dash_test_btn: 'Assessment',
  dash_view_cert: 'View Certificate',
  dash_download: 'Download',
  dash_browse_courses: 'Browse Courses',

  training_title: 'Annual Training Programs 2026',
  training_subtitle: 'Accredited training programs throughout the year',

  research_title: 'Scientific Research Library',
  research_subtitle: 'Research and studies in medical and health fields',
  research_download: 'Download PDF',
  research_papers: 'Published Papers',

  general_loading: 'Loading...',
  general_error: 'An error occurred',
  general_back: 'Back',
  general_save: 'Save',
  general_cancel: 'Cancel',
  general_edit: 'Edit',
  general_delete: 'Delete',
  general_search: 'Search',
  general_all: 'All',
  general_free: 'Free',
  general_paid: 'Paid',
  general_new: 'New',
  general_in_progress: 'In Progress',
  general_completed: 'Completed',
  general_minutes: 'min',
  general_hours: 'hrs',
  general_days: 'days',
  general_online: 'Online',
  general_onsite: 'On-site',
  general_yes: 'Yes',
  general_no: 'No',
  general_language: 'العربية',
};

export const translations: Record<Lang, Translations> = { ar, en };
