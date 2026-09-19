import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, User, Building2, BookOpen, Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const DEPARTMENTS_AR = [
  'التمريض', 'الطب', 'المختبرات الطبية', 'الأشعة',
  'الطوارئ والإسعاف', 'الصيدلة', 'إدارة الرعاية الصحية',
  'البحث العلمي', 'الموارد البشرية', 'تقنية المعلومات', 'أخرى',
];
const DEPARTMENTS_EN = [
  'Nursing', 'Medicine', 'Medical Laboratory', 'Radiology',
  'Emergency & EMS', 'Pharmacy', 'Healthcare Management',
  'Scientific Research', 'Human Resources', 'IT Department', 'Other',
];

interface ReadingConfirmationProps {
  articleTitle: string;
  courseId?: string;
  lessonId?: string;
}

export default function ReadingConfirmation({ articleTitle, courseId, lessonId }: ReadingConfirmationProps) {
  const { lang, isRTL } = useLang();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [error, setError] = useState('');

  const DEPTS = lang === 'ar' ? DEPARTMENTS_AR : DEPARTMENTS_EN;

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError(lang === 'ar' ? 'يرجى كتابة اسمك' : 'Please enter your name');
      return;
    }
    if (!dept) {
      setError(lang === 'ar' ? 'يرجى اختيار قسمك' : 'Please select your department');
      return;
    }
    setLoading(true); setError('');
    try {
      await supabase.from('reading_confirmations').insert({
        employee_name: name.trim(),
        department: dept,
        article_title: articleTitle,
        course_id: courseId || null,
        lesson_id: lessonId || null,
      });
      setConfirmed(true);
      setShowModal(false);
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, try again');
    }
    setLoading(false);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="mt-8 pt-6 border-t border-border">
      {confirmed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <CheckCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800 dark:text-green-300 text-sm">
              {lang === 'ar' ? `✅ تم تسجيل قراءة: ${name}` : `✅ Reading confirmed by: ${name}`}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {lang === 'ar' ? `القسم: ${dept}` : `Department: ${dept}`}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {lang === 'ar' ? 'هل أتممت قراءة هذا المقال؟' : 'Have you completed reading this article?'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'ar' ? 'اضغط لتسجيل حضورك رسمياً' : 'Click to officially register your attendance'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white gap-2 shrink-0 w-full sm:w-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            {lang === 'ar' ? 'تمت القراءة ✓' : 'Mark as Read ✓'}
          </Button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
            >
              {/* Close */}
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {lang === 'ar' ? 'تأكيد القراءة' : 'Reading Confirmation'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {articleTitle}
                </p>
              </div>

              <div className="space-y-4">
                {error && (
                  <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                  </Label>
                  <Input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className="h-11"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    {lang === 'ar' ? 'القسم *' : 'Department *'}
                  </Label>
                  <Select onValueChange={setDept}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={lang === 'ar' ? 'اختر قسمك' : 'Select your department'} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full h-11 bg-primary font-bold gap-2"
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />}
                  {lang === 'ar' ? 'تأكيد القراءة' : 'Confirm Reading'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
