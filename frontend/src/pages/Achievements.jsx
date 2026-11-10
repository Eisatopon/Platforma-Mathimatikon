import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Flame, Target, Award, Lock, RotateCcw, Footprints, Dumbbell, GraduationCap, Star, Crown, Trophy } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchGrades } from "@/lib/api";
import { getProgress, subscribe, computeStats, computeBadges, resetProgress, PROGRESSION_LEVELS } from "@/lib/progress";

const ICONS = { Footprints, Dumbbell, GraduationCap, Star, Flame, Crown, Target, Trophy };

const StatBox = ({ Icon, color, value, label, testid }) => (
  <div data-testid={testid} className="rounded-2xl border border-border bg-card p-4">
    <Icon className={`h-5 w-5 ${color}`} />
    <div className="mt-2 text-2xl font-extrabold leading-none">{value}</div>
    <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
  </div>
);

export default function Achievements() {
  const [grades, setGrades] = useState([]);
  const [progress, setProgress] = useState(getProgress());
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    fetchGrades().then(setGrades).catch(() => {});
    return subscribe(setProgress);
  }, []);

  const stats = useMemo(() => computeStats(progress, grades), [progress, grades]);
  const badges = useMemo(() => computeBadges(progress, grades), [progress, grades]);
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div className="App min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Τα Επιτεύγματά μου</h1>
        <p className="mt-1 text-muted-foreground">Συγκέντρωσε διακριτικά ολοκληρώνοντας μαθήματα και πετυχαίνοντας στα κουίζ.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox testid="ach-xp" Icon={Zap} color="text-amber-500" value={stats.xp} label="Συνολικοί πόντοι" />
          <StatBox testid="ach-streak" Icon={Flame} color="text-orange-500" value={stats.streak} label="Σερί ημερών" />
          <StatBox testid="ach-progress" Icon={Target} color="text-indigo-500" value={`${stats.overallPct}%`} label="Πρόοδος" />
          <StatBox testid="ach-badges" Icon={Award} color="text-emerald-500" value={`${unlocked}/${badges.length}`} label="Διακριτικά" />
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-gradient-to-br from-indigo-50 via-card to-violet-50 p-5 dark:from-indigo-500/10 dark:to-violet-500/10 sm:p-6" data-testid="progression-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Η μαθηματική σου πορεία</div>
              <h2 className="mt-1 text-2xl font-extrabold">Επίπεδο {stats.level} — {stats.levelTitle}</h2>
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              {stats.isMaxLevel ? "Ανώτατη βαθμίδα" : `${stats.xpInLevel} / ${stats.per} πόντοι για: ${stats.nextLevelTitle}`}
            </div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${stats.levelProgressPct}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PROGRESSION_LEVELS.map((item) => {
              const reached = stats.level >= item.level;
              const current = stats.level === item.level;
              return (
                <div key={item.level} className={`rounded-xl border px-3 py-3 ${current ? "border-primary bg-primary/10" : reached ? "border-border bg-card/80" : "border-dashed border-border bg-secondary/30 text-muted-foreground"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${reached ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{reached ? item.level : <Lock className="h-3.5 w-3.5" />}</span>
                    <span className="min-w-0 text-xs font-extrabold">{item.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {badges.map((b, i) => {
            const Icon = ICONS[b.icon] || Award;
            return (
              <motion.div
                key={b.key}
                data-testid={`badge-${b.key}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className={`rounded-2xl border p-5 text-center transition-all ${
                  b.unlocked ? "border-primary/30 bg-card shadow-md shadow-primary/5" : "border-dashed border-border bg-secondary/40"
                }`}
              >
                <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${b.unlocked ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-primary/30" : "bg-secondary text-muted-foreground/60"}`}>
                  {b.unlocked ? <Icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </div>
                <div className={`mt-3 font-extrabold ${b.unlocked ? "" : "text-muted-foreground"}`}>{b.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{b.desc}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          {!confirm ? (
            <button data-testid="reset-btn" onClick={() => setConfirm(true)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
              <RotateCcw className="h-4 w-4" /> Επαναφορά προόδου
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
              <span className="text-sm font-semibold">Σίγουρα;</span>
              <button data-testid="reset-confirm-btn" onClick={() => { resetProgress(); setConfirm(false); }} className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-rose-700">Ναι, διαγραφή</button>
              <button onClick={() => setConfirm(false)} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-bold hover:bg-secondary/70">Άκυρο</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
