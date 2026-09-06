import { useMemo, useState } from "react";
import { Save, X, ClipboardList, BookOpen, PencilRuler, MousePointerClick, Timer, CheckCircle2, Flag } from "lucide-react";
import { QuestionListEditor, SolutionListEditor } from "@/components/admin/QuestionListEditor";

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const label = "block text-xs font-bold text-muted-foreground mb-1";
const CATEGORIES = ["Αριθμητική", "Άλγεβρα", "Γεωμετρία", "Στατιστική"];

const lines = (t) => t.split("\n").map((s) => s.trim()).filter(Boolean);
const toText = (arr) => (arr || []).join("\n");

const Section = ({ Icon, n, title, children }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="mb-4 flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">{n}</span>
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-base font-extrabold">{title}</h3>
    </div>
    {children}
  </div>
);

export const LessonEditor = ({ initial, grades, onSave, onCancel }) => {
  const d = initial || {};
  const [gradeId, setGradeId] = useState(d.gradeId || (grades[0]?.id || "g7"));
  const [chapter, setChapter] = useState(d.chapter || "");
  const [category, setCategory] = useState(d.category || "Αριθμητική");
  const [title, setTitle] = useState(d.title || "");
  const [minutes, setMinutes] = useState(d.minutes || 10);
  // plan
  const [overview, setOverview] = useState(d.plan?.overview || "");
  const [objectives, setObjectives] = useState(toText(d.plan?.objectives));
  const [prerequisites, setPrerequisites] = useState(toText(d.plan?.prerequisites));
  const [materials, setMaterials] = useState(toText(d.plan?.materials));
  const [duration, setDuration] = useState(d.plan?.duration || "");
  // theory
  const [theory, setTheory] = useState(toText(d.theory));
  const [exTitle, setExTitle] = useState(d.example?.title || "Παράδειγμα");
  const [exText, setExText] = useState(d.example?.text || "");
  const [attention, setAttention] = useState(toText(d.attention));
  // worksheet
  const [wA, setWA] = useState(toText(d.worksheet?.A));
  const [wB, setWB] = useState(toText(d.worksheet?.B));
  const [wC, setWC] = useState(toText(d.worksheet?.C));
  // interactive
  const [questions, setQuestions] = useState(d.questions || []);
  // test
  const [testDuration, setTestDuration] = useState(d.assessment?.durationMinutes || 15);
  const [testQuestions, setTestQuestions] = useState(d.assessment?.questions || []);
  // solutions
  const [solutions, setSolutions] = useState(d.solutions || []);
  // recap
  const [keyPoints, setKeyPoints] = useState(toText(d.recap?.keyPoints));
  const [furtherStudy, setFurtherStudy] = useState(toText(d.recap?.furtherStudy));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const valid = gradeId && chapter.trim() && title.trim();

  const buildPayload = () => ({
    gradeId, chapter: chapter.trim(), category, title: title.trim(), minutes: Number(minutes) || 10,
    order: d.order ?? null,
    theory: lines(theory),
    example: { title: exTitle.trim() || "Παράδειγμα", text: exText },
    questions,
    plan: { objectives: lines(objectives), prerequisites: lines(prerequisites), duration: duration.trim(), materials: lines(materials), overview: overview },
    attention: lines(attention),
    worksheet: { A: lines(wA), B: lines(wB), C: lines(wC) },
    assessment: { durationMinutes: Number(testDuration) || 15, questions: testQuestions },
    solutions,
    recap: { keyPoints: lines(keyPoints), nextLessonIds: [], furtherStudy: lines(furtherStudy) },
  });

  const save = async () => {
    if (!valid) { setError("Συμπλήρωσε Τάξη, Κεφάλαιο και Τίτλο."); return; }
    setSaving(true); setError("");
    try {
      await onSave(buildPayload());
    } catch (e) {
      setError(e?.response?.data?.detail || "Σφάλμα αποθήκευσης.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">{initial ? "Επεξεργασία μαθήματος" : "Νέο μάθημα"}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} data-testid="editor-cancel" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary"><X className="h-4 w-4" /> Άκυρο</button>
          <button onClick={save} disabled={saving} data-testid="editor-save" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Αποθήκευση…" : "Αποθήκευση"}</button>
        </div>
      </div>
      {error && <div data-testid="editor-error" className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 dark:bg-rose-500/10">{error}</div>}

      {/* Basic */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Τάξη</label>
            <select className={inp} value={gradeId} onChange={(e) => setGradeId(e.target.value)} data-testid="editor-grade">
              {grades.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Κατηγορία</label>
            <select className={inp} value={category} onChange={(e) => setCategory(e.target.value)} data-testid="editor-category">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Κεφάλαιο</label>
            <input className={inp} value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="π.χ. Κλάσματα" data-testid="editor-chapter" />
          </div>
          <div>
            <label className={label}>Διάρκεια (λεπτά)</label>
            <input type="number" className={inp} value={minutes} onChange={(e) => setMinutes(e.target.value)} data-testid="editor-minutes" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Τίτλος μαθήματος</label>
            <input className={inp} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="π.χ. Πρόσθεση κλασμάτων" data-testid="editor-title" />
          </div>
        </div>
      </div>

      <Section n={1} Icon={ClipboardList} title="Σχέδιο μαθήματος">
        <div className="space-y-3">
          <div><label className={label}>Επισκόπηση</label><textarea rows={2} className={`${inp} resize-y`} value={overview} onChange={(e) => setOverview(e.target.value)} /></div>
          <div><label className={label}>Στόχοι (ένας ανά γραμμή)</label><textarea rows={3} className={`${inp} resize-y`} value={objectives} onChange={(e) => setObjectives(e.target.value)} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label}>Προαπαιτούμενα (ανά γραμμή)</label><textarea rows={3} className={`${inp} resize-y`} value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)} /></div>
            <div><label className={label}>Υλικά (ανά γραμμή)</label><textarea rows={3} className={`${inp} resize-y`} value={materials} onChange={(e) => setMaterials(e.target.value)} /></div>
          </div>
          <div><label className={label}>Διάρκεια (κείμενο, προαιρετικό)</label><input className={inp} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="π.χ. 45 λεπτά" /></div>
        </div>
      </Section>

      <Section n={2} Icon={BookOpen} title="Θεωρία / Επανάληψη">
        <div className="space-y-3">
          <div><label className={label}>Θεωρία — σημεία (ένα ανά γραμμή, LaTeX σε $...$)</label><textarea rows={5} className={`${inp} resize-y`} value={theory} onChange={(e) => setTheory(e.target.value)} data-testid="editor-theory" /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className={label}>Τίτλος παραδείγματος</label><input className={inp} value={exTitle} onChange={(e) => setExTitle(e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={label}>Κείμενο παραδείγματος</label><input className={inp} value={exText} onChange={(e) => setExText(e.target.value)} /></div>
          </div>
          <div><label className={label}>Σημεία προσοχής (ανά γραμμή)</label><textarea rows={3} className={`${inp} resize-y`} value={attention} onChange={(e) => setAttention(e.target.value)} /></div>
        </div>
      </Section>

      <Section n={3} Icon={PencilRuler} title="Φύλλο εργασίας (Α/Β/Γ)">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className={`${label} text-emerald-600`}>Επίπεδο Α (ανά γραμμή)</label><textarea rows={4} className={`${inp} resize-y`} value={wA} onChange={(e) => setWA(e.target.value)} /></div>
          <div><label className={`${label} text-orange-600`}>Επίπεδο Β (ανά γραμμή)</label><textarea rows={4} className={`${inp} resize-y`} value={wB} onChange={(e) => setWB(e.target.value)} /></div>
          <div><label className={`${label} text-rose-600`}>Επίπεδο Γ (ανά γραμμή)</label><textarea rows={4} className={`${inp} resize-y`} value={wC} onChange={(e) => setWC(e.target.value)} /></div>
        </div>
      </Section>

      <Section n={4} Icon={MousePointerClick} title="Διαδραστικές ασκήσεις">
        <QuestionListEditor value={questions} onChange={setQuestions} testidPrefix="ix" />
      </Section>

      <Section n={5} Icon={Timer} title="Τεστ αξιολόγησης">
        <div className="mb-4 max-w-[220px]"><label className={label}>Χρονικό όριο (λεπτά)</label><input type="number" className={inp} value={testDuration} onChange={(e) => setTestDuration(e.target.value)} data-testid="editor-test-duration" /></div>
        <p className="mb-3 text-xs text-muted-foreground">Αν αφήσεις κενές τις ερωτήσεις, το τεστ θα χρησιμοποιεί τις διαδραστικές ασκήσεις ως δείγμα.</p>
        <QuestionListEditor value={testQuestions} onChange={setTestQuestions} testidPrefix="test" />
      </Section>

      <Section n={6} Icon={CheckCircle2} title="Λύσεις">
        <SolutionListEditor value={solutions} onChange={setSolutions} />
      </Section>

      <Section n={7} Icon={Flag} title="Ανακεφαλαίωση">
        <div className="space-y-3">
          <div><label className={label}>Βασικά σημεία (ανά γραμμή)</label><textarea rows={3} className={`${inp} resize-y`} value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} /></div>
          <div><label className={label}>Περαιτέρω μελέτη (ανά γραμμή)</label><textarea rows={3} className={`${inp} resize-y`} value={furtherStudy} onChange={(e) => setFurtherStudy(e.target.value)} /></div>
        </div>
      </Section>

      <div className="flex justify-end gap-2 pb-8">
        <button onClick={onCancel} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary"><X className="h-4 w-4" /> Άκυρο</button>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Αποθήκευση…" : "Αποθήκευση"}</button>
      </div>
    </div>
  );
};
