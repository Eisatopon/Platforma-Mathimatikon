import { useId, useMemo, useState } from "react";
import { LockKeyhole, MoveHorizontal, RotateCcw, Sparkles, UnlockKeyhole } from "lucide-react";
import { MathText } from "@/components/MathText";
import { segmentFractionLatex } from "./segmentRatioModel";
import { buildThalesModel, thalesTenthsFromPosition } from "./thalesModel";

function ParallelMark({ from, to }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  const x = (from.x + to.x) / 2;
  const y = (from.y + to.y) / 2;
  return <polyline points={`${x - ux * 7 - uy * 5},${y - uy * 7 + ux * 5} ${x + ux * 2},${y + uy * 2} ${x - ux * 7 + uy * 5},${y - uy * 7 - ux * 5}`} fill="none" stroke="var(--thales-parallel)" strokeWidth="3" strokeLinejoin="round" />;
}

function ThalesDrawing({ model, changeLeft, changeRight }) {
  const titleId = useId();
  const xMin = model.B.x;
  const xMax = model.C.x;
  const scale = Math.min(520 / (xMax - xMin), 290 / Math.max(model.B.y, model.C.y));
  const centre = (xMin + xMax) / 2;
  const project = (point) => ({ x: 360 + (point.x - centre) * scale, y: 55 + point.y * scale });
  const A = project(model.A); const B = project(model.B); const C = project(model.C);
  const D = project(model.D); const E = project(model.E);
  const handle = (name, position, end, tenths, change) => {
    const move = (event) => {
      const svg = event.currentTarget.ownerSVGElement;
      const matrix = svg?.getScreenCTM();
      if (!matrix) return;
      const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
      const p = point.matrixTransform(matrix.inverse());
      const dx = end.x - A.x; const dy = end.y - A.y;
      change(thalesTenthsFromPosition(((p.x - A.x) * dx + (p.y - A.y) * dy) / (dx * dx + dy * dy)));
    };
    const keyMove = (event) => {
      let next;
      if (["ArrowLeft", "ArrowDown"].includes(event.key)) next = tenths - 1;
      if (["ArrowRight", "ArrowUp"].includes(event.key)) next = tenths + 1;
      if (event.key === "Home") next = 1;
      if (event.key === "End") next = 9;
      if (next !== undefined) { event.preventDefault(); change(Math.max(1, Math.min(9, next))); }
    };
    const release = (event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); };
    return <g role="slider" tabIndex="0" aria-label={`Θέση του ${name}`} aria-valuemin="10" aria-valuemax="90" aria-valuenow={tenths * 10} aria-valuetext={`${tenths * 10}% της πλευράς από την Α`} onKeyDown={keyMove} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); move(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }} onPointerUp={release} onPointerCancel={release} className="group cursor-move touch-none outline-none"><circle cx={position.x} cy={position.y} r="22" fill="transparent" /><circle cx={position.x} cy={position.y} r="9" strokeWidth="2.5" className="fill-amber-400 stroke-slate-800 group-focus:stroke-violet-600 dark:stroke-slate-100" /></g>;
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white p-2 [--thales-left:#1f4e7b] [--thales-right:#0f766e] [--thales-parallel:#b45309] [--thales-free:#be123c] dark:border-sky-500/30 dark:bg-slate-950 dark:[--thales-left:#7dd3fc] dark:[--thales-right:#5eead4] dark:[--thales-parallel:#fbbf24] dark:[--thales-free:#fda4af]">
      <svg viewBox="0 0 720 410" className="min-w-[510px] w-full" role="group" aria-labelledby={titleId}>
        <title id={titleId}>Τρίγωνο ΑΒΓ με Δ στην ΑΒ και Ε στην ΑΓ. {model.parallel ? "Η ΔΕ είναι παράλληλη στη ΒΓ." : "Η ΔΕ δεν είναι παράλληλη στη ΒΓ."}</title>
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="currentColor" fillOpacity=".025" />
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--thales-left)" strokeWidth="4" />
        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="var(--thales-right)" strokeWidth="4" />
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="currentColor" strokeWidth="2.5" />
        <line x1={D.x} y1={D.y} x2={E.x} y2={E.y} stroke={model.parallel ? "var(--thales-parallel)" : "var(--thales-free)"} strokeWidth="3.5" strokeDasharray={model.parallel ? undefined : "8 5"} />
        {model.parallel && <><ParallelMark from={B} to={C} /><ParallelMark from={D} to={E} /></>}
        {[A, B, C].map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill="currentColor" />)}
        {handle("Δ", D, B, model.leftTenths, changeLeft)}
        {handle("Ε", E, C, model.rightTenths, changeRight)}
        <text x={A.x} y={A.y - 21} textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">Α</text>
        <text x={B.x - 19} y={B.y + 23} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--thales-left)">Β</text>
        <text x={C.x + 19} y={C.y + 23} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--thales-right)">Γ</text>
        <text x={D.x - 23} y={D.y + 5} textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--thales-left)">Δ</text>
        <text x={E.x + 23} y={E.y + 5} textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--thales-right)">Ε</text>
        <text x="360" y="399" textAnchor="middle" fontSize="16" fill="currentColor">ΑΒ = {model.ab} cm · ΑΓ = {model.ac} cm</text>
      </svg>
    </div>
  );
}

