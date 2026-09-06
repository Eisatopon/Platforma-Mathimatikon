import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Zap, Flame, Target, GraduationCap, Play, Trophy, ChevronRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MathText } from "@/components/MathText";
import { fetchGrades, fetchAllLessons } from "@/lib/api";
import { getProgress, subscribe, computeStats, isCompleted, completedInGrade } from "@/lib/progress";
import { gradeStyles, categoryIcon, categoryColor } from "@/lib/ui";

const CATEGORIES = ["Όλα", "Άλγεβρα", "Γεωμετρία", "Αριθμητική", "Στατιστική", "Ολοκληρωμένα", "Σε εξέλιξη"];

const StatBox = ({ Icon, color, value, label, testid }) => (
  <div data-testid={testid} className="rounded-2xl border border-border bg-card p-3.5">
    <Icon className={`h-4 w-4 ${color}`} />
    <div className="mt-1.5 text-2xl font-extrabold leading-none">{value}</div>
    <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(getProgress());
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Όλα");

  useEffect(() => {
    fetchGrades().then(setGrades).catch(() => {});
    fetchAllLessons().then(setLessons).catch(() => {});
    return subscribe(setProgress);
  }, []);

  const stats = useMemo(() => computeStats(progress, grades), [progress, grades]);
  const isReturning = stats.completedCount > 0 || stats.xp > 0 || stats.streak > 0;
  const gradeTitle = (id) => grades.find((g) => g.id === id)?.title || "";

  const filtering = query.trim() !== "" || cat !== "Όλα";
  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      const matchQ = !q || l.title.toLowerCase().includes(q) || l.chapter.toLowerCase().includes(q);
      let matchC = true;
      if (["Άλγεβρα", "Γεωμετρία", "Αριθμητική", "Στατιστική"].includes(cat)) matchC = l.category === cat;
      else if (cat === "Ολοκληρωμένα") matchC = isCompleted(progress, l.id);
      else if (cat === "Σε εξέλιξη") matchC = !isCompleted(progress, l.id);
      return matchQ && matchC;
    });
  }, [lessons, query, cat, progress]);

  return (
    <div className="App min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-border bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:from-indigo-500/10 dark:via-card dark:to-violet-500/10 sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Ατομική σου πορεία μάθησης
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {isReturning ? "Καλώς ήρθες πίσω!" : "Καλώς ήρθες!"}<br />Ας μάθουμε Μαθηματικά.
              </h1>
              <p className="mt-3 max-w-md text-base text-muted-foreground">
                Βρες το μάθημα που χρειάζεσαι, λύσε διαδραστικά κουίζ και παρακολούθησε την πρόοδό σου βήμα-βήμα.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  data-testid="hero-start-btn"
                  onClick={() => grades[0] && navigate(`/grade/${grades[0].id}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <Play className="h-4 w-4" /> Ξεκίνα τώρα
                </button>
                <button
                  data-testid="hero-achievements-btn"
                  onClick={() => navigate("/achievements")}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
                >
                  <Trophy className="h-4 w-4" /> Τα Επιτεύγματά μου
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatBox testid="stat-xp" Icon={Zap} color="text-amber-500" value={stats.xp} label="Συνολικά XP" />
              <StatBox testid="stat-streak" Icon={Flame} color="text-orange-500" value={stats.streak} label="Σερί ημερών" />
              <StatBox testid="stat-progress" Icon={Target} color="text-indigo-500" value={`${stats.overallPct}%`} label="Συνολική πρόοδος" />
              <StatBox testid="stat-lessons" Icon={GraduationCap} color="text-emerald-500" value={stats.completedCount} label="Μαθήματα" />
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Level {stats.level}</span>
              <span className="text-muted-foreground">{stats.xpInLevel} / {stats.per} XP για το επόμενο</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${(stats.xpInLevel / stats.per) * 100}%` }} />
            </div>
          </div>
        </motion.section>

        {/* Search + filters */}
        <section className="mt-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              data-testid="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Αναζήτηση μαθήματος... (π.χ. Πυθαγόρειο, κλάσματα)"
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                data-testid={`filter-${c}`}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  cat === c ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        {!filtering ? (
          <section className="mt-6 grid gap-5 md:grid-cols-3">
            {grades.map((g, i) => {
              const st = gradeStyles[g.color] || gradeStyles.emerald;
              const done = completedInGrade(progress, g.id);
              const pct = g.lessonCount ? Math.round((done / g.lessonCount) * 100) : 0;
              return (
                <motion.button
                  key={g.id}
                  data-testid={`grade-card-${g.id}`}
                  onClick={() => navigate(`/grade/${g.id}`)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="group rounded-3xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="flex items-start justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${st.iconBg}`}>
                      <GraduationCap className={`h-6 w-6 ${st.iconText}`} />
                    </div>
                    <span className={`text-lg font-extrabold ${st.pct}`}>{pct}%</span>
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold tracking-tight">{g.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.subtitle}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground"><span className="font-bold text-foreground">{done}</span> από {g.lessonCount} μαθήματα</span>
                    <span className="inline-flex items-center gap-1 font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Έναρξη <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </section>
        ) : (
          <section className="mt-6">
            <p className="mb-3 text-sm text-muted-foreground">{filteredLessons.length} μαθήματα</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredLessons.map((l) => {
                const Icon = categoryIcon[l.category] || GraduationCap;
                const done = isCompleted(progress, l.id);
                return (
                  <button
                    key={l.id}
                    data-testid={`result-lesson-${l.id}`}
                    onClick={() => navigate(`/lesson/${l.id}`)}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Icon className={`h-5 w-5 shrink-0 ${categoryColor[l.category] || "text-primary"}`} />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold"><MathText text={l.title} /></div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{gradeTitle(l.gradeId)}</span>·<span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{l.minutes}′</span>·<span>{l.questionCount} ερωτήσεις</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
              {filteredLessons.length === 0 && (
                <p className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Δεν βρέθηκαν μαθήματα. Δοκίμασε άλλη αναζήτηση.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
