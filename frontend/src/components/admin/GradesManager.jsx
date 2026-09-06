import { useMemo, useState } from "react";
import { Plus, Save, Trash2, GraduationCap } from "lucide-react";
import { GRADE_COLORS } from "@/lib/ui";
import { adminCreateGrade, adminUpdateGrade, adminDeleteGrade, adminRenameChapter } from "@/lib/adminApi";

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const label = "block text-xs font-bold text-muted-foreground mb-1";

const COLOR_DOT = {
  emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500",
  sky: "bg-sky-500", violet: "bg-violet-500", teal: "bg-teal-500",
};

const GradeRow = ({ grade, lessons, onChanged }) => {
  const [title, setTitle] = useState(grade.title);
  const [subtitle, setSubtitle] = useState(grade.subtitle);
  const [color, setColor] = useState(grade.color);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const chapters = useMemo(() => {
    const set = [];
    lessons.filter((l) => l.gradeId === grade.id).forEach((l) => { if (!set.includes(l.chapter)) set.push(l.chapter); });
    return set;
  }, [lessons, grade.id]);

  const save = async () => {
    setBusy(true); setErr("");
    try { await adminUpdateGrade(grade.id, { title, subtitle, color }); onChanged(); }
    catch (e) { setErr(e?.response?.data?.detail || "Σφάλμα"); } finally { setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm(`Διαγραφή της τάξης "${grade.title}";`)) return;
    setBusy(true); setErr("");
    try { await adminDeleteGrade(grade.id); onChanged(); }
    catch (e) { setErr(e?.response?.data?.detail || "Σφάλμα"); setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div><label className={label}>Τίτλος</label><input className={inp} value={title} onChange={(e) => setTitle(e.target.value)} data-testid={`grade-title-${grade.id}`} /></div>
        <div><label className={label}>Υπότιτλος</label><input className={inp} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></div>
        <div>
          <label className={label}>Χρώμα</label>
          <div className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded-full ${COLOR_DOT[color] || "bg-emerald-500"}`} />
            <select className={inp} value={color} onChange={(e) => setColor(e.target.value)}>
              {GRADE_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      {err && <p className="mt-2 text-sm font-semibold text-rose-600">{err}</p>}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={save} disabled={busy} data-testid={`grade-save-${grade.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" /> Αποθήκευση</button>
        <button onClick={del} disabled={busy} data-testid={`grade-delete-${grade.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /> Διαγραφή</button>
        <span className="text-xs text-muted-foreground">{lessons.filter((l) => l.gradeId === grade.id).length} μαθήματα</span>
      </div>

      {chapters.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 text-xs font-bold text-muted-foreground">Κεφάλαια (μετονομασία)</div>
          <div className="space-y-2">
            {chapters.map((ch) => <ChapterRenamer key={ch} gradeId={grade.id} name={ch} onChanged={onChanged} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const ChapterRenamer = ({ gradeId, name, onChanged }) => {
  const [val, setVal] = useState(name);
  const [busy, setBusy] = useState(false);
  const rename = async () => {
    if (val.trim() === name || !val.trim()) return;
    setBusy(true);
    try { await adminRenameChapter(gradeId, name, val.trim()); onChanged(); } finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-2">
      <input className={inp} value={val} onChange={(e) => setVal(e.target.value)} />
      <button onClick={rename} disabled={busy || val.trim() === name} className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-secondary disabled:opacity-40">Μετονομασία</button>
    </div>
  );
};

export const GradesManager = ({ grades, lessons, onChanged }) => {
  const [nt, setNt] = useState("");
  const [ns, setNs] = useState("");
  const [nc, setNc] = useState("sky");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!nt.trim()) return;
    setBusy(true);
    try { await adminCreateGrade({ title: nt.trim(), subtitle: ns.trim(), color: nc }); setNt(""); setNs(""); onChanged(); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2 font-extrabold"><Plus className="h-4 w-4 text-primary" /> Νέα τάξη</div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input className={inp} placeholder="Τίτλος (π.χ. Δ΄ Τάξη)" value={nt} onChange={(e) => setNt(e.target.value)} data-testid="new-grade-title" />
          <input className={inp} placeholder="Υπότιτλος" value={ns} onChange={(e) => setNs(e.target.value)} />
          <select className={inp} value={nc} onChange={(e) => setNc(e.target.value)}>{GRADE_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <button onClick={create} disabled={busy} data-testid="new-grade-create" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"><Plus className="h-4 w-4" /> Προσθήκη</button>
        </div>
      </div>
      {grades.map((g) => <GradeRow key={g.id} grade={g} lessons={lessons} onChanged={onChanged} />)}
    </div>
  );
};
