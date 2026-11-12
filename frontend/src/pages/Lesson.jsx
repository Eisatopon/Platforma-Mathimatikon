import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight, ChevronLeft, ArrowLeft, BookOpen, Lightbulb, Clock, Home as HomeIcon,
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
import { GuidedPractice } from "@/components/lesson/GuidedPractice";
import { DiagnosticCheck } from "@/components/lesson/DiagnosticCheck";
import { ParabolaExplorer } from "@/components/lesson/ParabolaExplorer";
import { QuadraticExplorer } from "@/components/lesson/QuadraticExplorer";
import { SetExplorer } from "@/components/lesson/SetExplorer";
import { SegmentRatioExplorer } from "@/components/lesson/SegmentRatioExplorer";
import { TrigIdentityExplorer } from "@/components/lesson/TrigIdentityExplorer";
import { TriangleLawsExplorer } from "@/components/lesson/TriangleLawsExplorer";
import { SupplementaryExplorer } from "@/components/lesson/SupplementaryExplorer";
import { UnitCircleExplorer } from "@/components/lesson/UnitCircleExplorer";
import { SimilarAreasExplorer } from "@/components/lesson/SimilarAreasExplorer";
import { SimilarityExplorer } from "@/components/lesson/SimilarityExplorer";
import { HomothetyExplorer } from "@/components/lesson/HomothetyExplorer";
import { ThalesExplorer } from "@/components/lesson/ThalesExplorer";
import { CongruenceExplorer } from "@/components/lesson/CongruenceExplorer";
import { ProbabilityExplorer } from "@/components/lesson/ProbabilityExplorer";
import { SampleSpaceExplorer } from "@/components/lesson/SampleSpaceExplorer";
import { NumberSenseExplorer } from "@/components/lesson/NumberSenseExplorer";
import { RealOperationsExplorer } from "@/components/lesson/RealOperationsExplorer";
import { fetchLesson, fetchGrade, readApiCache } from "@/lib/api";
import { categoryIcon } from "@/lib/ui";

const SECTIONS = [
  { id: "plan", n: 1, title: "Ξεκίνα εδώ", Icon: ClipboardList },
  { id: "theory", n: 2, title: "Θεωρία / Επανάληψη", Icon: BookOpen },
  { id: "worksheet", n: 3, title: "Φύλλο εργασίας", Icon: PencilRuler },
  { id: "interactive", n: 4, title: "Διαδραστικές ασκήσεις", Icon: MousePointerClick },
  { id: "test", n: 5, title: "Τεστ αξιολόγησης", Icon: Timer },
  { id: "solutions", n: 6, title: "Λύσεις", Icon: CheckCircle2 },
  { id: "recap", n: 7, title: "Ανακεφαλαίωση", Icon: Flag },
];

const NEXT_GENERATION_SECTIONS = [
  { id: "plan", n: 1, title: "Αφετηρία", Icon: ClipboardList },
  { id: "theory", n: 2, title: "Ανακάλυψε", Icon: BookOpen },
  { id: "worksheet", n: 3, title: "Εφάρμοσε", Icon: PencilRuler },
  { id: "interactive", n: 4, title: "Προσαρμοστική εξάσκηση", Icon: MousePointerClick },
  { id: "test", n: 5, title: "Έλεγξε την πρόοδό σου", Icon: Timer },
  { id: "solutions", n: 6, title: "Κατανόησε τις λύσεις", Icon: CheckCircle2 },
  { id: "recap", n: 7, title: "Κλείσε το μάθημα", Icon: Flag },
];

const SOLUTION_LEVEL_SUBTITLES = {
  "Επίπεδο Α": "Βασικές ασκήσεις",
  "Επίπεδο Β": "Ασκήσεις μέτριας δυσκολίας",
  "Επίπεδο Γ": "Προχωρημένες ασκήσεις",
};

