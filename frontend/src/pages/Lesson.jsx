import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, ArrowLeft, BookOpen, Lightbulb, Clock, Home as HomeIcon,
  ClipboardList, PencilRuler, MousePointerClick, Timer, CheckCircle2, Flag,
  Target, ListChecks, Package, Eye, EyeOff, AlertTriangle, Link2, GraduationCap,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MathText } from "@/components/MathText";
import { EmptyState } from "@/components/lesson/EmptyState";
import { Worksheet } from "@/components/lesson/Worksheet";
import { InteractiveExercises } from "@/components/lesson/InteractiveExercises";
import { TimedTest } from "@/components/lesson/TimedTest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchLesson, fetchGrade, readApiCache } from "@/lib/api";
import { categoryIcon, categoryColor } from "@/lib/ui";

const SECTIONS = [
  { id: "plan", n: 1, title: "Σχέδιο μαθήματος", Icon: ClipboardList },
  { id: "theory", n: 2, title: "Θεωρία / Επανάληψη", Icon: BookOpen },
  { id: "worksheet", n: 3, title: "Φύλλο εργασίας", Icon: PencilRuler },
  { id: "interactive", n: 4, title: "Διαδραστικές ασκήσεις", Icon: MousePointerClick },
  { id: "test", n: 5, title: "Τεστ αξιολόγησης", Icon: Timer },
  { id: "solutions", n: 6, title: "Λύσεις", Icon: CheckCircle2 },
  { id: "recap", n: 7, title: "Ανακεφαλαίωση", Icon: Flag },
];

