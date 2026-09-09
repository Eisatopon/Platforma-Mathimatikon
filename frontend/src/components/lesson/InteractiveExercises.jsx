import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Sparkles, RotateCcw, Trophy, Lightbulb, Brain, CalendarClock } from "lucide-react";
import { MathText } from "@/components/MathText";
import { getProgress, getLessonMastery, MASTERY_LEVELS, recordPracticeResult } from "@/lib/progress";

const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε"];

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function masteryText(value) {
  return MASTERY_LEVELS[value?.level || 0] || MASTERY_LEVELS[0];
}

export const InteractiveExercises = ({ lessonId, questions }) => {
  const [sessionQuestions, setSessionQuestions] = useState(() => shuffled(questions).slice(0, Math.min(8, questions.length)));
  const total = sessionQuestions.length;
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [attempt, setAttempt] = useState(1);
  const [resolved, setResolved] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [secondTryCorrect, setSecondTryCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [mastery, setMastery] = useState(() => getLessonMastery(getProgress(), lessonId));

  const q = sessionQuestions[idx];
  const level = masteryText(mastery);

  const choose = (i) => {
    if (resolved || wrongOptions.includes(i)) return;
    setSelected(i);
    if (i === q.correct) {
      if (attempt === 1) setFirstTryCorrect((value) => value + 1);
      else setSecondTryCorrect((value) => value + 1);
      setResolved(true);
      return;
    }
    setWrongOptions((items) => [...items, i]);
    if (attempt === 1) {
      setAttempt(2);
      setHintIndex(0);
    } else {
      setResolved(true);
    }
  };

  const showNextHint = () => {
    const hints = q.hints || [];
    setHintIndex((value) => Math.min(value + 1, hints.length - 1));
  };

  const next = () => {
    if (idx < total - 1) {
      setIdx((value) => value + 1);
      setSelected(null);
      setWrongOptions([]);
      setAttempt(1);
      setResolved(false);
      setHintIndex(-1);
    } else {
      const result = recordPracticeResult(lessonId, { firstTryCorrect, secondTryCorrect, total });
      setMastery(result);
      setDone(true);
    }
  };

  const restart = () => {
    setSessionQuestions(shuffled(questions).slice(0, Math.min(8, questions.length)));
    setIdx(0); setSelected(null); setWrongOptions([]); setAttempt(1); setResolved(false); setHintIndex(-1);
    setFirstTryCorrect(0); setSecondTryCorrect(0); setDone(false); setStarted(true);
  };

  if (!started) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><Brain className="h-4 w-4" /> {level.label}</div>
        <p className="text-sm text-muted-foreground">{total} ερωτήσεις διαφορετικής δυσκολίας, με υπόδειξη και δεύτερη ευκαιρία όταν χρειάζεται.</p>
        <button data-testid="start-interactive-btn" onClick={() => setStarted(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"><Sparkles className="h-4 w-4" /> Ξεκίνα την εξάσκηση</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round(((firstTryCorrect + secondTryCorrect * 0.5) / total) * 100);
    const newLevel = masteryText(mastery);
    return (
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-primary/30"><Trophy className="h-8 w-8" /></div>
        <h4 className="mt-4 text-2xl font-extrabold">{pct}%</h4>
        <p data-testid="interactive-score" className="mt-1 text-sm text-muted-foreground">{firstTryCorrect} σωστές με την πρώτη · {secondTryCorrect} μετά από υπόδειξη</p>
        <div className="mx-auto mt-4 max-w-sm rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div className="flex items-center justify-center gap-2 font-extrabold text-indigo-700 dark:text-indigo-300"><Brain className="h-5 w-5" /> {newLevel.label}</div>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" /> Η επανάληψη προγραμματίστηκε αυτόματα.</div>
        </div>
        <button data-testid="interactive-retry" onClick={restart} className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary"><RotateCcw className="h-4 w-4" /> Νέα εξάσκηση</button>
      </div>
    );
  }

  const feedback = selected !== null && selected !== q.correct ? q.optionFeedback?.[selected] : null;
  const hints = q.hints || [];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold"><span data-testid="interactive-progress">Ερώτηση {idx + 1} από {total}</span><span className="text-primary">{q.difficulty ? `Επίπεδο ${q.difficulty}` : "Εξάσκηση"}</span></div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${((idx + (resolved ? 1 : 0)) / total) * 100}%` }} /></div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {q.skill && <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Δεξιότητα: {q.skill}</div>}
          <h4 className="text-base font-bold leading-snug"><MathText text={q.prompt} /></h4>
          <div className="mt-3 space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const wasWrong = wrongOptions.includes(i);
              let cls = "border-border bg-card hover:border-primary/40 hover:bg-secondary/50";
              let badge = "bg-secondary text-muted-foreground";
              if (resolved && isCorrect) { cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; badge = "bg-emerald-500 text-white"; }
              else if (wasWrong) { cls = "border-rose-400 bg-rose-50 opacity-70 dark:bg-rose-500/10"; badge = "bg-rose-500 text-white"; }
              return <button key={i} data-testid={`ix-option-${i}`} disabled={resolved || wasWrong} onClick={() => choose(i)} className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${cls}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${badge}`}>{LETTERS[i]}</span><span className="flex-1 font-semibold"><MathText text={opt} /></span>{resolved && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}{wasWrong && <XCircle className="h-5 w-5 text-rose-500" />}</button>;
            })}
          </div>
          {wrongOptions.length > 0 && !resolved && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="font-bold text-amber-700 dark:text-amber-300">Δοκίμασε ξανά — δεν χάθηκε η προσπάθεια.</div>
              {feedback && <MathText className="mt-1 block" text={feedback} />}
              {hintIndex >= 0 && hints[hintIndex] && <div className="mt-2 flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><MathText text={hints[hintIndex]} /></div>}
              {hintIndex < hints.length - 1 && <button onClick={showNextHint} className="mt-2 text-xs font-bold text-primary hover:underline">Μία ακόμη υπόδειξη</button>}
            </div>
          )}
          {resolved && <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${selected === q.correct ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-secondary"}`}><span className={`font-bold ${selected === q.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{selected === q.correct ? (attempt === 1 ? "Σωστό με την πρώτη! " : "Σωστό μετά την υπόδειξη! ") : "Ας το ξεκαθαρίσουμε. "}</span><MathText text={q.explanation} /></div>}
        </motion.div>
      </AnimatePresence>
      <button data-testid="ix-next-btn" disabled={!resolved} onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">{idx < total - 1 ? "Επόμενη" : "Ολοκλήρωση"} <ChevronRight className="h-4 w-4" /></button>
    </div>
  );
};
