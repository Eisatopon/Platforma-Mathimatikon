import { useId, useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";
import { LAW_CASES, solveSAS, solveAAS, solveSSS, solveSSA } from "./triangleLawsModel";

const fmt = value => (Math.abs(value) < 1e-9 ? 0 : value).toLocaleString("el-GR", { maximumFractionDigits: 3 });
const tex = value => fmt(value).replace(/,/g, "{,}").replace(/\./g, "");
const labels = ["Α", "Β", "Γ"];
const sides = ["α", "β", "γ"];
const colours = ["var(--law-a)", "var(--law-b)", "var(--law-c)"];
const SSA_CASES = [
  { label: "Δύο τρίγωνα", A: 30, a: 7, b: 10 },
  { label: "Κανένα τρίγωνο", A: 30, a: 4, b: 10 },
  { label: "Μία ορθή Β", A: 30, a: 5, b: 10 },
  { label: "Ένα τρίγωνο", A: 30, a: 10, b: 10 },
];

function TriangleDrawing({ model, selected, index }) {
  const titleId = useId();
  const xs = model.points.map(p => p.x), ys = model.points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys);
  const scale = Math.min(420 / (maxX - minX), 215 / maxY);
  const points = model.points.map(p => ({ x: 300 + (p.x - (minX + maxX) / 2) * scale, y: 275 - p.y * scale }));
  const centre = { x: points.reduce((s, p) => s + p.x, 0) / 3, y: points.reduce((s, p) => s + p.y, 0) / 3 };
  return <svg viewBox="0 0 600 340" className="w-full min-w-[330px]" role="img" aria-labelledby={titleId}>
    <title id={titleId}>{`Τρίγωνο ${index + 1}: α περίπου ${fmt(model.a)}, β περίπου ${fmt(model.b)}, γ περίπου ${fmt(model.c)} cm. Η πλευρά ${sides[selected]} βρίσκεται απέναντι από τη γωνία ${labels[selected]}.`}</title>
    <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="var(--law-c)" fillOpacity=".07"/>
    {[0, 1, 2].map(i => {
      const j = (i + 1) % 3, k = (i + 2) % 3;
      const p = points[j], q = points[k], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      const dx = mx - centre.x, dy = my - centre.y, distance = Math.hypot(dx, dy) || 1;
      return <g key={i}>
        <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colours[i]} strokeWidth={i === selected ? 6 : 2.5}/>
        <text x={mx + 20 * dx / distance} y={my + 20 * dy / distance + 6} textAnchor="middle" fill={colours[i]} fontSize="20" fontWeight="800">{sides[i]}</text>
        <circle cx={points[i].x} cy={points[i].y} r={i === selected ? 7 : 4} fill={colours[i]}/>
        <text x={points[i].x + (points[i].x < centre.x ? -20 : 20)} y={points[i].y + (points[i].y < centre.y ? -17 : 27)} textAnchor="middle" fontSize="21" fontWeight="800" fill={colours[i]}>{labels[i]}</text>
      </g>;
    })}
    <text x="300" y="330" textAnchor="middle" fontSize="16" fill="currentColor">{labels[selected]} ↔ {sides[selected]} · γωνία και απέναντι πλευρά</text>
  </svg>;
}

function Slider({ label, value, min, max, onChange, unit = "" }) {
  return <label className="block text-base font-bold">{label}: {value}{unit}
    <input aria-label={label} aria-valuetext={`${value}${unit}`} type="range" min={min} max={max} step="1" value={value} onChange={e => onChange(Number(e.target.value))} className="mt-3 block w-full accent-sky-800 dark:accent-sky-300"/>
  </label>;
}