const SolutionItem = ({ sol, i }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold">{sol.title}</span>
        <button data-testid={`solution-toggle-${i}`} onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold hover:bg-secondary/70">
          {open ? <><EyeOff className="h-3.5 w-3.5" /> Απόκρυψη</> : <><Eye className="h-3.5 w-3.5" /> Εμφάνιση λύσης</>}
        </button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
          <MathText className="text-[15px] leading-relaxed" text={sol.text} />
        </motion.div>
      )}
    </div>
  );
};

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(() => readApiCache(`lesson:${lessonId}`));
  const [slowLoading, setSlowLoading] = useState(false);
  const [gradeTitle, setGradeTitle] = useState("");
  const [nextLesson, setNextLesson] = useState(null);
  const [open, setOpen] = useState(["plan", "theory"]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(["plan", "theory"]);
    setLesson(readApiCache(`lesson:${lessonId}`));
    setSlowLoading(false);
    const slowTimer = window.setTimeout(() => setSlowLoading(true), 1800);
    fetchLesson(lessonId).then((l) => {
      setLesson(l);
      fetchGrade(l.gradeId).then((d) => {
        setGradeTitle(d.grade.title);
        const arr = d.lessons;
        const pos = arr.findIndex((x) => x.id === l.id);
        setNextLesson(pos >= 0 && pos < arr.length - 1 ? arr[pos + 1] : null);
      }).catch(() => {});
    }).catch(() => {});
    return () => window.clearTimeout(slowTimer);
  }, [lessonId]);

  useEffect(() => {
    if (lesson) setSlowLoading(false);
  }, [lesson]);

  const Icon = useMemo(() => (lesson ? categoryIcon[lesson.category] || BookOpen : BookOpen), [lesson]);

  if (!lesson) {
    return (
      <div className="App min-h-screen">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          <div className="font-semibold">Φόρτωση μαθήματος…</div>
          {slowLoading && <div className="mt-2 text-sm">Η δωρεάν εκπαιδευτική υπηρεσία ενεργοποιείται. Η πρώτη φόρτωση μπορεί να χρειαστεί έως ένα λεπτό.</div>}
        </div>
      </div>
    );
  }

  const jump = (id) => {
    setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTimeout(() => {
      const el = document.getElementById(`sec-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const plan = lesson.plan || {};
  const planHasContent = (plan.objectives?.length || plan.prerequisites?.length || plan.duration || plan.materials?.length || plan.overview || plan.phases?.length || plan.formativeAssessment?.length || plan.exitTicket?.length);
  const recap = lesson.recap || {};
  const recapHasContent = (recap.keyPoints?.length || recap.nextLessonIds?.length || recap.furtherStudy?.length);
  const testQuestions = lesson.assessment?.questions?.length ? lesson.assessment.questions : lesson.questions;
  const testFallback = !(lesson.assessment?.questions?.length);

  const renderSection = (id) => {
    switch (id) {
      case "plan":
        return planHasContent ? (
          <div className="space-y-5">
            {plan.overview && <p className="text-[15px] leading-relaxed text-muted-foreground"><MathText text={plan.overview} /></p>}
            {plan.objectives?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4 text-primary" /> Στόχοι</div>
                <ul className="space-y-1.5">
                  {plan.objectives.map((o, i) => (
                    <li key={i} className="flex gap-2 text-[15px]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><MathText text={o} /></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {plan.prerequisites?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold"><ListChecks className="h-4 w-4 text-primary" /> Προαπαιτούμενα</div>
                  <ul className="list-inside list-disc space-y-1 text-[15px] text-muted-foreground">{plan.prerequisites.map((p, i) => <li key={i}><MathText text={p} /></li>)}</ul>
                </div>
              )}
              {plan.materials?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Package className="h-4 w-4 text-primary" /> Υλικά</div>
                  <ul className="list-inside list-disc space-y-1 text-[15px] text-muted-foreground">{plan.materials.map((m, i) => <li key={i}><MathText text={m} /></li>)}</ul>
                </div>
              )}
            </div>
            {plan.phases?.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold"><ClipboardList className="h-4 w-4 text-primary" /> Πορεία διδασκαλίας</div>
                <ol className="space-y-3">
                  {plan.phases.map((phase, i) => (
                    <li key={i} className="grid grid-cols-[34px_1fr] gap-3 rounded-xl border border-border bg-secondary/35 p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{phase.minutes}΄</span>
                      <div>
                        <div className="text-sm font-extrabold">{phase.title}</div>
                        <MathText className="mt-1 block text-[14px] leading-relaxed text-muted-foreground" text={phase.description} />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {plan.formativeAssessment?.length > 0 && (
              <div className="rounded-xl border border-sky-300/60 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
                <div className="mb-2 text-sm font-extrabold text-sky-800 dark:text-sky-300">Διαμορφωτικός έλεγχος</div>
                <ul className="list-inside list-disc space-y-1.5 text-[14px]">{plan.formativeAssessment.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ul>
              </div>
            )}
            {(plan.differentiation?.support?.length > 0 || plan.differentiation?.challenge?.length > 0) && (
              <div>
                <div className="mb-2 text-sm font-bold">Διαφοροποίηση</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <div className="mb-2 text-sm font-extrabold">Υποστήριξη</div>
                    <ul className="list-inside list-disc space-y-1 text-[14px] text-muted-foreground">{plan.differentiation.support?.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ul>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <div className="mb-2 text-sm font-extrabold">Πρόκληση</div>
                    <ul className="list-inside list-disc space-y-1 text-[14px] text-muted-foreground">{plan.differentiation.challenge?.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ul>
                  </div>
                </div>
              </div>
            )}
            {plan.exitTicket?.length > 0 && (
              <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="mb-2 text-sm font-extrabold text-emerald-800 dark:text-emerald-300">Έλεγχος εξόδου</div>
                <ol className="list-inside list-decimal space-y-1.5 text-[14px]">{plan.exitTicket.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ol>
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold"><Clock className="h-4 w-4 text-muted-foreground" /> Διάρκεια: {plan.duration || `${lesson.minutes} λεπτά`}</div>
          </div>
        ) : (
          <EmptyState message="Δεν έχει προστεθεί ακόμη σχέδιο μαθήματος." hint="Εδώ θα μπουν: στόχοι, προαπαιτούμενα, διάρκεια, υλικά και επισκόπηση." />
        );

      case "theory":
        return (
          <div className="space-y-5">
            <ul className="space-y-3">
              {lesson.theory.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <MathText className="text-[15px] leading-relaxed" text={t} />
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><h4 className="font-extrabold text-amber-700 dark:text-amber-400">{lesson.example.title}</h4></div>
              <MathText className="text-[15px] leading-relaxed" text={lesson.example.text} />
            </div>
            {lesson.attention?.length > 0 && (
              <div className="rounded-xl border border-rose-300/60 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                <div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" /><h4 className="font-extrabold text-rose-700 dark:text-rose-400">Σημεία προσοχής</h4></div>
                <ul className="list-inside list-disc space-y-1 text-[15px]">{lesson.attention.map((a, i) => <li key={i}><MathText text={a} /></li>)}</ul>
              </div>
            )}
          </div>
        );

      case "worksheet":
        return <Worksheet lessonId={lesson.id} worksheet={lesson.worksheet} />;

      case "interactive":
        return <InteractiveExercises lessonId={lesson.id} questions={lesson.questions} />;

      case "test":
        return <TimedTest lessonId={lesson.id} questions={testQuestions} durationMinutes={lesson.assessment?.durationMinutes || 15} fallback={testFallback} />;

      case "solutions":
        return lesson.solutions?.length > 0 ? (
          <div className="space-y-3">{lesson.solutions.map((s, i) => <SolutionItem key={i} sol={s} i={i} />)}</div>
        ) : (
          <EmptyState message="Δεν έχουν προστεθεί ακόμη αναλυτικές λύσεις." hint="Εδώ θα μπουν λύσεις βήμα-βήμα με εναλλακτικούς τρόπους και σχόλια για συχνά λάθη." />
        );

      case "recap":
        return recapHasContent ? (
          <div className="space-y-5">
            {recap.keyPoints?.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-bold">Βασικά σημεία</div>
                <ul className="space-y-1.5">{recap.keyPoints.map((k, i) => <li key={i} className="flex gap-2 text-[15px]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><MathText text={k} /></li>)}</ul>
              </div>
            )}
            {recap.furtherStudy?.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-bold">Περαιτέρω μελέτη</div>
                <ul className="list-inside list-disc space-y-1 text-[15px] text-muted-foreground">{recap.furtherStudy.map((f, i) => <li key={i}><MathText text={f} /></li>)}</ul>
              </div>
            )}
          </div>
        ) : (
          <EmptyState message="Δεν έχει προστεθεί ακόμη ανακεφαλαίωση." hint="Εδώ θα μπουν 3–5 βασικά σημεία, σύνδεσμοι επόμενων μαθημάτων και περαιτέρω μελέτη." />
        );

      default:
        return null;
    }
  };

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
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent"><Icon className={`h-6 w-6 ${categoryColor[lesson.category] || "text-primary"}`} /></div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight"><MathText text={lesson.title} /></h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{lesson.category}</span>·<span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lesson.minutes} λεπτά</span>·<span>{lesson.questionCount} ερωτήσεις</span>
              </div>
            </div>
          </div>
        </div>

        {/* step nav */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {SECTIONS.map((s) => (
            <button key={s.id} data-testid={`stepnav-${s.id}`} onClick={() => jump(s.id)} className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{s.n}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* 7 sections */}
        <Accordion type="multiple" value={open} onValueChange={setOpen} className="mt-3 space-y-3">
          {SECTIONS.map((s) => (
            <div key={s.id} id={`sec-${s.id}`} className="scroll-mt-20 rounded-2xl border border-border bg-card">
              <AccordionItem value={s.id} className="border-0">
                <AccordionTrigger data-testid={`section-${s.id}`} className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">{s.n}</span>
                    <div className="flex items-center gap-2">
                      <s.Icon className="h-4 w-4 text-primary" />
                      <span className="text-base font-extrabold">{s.title}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1">{renderSection(s.id)}</AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>

        {/* bottom navigation */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button data-testid="back-grade-bottom" onClick={() => navigate(`/grade/${lesson.gradeId}`)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold hover:bg-secondary">
            <HomeIcon className="h-4 w-4" /> Λίστα μαθημάτων
          </button>
          {nextLesson && (
            <button data-testid="next-lesson-btn" onClick={() => navigate(`/lesson/${nextLesson.id}`)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.03]">
              Επόμενο μάθημα: <MathText text={nextLesson.title} /> <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
