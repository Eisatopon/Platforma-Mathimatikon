import { useMemo, useState } from "react";
import { CircleHelp, Dices, FlaskConical, MousePointerClick, Sparkles } from "lucide-react";
import { buildSampleSpaceModel, SAMPLE_SPACE_EXPERIMENTS } from "./sampleSpaceModel";

const EXPERIMENT_IDS = ["coin", "twoCoins", "die", "twoDice"];

const formatOutcomeSet = (outcomes) => outcomes.length
  ? `{${outcomes.map((outcome) => outcome.label).join(", ")}}`
  : "∅";

function OutcomeGrid({ model, simulatedId }) {
  const favourableIds = new Set(model.favourable.map((outcome) => outcome.id));
  const twoDice = model.experiment === SAMPLE_SPACE_EXPERIMENTS.twoDice;

  if (twoDice) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
        <div className="mb-2 text-xs font-bold text-muted-foreground">Γραμμή: πρώτο ζάρι · Στήλη: δεύτερο ζάρι</div>
        <div className="grid min-w-[470px] grid-cols-6 gap-1.5" role="list" aria-label="Τα 36 διατεταγμένα αποτελέσματα δύο ζαριών">
          {model.outcomes.map((outcome) => {
            const favourable = favourableIds.has(outcome.id);
            const simulated = simulatedId === outcome.id;
            return (
              <div key={outcome.id} role="listitem" className={`relative grid min-h-12 place-items-center rounded-lg border text-sm font-black transition ${favourable ? "border-violet-500 bg-violet-100 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"} ${simulated ? "ring-4 ring-amber-400 ring-offset-1 dark:ring-offset-slate-950" : ""}`}>
                {outcome.label}
                {simulated && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500" aria-label="Αποτέλεσμα προσομοίωσης" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-4 md:grid-cols-6 dark:border-slate-700 dark:bg-slate-950" role="list" aria-label="Δειγματικός χώρος">
      {model.outcomes.map((outcome) => {
        const favourable = favourableIds.has(outcome.id);
        const simulated = simulatedId === outcome.id;
        return (
          <div key={outcome.id} role="listitem" className={`relative grid min-h-20 place-items-center rounded-xl border p-2 text-center font-black transition ${favourable ? "border-violet-500 bg-violet-100 text-violet-900 dark:bg-violet-500/25 dark:text-violet-100" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"} ${simulated ? "ring-4 ring-amber-400 ring-offset-2 dark:ring-offset-slate-950" : ""}`}>
            <span className="text-xl">{outcome.symbol || outcome.label}</span>
            {outcome.symbol && <span className="text-[11px] text-muted-foreground">{outcome.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function SampleSpaceExplorer() {
  const [experimentId, setExperimentId] = useState("die");
  const [eventId, setEventId] = useState(SAMPLE_SPACE_EXPERIMENTS.die.events[0].id);
  const [simulatedId, setSimulatedId] = useState(null);
  const model = useMemo(() => buildSampleSpaceModel(experimentId, eventId), [experimentId, eventId]);

  const selectExperiment = (id) => {
    setExperimentId(id);
    setEventId(SAMPLE_SPACE_EXPERIMENTS[id].events[0].id);
    setSimulatedId(null);
  };

  const simulate = () => {
    const index = Math.floor(Math.random() * model.outcomes.length);
    setSimulatedId(model.outcomes[index].id);
  };

  const simulated = model.outcomes.find((outcome) => outcome.id === simulatedId);
  const occurred = simulated && model.favourable.some((outcome) => outcome.id === simulated.id);

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-amber-50 shadow-[0_14px_35px_rgba(109,40,217,0.08)] dark:border-violet-500/30 dark:from-violet-500/10 dark:via-card dark:to-amber-500/10">
      <div className="border-b border-violet-200/80 px-4 py-4 sm:px-5 dark:border-violet-500/25">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20"><Sparkles className="h-5 w-5" /></span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-violet-700 dark:text-violet-300">Δυναμικό εργαστήριο</div>
            <h3 className="mt-0.5 text-lg font-black sm:text-xl">Κατασκεύασε τον δειγματικό χώρο</h3>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">Άλλαξε πείραμα και ενδεχόμενο. Τα ευνοϊκά αποτελέσματα φωτίζονται μέσα στο σύνολο όλων των δυνατών αποτελεσμάτων.</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex items-center gap-2 font-black"><FlaskConical className="h-4 w-4 text-violet-600" /> 1. Επίλεξε πείραμα τύχης</div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {EXPERIMENT_IDS.map((id) => {
              const experiment = SAMPLE_SPACE_EXPERIMENTS[id];
              return <button key={id} type="button" aria-pressed={experimentId === id} onClick={() => selectExperiment(id)} className={`rounded-xl border px-3 py-3 text-left transition ${experimentId === id ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-600/15" : "border-border bg-white/85 hover:border-violet-400 dark:bg-card/80"}`}><span className="block text-xs font-bold opacity-75">ΠΕΙΡΑΜΑ</span><span className="mt-0.5 block font-black">{experiment.shortLabel}</span></button>;
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 font-black"><MousePointerClick className="h-4 w-4 text-violet-600" /> 2. Επίλεξε ενδεχόμενο</div>
          <div className="flex flex-wrap gap-2">
            {model.experiment.events.map((event) => <button key={event.id} type="button" aria-pressed={eventId === event.id} onClick={() => { setEventId(event.id); setSimulatedId(null); }} className={`rounded-full border px-3 py-2 text-sm font-extrabold transition ${eventId === event.id ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-violet-800 hover:border-violet-500 dark:border-violet-500/30 dark:bg-card dark:text-violet-200"}`}>{event.label}</button>)}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
          <div className="min-w-0 space-y-3">
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 p-4 dark:border-cyan-500/25 dark:bg-cyan-500/10">
              <div className="text-xs font-extrabold uppercase tracking-[.14em] text-cyan-700 dark:text-cyan-300">Δειγματικός χώρος</div>
              <div className="mt-1 break-words text-lg font-black">Ω = {formatOutcomeSet(model.outcomes)}</div>
            </div>
            <OutcomeGrid model={model} simulatedId={simulatedId} />
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10" aria-live="polite">
              <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-violet-700 dark:text-violet-300">Ενδεχόμενο A</div>
              <div className="mt-2 break-words text-xl font-black text-violet-800 dark:text-violet-200">A = {formatOutcomeSet(model.favourable)}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{model.event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center dark:border-cyan-500/25 dark:bg-cyan-500/10"><div className="text-xs font-bold text-muted-foreground">Όλα τα δυνατά</div><div className="mt-1 text-2xl font-black text-cyan-800 dark:text-cyan-200">N(Ω) = {model.outcomeCount}</div></div>
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center dark:border-violet-500/25 dark:bg-violet-500/10"><div className="text-xs font-bold text-muted-foreground">Ευνοϊκά</div><div className="mt-1 text-2xl font-black text-violet-800 dark:text-violet-200">N(A) = {model.favourableCount}</div></div>
            </div>

            <div className={`rounded-xl border p-4 ${model.isCertain ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10" : model.isImpossible ? "border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10"}`}>
              <div className="flex items-center gap-2 font-black"><CircleHelp className="h-4 w-4" /> Χαρακτηρισμός</div>
              <p className="mt-1 text-[15px] leading-relaxed sm:text-base">{model.isCertain ? "Βέβαιο ενδεχόμενο: A = Ω." : model.isImpossible ? "Αδύνατο ενδεχόμενο: A = ∅." : "Δυνατό, μη βέβαιο ενδεχόμενο: το A είναι γνήσιο υποσύνολο του Ω."}</p>
            </div>

            <button type="button" onClick={simulate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f68] px-4 py-3 font-black text-white shadow-md transition hover:bg-[#0f3154]"><Dices className="h-5 w-5" /> Προσομοίωσε μία δοκιμή</button>
            {simulated && <div className={`rounded-xl border p-3 text-center font-bold ${occurred ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200" : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`} aria-live="polite">Αποτέλεσμα: <strong>{simulated.label}</strong> — το ενδεχόμενο {occurred ? "πραγματοποιήθηκε" : "δεν πραγματοποιήθηκε"}.</div>}
          </aside>
        </div>
      </div>
    </section>
  );
}

