import { useId, useMemo, useState } from "react";
import { ArrowLeftRight, MoveHorizontal, RotateCcw, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";
import { buildSegmentRatioModel, segmentFractionLatex, segmentRatioFromPosition, SEGMENT_UNITS } from "./segmentRatioModel";

const PRESETS = [
  { label: "3 : 2", total: 20, m: 3, n: 2 },
  { label: "1 : 1", total: 20, m: 1, n: 1 },
  { label: "2 : 3", total: 25, m: 2, n: 3 },
  { label: "2 : 4", total: 18, m: 2, n: 4 },
];
const formatNumber = (value) => value.toLocaleString("el-GR", { maximumFractionDigits: 3 });
const plainFraction = (fraction) => fraction.denominator === 1 ? String(fraction.numerator) : `${fraction.numerator}/${fraction.denominator}`;
const decimalText = (fraction) => {
  const value = fraction.numerator / fraction.denominator;
  return `${Math.abs(value - Math.round(value * 1000) / 1000) < 1e-10 ? "=" : "≈"} ${formatNumber(value)}`;
};

function SegmentDrawing({ model, changeRatio }) {
  const titleId = useId();
  const xA = 70;
  const xB = 650;
  const xM = xA + (xB - xA) * model.position;
  const move = (event) => {
    const svg = event.currentTarget.ownerSVGElement;
    const matrix = svg?.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    changeRatio(segmentRatioFromPosition((local.x - xA) / (xB - xA)));
  };
  const keyMove = (event) => {
    let next;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(1, Math.round(model.position * 20) - 1) / 20;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(19, Math.round(model.position * 20) + 1) / 20;
    if (event.key === "Home") next = 1 / 20;
    if (event.key === "End") next = 19 / 20;
    if (next !== undefined) { event.preventDefault(); changeRatio(segmentRatioFromPosition(next)); }
  };
  const release = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white p-2 [--ratio-first:#1f4e7b] [--ratio-second:#0f766e] dark:border-sky-500/30 dark:bg-slate-950 dark:[--ratio-first:#7dd3fc] dark:[--ratio-second:#5eead4]">
      <svg viewBox="0 0 720 255" className="min-w-[520px] w-full" role="group" aria-labelledby={titleId}>
        <title id={titleId}>Το Μ χωρίζει το ΑΒ σε λόγο {model.ratio.numerator} προς {model.ratio.denominator}. Μετακίνησε το Μ με το ποντίκι ή τα βέλη.</title>
        <path d={`M ${xA} 78 V 65 H ${xM} V 78`} stroke="var(--ratio-first)" strokeWidth="2" fill="none" />
        <path d={`M ${xM} 78 V 65 H ${xB} V 78`} stroke="var(--ratio-second)" strokeWidth="2" fill="none" />
        <text x={(xA + xM) / 2} y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ratio-first)">ΑΜ</text>
        <text x={(xM + xB) / 2} y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ratio-second)">ΜΒ</text>
        <line x1={xA} x2={xM} y1="120" y2="120" stroke="var(--ratio-first)" strokeWidth="8" strokeLinecap="round" />
        <line x1={xM} x2={xB} y1="120" y2="120" stroke="var(--ratio-second)" strokeWidth="8" strokeLinecap="round" />
        {[xA, xB].map((x) => <line key={x} x1={x} x2={x} y1="108" y2="132" stroke="currentColor" strokeWidth="2.5" />)}
        <g role="slider" tabIndex="0" aria-label="Θέση του Μ" aria-valuemin="5" aria-valuemax="95" aria-valuenow={Math.round(model.position * 10000) / 100} aria-valuetext={`ΑΜ προς ΜΒ ${model.ratio.numerator} προς ${model.ratio.denominator}`} onKeyDown={keyMove} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); move(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }} onPointerUp={release} onPointerCancel={release} className="group cursor-ew-resize touch-none outline-none">
          <circle cx={xM} cy="120" r="24" fill="transparent" />
          <circle cx={xM} cy="120" r="11" strokeWidth="3" className="fill-amber-400 stroke-slate-800 group-focus:stroke-violet-600 dark:stroke-slate-100" />
        </g>
        <text x={xA} y="159" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">Α</text>
        <text x={xM} y="159" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">Μ</text>
        <text x={xB} y="159" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">Β</text>
        <path d={`M ${xA} 187 V 198 H ${xB} V 187`} stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="360" y="231" textAnchor="middle" fontSize="19" fontWeight="700" fill="currentColor">ΑΒ = {plainFraction(model.total)} {model.unit}</text>
      </svg>
    </div>
  );
}

