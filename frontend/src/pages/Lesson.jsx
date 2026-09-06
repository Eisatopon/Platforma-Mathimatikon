import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, BookOpen, Lightbulb, Sparkles, CheckCircle2, XCircle, RotateCcw, Trophy, Home as HomeIcon, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MathText } from "@/components/MathText";
import { fetchLesson, fetchGrade } from "@/lib/api";
import { recordLessonResult } from "@/lib/progress";
import { categoryIcon, categoryColor } from "@/lib/ui";

const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε"];

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [gradeTitle, setGradeTitle] = useState("");
  const [nextLesson, setNextLesson] = useState(null);

  const [mode, setMode] = useState("read"); // read | quiz | result
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMode("read"); setIdx(0); setSelected(null); setAnswered(false); setCorrectCount(0);
    fetchLesson(lessonId).then((l) => {
      setLesson(l);
      fetchGrade(l.gradeId).then((d) => {
        setGradeTitle(d.grade.title);
        const arr = d.lessons;
        const pos = arr.findIndex((x) => x.id === l.id);
        setNextLesson(pos >= 0 && pos < arr.length - 1 ? arr[pos + 1] : null);
      }).catch(() => {});
    }).catch(() => {});
  }, [lessonId]);

  const Icon = useMemo(() => (lesson ? categoryIcon[lesson.category] || BookOpen : BookOpen), [lesson]);

  if (!lesson) {
    return (
      <div className="App min-h-screen">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Φόρτωση…</div>
      </div>
    );
  }

  const q = lesson.questions[idx];
  const total = lesson.questions.length;

  const chooseAnswer = (i) => {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      recordLessonResult(lesson.id, correctCount, total);
      setMode("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const restartQuiz = () => {
    setMode("quiz"); setIdx(0); setSelected(null); setAnswered(false); setCorrectCount(0);
  };

  const scorePct = Math.round((correctCount / total) * 100);

  return (
    <div className="App min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <button data-testid="back-grade" onClick={() => navigate(`/grade/${lesson.gradeId}`)} className="inline-flex items-center gap-1.5 font-semibold hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {gradeTitle}
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{lesson.chapter}</span>
        </div>

        {/* lesson header */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent">
              <Icon className={`h-6 w-6 ${categoryColor[lesson.category] || "text-primary"}`} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight"><MathText text={lesson.title} /></h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{lesson.category}</span>·<span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lesson.minutes} λεπτά</span>·<span>{total} ερωτήσεις</span>
              </div>
            </div>
          </div>
        </div>

        {mode === "read" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-extrabold">Θεωρία</h2>
              </div>
              <ul className="space-y-3">
                {lesson.theory.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <MathText className="text-[15px] leading-relaxed" text={t} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-amber-700 dark:text-amber-400">{lesson.example.title}</h3>
              </div>
              <MathText className="text-[15px] leading-relaxed" text={lesson.example.text} />
            </div>

            <button
              data-testid="start-quiz-btn"
              onClick={() => setMode("quiz")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="h-5 w-5" /> Ξεκίνα το κουίζ
            </button>
          </motion.div>
        )}

        {mode === "quiz" && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span data-testid="quiz-progress">Ερώτηση {idx + 1} από {total}</span>
              <span className="text-primary">{correctCount} σωστές</span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <h2 className="text-lg font-bold leading-snug"><MathText text={q.prompt} /></h2>
                <div className="mt-4 space-y-2.5">
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
                      <button
                        key={i}
                        data-testid={`option-${i}`}
                        disabled={answered}
                        onClick={() => chooseAnswer(i)}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${cls}`}
                      >
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${badge}`}>{LETTERS[i]}</span>
                        <span className="flex-1 font-semibold"><MathText text={opt} /></span>
                        {answered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        {answered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
                    <div className={`rounded-xl px-4 py-3 text-sm ${selected === q.correct ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-secondary"}`}>
                      <span className={`font-bold ${selected === q.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {selected === q.correct ? "Σωστό! " : "Λάθος. "}
                      </span>
                      <MathText text={q.explanation} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              data-testid="next-question-btn"
              disabled={!answered}
              onClick={next}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {idx < total - 1 ? "Επόμενη ερώτηση" : "Δες το αποτέλεσμα"} <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {mode === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-primary/30">
              <Trophy className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-3xl font-extrabold">{scorePct}%</h2>
            <p data-testid="quiz-score" className="mt-1 text-muted-foreground">
              Απάντησες σωστά <span className="font-bold text-foreground">{correctCount}</span> από {total} ερωτήσεις
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              <Sparkles className="h-4 w-4" /> +{correctCount * 10} XP
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {scorePct === 100 ? "Τέλεια! Άριστη επίδοση 🎉" : scorePct >= 60 ? "Μπράβο! Συνέχισε έτσι." : "Ρίξε μια ματιά ξανά στη θεωρία και δοκίμασε πάλι."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button data-testid="retry-btn" onClick={restartQuiz} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold hover:bg-secondary">
                <RotateCcw className="h-4 w-4" /> Ξανά
              </button>
              <button data-testid="back-grade-result" onClick={() => navigate(`/grade/${lesson.gradeId}`)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold hover:bg-secondary">
                <HomeIcon className="h-4 w-4" /> Λίστα μαθημάτων
              </button>
              {nextLesson && (
                <button data-testid="next-lesson-btn" onClick={() => navigate(`/lesson/${nextLesson.id}`)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.03]">
                  Επόμενο μάθημα <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
