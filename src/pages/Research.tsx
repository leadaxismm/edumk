import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ExternalLink, BookOpen, Filter, FileText, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { MOCK_PAPERS, MOCK_SPECIALIZATIONS } from '@/data/index';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { getResearchPapers } from '@/lib/supabase';

interface DbPaper {
  id: string;
  title: string;
  abstract?: string;
  authors?: string[];
  year?: number;
  journal?: string;
  doi?: string;
  file_url?: string;
  download_count?: number;
  file_size_kb?: number;
  is_published?: boolean;
  created_at?: string;
  specialization?: { name_ar: string; color?: string };
}

function mapDbPaper(row: Record<string, unknown>): typeof MOCK_PAPERS[0] {
  const titleFull = (row.title as string) || '';
  const [title_ar, title_en = ''] = titleFull.split('|').map((s: string) => s.trim());
  const authorsRaw = row.authors as string | string[] | undefined;
  const authors: string[] = Array.isArray(authorsRaw) ? authorsRaw : typeof authorsRaw === 'string' ? authorsRaw.split(',').map((a: string) => a.trim()) : ['فريق البحث'];
  return {
    id: row.id as string,
    title_ar,
    title_en,
    abstract_ar: (row.abstract as string) || '',
    authors,
    year: row.year as number | undefined,
    journal: (row.journal as string) || '',
    doi: (row.doi as string) || '',
    file_url: (row.file_url as string) || '',
    download_count: (row.download_count as number) || 0,
    file_size_kb: (row.file_size_kb as number) || 0,
    is_published: true,
    specialization_id: '',
    specialization: (row.specialization as { id: string; name_ar: string; color?: string }) || { id: '', name_ar: 'طبي', color: '#1a4a7a' },
    created_at: (row.created_at as string) || '',
  };
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [papers, setPapers] = useState(MOCK_PAPERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getResearchPapers() as Record<string, unknown>[];
        if (data && data.length > 0) setPapers(data.map(mapDbPaper) as typeof MOCK_PAPERS);
      } catch { /* fallback */ }
      setLoading(false);
    })();
  }, []);

  const years = [...new Set(papers.map(p => p.year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));

  const filtered = useMemo(() => {
    let list = [...papers];
    if (query) list = list.filter(p => p.title_ar.includes(query) || p.abstract_ar?.includes(query) || p.authors.some((a: string) => a.includes(query)));
    if (selectedYear !== 'all') list = list.filter(p => p.year?.toString() === selectedYear);
    return list;
  }, [query, selectedYear, papers]);

  return (
    <Layout>
      <div dir="rtl" className="bg-background min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-bl from-primary/90 to-accent/80 py-14 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">مكتبة البحوث العلمية</h1>
            <p className="text-white/75 max-w-xl mx-auto mb-8">تصفّح وحمّل أحدث الأبحاث والدراسات في المجالات الطبية والصحية</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="ابحث بالعنوان، المؤلف، أو الكلمات المفتاحية..."
                className="w-full pr-12 pl-4 py-3.5 bg-white/15 border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 text-sm" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { value: loading ? '...' : papers.length.toString(), label: 'بحث منشور', icon: FileText },
              { value: '8', label: 'تخصص طبي', icon: Filter },
              { value: '2026', label: 'أحدث الإصدارات', icon: Calendar },
              { value: loading ? '...' : papers.reduce((s, p) => s + (p.download_count || 0), 0).toLocaleString(), label: 'إجمالي التنزيلات', icon: Download },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Select value={selectedSpec} onValueChange={setSelectedSpec}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {MOCK_SPECIALIZATIONS.map(s => <SelectItem key={s.id} value={s.id}>{s.name_ar}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع السنوات</SelectItem>
                {years.map(y => <SelectItem key={y} value={y!.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="mr-auto text-sm text-muted-foreground">{filtered.length} بحث</span>
          </div>

          {/* Papers Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد نتائج تطابق بحثك</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map(paper => (
                <motion.div key={paper.id} variants={staggerItem}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: (paper.specialization?.color || '#1a4a7a') + '20' }}>
                          <FileText className="w-5 h-5" style={{ color: paper.specialization?.color || '#1a4a7a' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs" style={{ color: paper.specialization?.color, borderColor: paper.specialization?.color + '50' }}>
                              {paper.specialization?.name_ar}
                            </Badge>
                            {paper.year && <Badge variant="secondary" className="text-xs">{paper.year}</Badge>}
                          </div>
                          <h3 className="font-bold text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
                            {paper.title_ar}
                          </h3>
                        </div>
                      </div>

                      {paper.title_en && (
                        <p className="text-xs text-muted-foreground italic mb-3 line-clamp-1" dir="ltr">{paper.title_en}</p>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{paper.abstract_ar}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {paper.authors.slice(0, 3).map(a => (
                          <span key={a} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{a}</span>
                        ))}
                        {paper.authors.length > 3 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">+{paper.authors.length - 3}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {paper.journal && <span className="truncate max-w-32">{paper.journal}</span>}
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />{paper.download_count}
                          </span>
                          {paper.file_size_kb && <span>{Math.round(paper.file_size_kb / 1024 * 10) / 10} MB</span>}
                        </div>
                        <div className="flex gap-2">
                          {paper.doi && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:text-primary">
                              <ExternalLink className="w-3.5 h-3.5" />DOI
                            </Button>
                          )}
                          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground">
                            <Download className="w-3.5 h-3.5" />تحميل PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
