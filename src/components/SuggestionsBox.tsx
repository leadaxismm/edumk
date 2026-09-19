import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Send, CheckCircle2, User, Building2, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';

const DEPARTMENTS_AR = ['التمريض','الطب','المختبرات الطبية','الأشعة','الطوارئ والإسعاف','الصيدلة','إدارة الرعاية الصحية','البحث العلمي','الموارد البشرية','تقنية المعلومات','أخرى'];
const DEPARTMENTS_EN = ['Nursing','Medicine','Medical Laboratory','Radiology','Emergency & EMS','Pharmacy','Healthcare Management','Scientific Research','Human Resources','IT Department','Other'];
const CATEGORIES_AR = ['دورة تدريبية جديدة','مقال علمي','بروتوكول طبي','سياسة إدارية','ورشة عمل','مادة بحثية','أخرى'];
const CATEGORIES_EN = ['New Training Course','Scientific Article','Medical Protocol','Administrative Policy','Workshop','Research Material','Other'];

export default function SuggestionsBox() {
  const { lang, isRTL } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', dept: '', category: '', suggestion: '', email: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(lang === 'ar' ? 'يرجى كتابة اسمك' : 'Please enter your name'); return; }
    if (!form.dept) { setError(lang === 'ar' ? 'يرجى اختيار قسمك' : 'Please select your department'); return; }
    if (!form.suggestion.trim() || form.suggestion.trim().length < 10) {
      setError(lang === 'ar' ? 'يرجى كتابة اقتراحك (10 أحرف على الأقل)' : 'Please write your suggestion (at least 10 chars)'); return;
    }
    setLoading(true); setError('');
    try {
      await supabase.from('suggestions').insert({
        employee_name: form.name.trim(),
        department: form.dept,
        category: form.category || 'general',
        suggestion: form.suggestion.trim(),
        email: form.email.trim() || null,
        status: 'pending',
      });
      setSubmitted(true);
    } catch {
      setError(lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again');
    }
    setLoading(false);
  };

  const DEPTS = lang === 'ar' ? DEPARTMENTS_AR : DEPARTMENTS_EN;
  const CATS = lang === 'ar' ? CATEGORIES_AR : CATEGORIES_EN;

  return (
    <section dir={isRTL ? 'rtl' : 'ltr'} className="py-16 bg-gradient-to-bl from-primary/5 to-accent/5">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-2">
              {lang === 'ar' ? '🎉 شكراً على اقتراحك!' : '🎉 Thank you for your suggestion!'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {lang === 'ar'
                ? 'تم استلام اقتراحك وسيتم مراجعته من قِبل إدارة الشؤون الأكاديمية والتدريب.'
                : 'Your suggestion has been received and will be reviewed by the Academic Affairs & Training Department.'}
            </p>
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', dept: '', category: '', suggestion: '', email: '' }); }}>
              {lang === 'ar' ? 'إضافة اقتراح جديد' : 'Add New Suggestion'}
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">
                {lang === 'ar' ? '💡 صندوق الاقتراحات' : '💡 Suggestions Box'}
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {lang === 'ar'
                  ? 'هل تحتاج موضوعاً تعليمياً معيناً؟ أو لديك اقتراح لتحسين المنصة؟ شاركنا فكرتك!'
                  : 'Need a specific educational topic? Have a suggestion to improve the platform? Share your idea!'}
              </p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-4"
            >
              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {lang === 'ar' ? 'الاسم *' : 'Name *'}
                  </Label>
                  <Input value={form.name} onChange={set('name')} className="h-10"
                    placeholder={lang === 'ar' ? 'اسمك الكامل' : 'Your full name'} />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    {lang === 'ar' ? 'القسم *' : 'Department *'}
                  </Label>
                  <Select onValueChange={v => setForm(p => ({ ...p, dept: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={lang === 'ar' ? 'اختر قسمك' : 'Select dept.'} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    {lang === 'ar' ? 'نوع الاقتراح' : 'Category'}
                  </Label>
                  <Select onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={lang === 'ar' ? 'اختر النوع' : 'Select type'} />
                    </SelectTrigger>
                    <SelectContent>
                      {CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email optional */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {lang === 'ar' ? 'البريد (اختياري)' : 'Email (optional)'}
                  </Label>
                  <Input type="email" value={form.email} onChange={set('email')} className="h-10"
                    placeholder="you@hospital.sa" dir="ltr" />
                </div>
              </div>

              {/* Suggestion Text */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {lang === 'ar' ? 'اقتراحك *' : 'Your Suggestion *'}
                </Label>
                <Textarea
                  value={form.suggestion}
                  onChange={set('suggestion')}
                  rows={4}
                  className="resize-none"
                  placeholder={lang === 'ar'
                    ? 'اكتب اقتراحك هنا... مثال: أحتاج دورة في إدارة جرعات الأدوية للمواليد'
                    : 'Write your suggestion here... e.g., I need a course on neonatal medication dosing'}
                />
                <p className="text-xs text-muted-foreground text-left" dir="ltr">{form.suggestion.length} / 500</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary font-bold gap-2">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
                {lang === 'ar' ? 'إرسال الاقتراح' : 'Submit Suggestion'}
              </Button>
            </motion.form>
          </>
        )}
      </div>
    </section>
  );
}
