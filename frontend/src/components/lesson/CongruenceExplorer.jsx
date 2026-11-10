import { useId, useMemo, useState } from "react";
import { FlipHorizontal2, Layers, RotateCcw, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";
import { buildCongruenceModel, centroid, CONGRUENCE_MODES, transformTriangle } from "./congruenceModel";

const EDGE_INDICES = [[0, 1], [0, 2], [1, 2]];
const NAMES = [["Α", "Β", "Γ"], ["Δ", "Ε", "Ζ"]];
const formatNumber = (value) => value.toLocaleString("el-GR", { maximumFractionDigits: 2 });
const measurement = (value) => `${Math.abs(value - Math.round(value * 100) / 100) > 1e-8 ? "≈ " : ""}${formatNumber(value)}`;

function SideTicks({ a, b, count, colour }) {
  if (!count) return null;
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / length;
  const uy = (b.y - a.y) / length;
  return Array.from({ length: count }, (_, index) => {
    const shift = (index - (count - 1) / 2) * 7;
    const x = (a.x + b.x) / 2 + ux * shift;
    const y = (a.y + b.y) / 2 + uy * shift;
    return <line key={index} x1={x - uy * 7} y1={y + ux * 7} x2={x + uy * 7} y2={y - ux * 7} stroke={colour} strokeWidth="2.5" />;
  });
}

function AngleArcs({ vertices, index, count, colour }) {
  if (!count) return null;
  const vertex = vertices[index];
  const first = vertices[(index + 1) % 3];
  const second = vertices[(index + 2) % 3];
  const start = Math.atan2(first.y - vertex.y, first.x - vertex.x);
  let delta = Math.atan2(second.y - vertex.y, second.x - vertex.x) - start;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return Array.from({ length: count }, (_, arc) => {
    const radius = 19 + arc * 5;
    const x1 = vertex.x + radius * Math.cos(start);
    const y1 = vertex.y + radius * Math.sin(start);
    const x2 = vertex.x + radius * Math.cos(start + delta);
    const y2 = vertex.y + radius * Math.sin(start + delta);
    return <path key={arc} d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 ${delta > 0 ? 1 : 0} ${x2} ${y2}`} fill="none" stroke={colour} strokeWidth="2" />;
  });
}

function TriangleDrawing({ vertices, model, colour, dashed, marks = true }) {
  return <g><polygon points={vertices.map((p) => `${p.x},${p.y}`).join(" ")} fill={colour} fillOpacity=".08" stroke={colour} strokeWidth="3" strokeDasharray={dashed ? "8 5" : undefined} />{marks && <>{EDGE_INDICES.map(([a, b], index) => <SideTicks key={index} a={vertices[a]} b={vertices[b]} count={model.givenSides[index]} colour={colour} />)}{vertices.map((p, index) => <AngleArcs key={index} vertices={vertices} index={index} count={model.givenAngles[index]} colour={colour} />)}</>}</g>;
}

function VertexLabels({ vertices, names, colour }) {
  const centre = centroid(vertices);
  return vertices.map((point, index) => {
    if (!names[index]) return null;
    const dx = point.x - centre.x;
    const dy = point.y - centre.y;
    const length = Math.hypot(dx, dy);
    return <text key={index} x={point.x + (dx / length) * 23} y={point.y + (dy / length) * 23 + 5} textAnchor="middle" fill={colour} fontSize="17" fontWeight="800">{names[index]}</text>;
  });
}

function TriangleView({ model, rotation, reflected, overlay }) {
  const titleId = useId();
  const secondWorld = overlay ? model.second : transformTriangle(model.second, rotation, reflected);
  let first;
  let second;
  if (overlay) {
    const all = [...model.first, ...secondWorld];
    const xs = all.map((p) => p.x);
    const ys = all.map((p) => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const scale = Math.min(540 / width, 220 / height);
    const project = (points) => points.map((p) => ({ x: 360 + (p.x - cx) * scale, y: 185 - (p.y - cy) * scale }));
    first = project(model.first); second = project(secondWorld);
  } else {
    const radius = Math.max(...[model.first, secondWorld].flatMap((points) => { const c = centroid(points); return points.map((p) => Math.hypot(p.x - c.x, p.y - c.y)); }));
    const scale = 116 / radius;
    const project = (points, x) => { const c = centroid(points); return points.map((p) => ({ x: x + (p.x - c.x) * scale, y: 185 - (p.y - c.y) * scale })); };
    first = project(model.first, 180); second = project(secondWorld, 540);
  }
  const firstNames = [...NAMES[0]];
  const secondNames = [...NAMES[1]];
  if (overlay) first.forEach((point, index) => {
    if (Math.hypot(point.x - second[index].x, point.y - second[index].y) < 1e-6) {
      firstNames[index] = `${NAMES[0][index]} / ${NAMES[1][index]}`;
      secondNames[index] = "";
    }
  });
  return (
    <div className="overflow-x-auto rounded-xl border border-sky-200 bg-white p-2 [--triangle-one:#1f4e7b] [--triangle-two:#0f766e] dark:border-sky-500/30 dark:bg-slate-950 dark:[--triangle-one:#7dd3fc] dark:[--triangle-two:#5eead4]">
      <svg viewBox="0 0 720 355" className="min-w-[560px] w-full" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{overlay ? "Ευθυγράμμιση αντίστοιχων κορυφών και πλευρών" : "Δύο τρίγωνα σε κοινή κλίμακα"}: {model.mode.label}. {model.congruent ? "Τα τρίγωνα είναι ίσα." : "Τα τρίγωνα δεν είναι ίσα."}</title>
        <rect x="10" y="45" width={overlay ? 700 : 340} height="275" rx="14" fill="currentColor" fillOpacity=".025" />
        {!overlay && <rect x="370" y="45" width="340" height="275" rx="14" fill="currentColor" fillOpacity=".025" />}
        <text x="24" y="29" fill="var(--triangle-one)" fontSize="17" fontWeight="800">{overlay ? "Σύγκριση με κοινή αρχή και κατεύθυνση" : "Τρίγωνο ΑΒΓ"}</text>
        {!overlay && <text x="384" y="29" fill="var(--triangle-two)" fontSize="17" fontWeight="800">Τρίγωνο ΔΕΖ</text>}
        <TriangleDrawing vertices={first} model={model} colour="var(--triangle-one)" />
        <TriangleDrawing vertices={second} model={model} colour="var(--triangle-two)" dashed={overlay} marks={!overlay || !model.congruent} />
        <VertexLabels vertices={first} names={firstNames} colour="var(--triangle-one)" />
        <VertexLabels vertices={second} names={secondNames} colour="var(--triangle-two)" />
        <text x="360" y="345" textAnchor="middle" fill="currentColor" fontSize="14">Ίδιες χαραγές ή ίδια τόξα δηλώνουν τα δεδομένα ίσα στοιχεία.</text>
      </svg>
    </div>
  );
}

export function CongruenceExplorer() {
  const titleId = useId();
  const [modeId, setModeId] = useState("sss");
  const [value, setValue] = useState(4);
  const [rotation, setRotation] = useState(125);
  const [reflected, setReflected] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const model = useMemo(() => buildCongruenceModel(modeId, value), [modeId, value]);
  const selectMode = (mode) => { setModeId(mode.id); setValue(mode.initial); setOverlay(false); };
  const reset = () => { setModeId("sss"); setValue(4); setRotation(125); setReflected(false); setOverlay(false); };
  return (
    <section aria-labelledby={titleId} className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 shadow-[0_14px_35px_rgba(31,78,123,0.08)] dark:border-sky-500/30 dark:from-sky-500/10 dark:via-card dark:to-teal-500/10">
      <div className="flex items-start gap-3 border-b border-sky-200/80 p-4 sm:p-5 dark:border-sky-500/25"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f4e7b] text-white"><Sparkles className="h-5 w-5" /></span><div><div className="text-xs font-extrabold uppercase tracking-widest text-sky-800 dark:text-sky-300">Δυναμικό εργαστήριο</div><h3 id={titleId} className="mt-1 text-xl font-black">Ποια δεδομένα εξασφαλίζουν ισότητα;</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Επίλεξε κριτήριο, άλλαξε τα δεδομένα και έλεγξε τη σύμπτωση. Σύγκρινε με δύο περιπτώσεις όπου τα δεδομένα δεν αρκούν.</p></div></div>
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" aria-label="Επιλογή κριτηρίου ή αντιπαραδείγματος">{CONGRUENCE_MODES.map((mode) => <button key={mode.id} type="button" aria-pressed={modeId === mode.id} onClick={() => selectMode(mode)} className={`rounded-xl border px-4 py-2.5 text-base font-extrabold ${modeId === mode.id ? "border-[#1f4e7b] bg-[#1f4e7b] text-white" : "border-border bg-background hover:border-sky-500"}`}>{mode.label}</button>)}</div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-sky-200 bg-background p-4 dark:border-sky-500/30"><h4 className="text-base font-black">Δεδομένα ίσα στοιχεία</h4><ul className="mt-3 space-y-2 text-lg">{model.data.map((item) => <li key={item}><MathText text={item} /></li>)}</ul>{model.mode.min !== undefined && <label className="mt-5 block text-base font-bold"><span>{model.mode.parameter}: {formatNumber(value)}{model.mode.unit}</span><input aria-label={model.mode.parameter} type="range" min={model.mode.min} max={model.mode.max} step={model.mode.step} value={value} onChange={(event) => setValue(Number(event.target.value))} className="mt-3 block w-full accent-sky-700" /></label>}</div>
          <div className={`rounded-xl border p-4 ${model.sufficient ? "border-teal-300 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10" : "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"}`} role="status"><h4 className="text-lg font-black">{model.sufficient ? `Ίσα τρίγωνα με ${model.mode.label}` : "Τα δεδομένα δεν αρκούν γενικά"}</h4><p className="mt-3 text-base leading-relaxed">{model.explanation}</p><p className="mt-3 text-base font-bold">Αντιστοίχιση: Α ↔ Δ, Β ↔ Ε, Γ ↔ Ζ.</p>{modeId === "ssa" && <p className="mt-3 text-base">Εδώ ΒΓ ≈ {formatNumber(model.firstMeasures.sides[2])}, ενώ ΕΖ ≈ {formatNumber(model.secondMeasures.sides[2])}.</p>}</div>
        </div>
        <TriangleView model={model} rotation={rotation} reflected={reflected} overlay={overlay} />
        <div className="flex flex-wrap gap-2"><button type="button" aria-pressed={overlay} onClick={() => setOverlay((current) => !current)} className="inline-flex items-center gap-2 rounded-xl bg-[#173f68] px-4 py-2.5 text-base font-bold text-white"><Layers className="h-4 w-4" /> {overlay ? "Χώρισε τα τρίγωνα" : "Έλεγξε τη σύμπτωση"}</button><button type="button" aria-pressed={reflected} disabled={overlay} onClick={() => setReflected((current) => !current)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-base font-bold disabled:opacity-40"><FlipHorizontal2 className="h-4 w-4" /> Ανάκλαση δεύτερου</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-base font-bold"><RotateCcw className="h-4 w-4" /> Αρχική θέση</button></div>
        {!overlay ? <label className="block rounded-xl border border-border bg-background p-4 text-base font-bold"><span>Περιστροφή δεύτερου τριγώνου: {rotation}°</span><input aria-label="Περιστροφή δεύτερου τριγώνου" type="range" min="0" max="180" step="5" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="mt-3 block w-full accent-teal-700" /></label> : <p className="text-base leading-relaxed text-muted-foreground">Για τη σύγκριση τοποθετούμε τις Α και Δ στο ίδιο σημείο και τις ΑΒ, ΔΕ στην ίδια κατεύθυνση. Οι περιστροφές και η ανάκλαση αναιρούνται. Η σύμπτωση ελέγχει την κατασκευή· η απόδειξη βασίζεται στα δεδομένα και στο κριτήριο.</p>}
        <div className="overflow-x-auto rounded-xl border border-border bg-background"><table className="w-full text-left text-base"><caption className="p-3 text-left font-bold">Έλεγχος αντίστοιχων πλευρών σε κοινή μονάδα</caption><thead className="bg-secondary"><tr><th scope="col" className="px-3 py-2">Αντιστοιχία</th><th scope="col" className="px-3 py-2">ΑΒΓ</th><th scope="col" className="px-3 py-2">ΔΕΖ</th><th scope="col" className="px-3 py-2">Δίνεται;</th></tr></thead><tbody>{["ΑΒ ↔ ΔΕ", "ΑΓ ↔ ΔΖ", "ΒΓ ↔ ΕΖ"].map((pair, index) => <tr key={pair} className="border-t border-border"><th scope="row" className="px-3 py-2 font-bold">{pair}</th><td className="px-3 py-2">{measurement(model.firstMeasures.sides[index])}</td><td className="px-3 py-2">{measurement(model.secondMeasures.sides[index])}</td><td className="px-3 py-2">{model.givenSides[index] ? "Ναι" : "Όχι"}</td></tr>)}</tbody></table></div>
        <p className="text-base leading-relaxed text-muted-foreground">Η κλίμακα σχεδίασης είναι κοινή για τα δύο τρίγωνα. Οι υπολογισμένες μη ακέραιες μετρήσεις μπορεί να εμφανίζονται κατά προσέγγιση. Μια εικόνα ή μια μέτρηση από μόνη της δεν αποτελεί απόδειξη.</p>
      </div>
    </section>
  );
}
