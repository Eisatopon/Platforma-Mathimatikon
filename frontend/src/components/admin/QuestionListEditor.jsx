import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ"];

export const QuestionListEditor = ({ value, onChange, testidPrefix = "q" }) => {
  const update = (i, patch) => onChange(value.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const addQ = () => onChange([...value, { prompt: "", options: ["", ""], correct: 0, explanation: "" }]);
  const removeQ = (i) => onChange(value.filter((_, idx) => idx !== i));

  const setOpt = (qi, oi, v) => update(qi, { options: value[qi].options.map((o, idx) => (idx === oi ? v : o)) });
  const addOpt = (qi) => update(qi, { options: [...value[qi].options, ""] });
  const removeOpt = (qi, oi) => {
    const opts = value[qi].options.filter((_, idx) => idx !== oi);
    const correct = value[qi].correct >= opts.length ? opts.length - 1 : value[qi].correct;
    update(qi, { options: opts, correct: Math.max(0, correct) });
  };

  return (
    <div className="space-y-4">
      {value.map((q, i) => (
        <div key={i} data-testid={`${testidPrefix}-block-${i}`} className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground"><GripVertical className="h-3.5 w-3.5" /> Ερώτηση {i + 1}</span>
            <button type="button" data-testid={`${testidPrefix}-remove-${i}`} onClick={() => removeQ(i)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /> Διαγραφή</button>
          </div>
          <input className={inp} placeholder="Εκφώνηση (LaTeX σε $...$)" value={q.prompt} onChange={(e) => update(i, { prompt: e.target.value })} data-testid={`${testidPrefix}-prompt-${i}`} />
          <div className="mt-3 space-y-2">
            {q.options.map((o, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <button type="button" onClick={() => update(i, { correct: oi })} title="Ορισμός σωστής" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${q.correct === oi ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"}`} data-testid={`${testidPrefix}-correct-${i}-${oi}`}>{LETTERS[oi]}</button>
                <input className={inp} placeholder={`Επιλογή ${LETTERS[oi]}`} value={o} onChange={(e) => setOpt(i, oi, e.target.value)} data-testid={`${testidPrefix}-opt-${i}-${oi}`} />
                {q.options.length > 2 && <button type="button" onClick={() => removeOpt(i, oi)} className="text-muted-foreground hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
            {q.options.length < 6 && <button type="button" onClick={() => addOpt(i)} className="text-xs font-bold text-primary hover:underline">+ Προσθήκη επιλογής</button>}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Πάτησε το γράμμα για να ορίσεις τη σωστή απάντηση (πράσινο).</p>
          <input className={`${inp} mt-2`} placeholder="Επεξήγηση σωστής απάντησης" value={q.explanation} onChange={(e) => update(i, { explanation: e.target.value })} data-testid={`${testidPrefix}-expl-${i}`} />
        </div>
      ))}
      <button type="button" onClick={addQ} data-testid={`${testidPrefix}-add`} className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
        <Plus className="h-4 w-4" /> Προσθήκη ερώτησης
      </button>
    </div>
  );
};

export const SolutionListEditor = ({ value, onChange }) => {
  const update = (i, patch) => onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-3">
      {value.map((s, i) => (
        <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Λύση {i + 1}</span>
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /> Διαγραφή</button>
          </div>
          <input className={inp} placeholder="Τίτλος (π.χ. Άσκηση Α1)" value={s.title} onChange={(e) => update(i, { title: e.target.value })} />
          <textarea rows={3} className={`${inp} mt-2 resize-y`} placeholder="Αναλυτική λύση (LaTeX σε $...$)" value={s.text} onChange={(e) => update(i, { text: e.target.value })} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { title: "", text: "" }])} className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
        <Plus className="h-4 w-4" /> Προσθήκη λύσης
      </button>
    </div>
  );
};
