import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import { MathText } from "@/components/MathText";

const LETTERS = ["Α", "Β", "Γ", "Δ"];

export function DiagnosticCheck({ lessonId, diagnostic }) {
  const questions = useMemo(() => diagnostic?.questions || [], [diagnostic]);
  const storageKey = `diagnostic-${lessonId}`;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved?.answers) setAnswers(saved.answers);
      if (saved?.submitted) setSubmitted(true);
    } catch {
      // Αν ένα παλιό τοπικό δεδομένο έχει αλλοιωθεί, ξεκινάμε καθαρά.
    }
  }, [storageKey]);

  if (!questions.length) return null;

  const score = questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0);
  const ready = score === questions.length;
  const needsReview = score <= Math.floor(questions.length / 2);
  const recommendation = ready
    ? diagnostic.successMessage || "Είσαι έτοιμος να προχωρήσεις στη διερεύνηση."
    : needsReview
      ? diagnostic.reviewMessage || "Κάνε πρώτα μια σύντομη επανάληψη στα προαπαιτούμενα και δοκίμασε ξανά."
      : diagnostic.supportMessage || "Μπορείς να συνεχίσεις· δώσε ιδιαίτερη προσοχή στα σημεία που σημειώνονται παρακάτω.";

  const submit = () => {
    setSubmitted(true);
    localStorage.setItem(storageKey, JSON.stringify({ answers, submitted: true, score }));
  };

  const restart = () => {
    setAnswers({});
    setSubmitted(false);
    localStorage.removeItem(storageKey);
  };

  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-500/30 dark:bg-violet-500/10 sm:p-5" aria-labelledby={`${lessonId}-diagnostic-title`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white"><ClipboardCheck className="h-5 w-5" /></span>
        <div>
          <h3 id={`${lessonId}-diagnostic-title`} className="text-lg font-black">Γρήγορη αφετηρία</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Τρεις σύντομες ερωτήσεις για να προσαρμοστεί η συνέχεια στις ανάγκες σου. Δεν βαθμολογούνται.</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {questions.map((question, questionIndex) => (
          <fieldset key={question.id || questionIndex} className="rounded-xl border border-violet-200/80 bg-background p-4 dark:border-violet-500/25">
            <legend className="px-1 text-base font-extrabold"><MathText text={`${questionIndex + 1}. ${question.prompt}`} /></legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;
                const correct = submitted && optionIndex === question.correct;
                const wrong = submitted && selected && optionIndex !== question.correct;
                return (
                  <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-base font-semibold transition ${correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : wrong ? "border-rose-400 bg-rose-50 dark:bg-rose-500/10" : selected ? "border-violet-500 bg-violet-100/70 dark:bg-violet-500/15" : "border-border bg-card hover:border-violet-300"}`}>
                    <input type="radio" name={`${lessonId}-diagnostic-${questionIndex}`} value={optionIndex} checked={selected} disabled={submitted} onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} className="sr-only" />
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">{LETTERS[optionIndex]}</span>
                    <MathText text={option} />
                  </label>
                );
              })}
            </div>
            {submitted && answers[questionIndex] !== question.correct && (
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[15px] leading-relaxed dark:bg-amber-500/10 sm:text-base"><MathText text={question.feedback} /></div>
            )}
          </fieldset>
        ))}
      </div>

      {!submitted ? (
        <button type="button" disabled={Object.keys(answers).length !== questions.length} onClick={submit} className="mt-4 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40">Δες την αφετηρία μου</button>
      ) : (
        <div className={`mt-4 rounded-xl border p-4 ${ready ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"}`} role="status">
          <div className="flex items-center gap-2 font-extrabold"><CheckCircle2 className={`h-5 w-5 ${ready ? "text-emerald-600" : "text-amber-600"}`} /> {score} από {questions.length}</div>
          <p className="mt-1 text-[15px] leading-relaxed sm:text-base">{recommendation}</p>
          <button type="button" onClick={restart} className="mt-3 inline-flex items-center gap-2 rounded-full border border-current px-3 py-1.5 text-xs font-bold"><RotateCcw className="h-3.5 w-3.5" /> Νέα προσπάθεια</button>
        </div>
      )}
    </section>
  );
}
