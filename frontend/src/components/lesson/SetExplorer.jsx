import { useId, useMemo, useState } from "react";
import { CircleDot, MousePointerClick, Sparkles } from "lucide-react";
import { buildSetModel } from "./setModel";

const UNIVERSE = Array.from({ length: 10 }, (_, index) => index + 1);
const PRESETS = [
  { label: "Με κοινά στοιχεία", a: [1, 2, 3, 4, 5], b: [4, 5, 6, 7] },
  { label: "Ξένα σύνολα", a: [1, 2, 3], b: [7, 8, 9] },
  { label: "A ⊆ B", a: [2, 4], b: [1, 2, 3, 4, 5] },
  { label: "Ίσα σύνολα", a: [2, 5, 8], b: [2, 5, 8] },
];

const OPERATIONS = [
  { id: "union", label: "Ένωση", symbol: "A ∪ B" },
  { id: "intersection", label: "Τομή", symbol: "A ∩ B" },
  { id: "onlyA", label: "Διαφορά", symbol: "A − B" },
  { id: "complementA", label: "Συμπλήρωμα", symbol: "A′" },
];

const formatSet = (values) => values.length ? `{${values.join(", ")}}` : "∅";

function NumberToggle({ value, selected, setName, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${selected ? "Αφαίρεσε" : "Πρόσθεσε"} το ${value} ${selected ? "από" : "στο"} σύνολο ${setName}`}
      onClick={() => onToggle(value)}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-sm font-black transition ${
        selected
          ? setName === "A"
            ? "border-cyan-600 bg-cyan-600 text-white shadow-sm"
            : "border-orange-500 bg-orange-500 text-white shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground"
      }`}
    >
      {value}
    </button>
  );
}

