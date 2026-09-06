import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock, CheckCircle2, Circle, BookOpen, Library } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MathText } from "@/components/MathText";
import { fetchGrade } from "@/lib/api";
import { getProgress, subscribe, isCompleted } from "@/lib/progress";
import { gradeStyles, categoryIcon, categoryColor } from "@/lib/ui";

export default function Grade() {
  const { gradeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(getProgress());
  const [selectedBookId, setSelectedBookId] = useState(null);

  useEffect(() => {
    setSelectedBookId(null);
    fetchGrade(gradeId).then(setData).catch(() => {});
    return subscribe(setProgress);
  }, [gradeId]);

  const books = data?.books || [];
  const hasBooks = books.length > 0;

  const chapters = useMemo(() => {
    if (!data) return [];
    const source = hasBooks
      ? (selectedBookId ? data.lessons.filter((l) => l.bookId === selectedBookId) : [])
      : data.lessons;
    const map = new Map();
    for (const l of source) {
      if (!map.has(l.chapter)) map.set(l.chapter, []);
      map.get(l.chapter).push(l);
    }
    return Array.from(map.entries()).map(([chapter, lessons]) => ({ chapter, lessons, category: lessons[0].category }));
  }, [data, hasBooks, selectedBookId]);

  if (!data) {
    return (
      <div className="App min-h-screen">
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">Φόρτωση…</div>
      </div>
    );
  }

  const g = data.grade;
  const st = gradeStyles[g.color] || gradeStyles.emerald;
  const done = data.lessons.filter((l) => isCompleted(progress, l.id)).length;
  const pct = g.lessonCount ? Math.round((done / g.lessonCount) * 100) : 0;

  return (
    <div className="App min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <button data-testid="back-home" onClick={() => navigate("/")} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Αρχική
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl border border-border bg-gradient-to-br ${st.banner} p-6`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl ${st.iconBg}`}>
                <BookOpen className={`h-7 w-7 ${st.iconText}`} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{g.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{g.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-extrabold ${st.pct}`}>{pct}%</div>
              <div className="text-xs text-muted-foreground">{done}/{g.lessonCount}</div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
          </div>
        </motion.div>

        {hasBooks && !selectedBookId ? (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-extrabold">Διάλεξε βιβλίο</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {books.map((b, i) => {
                const bLessons = data.lessons.filter((l) => l.bookId === b.id);
                const bDone = bLessons.filter((l) => isCompleted(progress, l.id)).length;
                return (
                  <motion.button
                    key={b.id}
                    data-testid={`book-card-${b.id}`}
                    onClick={() => setSelectedBookId(b.id)}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-secondary">
                      {b.coverUrl ? (
                        <img src={b.coverUrl} alt={b.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground"><Library className="h-10 w-10" /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-extrabold leading-tight">{b.title}</div>
                      {b.publisher && <div className="mt-0.5 text-xs text-muted-foreground">{b.publisher}</div>}
                      <div className="mt-2 text-xs text-muted-foreground">{bDone}/{bLessons.length} μαθήματα</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
        <div className="mt-8 space-y-8">
          {hasBooks && (
            <button data-testid="back-books" onClick={() => setSelectedBookId(null)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Όλα τα βιβλία
            </button>
          )}
          {chapters.map((ch, ci) => {
            const Icon = categoryIcon[ch.category] || BookOpen;
            return (
              <section key={ch.chapter}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary">
                      <Icon className={`h-4 w-4 ${categoryColor[ch.category] || "text-primary"}`} />
                    </div>
                    <h2 className="text-lg font-extrabold tracking-tight">{ch.chapter}</h2>
                  </div>
                  <span className={`text-xs font-bold ${categoryColor[ch.category] || "text-muted-foreground"}`}>{ch.category}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ch.lessons.map((l, li) => {
                    const c = isCompleted(progress, l.id);
                    return (
                      <motion.button
                        key={l.id}
                        data-testid={`lesson-card-${l.id}`}
                        onClick={() => navigate(`/lesson/${l.id}`)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.02 * li }}
                        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                      >
                        {c ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" /> : <Circle className="h-6 w-6 shrink-0 text-muted-foreground/40" />}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold"><MathText text={l.title} /></div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{l.minutes} λεπτά</span>·<span>{l.questionCount} ερωτήσεις</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {hasBooks && selectedBookId && chapters.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Δεν υπάρχουν μαθήματα σε αυτό το βιβλίο ακόμη.</p>
          )}
        </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
