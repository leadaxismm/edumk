import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, MapPin, CheckCircle, Award, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { MOCK_PROGRAMS, MOCK_SPECIALIZATIONS } from '@/data/index';
import { getTrainingPrograms } from '@/lib/supabase';
import { PROGRAM_TYPE_LABELS } from '@/lib/index';
import { staggerContainer, staggerItem, springPresets } from '@/lib/motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function TrainingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [programs, setPrograms] = useState(MOCK_PROGRAMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTrainingPrograms() as Record<string, unknown>[];
        if (data && data.length > 0) {
          const mapped = data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            title_ar: (row.title as string) || '',
            description_ar: (row.description as string) || '',
            program_type: (row.program_type as string) || 'workshop',
            start_date: (row.start_date as string) || '',
            end_date: (row.end_date as string) || '',
            duration_days: (row.duration_days as number) || 3,
            capacity: (row.capacity as number) || 30,
            enrolled_count: (row.enrolled_count as number) || 0,
            location: (row.location as string) || 'عن بعد',
            is_online: (row.is_online as boolean) ?? true,
            is_published: true,
            specialization_id: '',
            specialization: (row.specialization as Record<string, unknown>) || { name_ar: 'طبي', color: '#1a4a7a' },
            instructor_name: (row.instructor_name as string) || 'فريق التدريب',
            objectives: [] as string[],
            year: 2026,
            max_participants: (row.capacity as number) || 30,
            certificate_enabled: true,
            created_at: (row.created_at as string) || '',
          }));
          setPrograms(mapped as unknown as typeof MOCK_PROGRAMS);
        }
      } catch { /* fallback */ }
      setLoading(false);
    })();
  }, []);

  const filtered = programs.filter((p: typeof MOCK_PROGRAMS[0]) => {
    if (selectedType !== 'all' && p.program_type !== selectedType) return false;
    if (selectedSpec !== 'all' && p.specialization_id !== selectedSpec) return false;
    return true;
  });

  // Build calendar view
  const calendar: Record<number, typeof MOCK_PROGRAMS> = {};
  MOCK_PROGRAMS.forEach(p => {
    if (p.start_date) {
      const month = new Date(p.start_date).getMonth();
      if (!calendar[month]) calendar[month] = [];
      calendar[month].push(p);
    }
  });

  const handleEnroll = (progId: string) => {
    if (!isAuthenticated) { navigate(ROUTE_PATHS.LOGIN); return; }
    alert('تم تسجيلك في البرنامج بنجاح! ستتلقى بريداً إلكترونياً بتفاصيل البرنامج.');
  };

  return (
    <Layout>
      <div dir="rtl" className="bg-background min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-bl from-primary via-primary/90 to-accent/80 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">البرامج التدريبية السنوية 2026</h1>
            <p className="text-white/75 max-w-xl mx-auto">برامج تدريبية معتمدة في التخصصات الطبية والإدارية والبحثية على مدار العام</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Annual Calendar Strip */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-5">التقويم التدريبي 2026</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {MONTHS_AR.map((month, idx) => {
                const monthProgs = calendar[idx] || [];
                const hasProgram = monthProgs.length > 0;
                return (
                  <div key={month}
                    className={`relative p-2 rounded-xl border text-center transition-all ${hasProgram ? 'border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer' : 'border-border bg-muted/30 opacity-60'}`}>
                    <p className="text-xs font-medium text-foreground">{month}</p>
                    {hasProgram && (
                      <div className="mt-1 space-y-0.5">
                        {monthProgs.slice(0, 2).map(p => (
                          <div key={p.id} className="w-full h-1.5 rounded-full" style={{ backgroundColor: p.specialization?.color || '#1a4a7a' }} />
                        ))}
                      </div>
                    )}
                    {hasProgram && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {monthProgs.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
              {MOCK_SPECIALIZATIONS.slice(0, 4).map(s => (
                <span key={s.id} className="flex items-center gap-1">
                  <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name_ar}
                </span>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="text-xl font-bold ml-4">البرامج المتاحة</h2>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="نوع البرنامج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="medical">🏥 طبي</SelectItem>
                <SelectItem value="administrative">🏛️ إداري</SelectItem>
                <SelectItem value="research">🔬 بحثي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSpec} onValueChange={setSelectedSpec}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {MOCK_SPECIALIZATIONS.map(s => <SelectItem key={s.id} value={s.id}>{s.name_ar}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="mr-auto text-sm text-muted-foreground">{filtered.length} برنامج</span>
          </div>

          {/* Programs Grid */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(prog => {
              const fillPercent = (prog.enrolled_count / prog.max_participants) * 100;
              const isFull = fillPercent >= 100;
              const startDate = prog.start_date ? new Date(prog.start_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
              const endDate = prog.end_date ? new Date(prog.end_date).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' }) : '';

              return (
                <motion.div key={prog.id} variants={staggerItem}>
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Color stripe */}
                    <div className="h-1.5 w-full" style={{ backgroundColor: prog.specialization?.color || '#1a4a7a' }} />
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs"
                              style={{ color: prog.specialization?.color, borderColor: prog.specialization?.color + '50' }}>
                              {prog.specialization?.name_ar}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {prog.program_type === 'medical' ? '🏥' : prog.program_type === 'research' ? '🔬' : '🏛️'} {PROGRAM_TYPE_LABELS[prog.program_type]}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-foreground text-base leading-snug">{prog.title_ar}</h3>
                        </div>
                        {prog.certificate_enabled && (
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-5 flex-1 line-clamp-3">{prog.description_ar}</p>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{startDate}</p>
                            <p className="text-xs">حتى {endDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{prog.duration_days} يوم</p>
                            <p className="text-xs">مدة البرنامج</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-xs">{prog.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-xs">{prog.enrolled_count}/{prog.max_participants} متدرب</span>
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">الطاقة الاستيعابية</span>
                          <span className={`font-semibold ${isFull ? 'text-destructive' : fillPercent > 70 ? 'text-amber-600' : 'text-green-600'}`}>
                            {Math.round(fillPercent)}%
                          </span>
                        </div>
                        <Progress value={fillPercent} className="h-1.5" />
                      </div>

                      {prog.instructor_name && (
                        <p className="text-xs text-muted-foreground mb-4">
                          المدرب: <span className="font-medium text-foreground">{prog.instructor_name}</span>
                        </p>
                      )}

                      <Button
                        className="w-full font-bold"
                        disabled={isFull}
                        onClick={() => handleEnroll(prog.id)}
                        style={!isFull ? { backgroundColor: prog.specialization?.color || undefined } : {}}>
                        {isFull ? '🚫 اكتملت الأماكن' : <>
                          <CheckCircle className="w-4 h-4 ml-2" />التسجيل في البرنامج
                        </>}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
