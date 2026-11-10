import { useId, useMemo, useState } from "react";
import { Activity, MoveHorizontal, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";
import { buildQuadraticModel } from "./quadraticModel";

const A_VALUES = [-2, -1, -0.5, 0.5, 1, 2];
const PRESETS = [
  { label: "2 ρίζες", a: 1, b: -2, c: -3 },
  { label: "1 ρίζα", a: 1, b: -4, c: 4 },
  { label: "Καμία ρίζα", a: 1, b: 0, c: 2 },
  { label: "Κοίλα κάτω", a: -1, b: 2, c: 3 },
];
const VIEW = { width: 680, height: 430, xMin: -6, xMax: 6, yMin: -6, yMax: 6 };

const xToSvg = (x) => ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * VIEW.width;
const yToSvg = (y) => VIEW.height - ((y - VIEW.yMin) / (VIEW.yMax - VIEW.yMin)) * VIEW.height;
const formatNumber = (value) => {
  if (Math.abs(value) < 1e-10) return "0";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace(".", ",");
};

function functionText(a, b, c) {
  const aPart = a === 1 ? "x^2" : a === -1 ? "-x^2" : `${formatNumber(a)}x^2`;
  const bPart = b === 0 ? "" : `${b > 0 ? "+" : "-"}${Math.abs(b) === 1 ? "" : formatNumber(Math.abs(b))}x`;
  const cPart = c === 0 ? "" : `${c > 0 ? "+" : "-"}${formatNumber(Math.abs(c))}`;
  return `y=${aPart}${bPart}${cPart}`;
}

function curvePath(a, b, c) {
  const segments = [];
  let drawing = false;
  for (let x = VIEW.xMin; x <= VIEW.xMax + 0.001; x += 0.035) {
    const y = a * x * x + b * x + c;
    const visible = y >= VIEW.yMin - 0.25 && y <= VIEW.yMax + 0.25;
    if (visible) {
      segments.push(`${drawing ? "L" : "M"}${xToSvg(x).toFixed(2)},${yToSvg(y).toFixed(2)}`);
      drawing = true;
    } else {
      drawing = false;
    }
  }
  return segments.join(" ");
}

export function QuadraticExplorer() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);
  const model = useMemo(() => buildQuadraticModel(a, b, c), [a, b, c]);
  const curve = useMemo(() => curvePath(a, b, c), [a, b, c]);
  const titleId = useId();
  const descriptionId = useId();
  const formula = functionText(a, b, c);
  const opensUp = a > 0;
  const rootLabel = model.roots.length === 2 ? "Δύο πραγματικές ρίζες" : model.roots.length === 1 ? "Μία διπλή ρίζα" : "Καμία πραγματική ρίζα";

  const applyPreset = (preset) => {
    setA(preset.a);
    setB(preset.b);
    setC(preset.c);
  };

  const pointVisible = (x, y) => x >= VIEW.xMin && x <= VIEW.xMax && y >= VIEW.yMin && y <= VIEW.yMax;

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 shadow-[0_14px_35px_rgba(8,145,178,0.08)] dark:border-cyan-500/30 dark:from-cyan-500/10 dark:via-card dark:to-indigo-500/10">
      <div className="border-b border-cyan-200/80 px-4 py-4 sm:px-5 dark:border-cyan-500/25">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20"><Sparkles className="h-5 w-5" /></span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-cyan-700 dark:text-cyan-300">Δυναμικό εργαστήριο</div>
            <h3 className="mt-0.5 text-lg font-black sm:text-xl">Μετακίνησε τους συντελεστές και διάβασε την παραβολή</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Παρατήρησε πώς οι αλλαγές στα α, β και γ μετακινούν την κορυφή και αλλάζουν τις τομές.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.75fr)]">
        <div className="min-w-0">
          <div className="rounded-xl border border-cyan-200/80 bg-white/90 p-4 dark:border-cyan-500/25 dark:bg-background/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="text-xs font-bold text-muted-foreground">Τρέχουσα συνάρτηση</div><div className="mt-1 text-2xl font-black text-cyan-700 dark:text-cyan-300"><MathText text={`$${formula}$`} /></div></div>
              <div className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${model.roots.length ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"}`}>{rootLabel}</div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-extrabold"><span className="flex items-center gap-1.5"><MoveHorizontal className="h-4 w-4 text-cyan-600" /> α = {formatNumber(a)}</span><select value={a} onChange={(event) => setA(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-base">{A_VALUES.map((value) => <option key={value} value={value}>{formatNumber(value)}</option>)}</select></label>
              <label className="text-sm font-extrabold"><span>β = {b}</span><input type="range" min="-6" max="6" value={b} onChange={(event) => setB(Number(event.target.value))} className="mt-3 h-2 w-full cursor-pointer accent-cyan-600" /></label>
              <label className="text-sm font-extrabold"><span>γ = {c}</span><input type="range" min="-6" max="6" value={c} onChange={(event) => setC(Number(event.target.value))} className="mt-3 h-2 w-full cursor-pointer accent-cyan-600" /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Έτοιμα παραδείγματα παραβολών">{PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-extrabold text-cyan-800 hover:border-cyan-500 dark:border-cyan-500/30 dark:bg-card dark:text-cyan-200">{preset.label}</button>)}</div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="block h-auto w-full" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
              <title id={titleId}>Γραφική παράσταση της συνάρτησης {formula}</title>
              <desc id={descriptionId}>Παραβολή με κορυφή ({formatNumber(model.vertexX)}, {formatNumber(model.vertexY)}), άξονα συμμετρίας x ίσον {formatNumber(model.vertexX)} και {rootLabel.toLocaleLowerCase("el-GR")}.</desc>
              {Array.from({ length: 13 }, (_, i) => i - 6).map((n) => <g key={n}><line x1={xToSvg(n)} y1="0" x2={xToSvg(n)} y2={VIEW.height} stroke="currentColor" className="text-slate-200 dark:text-slate-800" /><line x1="0" y1={yToSvg(n)} x2={VIEW.width} y2={yToSvg(n)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" /></g>)}
              <line x1="0" y1={yToSvg(0)} x2={VIEW.width} y2={yToSvg(0)} stroke="currentColor" className="text-slate-600 dark:text-slate-300" strokeWidth="2" />
              <line x1={xToSvg(0)} y1="0" x2={xToSvg(0)} y2={VIEW.height} stroke="currentColor" className="text-slate-600 dark:text-slate-300" strokeWidth="2" />
              {model.vertexX >= VIEW.xMin && model.vertexX <= VIEW.xMax && <line x1={xToSvg(model.vertexX)} y1="0" x2={xToSvg(model.vertexX)} y2={VIEW.height} stroke="#f59e0b" strokeWidth="2" strokeDasharray="7 6" />}
              <path d={curve} fill="none" stroke={opensUp ? "#0891b2" : "#e11d48"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {pointVisible(model.vertexX, model.vertexY) && <circle cx={xToSvg(model.vertexX)} cy={yToSvg(model.vertexY)} r="7" fill="#f59e0b" stroke="white" strokeWidth="3" />}
              {model.roots.filter((root) => pointVisible(root, 0)).map((root) => <circle key={root} cx={xToSvg(root)} cy={yToSvg(0)} r="6" fill="#10b981" stroke="white" strokeWidth="3" />)}
              {pointVisible(0, c) && <circle cx={xToSvg(0)} cy={yToSvg(c)} r="6" fill="#8b5cf6" stroke="white" strokeWidth="3" />}
              <text x={VIEW.width - 14} y={yToSvg(0) - 10} textAnchor="end" fill="currentColor" className="text-slate-600 dark:text-slate-300" fontSize="15" fontWeight="800">x</text>
              <text x={xToSvg(0) + 12} y="20" fill="currentColor" className="text-slate-600 dark:text-slate-300" fontSize="15" fontWeight="800">y</text>
            </svg>
          </div>
        </div>

        <aside className="space-y-3" aria-live="polite">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"><div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-amber-700 dark:text-amber-300">Κορυφή και συμμετρία</div><dl className="mt-2 grid gap-2 text-[15px] sm:text-base"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Κορυφή</dt><dd className="font-extrabold">K({formatNumber(model.vertexX)}, {formatNumber(model.vertexY)})</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Άξονας</dt><dd className="font-extrabold">x = {formatNumber(model.vertexX)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Ακρότατο</dt><dd className="text-right font-extrabold">{opensUp ? `Ελάχιστο ${formatNumber(model.vertexY)}` : `Μέγιστο ${formatNumber(model.vertexY)}`}</dd></div></dl></div>
          <div className="rounded-xl border border-border bg-white/85 p-4 dark:bg-card/80"><div className="flex items-center gap-2 text-base font-black"><Activity className="h-4 w-4 text-cyan-600" /> Διακρίνουσα και ρίζες</div><div className="mt-2 text-xl font-black text-cyan-700 dark:text-cyan-300">Δ = {formatNumber(model.discriminant)}</div><p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{rootLabel}. {model.roots.length ? `x = ${model.roots.map(formatNumber).join(" ή ")}` : "Η παραβολή δεν τέμνει τον άξονα x."}</p></div>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10"><div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-violet-700 dark:text-violet-300">Τομή με τον άξονα y</div><div className="mt-2 text-base font-black">(0, {formatNumber(model.yIntercept)})</div><p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Η τεταγμένη της τομής είναι πάντα ο σταθερός όρος γ.</p></div>
          <div className="rounded-xl bg-[#173f68] p-4 text-white"><div className="text-xs font-extrabold text-sky-200">Διάβασε πριν σχεδιάσεις</div><p className="mt-1 text-[15px] leading-relaxed text-white/85 sm:text-base">Από τους α, β, γ μπορείς να προβλέψεις κατεύθυνση, άξονα, κορυφή και τομές πριν χαράξεις την καμπύλη.</p></div>
        </aside>
      </div>
    </section>
  );
}
