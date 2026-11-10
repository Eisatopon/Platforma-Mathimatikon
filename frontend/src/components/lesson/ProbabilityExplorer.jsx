import { useId, useMemo, useState } from "react";
import { Dices, FlaskConical, RotateCcw, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";
import { SAMPLE_SPACE_EXPERIMENTS } from "./sampleSpaceModel";
import { buildProbabilityModel, simulateProbabilityTrials } from "./probabilityModel";

const EXPERIMENTS = [
  { id: "coin", label: "Νόμισμα", initialEvent: "heads" },
  { id: "die", label: "Ζάρι", initialEvent: "even" },
  { id: "twoDice", label: "Δύο ζάρια", initialEvent: "sumSeven" },
  { id: "urn", label: "Κάλπη", initialEvent: "red" },
];
const EMPTY_TRIALS = { hits: 0, trials: 0, history: [] };
const MAX_TRIALS = 10000;
const formatNumber = (number, digits = 2) => number.toLocaleString("el-GR", { maximumFractionDigits: digits });
const fractionText = ({ numerator, denominator }) => denominator === 1 ? String(numerator) : `\\frac{${numerator}}{${denominator}}`;

function FrequencyChart({ history, probability }) {
  const titleId = useId();
  if (!history.length) return <p className="rounded-xl border border-dashed border-teal-300 bg-white/60 p-5 text-base leading-relaxed text-muted-foreground dark:bg-card/60">Κάνε πρώτα μια πρόβλεψη. Έπειτα εκτέλεσε δοκιμές για να δεις πώς μεταβάλλεται η σχετική συχνότητα.</p>;
  const total = history.length;
  const stride = Math.max(1, Math.ceil(total / 150));
  const x = (trial) => 40 + (total === 1 ? 0 : ((trial - 1) / (total - 1)) * 480);
  const y = (frequency) => 154 - frequency * 128;
  const points = history.filter((point, index) => index % stride === 0 || index === total - 1).map((point) => `${x(point.trials)},${y(point.hits / point.trials)}`).join(" ");
  return (
    <div className="rounded-xl border border-teal-200 bg-white p-3 dark:border-teal-500/30 dark:bg-card">
      <svg viewBox="0 0 550 195" className="w-full" role="img" aria-labelledby={titleId}>
        <title id={titleId}>Σχετική συχνότητα ανά πλήθος δοκιμών· θεωρητική πιθανότητα {formatNumber(probability)}.</title>
        {[0, 0.5, 1].map((value) => <g key={value}><line x1="40" x2="520" y1={y(value)} y2={y(value)} stroke="currentColor" opacity=".15" /><text x="30" y={y(value) + 4} textAnchor="end" fontSize="12" fill="currentColor">{formatNumber(value)}</text></g>)}
        <line x1="40" x2="520" y1={y(probability)} y2={y(probability)} stroke="#d97706" strokeWidth="2" strokeDasharray="7 5" />
        <polyline points={points} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={x(total)} cy={y(history[total - 1].hits / total)} r="3.5" fill="#0d9488" />
        <text x="40" y="175" fontSize="12" fill="currentColor">1</text>
        {total > 1 && <text x="520" y="175" textAnchor="end" fontSize="12" fill="currentColor">{formatNumber(total)}</text>}
        <text x="280" y="192" textAnchor="middle" fontSize="12" fill="currentColor">Πλήθος δοκιμών</text>
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold"><span className="text-teal-700 dark:text-teal-300">Πράσινη γραμμή: σχετική συχνότητα</span><span className="text-amber-700 dark:text-amber-300">Διακεκομμένη: θεωρητική πιθανότητα</span></div>
    </div>
  );
}

export function ProbabilityExplorer() {
  const headingId = useId();
  const [experimentId, setExperimentId] = useState("die");
  const [eventId, setEventId] = useState("even");
  const [red, setRed] = useState(4);
  const [blue, setBlue] = useState(6);
  const [trials, setTrials] = useState(EMPTY_TRIALS);
  const model = useMemo(() => buildProbabilityModel(experimentId, eventId, red, blue), [experimentId, eventId, red, blue]);
  const favourableIds = new Set(model.favourable.map((outcome) => outcome.id));
  const selectExperiment = (experiment) => {
    setExperimentId(experiment.id);
    setEventId(experiment.initialEvent);
    setTrials(EMPTY_TRIALS);
  };
  const simulate = (count) => {
    const batch = simulateProbabilityTrials(model, Math.min(count, MAX_TRIALS - trials.trials));
    setTrials((previous) => ({
      trials: previous.trials + batch.trials,
      hits: previous.hits + batch.hits,
      history: [...previous.history, ...batch.cumulativeHits.map((hits, index) => ({ trials: previous.trials + index + 1, hits: previous.hits + hits }))],
    }));
  };

  return (
    <section aria-labelledby={headingId} className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 shadow-[0_14px_35px_rgba(13,148,136,0.08)] dark:border-teal-500/30 dark:from-teal-500/10 dark:via-card dark:to-amber-500/10">
      <div className="flex items-start gap-3 border-b border-teal-200/80 p-4 sm:p-5 dark:border-teal-500/25">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-700 text-white"><Sparkles className="h-5 w-5" /></span>
        <div><div className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300">Δυναμικό εργαστήριο</div><h3 id={headingId} className="mt-1 text-xl font-black">Υπολόγισε, πρόβλεψε, πειραματίσου</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Μέτρησε τα ισοπίθανα αποτελέσματα. Σύγκρινε την ακριβή πιθανότητα με όσα συμβαίνουν σε επαναλαμβανόμενες δοκιμές.</p></div>
      </div>
      <div className="space-y-5 p-4 sm:p-5">
        <div><div className="mb-2 flex items-center gap-2 text-base font-black"><FlaskConical className="h-4 w-4 text-teal-700" /> 1. Επίλεξε πείραμα</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{EXPERIMENTS.map((experiment) => <button key={experiment.id} type="button" aria-pressed={experimentId === experiment.id} onClick={() => selectExperiment(experiment)} className={`rounded-xl border px-3 py-3 text-base font-extrabold transition ${experimentId === experiment.id ? "border-teal-700 bg-teal-700 text-white" : "border-border bg-background hover:border-teal-500"}`}>{experiment.label}</button>)}</div></div>
        <p className="text-base leading-relaxed text-muted-foreground">{experimentId === "urn" ? "Οι μπάλες διαφέρουν μόνο στο χρώμα και καθεμία έχει την ίδια πιθανότητα επιλογής. Μετά από κάθε δοκιμή επιστρέφεται στην κάλπη και ανακατεύουμε." : experimentId === "twoDice" ? "Δύο δίκαια ζάρια ρίχνονται ανεξάρτητα. Τα 36 διατεταγμένα ζεύγη είναι ισοπίθανα· τα 11 αθροίσματα δεν είναι." : experimentId === "coin" ? "Χρησιμοποιούμε δίκαιο νόμισμα. Κεφαλή και Γράμματα έχουν ίσες πιθανότητες." : "Χρησιμοποιούμε δίκαιο ζάρι. Καθεμία από τις έξι ενδείξεις έχει την ίδια πιθανότητα."}</p>
        {experimentId === "urn" ? (
          <div className="grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
            <label className="space-y-2 text-base font-bold"><span>Κόκκινες μπάλες: {red}</span><input aria-label="Κόκκινες μπάλες" type="range" min={blue === 0 ? 1 : 0} max="10" step="1" value={red} onChange={(event) => { setRed(Number(event.target.value)); setTrials(EMPTY_TRIALS); }} className="block w-full accent-rose-600" /></label>
            <label className="space-y-2 text-base font-bold"><span>Μπλε μπάλες: {blue}</span><input aria-label="Μπλε μπάλες" type="range" min={red === 0 ? 1 : 0} max="10" step="1" value={blue} onChange={(event) => { setBlue(Number(event.target.value)); setTrials(EMPTY_TRIALS); }} className="block w-full accent-blue-600" /></label>
            <p className="text-base sm:col-span-2">Ενδεχόμενο Α: επιλέγεται κόκκινη μπάλα. Κάθε κύκλος παριστάνει μία ξεχωριστή μπάλα.</p>
          </div>
        ) : <div className="flex flex-wrap gap-2" aria-label="Επίλεξε ενδεχόμενο">{SAMPLE_SPACE_EXPERIMENTS[experimentId].events.map((event) => <button key={event.id} type="button" aria-pressed={eventId === event.id} onClick={() => { setEventId(event.id); setTrials(EMPTY_TRIALS); }} className={`rounded-full border px-3 py-2 text-base font-bold ${eventId === event.id ? "border-teal-700 bg-teal-700 text-white" : "border-teal-300 bg-background text-teal-800 dark:text-teal-200"}`}>{event.label}</button>)}</div>}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.7fr)]">
          <div className="min-w-0 rounded-xl border border-border bg-background p-4"><div className="mb-3 text-base font-black">Όλα τα δυνατά αποτελέσματα</div><ul className={`grid gap-2 ${experimentId === "twoDice" ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4 sm:grid-cols-6"}`} aria-label="Ισοπίθανα αποτελέσματα">{model.outcomes.map((outcome) => <li key={outcome.id} className={`grid min-h-11 place-items-center rounded-lg border px-1 py-2 text-center text-sm font-extrabold ${experimentId === "urn" ? outcome.colour === "red" ? "rounded-full border-rose-400 bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100" : "rounded-full border-blue-400 bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-100" : favourableIds.has(outcome.id) ? "border-teal-600 bg-teal-100 text-teal-900 dark:bg-teal-500/20 dark:text-teal-100" : "border-border bg-secondary text-muted-foreground"}`}>{outcome.symbol || outcome.label}</li>)}</ul><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{experimentId === "urn" ? "Κ: κόκκινη · Μ: μπλε. Οι αριθμοί διακρίνουν τις μπάλες του ίδιου χρώματος." : "Πράσινο: το αποτέλεσμα ανήκει στο Α. Κάθε αποτέλεσμα μετριέται μία φορά."}</p></div>
          <div className="space-y-4" aria-live="polite">
            <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 dark:border-teal-500/30 dark:bg-teal-500/10"><h4 className="text-base font-black">Ακριβής πιθανότητα</h4><p className="mt-2 text-base">Ευνοϊκά: <strong>{model.numerator}</strong> · Δυνατά: <strong>{model.denominator}</strong></p><MathText className="mt-3 block text-xl font-black" text={`$P(A)=\\frac{${model.numerator}}{${model.denominator}}=${fractionText(model.fraction)}$`} /><p className="mt-3 text-lg font-bold">{Number.isInteger(model.probability * 100) ? "" : "≈ "}{formatNumber(model.probability * 100)}%</p></div>
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-base leading-relaxed dark:border-amber-500/30 dark:bg-amber-500/10"><MathText text={`Το αντίθετο ενδεχόμενο έχει πιθανότητα $P(A')=1-P(A)=${fractionText({ denominator: model.fraction.denominator, numerator: model.fraction.denominator - model.fraction.numerator })}$.`} /></div>
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-teal-200 bg-white/70 p-4 dark:border-teal-500/30 dark:bg-card/70">
          <h4 className="text-lg font-black">2. Δοκίμασε την πρόβλεψή σου</h4><p className="text-base leading-relaxed">Θα είναι η σχετική συχνότητα ακριβώς ίση με την πιθανότητα; Τι περιμένεις να παρατηρήσεις αν αυξήσεις πολύ τις δοκιμές;</p>
          <div className="flex flex-wrap gap-2">{[1, 10, 100, 1000].map((count) => <button key={count} type="button" onClick={() => simulate(count)} disabled={trials.trials >= MAX_TRIALS} className="inline-flex items-center gap-2 rounded-xl bg-[#173f68] px-3 py-2.5 text-base font-bold text-white disabled:opacity-40"><Dices className="h-4 w-4" /> +{formatNumber(count)} {count === 1 ? "δοκιμή" : "δοκιμές"}</button>)}<button type="button" onClick={() => setTrials(EMPTY_TRIALS)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-base font-bold"><RotateCcw className="h-4 w-4" /> Μηδενισμός δοκιμών</button></div>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary p-3 text-center text-base" role="status"><div>Δοκιμές<strong className="mt-1 block text-xl">{formatNumber(trials.trials)}</strong></div><div>Επιτυχίες<strong className="mt-1 block text-xl">{formatNumber(trials.hits)}</strong></div><div>Σχετική συχνότητα<strong className="mt-1 block text-xl">{trials.trials ? formatNumber(trials.hits / trials.trials, 4) : "—"}</strong></div></div>
          <FrequencyChart history={trials.history} probability={model.probability} />
          <p className="text-base leading-relaxed text-muted-foreground">Η πιθανότητα παραμένει σταθερή όσο το πείραμα δεν αλλάζει. Η σχετική συχνότητα μεταβάλλεται και σε πολλές δοκιμές συνήθως βρίσκεται κοντά της· δεν πλησιάζει υποχρεωτικά σε κάθε νέα δοκιμή. Η αλλαγή πειράματος, ενδεχομένου ή σύνθεσης της κάλπης μηδενίζει τις μετρήσεις.</p>
          {trials.trials >= MAX_TRIALS && <p className="text-base font-bold" role="status">Συμπληρώθηκαν 10.000 δοκιμές. Μηδένισε τις μετρήσεις για νέο πείραμα.</p>}
        </div>
      </div>
    </section>
  );
}
