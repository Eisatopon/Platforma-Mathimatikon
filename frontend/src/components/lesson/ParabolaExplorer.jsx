import { useId, useMemo, useState } from "react";
import { MoveHorizontal, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";

const A_VALUES = [
  -3, -2.5, -2, -1.5, -1, -0.75, -0.5, -0.25,
  0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3,
];

const PRESETS = [-2, -1, -0.5, 0.5, 1, 2];
const TABLE_X_VALUES = [-2, -1, 0, 1, 2];
const VIEW = { width: 640, height: 410, xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

const xToSvg = (x) => ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * VIEW.width;
const yToSvg = (y) => VIEW.height - ((y - VIEW.yMin) / (VIEW.yMax - VIEW.yMin)) * VIEW.height;
const formatNumber = (value) => Number.isInteger(value) ? String(value) : String(value).replace(".", ",");

function curvePath(a) {
  const points = [];
  for (let x = VIEW.xMin; x <= VIEW.xMax + 0.001; x += 0.04) {
    const y = a * x * x;
    if (y >= VIEW.yMin - 0.15 && y <= VIEW.yMax + 0.15) {
      points.push(`${points.length ? "L" : "M"}${xToSvg(x).toFixed(2)},${yToSvg(y).toFixed(2)}`);
    }
  }
  return points.join(" ");
}

export function ParabolaExplorer() {
  const [aIndex, setAIndex] = useState(A_VALUES.indexOf(1));
  const a = A_VALUES[aIndex];
  const opensUp = a > 0;
  const curve = useMemo(() => curvePath(a), [a]);
  const tableValues = useMemo(() => TABLE_X_VALUES.map((x) => ({ x, y: a * x * x })), [a]);
  const titleId = useId();
  const descriptionId = useId();
  const gradientId = useId().replace(/:/g, "");

  const widthDescription = Math.abs(a) > 1
    ? "στενότερη από τη y=x²"
    : Math.abs(a) < 1
      ? "πλατύτερη από τη y=x²"
      : "ίδιου ανοίγματος με τη y=x²";

  const chooseA = (value) => setAIndex(A_VALUES.indexOf(value));

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-[0_14px_35px_rgba(79,70,229,0.08)] dark:border-indigo-500/30 dark:from-indigo-500/10 dark:via-card dark:to-sky-500/10">
      <div className="border-b border-indigo-200/80 px-4 py-4 sm:px-5 dark:border-indigo-500/25">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">Δυναμική διερεύνηση</div>
            <h3 className="mt-0.5 text-lg font-black sm:text-xl">Μετακίνησε το α και παρατήρησε την παραβολή</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Άλλαξε την παράμετρο και σύνδεσε αμέσως τον τύπο με τη γραφική παράσταση.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
        <div className="min-w-0">
          <div className="mb-4 rounded-xl border border-indigo-200/80 bg-white/90 p-4 dark:border-indigo-500/25 dark:bg-background/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-muted-foreground">Τρέχουσα συνάρτηση</div>
                <div className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">
                  <MathText text={`$y=${formatNumber(a)}x^2$`} />
                </div>
              </div>
              <div className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${opensUp ? "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300"}`}>
                {opensUp ? "Κοίλα προς τα πάνω" : "Κοίλα προς τα κάτω"}
              </div>
            </div>

            <label htmlFor="parabola-a" className="mt-4 flex items-center gap-2 text-sm font-extrabold">
              <MoveHorizontal className="h-4 w-4 text-indigo-600" /> Παράμετρος α = {formatNumber(a)}
            </label>
            <input
              id="parabola-a"
              type="range"
              min="0"
              max={A_VALUES.length - 1}
              step="1"
              value={aIndex}
              onChange={(event) => setAIndex(Number(event.target.value))}
              aria-valuetext={`άλφα ίσον ${formatNumber(a)}`}
              className="mt-3 h-2 w-full cursor-pointer accent-indigo-600"
            />
            <div className="mt-2 flex justify-between text-[11px] font-bold text-muted-foreground"><span>−3</span><span>α ≠ 0</span><span>3</span></div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Έτοιμες τιμές της παραμέτρου α">
              {PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseA(value)}
                  aria-pressed={a === value}
                  className={`min-w-12 rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${a === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-indigo-200 bg-white text-indigo-800 hover:border-indigo-400 dark:border-indigo-500/30 dark:bg-card dark:text-indigo-200"}`}
                >
                  {formatNumber(value)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            <svg
              viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
              className="block h-auto w-full"
              role="img"
              aria-labelledby={`${titleId} ${descriptionId}`}
            >
              <title id={titleId}>Γραφική παράσταση της συνάρτησης y ίσον {formatNumber(a)} x στο τετράγωνο</title>
              <desc id={descriptionId}>Η παραβολή είναι {opensUp ? "κοίλη προς τα πάνω" : "κοίλη προς τα κάτω"}, έχει κορυφή στο μηδέν μηδέν και είναι {widthDescription}.</desc>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={opensUp ? "#4f46e5" : "#e11d48"} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={opensUp ? "#38bdf8" : "#fb7185"} stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {Array.from({ length: 11 }, (_, i) => i - 5).map((n) => (
                <g key={`grid-${n}`}>
                  <line x1={xToSvg(n)} y1="0" x2={xToSvg(n)} y2={VIEW.height} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1={yToSvg(n)} x2={VIEW.width} y2={yToSvg(n)} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                </g>
              ))}

              <line x1="0" y1={yToSvg(0)} x2={VIEW.width} y2={yToSvg(0)} stroke="currentColor" className="text-slate-600 dark:text-slate-300" strokeWidth="2" />
              <line x1={xToSvg(0)} y1="0" x2={xToSvg(0)} y2={VIEW.height} stroke="currentColor" className="text-slate-600 dark:text-slate-300" strokeWidth="2" />
              <line x1={xToSvg(0)} y1="0" x2={xToSvg(0)} y2={VIEW.height} stroke="#f59e0b" strokeWidth="2" strokeDasharray="7 6" opacity="0.9" />

              {[-4, -2, 2, 4].map((n) => (
                <g key={`labels-${n}`} fill="currentColor" className="text-slate-500 dark:text-slate-400" fontSize="13" fontWeight="700">
                  <text x={xToSvg(n)} y={yToSvg(0) + 20} textAnchor="middle">{n}</text>
                  <text x={xToSvg(0) - 10} y={yToSvg(n) + 4} textAnchor="end">{n}</text>
                </g>
              ))}
              <text x={VIEW.width - 15} y={yToSvg(0) - 10} textAnchor="end" fill="currentColor" className="text-slate-600 dark:text-slate-300" fontSize="15" fontWeight="800">x</text>
              <text x={xToSvg(0) + 12} y="20" fill="currentColor" className="text-slate-600 dark:text-slate-300" fontSize="15" fontWeight="800">y</text>

              <path d={curve} fill="none" stroke={opensUp ? "#4f46e5" : "#e11d48"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {tableValues.filter(({ y }) => y >= VIEW.yMin && y <= VIEW.yMax).map(({ x, y }) => (
                <circle key={`point-${x}`} cx={xToSvg(x)} cy={yToSvg(y)} r="5" fill={opensUp ? "#4f46e5" : "#e11d48"} stroke="white" strokeWidth="2" aria-hidden="true" />
              ))}
              <circle cx={xToSvg(0)} cy={yToSvg(0)} r="8" fill="#f59e0b" stroke="white" strokeWidth="3" />
              <g transform={`translate(${xToSvg(0) + 13} ${yToSvg(0) - 17})`}>
                <rect x="0" y="0" width="116" height="29" rx="8" fill="#0f172a" opacity="0.9" />
                <text x="58" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">Κορυφή O(0, 0)</text>
              </g>
              <g transform={`translate(${xToSvg(0) + 11} 28)`}>
                <rect x="0" y="0" width="119" height="27" rx="8" fill="#f59e0b" opacity="0.95" />
                <text x="59.5" y="18" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="800">Άξονας x = 0</text>
              </g>
            </svg>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-indigo-200 bg-white dark:border-indigo-500/25 dark:bg-card">
            <div className="border-b border-indigo-100 px-4 py-3 dark:border-indigo-500/20">
              <div className="text-sm font-extrabold">Ο πίνακας αλλάζει μαζί με το γράφημα</div>
              <p className="mt-0.5 text-[15px] text-muted-foreground sm:text-base">Σύγκρινε τις αντίθετες τιμές του <strong>x</strong>: δίνουν πάντα την ίδια τιμή του <strong>y</strong>.</p>
            </div>
            <div className="grid grid-cols-5 divide-x divide-indigo-100 dark:divide-indigo-500/20" role="table" aria-label={`Πίνακας τιμών της συνάρτησης y ίσον ${formatNumber(a)} x στο τετράγωνο`}>
              {tableValues.map(({ x, y }) => (
                <div key={x} className="p-2 text-center sm:p-3" role="row">
                  <div className="text-xs font-bold text-muted-foreground">x = {formatNumber(x)}</div>
                  <div className="mt-1 text-base font-black text-indigo-700 dark:text-indigo-300">y = {formatNumber(y)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-3" aria-live="polite">
          <div className="rounded-xl border border-border bg-white/85 p-4 dark:bg-card/80">
            <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-muted-foreground">Τι αλλάζει</div>
            <div className="mt-2 text-base font-black">Η κατεύθυνση</div>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Για <strong>{opensUp ? "α > 0" : "α < 0"}</strong>, η παραβολή στρέφει τα κοίλα προς τα <strong>{opensUp ? "πάνω" : "κάτω"}</strong>.</p>
          </div>
          <div className="rounded-xl border border-border bg-white/85 p-4 dark:bg-card/80">
            <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-muted-foreground">Τι αλλάζει</div>
            <div className="mt-2 text-base font-black">Το άνοιγμα</div>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Επειδή <strong>|α| {Math.abs(a) > 1 ? ">" : Math.abs(a) < 1 ? "<" : "="} 1</strong>, η παραβολή είναι <strong>{widthDescription}</strong>.</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-amber-700 dark:text-amber-300">Κρίσιμα σημεία</div>
            <dl className="mt-2 grid gap-2 text-[15px] sm:text-base">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Κορυφή</dt><dd className="font-extrabold">O(0, 0)</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Τομή με x΄x</dt><dd className="font-extrabold">O(0, 0)</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Τομή με y΄y</dt><dd className="font-extrabold">O(0, 0)</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Ακρότατο</dt><dd className="text-right font-extrabold">{opensUp ? "Ελάχιστο 0" : "Μέγιστο 0"}</dd></div>
            </dl>
          </div>
          <div className="rounded-xl bg-[#173f68] p-4 text-white">
            <div className="text-xs font-extrabold text-sky-200">Σταθερό συμπέρασμα</div>
            <p className="mt-1 text-[15px] leading-relaxed text-white/85 sm:text-base">Όσο κι αν μεταβάλλεται το α, η κορυφή και οι δύο τομές παραμένουν στην αρχή των αξόνων.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
