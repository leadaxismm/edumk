import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, CheckCircle2, Lock, Loader2, GraduationCap,
  Clock, ChevronLeft, Award, Sparkles, Shield, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface OnboardingModule {
  id: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  order_index: number;
  video_duration_minutes?: number;
  requires_policy_acceptance?: boolean;
  module_type: string;
  is_active: boolean;
}

interface Progress {
  module_id: string;
  is_completed: boolean;
  video_watched: boolean;
  quiz_passed: boolean;
  quiz_score?: number;
}

export default function OnboardingPage() {
  const { supabaseUser, isAdmin, onboardingCompleted, loading: authLoading, refreshOnboarding } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<OnboardingModule[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!supabaseUser) { navigate('/login'); return; }
    if (isAdmin || onboardingCompleted) { navigate('/'); return; }
    loadData();
  }, [supabaseUser, isAdmin, onboardingCompleted, authLoading]);

  const loadData = async () => {
    if (!supabaseUser) return;
    setLoading(true);
    try {
      const [{ data: mods }, { data: prog }] = await Promise.all([
        supabase.from('onboarding_modules').select('*').eq('is_active', true).order('order_index'),
        supabase.from('onboarding_progress').select('*').eq('user_id', supabaseUser.id),
      ]);
      setModules((mods || []) as OnboardingModule[]);
      setProgress((prog || []) as Progress[]);
    } finally { setLoading(false); }
  };

  const getProgress = (modId: string) => progress.find(p => p.module_id === modId);

  const completedCount = modules.filter(m => getProgress(m.id)?.is_completed).length;
  const totalCount = modules.length;
  const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Module is unlocked if it's the first, or the previous one is completed
  const isUnlocked = (module: OnboardingModule, idx: number) => {
    if (idx === 0) return true;
    const prev = modules[idx - 1];
    return !!getProgress(prev.id)?.is_completed;
  };

  const handleStart = (modId: string) => {
    navigate(`/onboarding/module/${modId}`);
  };

  const handleFinishAll = async () => {
    if (!supabaseUser) return;
    // Mark onboarding as completed in profiles
    await supabase.from('profiles').update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_score: progress.reduce((s, p) => s + (p.quiz_score || 0), 0) / Math.max(progress.filter(p => p.quiz_score != null).length, 1),
    }).eq('id', supabaseUser.id);
    await refreshOnboarding();
    navigate('/');
  };

  if (authLoading || loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    </Layout>
  );

  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <Layout>
      <div dir="rtl" className="bg-gradient-to-br from-primary/5 via-muted/30 to-teal-50 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-bl from-[oklch(0.22_0.08_220)] to-primary text-white py-8 sm:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-3">
              <img src="/edumk-logo.svg" className="w-8 h-8" alt="EduMK" />
              <Badge className="bg-amber-500 text-white border-0 text-[10px]">🎓 إلزامي</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              مرحباً بك، {supabaseUser?.user_metadata?.full_name || supabaseUser?.email?.split('@')[0] || 'عزيزي المستخدم'} 👋
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              يجب إكمال البرنامج التعريفي قبل الوصول إلى دورات ومحتوى المنصة
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Progress Summary */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    تقدمك في البرنامج
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    أكملت {completedCount} من {totalCount} وحدات
                  </p>
                </div>
                <div className="text-3xl font-extrabold text-primary">{Math.round(percent)}%</div>
              </div>
              <Progress value={percent} className="h-3" />
              {allDone && (
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-l from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-800">🎉 أحسنت! أكملت جميع الوحدات</h3>
                      <p className="text-xs text-green-700">اضغط الزر لفتح المنصة الكاملة</p>
                    </div>
                    <Button onClick={handleFinishAll} className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                      <Award className="w-4 h-4" />
                      افتح المنصة الآن
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modules List */}
          <div className="space-y-4">
            {modules.map((mod, idx) => {
              const p = getProgress(mod.id);
              const unlocked = isUnlocked(mod, idx);
              const completed = !!p?.is_completed;
              const inProgress = !!p && !completed;

              return (
                <Card key={mod.id} className={`border-0 shadow-md transition-all ${completed ? 'ring-2 ring-green-400/40' : !unlocked ? 'opacity-60' : 'hover:shadow-lg'}`}>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Number/Status icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg font-extrabold ${
                        completed ? 'bg-green-500 text-white' :
                        !unlocked ? 'bg-muted text-muted-foreground' :
                        inProgress ? 'bg-amber-500 text-white' :
                        'bg-primary text-white'
                      }`}>
                        {completed ? <CheckCircle2 className="w-6 h-6" /> :
                         !unlocked ? <Lock className="w-5 h-5" /> :
                         mod.order_index}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg text-foreground">{mod.title_ar}</h3>
                          {mod.requires_policy_acceptance && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] gap-1">
                              <Shield className="w-3 h-3" />إقرار سياسات
                            </Badge>
                          )}
                          {completed && <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">✅ مكتملة</Badge>}
                          {inProgress && <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">🔄 قيد التنفيذ</Badge>}
                          {!unlocked && <Badge variant="outline" className="text-[10px]">🔒 مقفلة</Badge>}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                          {mod.description_ar}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground mb-3">
                          {mod.video_duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{mod.video_duration_minutes} دقيقة</span>
                            </div>
                          )}
                          {p?.quiz_score != null && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>النتيجة: {p.quiz_score}%</span>
                            </div>
                          )}
                        </div>

                        {/* Action button */}
                        {!unlocked ? (
                          <Button disabled size="sm" variant="outline" className="gap-1.5">
                            <Lock className="w-3.5 h-3.5" />أكمل الوحدة السابقة أولاً
                          </Button>
                        ) : completed ? (
                          <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300" onClick={() => handleStart(mod.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />مكتملة — مراجعة
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5" onClick={() => handleStart(mod.id)}>
                            <PlayCircle className="w-4 h-4" />
                            {inProgress ? 'متابعة' : 'ابدأ الآن'}
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer message */}
          <Card className="border-0 shadow-sm mt-6 bg-primary/5">
            <CardContent className="p-5 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                بعد إكمال جميع الوحدات يُفتح لك الوصول الكامل للمنصة
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                الدورات • البحوث العلمية • البرامج التدريبية • الشهادات
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
