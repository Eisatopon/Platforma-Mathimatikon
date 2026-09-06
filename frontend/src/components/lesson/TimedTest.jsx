import { useEffect, useRef, useState } from "react";
import { Timer, Play, Send, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { MathText } from "@/components/MathText";
import { recordLessonResult } from "@/lib/progress";

const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε"];

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const TimedTest = ({ lessonId, questions, durationMinutes = 15, fallback = false }) => {
  const total = questions.length;
  const [phase, setPhase] = useState("intro"); // intro | running | done
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const start = () => {
    setAnswers({});
    setTimeLeft(durationMinutes * 60);
    setPhase("running");
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const finish = () => {
    clearInterval(timerRef.current);
    setPhase((p) => {
      if (p === "done") return p;
      return "done";
    });
  };

  const submit = () => {
    const correct = questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
    recordLessonResult(lessonId, correct, total);
    finish();
  };

  const restart = () => {
    setPhase("intro");
    setAnswers({});
    setTimeLeft(durationMinutes * 60);
  };

  const correctCount = questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);

  if (phase === "intro") {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
          <Timer className="h-7 w-7" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {total} ερωτήσεις · Χρονικό όριο <span className="font-bold text-foreground">{durationMinutes} λεπτά</span> · Η βαθμολογία εμφανίζεται στο τέλος.
        </p>
        {fallback && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            (Δείγμα ερωτήσεων — δεν έχει προστεθεί ακόμη ξεχωριστό τεστ αξιολόγησης)
          </p>
        )}
        <button data-testid="start-test-btn" onClick={start} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]">
          <Play className="h-4 w-4" /> Ξεκίνα το τεστ
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const pct = Math.round((correctCount / total) * 100);
    return (
      <div>
        <div className="text-center">
          <h4 className="text-3xl font-extrabold">{pct}%</h4>
          <p data-testid="test-score" className="mt-1 text-sm text-muted-foreground">Σωστά <span className="font-bold text-foreground">{correctCount}</span> από {total} ερωτήσεις</p>
          <button data-testid="test-retry" onClick={restart} className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary">
            <RotateCcw className="h-4 w-4" /> Επανάληψη τεστ
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {questions.map((q, i) => {
            const chosen = answers[i];
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="text-sm font-bold"><span className="text-muted-foreground">{i + 1}. </span><MathText text={q.prompt} /></div>
                <div className="mt-2 space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correct;
                    const isChosen = oi === chosen;
                    let cls = "text-muted-foreground";
                    if (isCorrect) cls = "text-emerald-600 dark:text-emerald-400 font-semibold";
                    else if (isChosen) cls = "text-rose-600 dark:text-rose-400 line-through";
                    return (
                      <div key={oi} className={`flex items-center gap-2 text-sm ${cls}`}>
                        {isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : isChosen ? <XCircle className="h-4 w-4 shrink-0" /> : <span className="h-4 w-4 shrink-0" />}
                        <MathText text={opt} />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground"><MathText text={q.explanation} /></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // running
  const answeredCount = Object.keys(answers).length;
  const low = timeLeft <= 60;
  return (
    <div>
      <div className="sticky top-16 z-10 mb-4 flex items-center justify-between rounded-xl border border-border bg-card/95 px-4 py-2.5 backdrop-blur">
        <span className="text-sm font-semibold text-muted-foreground">{answeredCount}/{total} απαντήθηκαν</span>
        <span data-testid="test-timer" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold tabular-nums ${low ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" : "bg-secondary text-foreground"}`}>
          <Timer className="h-4 w-4" /> {fmt(timeLeft)}
        </span>
      </div>

      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-bold leading-snug"><span className="text-muted-foreground">{i + 1}. </span><MathText text={q.prompt} /></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const sel = answers[i] === oi;
                return (
                  <button
                    key={oi}
                    data-testid={`test-q${i}-opt${oi}`}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-all ${sel ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                  >
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${sel ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{LETTERS[oi]}</span>
                    <span className="flex-1 font-medium"><MathText text={opt} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button data-testid="submit-test-btn" onClick={submit} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01]">
        <Send className="h-4 w-4" /> Υποβολή τεστ
      </button>
    </div>
  );
};
