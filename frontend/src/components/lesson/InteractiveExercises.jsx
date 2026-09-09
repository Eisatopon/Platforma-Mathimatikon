import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Sparkles, RotateCcw, Trophy, Lightbulb, Brain, CalendarClock } from "lucide-react";
import { MathText } from "@/components/MathText";
import { getProgress, getLessonMastery, MASTERY_LEVELS, recordPracticeResult } from "@/lib/progress";

const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε"];

function normalise(value) {
  return String(value || "").toLocaleLowerCase("el-GR").replace(/[\s$]/g, "").replace(/,/g, ".").trim();
}

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeSession(questions) {
  const recall = questions.find((question) => question.recall);
  const current = shuffled(questions.filter((question) => !question.recall));
  const picked = recall ? [...current.slice(0, 7), recall] : current.slice(0, 8);
  return shuffled(picked);
}

function masteryText(value) {
  return MASTERY_LEVELS[value?.level || 0] || MASTERY_LEVELS[0];
}

export const InteractiveExercises = ({ lessonId, questions }) => {
  const [sessionQuestions, setSessionQuestions] = useState(() => makeSession(questions));
  const total = sessionQuestions.length;
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [wasCorrect, setWasCorrect] = useState(null);
  const [modelVisible, setModelVisible] = useState(false);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [attempt, setAttempt] = useState(1);
  const [resolved, setResolved] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [secondTryCorrect, setSecondTryCorrect] = useState(0);
  const [successfulRepresentations, setSuccessfulRepresentations] = useState([]);
  const [skillResults, setSkillResults] = useState({});
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [orderedSteps, setOrderedSteps] = useState([]);
  const [done, setDone] = useState(false);
  const [mastery, setMastery] = useState(() => getLessonMastery(getProgress(), lessonId));

  const q = sessionQuestions[idx];
  const level = masteryText(mastery);

  useEffect(() => {
    setMatchingAnswers({});
    setOrderedSteps(q?.type === "ordering" ? shuffled(q.steps || []) : []);
  }, [q?.id, q?.type, q?.steps]);

  const recordSkillOutcome = (weight) => {
    const skill = q.skill || "Βασική δεξιότητα";
    setSkillResults((current) => {
      const old = current[skill] || { earned: 0, total: 0 };
      return { ...current, [skill]: { earned: old.earned + weight, total: old.total + 1 } };
    });
  };

  const choose = (i) => {
    if (resolved || wrongOptions.includes(i)) return;
    setSelected(i);
    if (i === q.correct) {
      if (attempt === 1) setFirstTryCorrect((value) => value + 1);
      else setSecondTryCorrect((value) => value + 1);
      setSuccessfulRepresentations((items) => Array.from(new Set([...items, q.representation || "symbolic"])));
      setResolved(true);
      setWasCorrect(true);
      recordSkillOutcome(attempt === 1 ? 1 : 0.6);
      return;
    }
    setWrongOptions((items) => [...items, i]);
    if (attempt === 1) {
      setAttempt(2);
      setHintIndex(0);
    } else {
      setResolved(true);
      setWasCorrect(false);
      recordSkillOutcome(0);
    }
  };

  const submitWritten = () => {
    if (!writtenAnswer.trim() || resolved) return;
    if (q.type === "self-check") {
      setModelVisible(true);
      return;
    }
    const correct = (q.acceptedAnswers || []).some((answer) => normalise(answer) === normalise(writtenAnswer));
    if (correct) {
      if (attempt === 1) setFirstTryCorrect((value) => value + 1);
      else setSecondTryCorrect((value) => value + 1);
      setSuccessfulRepresentations((items) => Array.from(new Set([...items, q.representation || "constructed-response"])));
      setWasCorrect(true);
      setResolved(true);
      recordSkillOutcome(attempt === 1 ? 1 : 0.6);
    } else if (attempt === 1) {
      setAttempt(2);
      setHintIndex(0);
      setWasCorrect(false);
    } else {
      setWasCorrect(false);
      setResolved(true);
      recordSkillOutcome(0);
    }
  };

  const selfAssess = (understood) => {
    if (understood) {
      setSecondTryCorrect((value) => value + 1);
      setSuccessfulRepresentations((items) => Array.from(new Set([...items, q.representation || "application"])));
    }
    recordSkillOutcome(understood ? 0.6 : 0);
    setWasCorrect(understood);
    setResolved(true);
  };

  const submitStructured = (correct) => {
    if (resolved) return;
    if (correct) {
      if (attempt === 1) setFirstTryCorrect((value) => value + 1);
      else setSecondTryCorrect((value) => value + 1);
      setSuccessfulRepresentations((items) => Array.from(new Set([...items, q.representation || "procedural"])));
      setWasCorrect(true);
      setResolved(true);
      recordSkillOutcome(attempt === 1 ? 1 : 0.6);
    } else if (attempt === 1) {
      setAttempt(2);
      setHintIndex(0);
      setWasCorrect(false);
    } else {
      setWasCorrect(false);
      setResolved(true);
      recordSkillOutcome(0);
    }
  };

  const moveStep = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= orderedSteps.length || resolved) return;
    setOrderedSteps((items) => {
      const nextItems = [...items];
      [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
      return nextItems;
    });
  };

  const showNextHint = () => {
    const hints = q.hints || [];
    setHintIndex((value) => Math.min(value + 1, hints.length - 1));
  };

  const next = () => {
    if (idx < total - 1) {
      setIdx((value) => value + 1);
      setSelected(null);
      setWrittenAnswer(""); setWasCorrect(null); setModelVisible(false);
      setWrongOptions([]);
      setAttempt(1);
      setResolved(false);
      setHintIndex(-1);
    } else {
      const result = recordPracticeResult(lessonId, { firstTryCorrect, secondTryCorrect, total, representations: successfulRepresentations, skillResults });
      setMastery(result);
      setDone(true);
    }
  };

  const restart = () => {
    setSessionQuestions(makeSession(questions));
    setIdx(0); setSelected(null); setWrittenAnswer(""); setWasCorrect(null); setModelVisible(false); setWrongOptions([]); setAttempt(1); setResolved(false); setHintIndex(-1);
    setFirstTryCorrect(0); setSecondTryCorrect(0); setSuccessfulRepresentations([]); setSkillResults({}); setDone(false); setStarted(true);
  };

  if (!started) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><Brain className="h-4 w-4" /> {level.label}</div>
        <p className="text-sm text-muted-foreground">{total} ερωτήσεις διαφορετικής δυσκολίας και αναπαράστασης, με διάγνωση λάθους, υπόδειξη και δεύτερη ευκαιρία.</p>
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
          {q.recall && <div className="mb-3 rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Σύντομη επανάληψη προηγούμενου μαθήματος</div>}
          {!q.type && <div className="mt-3 space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const wasWrong = wrongOptions.includes(i);
              let cls = "border-border bg-card hover:border-primary/40 hover:bg-secondary/50";
              let badge = "bg-secondary text-muted-foreground";
              if (resolved && isCorrect) { cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; badge = "bg-emerald-500 text-white"; }
              else if (wasWrong) { cls = "border-rose-400 bg-rose-50 opacity-70 dark:bg-rose-500/10"; badge = "bg-rose-500 text-white"; }
              return <button key={i} data-testid={`ix-option-${i}`} disabled={resolved || wasWrong} onClick={() => choose(i)} className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${cls}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${badge}`}>{LETTERS[i]}</span><span className="flex-1 font-semibold"><MathText text={opt} /></span>{resolved && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}{wasWrong && <XCircle className="h-5 w-5 text-rose-500" />}</button>;
            })}
          </div>}
          {["input", "fill", "self-check"].includes(q.type) && (
            <div className="mt-3">
              <textarea value={writtenAnswer} onChange={(event) => setWrittenAnswer(event.target.value)} rows={q.type === "self-check" ? 4 : 2} placeholder={q.type === "fill" ? "Συμπλήρωσε το κενό…" : "Γράψε την απάντηση και τη σκέψη σου…"} className="w-full resize-y rounded-xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              {!modelVisible && <button onClick={submitWritten} disabled={!writtenAnswer.trim()} className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40">Έλεγχος απάντησης</button>}
              {modelVisible && !resolved && <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10"><div className="text-sm font-extrabold text-sky-800 dark:text-sky-300">Ενδεικτική λύση</div><MathText className="mt-1 block text-sm" text={q.modelAnswer} /><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => selfAssess(true)} className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">Το αιτιολόγησα σωστά</button><button onClick={() => selfAssess(false)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-bold">Χρειάζομαι εξάσκηση</button></div></div>}
            </div>
          )}
          {q.type === "matching" && (
            <div className="mt-3 space-y-3">
              {(q.pairs || []).map((pair, pairIndex) => (
                <label key={pairIndex} className="block rounded-xl border border-border bg-card p-3">
                  <MathText className="mb-2 block text-sm font-semibold" text={pair.left} />
                  <select value={matchingAnswers[pairIndex] || ""} disabled={resolved} onChange={(event) => setMatchingAnswers((values) => ({ ...values, [pairIndex]: event.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="">Επίλεξε απάντηση</option>
                    {(q.pairs || []).map((item, optionIndex) => <option key={optionIndex} value={item.right}>{item.right}</option>)}
                  </select>
                </label>
              ))}
              <button disabled={Object.keys(matchingAnswers).length < (q.pairs || []).length} onClick={() => submitStructured((q.pairs || []).every((pair, pairIndex) => matchingAnswers[pairIndex] === pair.right))} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40">Έλεγχος αντιστοίχισης</button>
            </div>
          )}
          {q.type === "ordering" && (
            <div className="mt-3 space-y-2">
              {orderedSteps.map((step, stepIndex) => (
                <div key={step} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">{stepIndex + 1}</span>
                  <span className="flex-1 text-sm font-semibold">{step}</span>
                  <button disabled={stepIndex === 0 || resolved} onClick={() => moveStep(stepIndex, -1)} aria-label="Μετακίνηση επάνω" className="rounded-md border px-2 py-1 disabled:opacity-30">↑</button>
                  <button disabled={stepIndex === orderedSteps.length - 1 || resolved} onClick={() => moveStep(stepIndex, 1)} aria-label="Μετακίνηση κάτω" className="rounded-md border px-2 py-1 disabled:opacity-30">↓</button>
                </div>
              ))}
              <button onClick={() => submitStructured((q.steps || []).every((step, stepIndex) => orderedSteps[stepIndex] === step))} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Έλεγχος σειράς</button>
            </div>
          )}
          {((wrongOptions.length > 0 || (q.type && attempt > 1)) && !resolved) && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="font-bold text-amber-700 dark:text-amber-300">Δοκίμασε ξανά — δεν χάθηκε η προσπάθεια.</div>
              {feedback && <MathText className="mt-1 block" text={feedback} />}
              {hintIndex >= 0 && hints[hintIndex] && <div className="mt-2 flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><MathText text={hints[hintIndex]} /></div>}
              {hintIndex < hints.length - 1 && <button onClick={showNextHint} className="mt-2 text-xs font-bold text-primary hover:underline">Μία ακόμη υπόδειξη</button>}
            </div>
          )}
          {resolved && q.type !== "self-check" && <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${wasCorrect ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-secondary"}`}><span className={`font-bold ${wasCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{wasCorrect ? (attempt === 1 ? "Σωστό με την πρώτη! " : "Σωστό μετά την υπόδειξη! ") : "Ας το ξεκαθαρίσουμε. "}</span><MathText text={q.explanation} /></div>}
        </motion.div>
      </AnimatePresence>
      <button data-testid="ix-next-btn" disabled={!resolved} onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">{idx < total - 1 ? "Επόμενη" : "Ολοκλήρωση"} <ChevronRight className="h-4 w-4" /></button>
    </div>
  );
};