const LessonExperience = ({ lesson, gradeTitle, nextLesson, navigate, Icon, renderSection }) => {
  const sections = lesson.experienceVersion === 2 ? NEXT_GENERATION_SECTIONS : SECTIONS;
  const [active, setActive] = useState(0);
  const section = sections[active];
  const progress = Math.round(((active + 1) / sections.length) * 100);

  useEffect(() => {
    setActive(0);
    window.scrollTo(0, 0);
  }, [lesson.id]);

  const goTo = (index) => {
    setActive(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="lesson-shell App min-h-screen w-full max-w-full overflow-x-hidden bg-[#f5f7fb] dark:bg-background">
      <Header />
      <div className="border-b border-[#dbe3ef] bg-white dark:border-border dark:bg-card">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button onClick={() => navigate(`/grade/${lesson.gradeId}`)} className="inline-flex items-center gap-2 text-sm font-bold text-[#40566f] transition hover:text-primary dark:text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> {gradeTitle || "Επιστροφή στην τάξη"}
          </button>
          <div className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex">
            <span>{lesson.chapter}</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-foreground">{lesson.category}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto grid w-full min-w-0 max-w-[1380px] gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6">
        <aside className="min-w-0 max-w-full self-start lg:sticky lg:top-5">
          <div className="max-w-full rounded-2xl border border-[#dce4ef] bg-white p-3 shadow-[0_12px_35px_rgba(35,64,96,0.06)] dark:border-border dark:bg-card sm:p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-[#e6ebf2] pb-4 dark:border-border">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eaf1fb] text-[#1f4e7b] dark:bg-primary/15 dark:text-primary"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#738398]">MathTopon · Μάθημα</div>
                <div className="mt-1 line-clamp-2 text-sm font-extrabold leading-tight"><MathText text={lesson.title} /></div>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#64768b] dark:text-muted-foreground"><span>Πρόοδος μαθήματος</span><span>{progress}%</span></div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#e7edf5] dark:bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-[#1f4e7b] to-[#557fbe] transition-all duration-300" style={{ width: `${progress}%` }} /></div>

            <nav aria-label="Ενότητες μαθήματος" className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {sections.map((item, index) => {
                const SelectedIcon = item.Icon;
                const selected = index === active;
                const visited = index < active;
                return (
                  <button key={item.id} onClick={() => goTo(index)} aria-current={selected ? "step" : undefined} className={`group flex min-h-14 min-w-0 items-center gap-2 rounded-xl px-2 py-2.5 text-left text-xs font-bold transition sm:gap-3 sm:px-3 sm:text-sm ${selected ? "bg-[#1f4e7b] text-white shadow-md shadow-[#1f4e7b]/20" : "text-[#53677e] hover:bg-[#eef3f9] dark:text-muted-foreground dark:hover:bg-secondary"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${selected ? "bg-white/15" : visited ? "bg-emerald-100 text-emerald-700" : "bg-[#eaf0f7] text-[#315d88] dark:bg-secondary dark:text-primary"}`}>{visited ? <CheckCircle2 className="h-4 w-4" /> : <SelectedIcon className="h-4 w-4" />}</span>
                    <span className="min-w-0 break-words leading-tight"><span className={`mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider ${selected ? "text-white/65" : "text-[#93a0af]"}`}>Βήμα {item.n}</span>{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 max-w-full overflow-hidden">
          <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#173f68] via-[#1f4e7b] to-[#416fa8] p-5 text-white shadow-[0_14px_35px_rgba(31,78,123,0.16)] sm:p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur"><GraduationCap className="h-4 w-4" /> {lesson.category}</span>
              {lesson.experienceVersion === 2 && <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-100">✦ Μάθημα νέας γενιάς</span>}
            </div>
            <h1 className="max-w-3xl text-2xl font-black leading-tight tracking-tight sm:text-3xl"><MathText text={lesson.title} /></h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/85">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><Clock className="h-4 w-4" /> {lesson.minutes} λεπτά</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><ListChecks className="h-4 w-4" /> {lesson.questionCount} διαθέσιμες ερωτήσεις</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><Flag className="h-4 w-4" /> Βήμα {section.n} από {sections.length}</span>
            </div>
          </div>

          <article key={section.id} className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#dce4ef] bg-white shadow-[0_12px_38px_rgba(35,64,96,0.07)] dark:border-border dark:bg-card sm:rounded-3xl">
            <header className="flex min-w-0 items-center gap-3 border-b border-[#e5ebf2] px-4 py-4 dark:border-border sm:gap-4 sm:px-8 sm:py-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eaf1fb] text-[#1f4e7b] dark:bg-primary/15 dark:text-primary"><section.Icon className="h-5 w-5" /></span>
              <div className="min-w-0"><div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#8290a1]">Βήμα {section.n} από {sections.length}</div><h2 className="mt-0.5 break-words text-xl font-black sm:text-2xl">{section.title}</h2></div>
            </header>
            <div className="lesson-content min-w-0 max-w-full overflow-hidden px-4 py-5 sm:px-8 sm:py-8">{renderSection(section.id)}</div>
          </article>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button disabled={active === 0} onClick={() => goTo(active - 1)} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cfd9e6] bg-white px-5 py-2.5 text-sm font-bold text-[#35536f] transition hover:bg-[#eef3f9] disabled:cursor-not-allowed disabled:opacity-35 dark:border-border dark:bg-card dark:text-foreground"><ChevronLeft className="h-4 w-4" /> Προηγούμενο βήμα</button>
            {active < sections.length - 1 ? (
              <button onClick={() => goTo(active + 1)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f4e7b] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#1f4e7b]/20 transition hover:-translate-y-0.5">Επόμενο: {sections[active + 1].title}<ChevronRight className="h-4 w-4" /></button>
            ) : nextLesson ? (
              <button onClick={() => navigate(`/lesson/${nextLesson.id}`)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f4e7b] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#1f4e7b]/20">Επόμενο μάθημα<ChevronRight className="h-4 w-4" /></button>
            ) : (
              <button onClick={() => navigate(`/grade/${lesson.gradeId}`)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f4e7b] px-6 py-2.5 text-sm font-bold text-white"><HomeIcon className="h-4 w-4" /> Επιστροφή στα μαθήματα</button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const SolutionItem = ({ sol, i }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><span className="text-base font-extrabold">{sol.title}</span>{SOLUTION_LEVEL_SUBTITLES[sol.title] && <span className="ml-2 text-xs font-semibold text-muted-foreground">· {SOLUTION_LEVEL_SUBTITLES[sol.title]}</span>}</div>
        <button data-testid={`solution-toggle-${i}`} onClick={() => setOpen((o) => !o)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold hover:bg-secondary/70">
          {open ? <><EyeOff className="h-3.5 w-3.5" /> Απόκρυψη</> : <><Eye className="h-3.5 w-3.5" /> Εμφάνιση λύσης</>}
        </button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
          <MathText className="text-base leading-relaxed sm:text-[17px]" text={sol.text} />
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

  useEffect(() => {
    window.scrollTo(0, 0);
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
            {plan.overview && <p className="text-base leading-relaxed text-muted-foreground sm:text-[17px]"><MathText text={plan.overview} /></p>}
            <DiagnosticCheck lessonId={lesson.id} diagnostic={lesson.diagnostic} />
            {plan.objectives?.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Target className="h-4 w-4 text-primary" /> Στόχοι</div>
                <ul className="space-y-1.5">
                  {plan.objectives.map((o, i) => (
                    <li key={i} className="flex gap-2 text-base sm:text-[17px]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><MathText text={o} /></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {plan.prerequisites?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold"><ListChecks className="h-4 w-4 text-primary" /> Προαπαιτούμενα</div>
                  <ul className="list-inside list-disc space-y-1 text-base text-muted-foreground sm:text-[17px]">{plan.prerequisites.map((p, i) => <li key={i}><MathText text={p} /></li>)}</ul>
                </div>
              )}
              {plan.materials?.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Package className="h-4 w-4 text-primary" /> Υλικά</div>
                  <ul className="list-inside list-disc space-y-1 text-base text-muted-foreground sm:text-[17px]">{plan.materials.map((m, i) => <li key={i}><MathText text={m} /></li>)}</ul>
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
                        <MathText className="mt-1 block text-[15px] leading-relaxed text-muted-foreground sm:text-base" text={phase.description} />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {plan.formativeAssessment?.length > 0 && (
              <div className="rounded-xl border border-sky-300/60 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
                <div className="mb-2 text-sm font-extrabold text-sky-800 dark:text-sky-300">Διαμορφωτικός έλεγχος</div>
                <ul className="list-inside list-disc space-y-1.5 text-[15px] sm:text-base">{plan.formativeAssessment.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ul>
              </div>
            )}
            {(plan.differentiation?.support?.length > 0 || plan.differentiation?.challenge?.length > 0) && (
              <div>
                <div className="mb-2 text-sm font-bold">Διαφοροποίηση</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <div className="mb-2 text-sm font-extrabold">Υποστήριξη</div>
                    <ul className="list-inside list-disc space-y-1 text-[15px] text-muted-foreground sm:text-base">{plan.differentiation.support?.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ul>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <div className="mb-2 text-sm font-extrabold">Πρόκληση</div>
                    <ul className="list-inside list-disc space-y-1 text-[15px] text-muted-foreground sm:text-base">{plan.differentiation.challenge?.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ul>
                  </div>
                </div>
              </div>
            )}
            {plan.exitTicket?.length > 0 && (
              <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="mb-2 text-sm font-extrabold text-emerald-800 dark:text-emerald-300">Έλεγχος εξόδου</div>
                <ol className="list-inside list-decimal space-y-1.5 text-[15px] sm:text-base">{plan.exitTicket.map((item, i) => <li key={i}><MathText text={item} /></li>)}</ol>
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
                  <MathText className="text-base leading-relaxed sm:text-[17px]" text={t} />
                </li>
              ))}
            </ul>
            {lesson.figures?.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {lesson.figures.map((f, i) => (
                  <figure key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                    {f.title && <div className="border-b border-border bg-secondary/50 px-3 py-1.5 text-xs font-bold">{f.title}</div>}
                    <img src={f.url} alt={f.caption || f.title || "Σχήμα"} className="w-full object-contain p-2" loading="lazy" />
                    {f.caption && <figcaption className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">{f.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
            {lesson.id === "g7-a1-1" && <NumberSenseExplorer />}
            {lesson.id === "g9-a1-1" && <RealOperationsExplorer />}
            {lesson.id === "g9-a4-1" && <ParabolaExplorer />}
            {lesson.id === "g9-a4-2" && <QuadraticExplorer />}
            {lesson.id === "g9-a5-1" && <SetExplorer />}
            {lesson.id === "g9-a5-2" && <SampleSpaceExplorer />}
            {lesson.id === "g9-a5-3" && <ProbabilityExplorer />}
            {lesson.id === "g9-b1-1" && <CongruenceExplorer />}
            {lesson.id === "g9-b1-2" && <SegmentRatioExplorer />}
            {lesson.id === "g9-b1-3" && <ThalesExplorer />}
            {lesson.id === "g9-b1-4" && <HomothetyExplorer />}
            {lesson.id === "g9-b1-5" && <SimilarityExplorer />}
            {lesson.id === "g9-b1-6" && <SimilarAreasExplorer />}
            {lesson.id === "g9-b2-1" && <UnitCircleExplorer />}
            {lesson.id === "g9-b2-2" && <SupplementaryExplorer />}
            {lesson.id === "g9-b2-3" && <TrigIdentityExplorer />}
            {lesson.id === "g9-b2-4" && <TriangleLawsExplorer />}
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /><h4 className="font-extrabold text-amber-700 dark:text-amber-400">{lesson.example.title}</h4></div>
              <MathText className="text-base leading-relaxed sm:text-[17px]" text={lesson.example.text} />
            </div>
            <GuidedPractice lessonId={lesson.id} item={lesson.guidedPractice} />
            {lesson.attention?.length > 0 && (
              <div className="rounded-xl border border-rose-300/60 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                <div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" /><h4 className="font-extrabold text-rose-700 dark:text-rose-400">Σημεία προσοχής</h4></div>
                <ul className="list-inside list-disc space-y-1 text-base sm:text-[17px]">{lesson.attention.map((a, i) => <li key={i}><MathText text={a} /></li>)}</ul>
              </div>
            )}
          </div>
        );

      case "worksheet":
        return <Worksheet lessonId={lesson.id} worksheet={lesson.worksheet} />;

      case "interactive":
        return <InteractiveExercises key={lesson.id} lessonId={lesson.id} questions={lesson.practiceQuestions?.length ? lesson.practiceQuestions : lesson.questions} adaptive={Boolean(lesson.learningSpecification?.adaptiveDifficulty)} />;

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
                <ul className="space-y-1.5">{recap.keyPoints.map((k, i) => <li key={i} className="flex gap-2 text-base sm:text-[17px]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><MathText text={k} /></li>)}</ul>
              </div>
            )}
            {recap.furtherStudy?.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-bold">Περαιτέρω μελέτη</div>
                <ul className="list-inside list-disc space-y-1 text-base text-muted-foreground sm:text-[17px]">{recap.furtherStudy.map((f, i) => <li key={i}><MathText text={f} /></li>)}</ul>
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

  return <LessonExperience lesson={lesson} gradeTitle={gradeTitle} nextLesson={nextLesson} navigate={navigate} Icon={Icon} renderSection={renderSection} />;
}
