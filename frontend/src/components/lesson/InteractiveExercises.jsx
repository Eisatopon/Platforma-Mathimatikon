import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Sparkles, RotateCcw, Trophy } from "lucide-react";
import { MathText } from "@/components/MathText";
import { recordLessonResult } from "@/lib/progress";

const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε"];

export const InteractiveExercises = ({ lessonId, questions }) => {
  const total = questions.length;
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      recordLessonResult(lessonId, correctCount, total);
      setDone(true);
    }
  };

  const restart = () => {
    setIdx(0); setSelected(null); setAnswered(false); setCorrectCount(0); setDone(false);
  };

  if (!started) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Λύσε {total} διαδραστικές ερωτήσεις με άμεση ανατροφοδότηση για κάθε απάντηση.</p>
        <button data-testid="start-interactive-btn" onClick={() => setStarted(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]">
          <Sparkles className="h-4 w-4" /> Ξεκίνα τις ασκήσεις
        </button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100);
    return (
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-primary/30">
          <Trophy className="h-8 w-8" />
        </div>
        <h4 className="mt-4 text-2xl font-extrabold">{pct}%</h4>
        <p data-testid="interactive-score" className="mt-1 text-sm text-muted-foreground">Σωστά <span className="font-bold text-foreground">{correctCount}</span> / {total}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
          <Sparkles className="h-4 w-4" /> +{correctCount * 10} XP
        </div>
        <div className="mt-4">
          <button data-testid="interactive-retry" onClick={restart} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary">
            <RotateCcw className="h-4 w-4" /> Ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold">
        <span data-testid="interactive-progress">Ερώτηση {idx + 1} από {total}</span>
        <span className="text-primary">{correctCount} σωστές</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <h4 className="text-base font-bold leading-snug"><MathText text={q.prompt} /></h4>
          <div className="mt-3 space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let cls = "border-border bg-card hover:border-primary/40 hover:bg-secondary/50";
              let badge = "bg-secondary text-muted-foreground";
              if (answered) {
                if (isCorrect) { cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; badge = "bg-emerald-500 text-white"; }
                else if (isSelected) { cls = "border-rose-500 bg-rose-50 dark:bg-rose-500/10"; badge = "bg-rose-500 text-white"; }
                else { cls = "border-border bg-card opacity-60"; }
              }
              return (
                <button key={i} data-testid={`ix-option-${i}`} disabled={answered} onClick={() => choose(i)} className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${cls}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${badge}`}>{LETTERS[i]}</span>
                  <span className="flex-1 font-semibold"><MathText text={opt} /></span>
                  {answered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {answered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500" />}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${selected === q.correct ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-secondary"}`}>
              <span className={`font-bold ${selected === q.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{selected === q.correct ? "Σωστό! " : "Λάθος. "}</span>
              <MathText text={q.explanation} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button data-testid="ix-next-btn" disabled={!answered} onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
        {idx < total - 1 ? "Επόμενη" : "Τέλος"} <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
