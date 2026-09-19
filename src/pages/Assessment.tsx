import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Award, RotateCcw, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import { ROUTE_PATHS } from '@/lib/index';
import { springPresets } from '@/lib/motion';
import { useAuth } from '@/hooks/useAuth';
import { getAssessmentForCourse, submitResult, issueCertificate } from '@/lib/supabase';

const PASS_THRESHOLD = 70;
const TIME_PER_Q = 90; // seconds per question

interface Question {
  id: string;
  course_id: string;
  question: string;
  correct_answer: number;
  options: string[];
  text: string;
}

type AnswerMap = Record<string, number>;
type Phase = 'intro' | 'quiz' | 'result';

function parseQuestion(raw: Record<string, unknown>): Question {
  const parts = ((raw.question as string) || '').split('|||');
  const text = parts[0] || 'سؤال';
  const options = parts.slice(1);
  while (options.length < 4) options.push(`خيار ${options.length + 1}`);
  return {
    id: raw.id as string,
    course_id: raw.course_id as string,
    question: raw.question as string,
    correct_answer: (raw.correct_answer as number) - 1, // convert 1-based to 0-based
    options,
    text,
  };
}

export default function AssessmentPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [certNum, setCertNum] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    (async () => {
      if (!courseId) return;
      try {
        const data = (await getAssessmentForCourse(courseId)) as Record<string, unknown>[];
        if (data && data.length > 0) {
          const parsed = data.map(parseQuestion);
          setQuestions(parsed);
          setTimeLeft(parsed.length * TIME_PER_Q);
        }
      } catch { /* no questions */ }
      setLoading(false);
    })();
  }, [courseId]);

  const submitQuiz = useCallback(async (finalAnswers: AnswerMap) => {
    const correct = questions.filter(q => finalAnswers[q.id] === q.correct_answer).length;
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setCorrectCount(correct);
    setScore(pct);
    setPhase('result');

    if (user && courseId) {
      setSaving(true);
      try {
        const passed = pct >= PASS_THRESHOLD;
        await submitResult(user.id, courseId, pct, passed);
        if (passed) {
          const cert = await issueCertificate(user.id, courseId, pct) as Record<string, unknown> | null;
          if (cert?.certificate_number) setCertNum(cert.certificate_number as string);
        }
      } catch { /* ignore */ }
      setSaving(false);
    }
  }, [questions, user, courseId]);

  useEffect(() => {
    if (phase !== 'quiz') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); submitQuiz(answers); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, submitQuiz, answers]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const isPassed = score >= PASS_THRESHOLD;
  const answered = Object.keys(answers).length;
  const q = questions[currentQ];

  const selectAnswer = (qId: string, idx: number) => {
    if (answers[qId] !== undefined) return;
    const newAnswers = { ...answers, [qId]: idx };
    setAnswers(newAnswers);
    // Auto advance after short delay
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
      } else {
        submitQuiz(newAnswers);
      }
    }, 700);
  };

  const restart = () => {
    setPhase('intro'); setCurrentQ(0); setAnswers({}); setScore(0); setCorrectCount(0);
    setTimeLeft(questions.length * TIME_PER_Q);
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="mr-3 text-muted-foreground">جاري تحميل الاختبار...</span>
      </div>
    </Layout>
  );

  if (questions.length === 0) return (
    <Layout>
      <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">لا توجد أسئلة</h2>
        <p className="text-muted-foreground mb-6">لم يتم إضافة أسئلة لهذه الدورة بعد</p>
        <Button onClick={() => navigate(ROUTE_PATHS.COURSES)}>العودة للدورات</Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div dir="rtl" className="bg-background min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* INTRO */}
          {phase === 'intro' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}>
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-bl from-primary to-accent p-8 text-white text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">اختبار الدورة</h1>
                  <p className="text-white/75">اختبر معلوماتك واحصل على شهادتك</p>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'عدد الأسئلة', value: `${questions.length} سؤال` },
                      { label: 'الوقت المتاح', value: formatTime(questions.length * TIME_PER_Q) },
                      { label: 'درجة النجاح', value: `${PASS_THRESHOLD}%` },
                      { label: 'نوع الأسئلة', value: 'اختيار متعدد' },
                    ].map(item => (
                      <div key={item.label} className="text-center p-3 bg-muted/50 rounded-xl">
                        <p className="text-lg font-bold text-primary">{item.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-2">⚠️ تعليمات مهمة:</p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                      <li>اقرأ كل سؤال بعناية قبل الإجابة</li>
                      <li>لا يمكن تغيير إجابتك بعد الاختيار</li>
                      <li>يتقدم الاختبار تلقائياً للسؤال التالي</li>
                      <li>ستحصل على الشهادة عند تحقيق {PASS_THRESHOLD}% أو أكثر</li>
                    </ul>
                  </div>
                  {!isAuthenticated && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700 dark:text-blue-300">
                      💡 سجّل دخولك لحفظ نتائجك وإصدار شهادتك
                    </div>
                  )}
                  <Button className="w-full h-12 text-base font-bold bg-primary" onClick={() => setPhase('quiz')}>
                    ابدأ الاختبار الآن
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* QUIZ */}
          {phase === 'quiz' && q && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{currentQ + 1}</span> / {questions.length}
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1.5 rounded-full ${timeLeft <= 30 ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                  <Clock className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <Progress value={(currentQ / questions.length) * 100} className="mb-6 h-2" />

              <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <Card className="border-0 shadow-lg mb-4">
                    <CardHeader className="pb-2">
                      <Badge variant="outline" className="self-start text-xs mb-2">
                        سؤال {currentQ + 1}
                      </Badge>
                      <CardTitle className="text-lg leading-relaxed font-bold">{q.text}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {q.options.map((opt, idx) => {
                          const selected = answers[q.id];
                          const isSelected = selected === idx;
                          const isCorrect = idx === q.correct_answer;
                          const showResult = selected !== undefined;

                          let cls = 'border-2 rounded-xl p-4 cursor-pointer transition-all text-right ';
                          if (!showResult) cls += 'border-border hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]';
                          else if (isCorrect) cls += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                          else if (isSelected && !isCorrect) cls += 'border-red-400 bg-red-50 dark:bg-red-900/20';
                          else cls += 'border-border opacity-60';

                          return (
                            <button key={idx} className={`w-full ${cls}`} onClick={() => selectAnswer(q.id, idx)} disabled={selected !== undefined}>
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${showResult && isCorrect ? 'border-green-500 bg-green-500 text-white' : showResult && isSelected ? 'border-red-400 bg-red-400 text-white' : 'border-border'}`}>
                                  {['أ', 'ب', 'ج', 'د'][idx]}
                                </div>
                                <span className="text-sm text-right flex-1">{opt}</span>
                                {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                                {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>تمت الإجابة: {answered}/{questions.length}</span>
                {answers[q.id] !== undefined && currentQ < questions.length - 1 && (
                  <Button size="sm" variant="outline" onClick={() => setCurrentQ(p => p + 1)}>
                    السؤال التالي →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* RESULT */}
          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={springPresets.bouncy}>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className={`p-8 text-white text-center ${isPassed ? 'bg-gradient-to-bl from-green-600 to-teal-600' : 'bg-gradient-to-bl from-red-600 to-red-800'}`}>
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    {isPassed ? <Award className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
                  </div>
                  <h2 className="text-3xl font-bold mb-1">{score}%</h2>
                  <p className="text-white/80 text-lg">{isPassed ? '🎉 أحسنت! لقد اجتزت الاختبار' : 'لم تتمكن من اجتياز الاختبار هذه المرة'}</p>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                      <p className="text-xs text-muted-foreground">إجابات صحيحة</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-red-500">{questions.length - correctCount}</p>
                      <p className="text-xs text-muted-foreground">إجابات خاطئة</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-primary">{score}%</p>
                      <p className="text-xs text-muted-foreground">درجتك النهائية</p>
                    </div>
                  </div>

                  {isPassed && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-2xl p-5 mb-6 text-center">
                      <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">
                        {saving ? 'جارٍ إصدار شهادتك...' : 'مبروك! شهادتك جاهزة'}
                      </p>
                      {certNum && <p className="text-xs text-amber-600 font-mono">رقم الشهادة: {certNum}</p>}
                      {saving && <Loader2 className="w-4 h-4 animate-spin text-amber-600 mx-auto mt-2" />}
                    </div>
                  )}

                  {!isPassed && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-2xl p-4 mb-6 text-sm text-blue-700 dark:text-blue-300 text-center">
                      تحتاج إلى {PASS_THRESHOLD}% للنجاح. درجتك {score}%. يمكنك المحاولة مجدداً.
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {isPassed && (
                      <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white gap-2"
                        onClick={() => navigate(ROUTE_PATHS.CERTIFICATE + '/' + courseId)}>
                        <Award className="w-4 h-4" />عرض الشهادة
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1 gap-2" onClick={restart}>
                      <RotateCcw className="w-4 h-4" />إعادة الاختبار
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => navigate(ROUTE_PATHS.COURSES)}>
                      الدورات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