export function SetExplorer() {
  const [aValues, setAValues] = useState(PRESETS[0].a);
  const [bValues, setBValues] = useState(PRESETS[0].b);
  const [operation, setOperation] = useState("union");
  const model = useMemo(() => buildSetModel(UNIVERSE, aValues, bValues), [aValues, bValues]);
  const titleId = useId();
  const descriptionId = useId();
  const clipAId = useId();
  const maskDifferenceId = useId();
  const maskComplementId = useId();
  const active = OPERATIONS.find((item) => item.id === operation);
  const result = model[operation];

  const toggle = (setValues, updateSet, value) => {
    updateSet(setValues.includes(value)
      ? setValues.filter((item) => item !== value)
      : [...setValues, value].sort((x, y) => x - y));
  };

  const applyPreset = (preset) => {
    setAValues(preset.a);
    setBValues(preset.b);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 shadow-[0_14px_35px_rgba(109,40,217,0.08)] dark:border-violet-500/30 dark:from-violet-500/10 dark:via-card dark:to-cyan-500/10">
      <div className="border-b border-violet-200/80 px-4 py-4 sm:px-5 dark:border-violet-500/25">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20"><Sparkles className="h-5 w-5" /></span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-violet-700 dark:text-violet-300">Δυναμικό εργαστήριο</div>
            <h3 className="mt-0.5 text-lg font-black sm:text-xl">Κατασκεύασε σύνολα και δες τις πράξεις τους</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Πρόσθεσε ή αφαίρεσε αριθμούς και παρατήρησε αμέσως ποια περιοχή του διαγράμματος αντιστοιχεί στο αποτέλεσμα.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-violet-200/80 bg-white/90 p-4 dark:border-violet-500/25 dark:bg-background/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-muted-foreground">Σύνολο αναφοράς</div>
                <div className="mt-1 text-lg font-black">Ω = {formatSet(UNIVERSE)}</div>
              </div>
              <div className="flex flex-wrap gap-2">{PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-extrabold text-violet-800 hover:border-violet-500 dark:border-violet-500/30 dark:bg-card dark:text-violet-200">{preset.label}</button>)}</div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-500/25 dark:bg-cyan-500/10">
                <div className="font-black text-cyan-800 dark:text-cyan-200">A = {formatSet(model.a)}</div>
                <div className="mt-3 flex flex-wrap gap-2">{UNIVERSE.map((value) => <NumberToggle key={value} value={value} selected={model.a.includes(value)} setName="A" onToggle={(item) => toggle(aValues, setAValues, item)} />)}</div>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 dark:border-orange-500/25 dark:bg-orange-500/10">
                <div className="font-black text-orange-800 dark:text-orange-200">B = {formatSet(model.b)}</div>
                <div className="mt-3 flex flex-wrap gap-2">{UNIVERSE.map((value) => <NumberToggle key={value} value={value} selected={model.b.includes(value)} setName="B" onToggle={(item) => toggle(bValues, setBValues, item)} />)}</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
            <svg viewBox="0 0 680 400" className="block h-auto w-full" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
              <title id={titleId}>Διάγραμμα Venn για την πράξη {active.symbol}</title>
              <desc id={descriptionId}>Το σύνολο A έχει στοιχεία {formatSet(model.a)}, το B έχει {formatSet(model.b)} και το αποτέλεσμα είναι {formatSet(result)}.</desc>
              <defs>
                <clipPath id={clipAId}><circle cx="270" cy="205" r="145" /></clipPath>
                <mask id={maskDifferenceId}>
                  <rect width="680" height="400" fill="black" />
                  <circle cx="270" cy="205" r="145" fill="white" />
                  <circle cx="410" cy="205" r="145" fill="black" />
                </mask>
                <mask id={maskComplementId}>
                  <rect width="680" height="400" fill="white" />
                  <circle cx="270" cy="205" r="145" fill="black" />
                </mask>
              </defs>
              <rect x="18" y="18" width="644" height="364" rx="20" fill="currentColor" className="text-slate-50 dark:text-slate-900" stroke="currentColor" strokeWidth="3" />
              {operation === "complementA" && <rect x="18" y="18" width="644" height="364" rx="20" fill="#f59e0b" opacity=".27" mask={`url(#${maskComplementId})`} />}
              <circle cx="270" cy="205" r="145" fill="#06b6d4" opacity={operation === "union" ? ".36" : ".12"} stroke="#0891b2" strokeWidth="4" />
              <circle cx="410" cy="205" r="145" fill="#f97316" opacity={operation === "union" ? ".34" : ".12"} stroke="#ea580c" strokeWidth="4" />
              {operation === "intersection" && <circle cx="410" cy="205" r="145" fill="#8b5cf6" opacity=".64" clipPath={`url(#${clipAId})`} />}
              {operation === "onlyA" && <rect width="680" height="400" fill="#06b6d4" opacity=".52" mask={`url(#${maskDifferenceId})`} />}
              <text x="180" y="82" fill="#0e7490" fontSize="23" fontWeight="900">A</text>
              <text x="490" y="82" fill="#c2410c" fontSize="23" fontWeight="900">B</text>
              <text x="38" y="52" fill="currentColor" className="text-slate-600 dark:text-slate-300" fontSize="19" fontWeight="900">Ω</text>
              <text x="205" y="210" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-white" fontSize="19" fontWeight="800">{model.onlyA.join(", ") || "—"}</text>
              <text x="340" y="210" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-white" fontSize="19" fontWeight="800">{model.intersection.join(", ") || "∅"}</text>
              <text x="475" y="210" textAnchor="middle" fill="currentColor" className="text-slate-800 dark:text-white" fontSize="19" fontWeight="800">{model.onlyB.join(", ") || "—"}</text>
              <text x="340" y="354" textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-300" fontSize="17" fontWeight="800">Εκτός A και B: {model.outside.join(", ") || "∅"}</text>
            </svg>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-border bg-white/85 p-4 dark:bg-card/80">
            <div className="flex items-center gap-2 text-base font-black"><MousePointerClick className="h-4 w-4 text-violet-600" /> Επίλεξε πράξη</div>
            <div className="mt-3 grid grid-cols-2 gap-2">{OPERATIONS.map((item) => <button key={item.id} type="button" aria-pressed={operation === item.id} onClick={() => setOperation(item.id)} className={`rounded-xl border px-3 py-2.5 text-left transition ${operation === item.id ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-600/15" : "border-border bg-background hover:border-violet-400"}`}><span className="block text-xs font-bold opacity-80">{item.label}</span><span className="block text-lg font-black">{item.symbol}</span></button>)}</div>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10" aria-live="polite">
            <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-violet-700 dark:text-violet-300">Αποτέλεσμα</div>
            <div className="mt-2 text-2xl font-black text-violet-800 dark:text-violet-200">{active.symbol} = {formatSet(result)}</div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {operation === "union" && "Κρατάμε κάθε στοιχείο που ανήκει στο A ή στο B, χωρίς επανάληψη."}
              {operation === "intersection" && "Κρατάμε μόνο τα στοιχεία που ανήκουν ταυτόχρονα και στα δύο σύνολα."}
              {operation === "onlyA" && "Κρατάμε τα στοιχεία του A που δεν ανήκουν στο B."}
              {operation === "complementA" && "Κρατάμε τα στοιχεία του Ω που δεν ανήκουν στο A."}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-200"><CircleDot className="h-4 w-4" /> Σχέσεις συνόλων</div>
            <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed sm:text-base">
              <li>{model.intersection.length === 0 ? "Τα A και B είναι ξένα: A ∩ B = ∅." : `Έχουν ${model.intersection.length} κοινά στοιχεία.`}</li>
              <li>{model.isASubsetOfB ? "Ισχύει A ⊆ B." : "Δεν ισχύει A ⊆ B."}</li>
              <li>{model.isBSubsetOfA ? "Ισχύει B ⊆ A." : "Δεν ισχύει B ⊆ A."}</li>
            </ul>
          </div>

          <div className="rounded-xl bg-[#173f68] p-4 text-white">
            <div className="text-xs font-extrabold text-sky-200">Πριν γράψεις σύμβολα</div>
            <p className="mt-1 text-[15px] leading-relaxed text-white/85 sm:text-base">Πες με λόγια ποια στοιχεία ζητά η πράξη. Έπειτα χρησιμοποίησε το διάγραμμα για έλεγχο.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