export function TriangleLawsExplorer() {
  const headingId = useId();
  const [mode, setMode] = useState("sas"), [a, setA] = useState(7), [b, setB] = useState(6), [c, setC] = useState(8);
  const [A, setAngleA] = useState(60), [B, setAngleB] = useState(45), [selected, setSelected] = useState(0), [ssaIndex, setSsaIndex] = useState(0);
  const result = useMemo(() => mode === "sas" ? solveSAS(b, c, A) : mode === "sss" ? solveSSS(a, b, c) : mode === "aas" ? solveAAS(A, B, a) : solveSSA(SSA_CASES[ssaIndex].A, SSA_CASES[ssaIndex].a, SSA_CASES[ssaIndex].b), [mode, a, b, c, A, B, ssaIndex]);
  const choice = LAW_CASES.find(v => v.id === mode), first = result.triangles[0];
  const chooseMode = value => {
    setMode(value); setSelected(0);
    if (value === "aas") { setAngleA(30); setAngleB(45); setA(10); }
    if (value === "sss") { setA(8); setB(5); setC(5); }
    if (value === "sas") { setB(6); setC(8); setAngleA(60); }
    if (value === "ssa") setSsaIndex(0);
  };
  const reset = () => { chooseMode("sas"); setA(7); setAngleB(45); };
  const status = !result.valid ? "Δεν υπάρχει τρίγωνο" : result.triangles.length === 2 ? "Δύο διαφορετικά τρίγωνα με τα ίδια δεδομένα" : "Ένα τρίγωνο καθορίζεται από τα δεδομένα";
  const description = !result.valid ? result.reason : mode === "ssa" ? "Η τιμή του ημιτόνου δεν καθορίζει μόνη της τη γωνία. Εξετάζουμε τη Β και την παραπληρωματική της και κρατάμε μόνο όσες αφήνουν θετική Γ." : mode === "sas" ? "Οι β και γ σχηματίζουν τη γωνία Α. Η απέναντι πλευρά είναι η α. Άλλαξε την Α και σύγκρινε το α² με το β²+γ²." : mode === "sss" ? "Ελέγχουμε πρώτα την ανισότητα τριγώνου. Έπειτα ο νόμος συνημιτόνων δίνει το συνημίτονο της απέναντι γωνίας." : "Βρίσκουμε πρώτα Γ=180°−Α−Β. Το γνωστό ζεύγος α και Α επιτρέπει να υπολογίσουμε β και γ με τον νόμο ημιτόνων.";
  return <section aria-labelledby={headingId} className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:border-sky-500/30 dark:from-sky-500/10 dark:via-card dark:to-teal-500/10 [--law-a:#b45309] [--law-b:#0f766e] [--law-c:#1f4e7b] dark:[--law-a:#fbbf24] dark:[--law-b:#5eead4] dark:[--law-c:#7dd3fc]">
    <div className="flex items-start gap-3 border-b border-sky-200 p-4 sm:p-5 dark:border-sky-500/25"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f4e7b] text-white"><Sparkles className="h-5 w-5"/></span><div><div className="text-xs font-extrabold uppercase tracking-widest text-sky-800 dark:text-sky-300">Δυναμικό εργαστήριο</div><h3 id={headingId} className="mt-1 text-xl font-black">Ποια δεδομένα έχω; Ποιον νόμο επιλέγω;</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Επίλεξε τα γνωστά στοιχεία. Σύνδεσε κάθε γωνία με την απέναντι πλευρά και έλεγξε αν τα δεδομένα δίνουν ένα, δύο ή κανένα τρίγωνο.</p></div></div>
    <div className="space-y-5 p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">{LAW_CASES.map(v => <button key={v.id} type="button" aria-pressed={mode === v.id} onClick={() => chooseMode(v.id)} className={`rounded-xl border px-3 py-2.5 text-base font-bold ${mode === v.id ? "border-sky-800 bg-sky-800 text-white" : "border-border bg-background"}`}>{v.label}</button>)}</div>
      <div className="space-y-4 rounded-xl border border-border bg-background p-4">
        <p className="text-lg font-black">{choice.law}</p>
        {mode === "sas" && <><div className="grid gap-5 sm:grid-cols-2"><Slider label="Γνωστή πλευρά β" min={2} max={12} value={b} onChange={setB} unit=" cm"/><Slider label="Γνωστή πλευρά γ" min={2} max={12} value={c} onChange={setC} unit=" cm"/></div><Slider label="Περιεχόμενη γωνία Α" min={15} max={165} value={A} onChange={setAngleA} unit="°"/><div className="flex flex-wrap gap-2">{[60, 90, 120].map(v => <button key={v} type="button" aria-pressed={A === v} onClick={() => setAngleA(v)} className="rounded-lg border border-border px-3 py-2 text-base font-bold">Α={v}°</button>)}</div></>}
        {mode === "aas" && <div className="grid gap-5 sm:grid-cols-3"><Slider label="Γνωστή γωνία Α" min={15} max={150} value={A} onChange={setAngleA} unit="°"/><Slider label="Γνωστή γωνία Β" min={15} max={150} value={B} onChange={setAngleB} unit="°"/><Slider label="Απέναντι πλευρά α" min={2} max={15} value={a} onChange={setA} unit=" cm"/></div>}
        {mode === "sss" && <><div className="grid gap-5 sm:grid-cols-3"><Slider label="Πλευρά α" min={1} max={15} value={a} onChange={setA} unit=" cm"/><Slider label="Πλευρά β" min={1} max={15} value={b} onChange={setB} unit=" cm"/><Slider label="Πλευρά γ" min={1} max={15} value={c} onChange={setC} unit=" cm"/></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setA(5); setB(3); setC(4); }} className="rounded-lg border border-border px-3 py-2 text-base font-bold">3–4–5</button><button type="button" onClick={() => { setA(8); setB(5); setC(5); }} className="rounded-lg border border-border px-3 py-2 text-base font-bold">5–5–8</button><button type="button" onClick={() => { setA(5); setB(2); setC(3); }} className="rounded-lg border border-border px-3 py-2 text-base font-bold">2–3–5: γίνεται;</button></div></>}
        {mode === "ssa" && <><p className="text-base leading-relaxed">Προέκταση: είναι γνωστά η Α και οι πλευρές α, β. Η Α είναι απέναντι από την α και δεν περιέχεται ανάμεσα στις α, β.</p><div className="flex flex-wrap gap-2">{SSA_CASES.map((v, i) => <button key={v.label} type="button" aria-pressed={ssaIndex === i} onClick={() => setSsaIndex(i)} className={`rounded-xl border px-3 py-2 text-base font-bold ${ssaIndex === i ? "border-teal-700 bg-teal-100 dark:bg-teal-500/20" : "border-border"}`}>{v.label}</button>)}</div><p className="text-base font-bold">Α={SSA_CASES[ssaIndex].A}°, α={SSA_CASES[ssaIndex].a} cm, β={SSA_CASES[ssaIndex].b} cm</p><MathText className="block overflow-x-auto text-lg" text={`$\\sin B=\\frac{\\beta\\sin A}{\\alpha}=\\frac{${SSA_CASES[ssaIndex].b}\\cdot\\frac12}{${SSA_CASES[ssaIndex].a}}\\approx${tex(result.sineB)}$`}/></>}
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-base font-bold"><RotateCcw className="h-4 w-4"/>Αρχική περίπτωση</button>
      </div>
      <div role="status" className="rounded-xl border border-teal-300 bg-teal-50 p-4 text-base leading-relaxed dark:border-teal-500/30 dark:bg-teal-500/10"><h4 className="text-lg font-black">{status}</h4><p className="mt-2">{description}</p></div>
      {result.valid && <>
        <div className="flex flex-wrap items-center gap-2"><span className="text-base font-bold">Τόνισε το απέναντι ζεύγος:</span>{labels.map((v, i) => <button key={v} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)} className="rounded-xl border border-border bg-background px-3 py-2 text-base font-bold" style={{ color: colours[i] }}>{v} ↔ {sides[i]}</button>)}</div>
        <div className={result.triangles.length === 2 ? "grid gap-4 xl:grid-cols-2" : ""}>{result.triangles.map((t, i) => <div key={i} className="overflow-x-auto rounded-xl border border-border bg-background p-3"><h4 className="text-lg font-bold">{result.triangles.length === 2 ? `Τρίγωνο ${i + 1}` : "Το τρίγωνο των δεδομένων"}</h4><TriangleDrawing model={t} selected={selected} index={i}/><p className="text-base leading-relaxed">Α≈{fmt(t.A)}°, Β≈{fmt(t.B)}°, Γ≈{fmt(t.C)}°<br/>α≈{fmt(t.a)} cm, β≈{fmt(t.b)} cm, γ≈{fmt(t.c)} cm</p></div>)}</div>
        <p className="text-base text-muted-foreground">Τα σχήματα διατηρούν τις αναλογίες των πλευρών. Κάθε σχήμα προσαρμόζεται χωριστά στον χώρο του. Οι αριθμητικές ενδείξεις στρογγυλοποιούνται σε έως τρία δεκαδικά ψηφία.</p>
        <div className="space-y-3 rounded-xl border border-border bg-background p-4">
          {mode === "sas" && <><MathText className="block overflow-x-auto text-lg" text={`$\\alpha^2=${b}^2+${c}^2-2\\cdot${b}\\cdot${c}\\cos ${A}^\\circ$`}/><MathText className="block overflow-x-auto text-lg" text={`$\\alpha^2\\approx${tex(first.a ** 2)},\\quad\\alpha\\approx${tex(first.a)}\\;\\text{cm}$`}/><p className="text-base leading-relaxed">{A === 90 ? "Α=90°: συνΑ=0, άρα α²=β²+γ². Επιστρέφουμε στο Πυθαγόρειο." : A < 90 ? "Α οξεία: συνΑ>0, άρα αφαιρούμε θετικό όρο και α²<β²+γ²." : "Α αμβλεία: συνΑ<0, άρα η αφαίρεση αρνητικού όρου δίνει α²>β²+γ²."}</p></>}
          {mode === "sss" && <><MathText className="block overflow-x-auto text-lg" text={`$\\cos A=\\frac{\\beta^2+\\gamma^2-\\alpha^2}{2\\beta\\gamma}=\\frac{${b}^2+${c}^2-${a}^2}{2\\cdot${b}\\cdot${c}}\\approx${tex(first.cosineA)}$`}/><p className="text-base leading-relaxed">{Math.abs(first.cosineA) < 1e-9 ? "συνΑ=0: η Α είναι ορθή." : first.cosineA > 0 ? "συνΑ>0: η Α είναι οξεία." : "συνΑ<0: η Α είναι αμβλεία."} Η κατάταξη προκύπτει από το πρόσημο πριν από οποιαδήποτε στρογγυλοποίηση.</p></>}
          {mode === "aas" && <><MathText className="block overflow-x-auto text-lg" text={`$\\Gamma=180^\\circ-${A}^\\circ-${B}^\\circ=${180 - A - B}^\\circ$`}/><MathText className="block overflow-x-auto text-lg" text={`$\\beta=\\frac{${a}\\sin ${B}^\\circ}{\\sin ${A}^\\circ}\\approx${tex(first.b)}\\;\\text{cm}$`}/><MathText className="block overflow-x-auto text-lg" text={`$\\gamma=\\frac{${a}\\sin ${180 - A - B}^\\circ}{\\sin ${A}^\\circ}\\approx${tex(first.c)}\\;\\text{cm}$`}/></>}
          <MathText className="block overflow-x-auto text-lg" text={"$\\frac{\\alpha}{\\sin A}=\\frac{\\beta}{\\sin B}=\\frac{\\gamma}{\\sin\\Gamma}$"}/>
          <p className="text-base leading-relaxed">Αριθμητικός έλεγχος του νόμου ημιτόνων, με χωριστό υπολογισμό των τριών λόγων:</p>
          {result.triangles.map((t, i) => <p key={i} className="text-base font-bold">{result.triangles.length === 2 ? `Τρίγωνο ${i + 1}: ` : ""}α/ημΑ≈{fmt(t.ratios[0])}, β/ημΒ≈{fmt(t.ratios[1])}, γ/ημΓ≈{fmt(t.ratios[2])} cm</p>)}
        </div>
      </>}
    </div>
  </section>;
}
