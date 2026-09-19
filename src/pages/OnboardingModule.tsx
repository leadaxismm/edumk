import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlayCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight,
  Award, AlertTriangle, FileCheck, Video, BookOpen, Shield, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Module {
  id: string;
  title_ar: string;
  description_ar?: string;
  content_ar?: string;
  video_url?: string;
  video_duration_minutes?: number;
  passing_score: number;
  max_attempts: number;
  requires_policy_acceptance: boolean;
  policy_text_ar?: string;
  order_index: number;
}

interface Question {
  id: string;
  question_ar: string;
  option_a_ar: string;
  option_b_ar: string;
  option_c_ar: string;
  option_d_ar: string;
  correct_answer: string;
  explanation_ar?: string;
  order_index: number;
}

interface Prog {
  id?: string;
  user_id?: string;
  module_id?: string;
  video_watched: boolean;
  video_progress_percent?: number;
  quiz_attempts: number;
  quiz_score?: number;
  quiz_passed: boolean;
  policies_accepted: boolean;
  is_completed: boolean;
}

type Step = 'video' | 'quiz' | 'policy' | 'done';

function toEmbed(url: string): string {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return url;
}

export default function OnboardingModulePage() {
  const { id } = useParams<{ id: string }>();
  const { supabaseUser, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [module, setModule] = useState<Module | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prog, setProg] = useState<Prog>({
    video_watched: false, quiz_attempts: 0, quiz_passed: false,
    policies_accepted: false, is_completed: false,
  });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('video');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number; passed: boolean; correct: number; total: number} | null>(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!supabaseUser) { navigate('/login'); return; }
    load();
  }, [id, supabaseUser, authLoading]);

  const load = async () => {
    if (!id || !supabaseUser) return;
    setLoading(true);
    try {
      const [{ data: mod }, { data: qs }, { data: p }] = await Promise.all([
        supabase.from('onboarding_modules').select('*').eq('id', id).maybeSingle(),
        supabase.from('onboarding_questions').select('*').eq('module_id', id).eq('is_active', true).order('order_index'),
        supabase.from('onboarding_progress').select('*').eq('user_id', supabaseUser.id).eq('module_id', id).maybeSingle(),
      ]);
      if (mod) setModule(mod as Module);
      setQuestions((qs || []) as Question[]);
      if (p) {
        setProg(p as Prog);
        setPolicyAgreed(!!p.policies_accepted);
        setVideoPlayed(!!p.video_watched);
        // Route to next uncompleted step
        if (p.is_completed) setStep('done');
        else if (!p.video_watched) setStep('video');
        else if ((qs?.length || 0) > 0 && !p.quiz_passed) setStep('quiz');
        else if (mod?.requires_policy_acceptance && !p.policies_accepted) setStep('policy');
        else setStep('done');
      }
    } finally { setLoading(false); }
  };

  const upsertProgress = async (updates: Partial<Prog>) => {
    if (!supabaseUser || !id) return;
    const newProg = { ...prog, ...updates };
    setProg(newProg);
    const payload = {
      user_id: supabaseUser.id,
      module_id: id,
      video_watched: newProg.video_watched,
      video_progress_percent: newProg.video_progress_percent || 0,
      quiz_attempts: newProg.quiz_attempts || 0,
      quiz_score: newProg.quiz_score ?? null,
      quiz_passed: newProg.quiz_passed,
      policies_accepted: newProg.policies_accepted,
      is_completed: newProg.is_completed,
      completed_at: newProg.is_completed ? new Date().toISOString() : null,
    };
    await supabase.from('onboarding_progress').upsert(payload, { onConflict: 'user_id,module_id' });
  };

  const handleVideoDone = async () => {
    setSaving(true);
    await upsertProgress({ video_watched: true, video_progress_percent: 100 });
    setVideoPlayed(true);
    // If no quiz, go to policy or done
    if (questions.length === 0) {
      if (module?.requires_policy_acceptance) setStep('policy');
      else await completeModule();
    } else {
      setStep('quiz');
    }
    setSaving(false);
  };

  const submitQuiz = async () => {
    if (!module) return;
    let correct = 0;
    questions.forEach(q => { if (answers[q.id] === q.correct_answer) correct++; });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    const passed = score >= module.passing_score;
    setSaving(true);
    const attempts = (prog.quiz_attempts || 0) + 1;
    await upsertProgress({
      quiz_attempts: attempts,
      quiz_score: score,
      quiz_passed: passed,
    });
    setQuizResult({ score, passed, correct, total: questions.length });
    setSaving(false);
    if (passed) {
      // Move to policy or complete
      setTimeout(async () => {
        if (module.requires_policy_acceptance) setStep('policy');
        else await completeModule();
      }, 2500);
    }
  };

  const retryQuiz = () => {
    setAnswers({});
    setQuizResult(null);
  };

  const acceptPolicy = async () => {
    if (!policyAgreed) return;
    setSaving(true);
    await upsertProgress({ policies_accepted: true });
    await completeModule();
    setSaving(false);
  };

  const completeModule = async () => {
    await upsertProgress({ is_completed: true });
    setStep('done');
  };

  if (authLoading || loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    </Layout>
  );

  if (!module) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <p className="text-muted-foreground mb-4">الوحدة غير موجودة</p>
        <Button onClick={() => navigate('/onboarding')}>العودة للبرنامج</Button>
      </div>
    </Layout>
  );

  const failedAllAttempts = quizResult && !quizResult.passed && (prog.quiz_attempts >= module.max_attempts);
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
  const videoEmbed = module.video_url ? toEmbed(module.video_url) : '';

  return (
    <Layout>
      <div dir="rtl" className="bg-muted/30 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-bl from-[oklch(0.22_0.08_220)] to-primary text-white py-5 sm:py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 -mr-2 mb-2 gap-1" onClick={() => navigate('/onboarding')}>
              <ArrowRight className="w-4 h-4" />العودة للبرنامج
            </Button>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-500 border-0 text-[10px]">الوحدة {module.order_index}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{module.title_ar}</h1>
            <p className="text-white/70 text-xs sm:text-sm mt-1">{module.description_ar}</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
            {[
              { key: 'video', label: '1. الفيديو', icon: Video, active: step === 'video', done: prog.video_watched },
              ...(questions.length > 0 ? [{ key: 'quiz', label: '2. الاختبار', icon: FileCheck, active: step === 'quiz', done: prog.quiz_passed }] : []),
              ...(module.requires_policy_acceptance ? [{ key: 'policy', label: `${questions.length > 0 ? '3' : '2'}. السياسات`, icon: Shield, active: step === 'policy', done: prog.policies_accepted }] : []),
            ].map((s, i, arr) => (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  s.done ? 'bg-green-100 text-green-700' :
                  s.active ? 'bg-primary text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                  <span>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="w-4 sm:w-6 h-0.5 bg-border" />}
              </React.Fragment>
            ))}
          </div>

          {/* ═══ STEP 1: VIDEO ═══ */}
          {step === 'video' && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-extrabold text-lg mb-1 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />الخطوة 1: مشاهدة الفيديو
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5 inline ml-1" />
                  مدة الفيديو: {module.video_duration_minutes || 15} دقيقة تقريباً
                </p>

                {videoEmbed ? (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
                    <iframe
                      src={videoEmbed}
                      title={module.title_ar}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-teal-100 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-center p-6">
                      <PlayCircle className="w-16 h-16 text-primary/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">سيتم إضافة الفيديو قريباً</p>
                    </div>
                  </div>
                )}

                {module.content_ar && (
                  <div className="bg-primary/5 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-primary" />
                      محتوى الوحدة
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{module.content_ar}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="video-watched"
                      checked={videoPlayed}
                      onCheckedChange={(c) => setVideoPlayed(!!c)}
                    />
                    <label htmlFor="video-watched" className="text-xs sm:text-sm cursor-pointer">
                      ✓ أقر بأنني شاهدت الفيديو واطلعت على المحتوى
                    </label>
                  </div>
                  <Button
                    disabled={!videoPlayed || saving}
                    onClick={handleVideoDone}
                    className="bg-primary gap-1.5"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4" />}
                    {questions.length > 0 ? 'متابعة للاختبار' : module.requires_policy_acceptance ? 'متابعة للسياسات' : 'إكمال الوحدة'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 2: QUIZ ═══ */}
          {step === 'quiz' && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-extrabold text-lg mb-1 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />الخطوة 2: الاختبار
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  الدرجة المطلوبة: {module.passing_score}% • المحاولة {(prog.quiz_attempts || 0) + 1} من {module.max_attempts}
                </p>

                {quizResult ? (
                  <div className={`p-5 rounded-xl mb-4 ${quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {quizResult.passed ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-green-800 text-lg">🎉 نجحت!</h3>
                            <p className="text-sm text-green-700">الدرجة: {quizResult.score}% ({quizResult.correct} من {quizResult.total})</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-red-800 text-lg">لم تحقق الدرجة المطلوبة</h3>
                            <p className="text-sm text-red-700">الدرجة: {quizResult.score}% — المطلوب: {module.passing_score}%</p>
                          </div>
                        </>
                      )}
                    </div>
                    {!quizResult.passed && (
                      failedAllAttempts ? (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-red-300">
                          <p className="text-sm font-semibold text-red-800 mb-1">⚠️ استنفدت جميع المحاولات</p>
                          <p className="text-xs text-red-600">يرجى التواصل مع إدارة الشؤون الأكاديمية والتدريب لإعادة المحاولة</p>
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/onboarding')}>العودة للبرنامج</Button>
                        </div>
                      ) : (
                        <Button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white" onClick={retryQuiz}>
                          🔄 محاولة ثانية
                        </Button>
                      )
                    )}
                    {quizResult.passed && (
                      <p className="text-xs text-green-700 mt-2">✨ جاري الانتقال للخطوة التالية...</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-5">
                      {questions.map((q, qi) => (
                        <div key={q.id} className="bg-muted/40 rounded-xl p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <span className="bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{qi + 1}</span>
                            <h3 className="font-bold text-sm sm:text-base">{q.question_ar}</h3>
                          </div>
                          <div className="space-y-2">
                            {(['A','B','C','D'] as const).map(letter => {
                              const optKey = `option_${letter.toLowerCase()}_ar` as keyof Question;
                              const optText = q[optKey] as string;
                              if (!optText) return null;
                              const selected = answers[q.id] === letter;
                              return (
                                <label
                                  key={letter}
                                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                    selected ? 'bg-primary/10 border-primary' : 'bg-white border-transparent hover:bg-muted'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={letter}
                                    checked={selected}
                                    onChange={() => setAnswers(p => ({ ...p, [q.id]: letter }))}
                                    className="w-4 h-4 text-primary"
                                  />
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                    {{A:'أ',B:'ب',C:'ج',D:'د'}[letter]}
                                  </span>
                                  <span className="text-sm flex-1">{optText}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      disabled={!allAnswered || saving}
                      onClick={submitQuiz}
                      className="w-full bg-primary gap-1.5"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      تسليم الاختبار
                    </Button>
                    {!allAnswered && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        أجب على جميع الأسئلة قبل التسليم ({Object.keys(answers).length}/{questions.length})
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ STEP 3: POLICY ═══ */}
          {step === 'policy' && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-extrabold text-lg mb-1 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {questions.length > 0 ? 'الخطوة 3' : 'الخطوة 2'}: إقرار السياسات
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  اقرأ السياسات بعناية ثم أقرّ بالالتزام
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5 max-h-96 overflow-y-auto">
                  <h3 className="font-bold text-sm mb-2 text-amber-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />نص الإقرار
                  </h3>
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">
                    {module.policy_text_ar || module.content_ar}
                  </p>
                </div>

                <label className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl cursor-pointer border border-primary/20 mb-4">
                  <Checkbox
                    id="policy-agree"
                    checked={policyAgreed}
                    onCheckedChange={(c) => setPolicyAgreed(!!c)}
                    className="mt-0.5"
                  />
                  <span className="text-sm font-semibold text-foreground flex-1">
                    ✓ أقر بأنني قرأت وفهمت جميع السياسات والإجراءات أعلاه، وأتعهد بالالتزام بها أثناء أداء عملي في المستشفى
                  </span>
                </label>

                <Button
                  disabled={!policyAgreed || saving}
                  onClick={acceptPolicy}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  إكمال الوحدة وحفظ الإقرار
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ═══ DONE ═══ */}
          {step === 'done' && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-extrabold text-green-800 mb-2">✅ تم إكمال الوحدة!</h2>
                <p className="text-sm text-green-700 mb-5">أحسنت! أكملت هذه الوحدة بنجاح</p>
                {prog.quiz_score != null && (
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-green-300 mb-5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-sm">الدرجة: {prog.quiz_score}%</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Button onClick={() => navigate('/onboarding')} className="bg-primary gap-1.5">
                    <ArrowRight className="w-4 h-4" />
                    العودة للبرنامج
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