export function ThalesExplorer() {
  const headingId = useId();
  const [left, setLeft] = useState(4);
  const [right, setRight] = useState(7);
  const [ab, setAb] = useState(10);
  const [ac, setAc] = useState(15);
  const [locked, setLocked] = useState(true);
  const actualRight = locked ? left : right;
  const model = useMemo(() => buildThalesModel(left, actualRight, ab, ac), [left, actualRight, ab, ac]);
  const freeRight = () => { setRight(left === 7 ? 3 : 7); setLocked(false); };
  const changeRight = (value) => { if (locked) setLeft(value); else setRight(value); };
  const reset = () => { setLeft(4); setRight(7); setAb(10); setAc(15); setLocked(true); };
  const comparison = model.parallel ? "=" : "\\ne";
  const ratioLine = (leftLabels, rightLabels, first, second) => `$\\frac{${leftLabels[0]}}{${leftLabels[1]}}=${segmentFractionLatex(first)}\\quad${comparison}\\quad${segmentFractionLatex(second)}=\\frac{${rightLabels[0]}}{${rightLabels[1]}}$`;
  return (
    <section aria-labelledby={headingId} className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 shadow-[0_14px_35px_rgba(31,78,123,0.08)] dark:border-sky-500/30 dark:from-sky-500/10 dark:via-card dark:to-teal-500/10">
      <div className="flex items-start gap-3 border-b border-sky-200/80 p-4 sm:p-5 dark:border-sky-500/25"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f4e7b] text-white"><Sparkles className="h-5 w-5" /></span><div><div className="text-xs font-extrabold uppercase tracking-widest text-sky-800 dark:text-sky-300">Δυναμικό εργαστήριο</div><h3 id={headingId} className="mt-1 text-xl font-black">Κράτησε την παραλληλία, έλεγξε τους λόγους</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Σύνδεσε την υπόθεση ΔΕ ∥ ΒΓ με τις αναλογίες. Έπειτα ελευθέρωσε το Ε και αναζήτησε πότε οι λόγοι ξαναγίνονται ίσοι.</p></div></div>
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2"><button type="button" aria-pressed={locked} onClick={() => setLocked(true)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-bold ${locked ? "border-[#1f4e7b] bg-[#1f4e7b] text-white" : "border-border bg-background"}`}><LockKeyhole className="h-4 w-4" /> Κλείδωσε ΔΕ ∥ ΒΓ</button><button type="button" aria-pressed={!locked} onClick={freeRight} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-bold ${!locked ? "border-rose-700 bg-rose-700 text-white" : "border-border bg-background"}`}><UnlockKeyhole className="h-4 w-4" /> Ελεύθερο Ε στην ΑΓ</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-base font-bold"><RotateCcw className="h-4 w-4" /> Αρχική θέση</button></div>
        <div className="grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"><label className="text-base font-bold"><span>Θέση Δ από την Α: {left * 10}% της ΑΒ</span><input aria-label="Ποσοστό ΑΔ προς ΑΒ" type="range" min="1" max="9" step="1" value={left} onChange={(event) => setLeft(Number(event.target.value))} className="mt-3 block w-full accent-sky-700" /></label><label className="text-base font-bold"><span>Θέση Ε από την Α: {actualRight * 10}% της ΑΓ</span><input aria-label="Ποσοστό ΑΕ προς ΑΓ" type="range" min="1" max="9" step="1" value={actualRight} disabled={locked} onChange={(event) => setRight(Number(event.target.value))} className="mt-3 block w-full accent-teal-700 disabled:opacity-40" /></label><label className="text-base font-bold"><span>Μήκος ΑΒ: {ab} cm</span><input aria-label="Μήκος ΑΒ σε cm" type="range" min="6" max="20" step="1" value={ab} onChange={(event) => setAb(Number(event.target.value))} className="mt-3 block w-full accent-sky-700" /></label><label className="text-base font-bold"><span>Μήκος ΑΓ: {ac} cm</span><input aria-label="Μήκος ΑΓ σε cm" type="range" min="6" max="24" step="1" value={ac} onChange={(event) => setAc(Number(event.target.value))} className="mt-3 block w-full accent-teal-700" /></label></div>
        <ThalesDrawing model={model} changeLeft={setLeft} changeRight={changeRight} />
        <p className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground"><MoveHorizontal className="mt-1 h-4 w-4 shrink-0" /> Σύρε τα Δ και Ε ή εστίασέ τα με Tab και χρησιμοποίησε τα βέλη. Με κλειδωμένη παραλληλία μετακινούνται μαζί. Οι θέσεις αλλάζουν ανά 10% της αντίστοιχης πλευράς και παραμένουν εσωτερικές.</p>
        <div className={`rounded-xl border p-4 ${model.parallel ? "border-teal-300 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10" : "border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"}`} role="status"><h4 className="text-lg font-black">{model.parallel ? "ΔΕ ∥ ΒΓ — Οι αναλογίες ισχύουν" : "Η ΔΕ δεν είναι παράλληλη στη ΒΓ"}</h4><p className="mt-2 text-base leading-relaxed">{model.parallel ? locked ? "Η παράλληλη χωρίζει τις δύο πλευρές σε αντίστοιχα τμήματα με ίσους λόγους." : "Βρήκες ίσους λόγους και χωρίς κλείδωμα. Εφόσον τα Δ και Ε είναι εσωτερικά στις αντίστοιχες πλευρές, το αντίστροφο του Θαλή δίνει παραλληλία." : "Η προϋπόθεση της παραλληλίας δεν ισχύει. Οι αντίστοιχοι λόγοι είναι διαφορετικοί, οπότε δεν εφαρμόζουμε το θεώρημα σαν να υπήρχε παράλληλη."}</p></div>
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-4">{[["ΑΔ", model.lengths.AD], ["ΔΒ", model.lengths.DB], ["ΑΕ", model.lengths.AE], ["ΕΓ", model.lengths.EC]].map(([label, fraction]) => <div key={label} className="text-center text-lg font-extrabold"><MathText text={`$${label}=${segmentFractionLatex(fraction)}\\,\\mathrm{cm}$`} /></div>)}</div>
        <div className="space-y-4 rounded-xl border border-sky-200 bg-background p-4 dark:border-sky-500/30"><h4 className="text-lg font-black">Διάβασε την ίδια αντιστοιχία με τρεις τρόπους</h4>{[
          ["Μέρος προς υπόλοιπο της ίδιας πλευράς", ratioLine(["ΑΔ", "ΔΒ"], ["ΑΕ", "ΕΓ"], model.ratios.leftParts, model.ratios.rightParts)],
          ["Μέρος προς ολόκληρη πλευρά", ratioLine(["ΑΔ", "ΑΒ"], ["ΑΕ", "ΑΓ"], model.ratios.leftWhole, model.ratios.rightWhole)],
          ["Αντίστοιχα τμήματα των δύο πλευρών", ratioLine(["ΑΔ", "ΑΕ"], ["ΔΒ", "ΕΓ"], model.ratios.nearAcross, model.ratios.farAcross)],
        ].map(([label, formula]) => <div key={label}><p className="mb-2 text-base font-bold text-muted-foreground">{label}</p><div className="overflow-x-auto py-1 text-lg"><MathText className="whitespace-nowrap" text={formula} /></div></div>)}</div>
        <p className="text-base leading-relaxed text-muted-foreground">Η αλλαγή των μηκών ΑΒ και ΑΓ αλλάζει το τρίγωνο, όχι το θεώρημα. Το σχήμα προσαρμόζεται στο πλαίσιο. Τα ίσα βελάκια δηλώνουν παραλληλία μόνο όταν αυτή ισχύει· οι αριθμητικοί υπολογισμοί διατηρούν ακριβείς κλασματικές τιμές.</p>
      </div>
    </section>
  );
}
