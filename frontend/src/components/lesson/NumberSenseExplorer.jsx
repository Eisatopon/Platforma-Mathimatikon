import { useMemo, useState } from "react";
import { Hash, SlidersHorizontal, Target } from "lucide-react";

const PLACE_VALUES = [
  { label: "Δεκάδες χιλιάδων", value: 10000 },
  { label: "Χιλιάδες", value: 1000 },
  { label: "Εκατοντάδες", value: 100 },
  { label: "Δεκάδες", value: 10 },
  { label: "Μονάδες", value: 1 },
];

const ROUNDING_UNITS = [
  { label: "δεκάδα", value: 10 },
  { label: "εκατοντάδα", value: 100 },
  { label: "χιλιάδα", value: 1000 },
];

const formatNumber = (value) => Number(value).toLocaleString("el-GR");

export function buildNumberModel(value, unit) {
  const parsed = Number(value);
  const safeNumber = Math.max(0, Math.min(99999, Number.isFinite(parsed) ? Math.trunc(parsed) : 0));
  const digits = String(safeNumber).padStart(5, "0").split("").map(Number);
  const lower = Math.floor(safeNumber / unit) * unit;
  const upper = lower + unit;
  const rounded = Math.round(safeNumber / unit) * unit;
  const position = ((safeNumber - lower) / unit) * 100;
  const expanded = digits
    .map((digit, index) => digit * PLACE_VALUES[index].value)
    .filter(Boolean)
    .map(formatNumber)
    .join(" + ") || "0";

  return { safeNumber, digits, lower, upper, rounded, position, expanded };
}

export function NumberSenseExplorer() {
  const [number, setNumber] = useState(30407);
  const [unit, setUnit] = useState(1000);

  const { safeNumber, digits, lower, upper, rounded, position, expanded } = useMemo(
    () => buildNumberModel(number, unit),
    [number, unit],
  );
  const selectedUnit = ROUNDING_UNITS.find((item) => item.value === unit);

  const changeNumber = (value) => {
    const parsed = Number.parseInt(value, 10);
    setNumber(Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(99999, parsed)));
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-[0_14px_35px_rgba(14,116,144,0.08)] dark:border-sky-500/30 dark:from-sky-500/10 dark:via-card dark:to-indigo-500/10">
      <div className="border-b border-sky-200/80 px-4 py-4 dark:border-sky-500/25 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white"><SlidersHorizontal className="h-5 w-5" /></span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-sky-700 dark:text-sky-300">Δυναμική διερεύνηση</div>
            <h3 className="mt-0.5 text-lg font-black sm:text-xl">Εργαστήριο φυσικών αριθμών</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Άλλαξε τον αριθμό και παρατήρησε ταυτόχρονα την αξία θέσης, την αναπτυγμένη μορφή και τη στρογγυλοποίηση.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-extrabold"><Hash className="h-4 w-4 text-sky-600" /> Δοκίμασε έναν αριθμό από 0 έως 99.999</span>
          <input
            type="number"
            min="0"
            max="99999"
            value={safeNumber}
            onChange={(event) => changeNumber(event.target.value)}
            className="w-full rounded-xl border-2 border-sky-200 bg-background px-4 py-3 text-xl font-black tabular-nums outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-sky-500/30"
            aria-label="Φυσικός αριθμός για διερεύνηση"
          />
        </label>

        <div>
          <div className="mb-2 text-sm font-extrabold">Πίνακας αξίας θέσης</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PLACE_VALUES.map((place, index) => (
              <div key={place.value} className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="text-[10px] font-bold leading-tight text-muted-foreground">{place.label}</div>
                <div className="mt-2 text-2xl font-black text-sky-700 dark:text-sky-300">{digits[index]}</div>
                <div className="mt-1 text-xs font-semibold text-muted-foreground">αξία {formatNumber(digits[index] * place.value)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[15px] leading-relaxed dark:border-indigo-500/30 dark:bg-indigo-500/10 sm:text-base">
            <span className="font-extrabold">Αναπτυγμένη μορφή:</span> <span className="font-semibold tabular-nums">{expanded}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold"><Target className="h-4 w-4 text-indigo-600" /> Στρογγυλοποίηση</div>
            <div className="flex flex-wrap gap-2">
              {ROUNDING_UNITS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setUnit(item.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${unit === item.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-border bg-background hover:border-indigo-400"}`}
                >
                  Στη {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 px-2">
            <div className="relative h-2 rounded-full bg-gradient-to-r from-sky-300 to-indigo-400">
              <span className="absolute -top-2 h-6 w-1 rounded-full bg-foreground" style={{ left: `${Math.max(0, Math.min(100, position))}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold tabular-nums"><span>{formatNumber(lower)}</span><span>{formatNumber(upper)}</span></div>
          </div>

          <div className="mt-4 rounded-xl bg-secondary/70 px-4 py-3 text-[15px] leading-relaxed sm:text-base">
            Ο αριθμός <strong>{formatNumber(safeNumber)}</strong> βρίσκεται πιο κοντά στο <strong>{formatNumber(rounded)}</strong>. Επομένως, στη {selectedUnit?.label}, στρογγυλοποιείται σε <strong className="text-indigo-700 dark:text-indigo-300">{formatNumber(rounded)}</strong>.
          </div>
        </div>
      </div>
    </section>
  );
}