export function SegmentRatioExplorer() {
  const headingId = useId();
  const [total, setTotal] = useState(20);
  const [m, setM] = useState(3);
  const [n, setN] = useState(2);
  const [unit, setUnit] = useState("cm");
  const model = useMemo(() => buildSegmentRatioModel(total, m, n, unit), [total, m, n, unit]);
  const changeRatio = (ratio) => { setM(ratio.m); setN(ratio.n); };
  const apply = (preset) => { setTotal(preset.total); setM(preset.m); setN(preset.n); };
  const reset = () => { apply(PRESETS[0]); setUnit("cm"); };
  const lengthFormula = (label, fraction) => `$${label}=${segmentFractionLatex(fraction)}\\,\\mathrm{${unit}}$`;
  return (
    <section aria-labelledby={headingId} className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 shadow-[0_14px_35px_rgba(31,78,123,0.08)] dark:border-sky-500/30 dark:from-sky-500/10 dark:via-card dark:to-teal-500/10">
      <div className="flex items-start gap-3 border-b border-sky-200/80 p-4 sm:p-5 dark:border-sky-500/25"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f4e7b] text-white"><Sparkles className="h-5 w-5" /></span><div><div className="text-xs font-extrabold uppercase tracking-widest text-sky-800 dark:text-sky-300">Δυναμικό εργαστήριο</div><h3 id={headingId} className="mt-1 text-xl font-black">Χώρισε το τμήμα, διάβασε τον λόγο</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Άλλαξε τα μέρη του λόγου ή μετακίνησε το Μ. Παρατήρησε ποιο μήκος βρίσκεται κάθε φορά στον παρονομαστή.</p></div></div>
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-base font-bold">Παραδείγματα:</span>{PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => apply(preset)} className="rounded-xl border border-border bg-background px-3 py-2 text-base font-bold hover:border-sky-500">{preset.label}</button>)}</div>
        <div className="grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-3"><label className="text-base font-bold"><span>Συνολικό μήκος ΑΒ: {total} cm</span><input aria-label="Συνολικό μήκος ΑΒ σε cm" type="range" min="5" max="60" step="1" value={total} onChange={(event) => setTotal(Number(event.target.value))} className="mt-3 block w-full accent-sky-700" /></label><label className="text-base font-bold"><span>Μέρη για το ΑΜ: {m}</span><input aria-label="Μέρη για το ΑΜ" type="range" min="1" max="19" step="1" value={m} onChange={(event) => setM(Number(event.target.value))} className="mt-3 block w-full accent-sky-700" /></label><label className="text-base font-bold"><span>Μέρη για το ΜΒ: {n}</span><input aria-label="Μέρη για το ΜΒ" type="range" min="1" max="19" step="1" value={n} onChange={(event) => setN(Number(event.target.value))} className="mt-3 block w-full accent-teal-700" /></label></div>
        <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-3 text-base font-bold">Μετρήσεις σε<select aria-label="Μονάδα εμφάνισης μηκών" value={unit} onChange={(event) => setUnit(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2">{Object.entries(SEGMENT_UNITS).map(([id, data]) => <option key={id} value={id}>{data.label} ({id})</option>)}</select></label><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-base font-bold"><RotateCcw className="h-4 w-4" /> Αρχική θέση</button></div>
        <SegmentDrawing model={model} changeRatio={changeRatio} />
        <p className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground"><MoveHorizontal className="mt-1 h-4 w-4 shrink-0" /> Σύρε το πορτοκαλί σημείο Μ ή εστίασέ το με Tab και χρησιμοποίησε τα βέλη. Η μετακίνηση χρησιμοποιεί θέσεις ανά 5% του ΑΒ, με το Μ πάντα στο εσωτερικό του. Το σχήμα προσαρμόζεται στο πλαίσιο· τα μήκη δηλώνονται από τις τιμές.</p>
        <div className="grid gap-3 sm:grid-cols-2" role="status"><div className="rounded-xl border border-sky-300 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10"><MathText className="text-xl font-black" text={lengthFormula("ΑΜ", model.first)} />{model.first.denominator !== 1 && <p className="mt-2 text-base text-muted-foreground">{decimalText(model.first)} {unit}</p>}</div><div className="rounded-xl border border-teal-300 bg-teal-50 p-4 dark:border-teal-500/30 dark:bg-teal-500/10"><MathText className="text-xl font-black" text={lengthFormula("ΜΒ", model.second)} />{model.second.denominator !== 1 && <p className="mt-2 text-base text-muted-foreground">{decimalText(model.second)} {unit}</p>}</div></div>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-base leading-relaxed dark:border-amber-500/30 dark:bg-amber-500/10"><h4 className="text-lg font-black">Ο λόγος δεν είναι το μέρος του όλου</h4><div className="mt-3 grid gap-4 sm:grid-cols-2"><div><div className="mb-2 font-bold">Σύγκριση των δύο μερών</div><MathText text={`$\\frac{ΑΜ}{ΜΒ}=\\frac{${m}}{${n}}=${segmentFractionLatex(model.ratio)}$`} /></div><div><div className="mb-2 font-bold">Πρώτο μέρος προς ολόκληρο</div><MathText text={`$\\frac{ΑΜ}{ΑΒ}=\\frac{${m}}{${m}+${n}}=${segmentFractionLatex(model.firstShare)}$`} /></div></div></div>
        <div className="rounded-xl border border-border bg-background p-4"><h4 className="text-lg font-black">Η μέθοδος των μερών</h4><ol className="mt-3 list-inside list-decimal space-y-3 text-base"><li><MathText text={`Συνολικά μέρη: $${m}+${n}=${model.sum}$.`} /></li><li><MathText text={`Ένα μέρος: $\\frac{${segmentFractionLatex(model.total)}}{${model.sum}}=${segmentFractionLatex(model.onePart)}\\,\\mathrm{${unit}}$.`} /></li><li><MathText text={`$ΑΜ=${m}\\cdot${segmentFractionLatex(model.onePart)}=${segmentFractionLatex(model.first)}\\,\\mathrm{${unit}}$ και $ΜΒ=${n}\\cdot${segmentFractionLatex(model.onePart)}=${segmentFractionLatex(model.second)}\\,\\mathrm{${unit}}$.`} /></li></ol><p className="mt-4 font-bold"><MathText text={`Έλεγχος: $ΑΜ+ΜΒ=ΑΒ=${segmentFractionLatex(model.total)}\\,\\mathrm{${unit}}$.`} /></p></div>
        <div className="flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-base leading-relaxed dark:border-teal-500/30 dark:bg-teal-500/10"><ArrowLeftRight className="mt-1 h-5 w-5 shrink-0 text-teal-700 dark:text-teal-300" /><p><MathText text={`Αν αλλάξεις τη σειρά σύγκρισης, αντιστρέφεται ο λόγος: $\\frac{ΜΒ}{ΑΜ}=${segmentFractionLatex(model.inverseRatio)}$. Η αλλαγή μονάδας ή συνολικού μήκους δεν αλλάζει τον λόγο όταν τα δύο μέρη μεταβάλλονται αναλογικά.`} /></p></div>
      </div>
    </section>
  );
}
