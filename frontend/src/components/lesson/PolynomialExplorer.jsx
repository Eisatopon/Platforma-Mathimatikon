import { useState } from 'react';
import { MathText } from '@/components/MathText';
import {
  polynomial, fromTerms, isZero, degree, constantTerm, terms, termLatex, expressionLatex, polynomialLatex,
  add, subtract, evaluate, substitutionLatex, termValuesLatex, groupedLatex, coefficientSumsLatex,
  openedLatex, firstTermOnlyMistake, REDUCTION_EXAMPLES, CHECK_VALUES,
} from './polynomialModel';

const MODES = ['Ανατομία πολυωνύμου', 'Αναγωγή και διάταξη', 'Πρόσθεση και αφαίρεση'];
const POWER_NAMES = ['Σταθερός όρος', 'Συντελεστής του x', 'Συντελεστής του x²', 'Συντελεστής του x³'];
const COLUMN_NAMES = ['Σταθεροί όροι', 'Όροι με x', 'Όροι με x²'];
const INITIAL_ANATOMY = [5, 0, -3, 2];
const INITIAL = { p: [5, -2, 3], q: [-2, 3, 1] };
const ANATOMY_PRESETS = [
  ['Ο βαθμός πέφτει', [1, -3, 2, 0]],
  ['Σταθερό πολυώνυμο', [4, 0, 0, 0]],
  ['Μηδενικό πολυώνυμο', [0, 0, 0, 0]],
  ['Αρχικά δεδομένα', INITIAL_ANATOMY],
];
const SUM_PRESETS = [
  ['Ο βαθμός πέφτει', [-1, 3, 2], [4, 1, -2], '+'],
  ['Αντίθετα πολυώνυμα', [5, -2, 3], [-5, 2, -3], '+'],
  ['Αρχικά δεδομένα', INITIAL.p, INITIAL.q, '-'],
];

const buttonClass = active => `rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border bg-background hover:border-emerald-500'}`;
const cardClass = 'rounded-xl border border-border bg-card p-4';
const minus = value => String(value).replace('-', '−');

function Slider({ label, value, onChange, min, max }) {
  return (
    <label className="block text-sm font-bold">
      {label}: <strong>{minus(value)}</strong>
      <input className="mt-2 block w-full accent-emerald-700" type="range" aria-label={label} min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))} />
    </label>
  );
}

function PolynomialInputs({ name, values, onChange }) {
  const set = power => value => onChange(values.map((old, i) => (i === power ? value : old)));
  return (
    <div className={`${cardClass} space-y-3`}>
      {[2, 1, 0].map(power => <Slider key={power} label={`${POWER_NAMES[power]} στο ${name}`} value={values[power]} onChange={set(power)} min={-5} max={5} />)}
      <p className="text-lg font-bold">{name}(x) = <MathText text={`$${polynomialLatex(polynomial(values))}$`} /></p>
    </div>
  );
}

function anatomyNote(p, coefficients) {
  if (isZero(p)) return 'Όλοι οι συντελεστές είναι 0. Το μηδενικό πολυώνυμο δεν έχει όρους και δεν έχει βαθμό.';
  const notes = [];
  if (degree(p) === 0) notes.push('Έμεινε μόνο ένας αριθμός: σταθερό πολυώνυμο, με βαθμό 0.');
  else {
    notes.push(`Ο όρος με τον μεγαλύτερο εκθέτη είναι ο $${termLatex(p[degree(p)], degree(p))}$, άρα ο βαθμός είναι ${degree(p)}.`);
    if (coefficients[3] === 0) notes.push('Με συντελεστή 0 ο όρος του $x^3$ χάνεται και ο βαθμός πέφτει.');
    const missing = p.slice(0, degree(p)).map((coefficient, power) => (coefficient === 0 ? power : null)).filter(power => power !== null);
    if (missing.length) notes.push('Όταν λείπει ένας όρος, ο συντελεστής του είναι 0.');
  }
  return notes.join(' ');
}

export function PolynomialExplorer() {
  const [mode, setMode] = useState(0);
  const [anatomy, setAnatomy] = useState(INITIAL_ANATOMY);
  const [x, setX] = useState(-1);
  const [example, setExample] = useState(0), [step, setStep] = useState(0);
  const [p, setP] = useState(INITIAL.p), [q, setQ] = useState(INITIAL.q);
  const [op, setOp] = useState('-');
  const [shown, setShown] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);

  // Any change of the data hides the result, so the prediction always comes first.
  const changing = setter => value => { setter(value); setShown(false); };
  const preset = (first, second, operation) => { setP(first); setQ(second); setOp(operation); setShown(false); };

  const single = polynomial(anatomy);
  const value = evaluate(single, x);

  const chosen = REDUCTION_EXAMPLES[example];
  const reduced = fromTerms(chosen.terms);
  const reductionSteps = [
    ['Ομαδοποιώ τους όμοιους όρους, από τον μεγαλύτερο εκθέτη προς τον μικρότερο.', groupedLatex(chosen.terms)],
    ['Σε κάθε ομάδα προσθέτω μόνο τους συντελεστές. Το κύριο μέρος μένει ίδιο.', coefficientSumsLatex(chosen.terms)],
    [isZero(reduced) ? 'Όλοι οι όροι απαλείφθηκαν. Έμεινε το μηδενικό πολυώνυμο, που δεν έχει βαθμό.'
      : `Κάνω τις πράξεις. Το πολυώνυμο είναι γραμμένο κατά τις φθίνουσες δυνάμεις του x και ο βαθμός του είναι ${degree(reduced)}.`, polynomialLatex(reduced)],
  ];

  const P = polynomial(p), Q = polynomial(q);
  const sign = op === '+' ? 1 : -1;
  const result = sign === 1 ? add(P, Q) : subtract(P, Q);
  const check = CHECK_VALUES[checkIndex];
  const mistake = sign === -1 ? firstTermOnlyMistake(P, Q) : null;
  const mistakeValue = mistake ? evaluate(mistake, check) : null;
  const operationValue = evaluate(P, check) + sign * evaluate(Q, check);
  const second = sign === 1 ? q : q.map(coefficient => (coefficient === 0 ? 0 : -coefficient));
  const resultRow = [0, 1, 2].map(power => result[power] || 0);
  const resultDegree = degree(result);
  const row = (label, values) => (
    <tr className="border-t border-border">
      <th scope="row" className="py-2 pr-3 font-semibold">{label}</th>
      {[2, 1, 0].map(power => <td key={power} className="px-3"><MathText text={`$${termLatex(values[power], power)}$`} /></td>)}
    </tr>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:via-card dark:to-lime-500/10">
      <header className="border-b border-emerald-200 p-4 sm:p-5 dark:border-emerald-500/30">
        <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">Δυναμική διερεύνηση</div>
        <h3 className="mt-1 text-xl font-black">Εργαστήριο πολυωνύμων</h3>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Άλλαξε συντελεστές, πρόβλεψε το αποτέλεσμα και έλεγξέ το με αριθμητικές τιμές. Όλοι οι υπολογισμοί γίνονται ακριβώς.</p>
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Επιλογή διερεύνησης">
          {MODES.map((name, i) => <button type="button" key={name} aria-pressed={mode === i} onClick={() => { setMode(i); setShown(false); }} className={buttonClass(mode === i)}>{name}</button>)}
        </div>

        {mode === 0 && <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className={`${cardClass} space-y-3`}>
              {[3, 2].map(power => <Slider key={power} label={POWER_NAMES[power]} value={anatomy[power]} onChange={v => setAnatomy(anatomy.map((old, i) => (i === power ? v : old)))} min={-5} max={5} />)}
            </div>
            <div className={`${cardClass} space-y-3`}>
              {[1, 0].map(power => <Slider key={power} label={POWER_NAMES[power]} value={anatomy[power]} onChange={v => setAnatomy(anatomy.map((old, i) => (i === power ? v : old)))} min={-5} max={5} />)}
            </div>
          </div>
          <div className="rounded-xl bg-card p-4 text-center" role="status" aria-live="polite">
            <MathText className="text-2xl font-bold" text={`$$P(x)=${polynomialLatex(single)}$$`} />
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              ['Πλήθος όρων', String(terms(single).length)],
              ['Βαθμός', isZero(single) ? 'Δεν ορίζεται' : String(degree(single))],
              ['Σταθερός όρος', minus(constantTerm(single))],
            ].map(([term, text]) => (
              <div key={term} className={cardClass}>
                <dt className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{term}</dt>
                <dd className="mt-1 text-lg font-bold">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="rounded-xl bg-card p-4 text-base leading-relaxed"><MathText text={anatomyNote(single, anatomy)} /></p>
          <div className={`${cardClass} space-y-3`}>
            <h4 className="font-bold">Αριθμητική τιμή</h4>
            <Slider label="Τιμή του x" value={x} onChange={setX} min={-3} max={3} />
            <div className="overflow-x-auto" role="status" aria-live="polite">
              <MathText className="text-lg" text={isZero(single) ? `$$P(${x})=0$$` : `$$P(${x})=${substitutionLatex(single, x)}=${termValuesLatex(single, x)}=${value}$$`} />
            </div>
            <p className="text-base leading-relaxed">{x < 0 ? 'Η αρνητική τιμή μπαίνει σε παρένθεση, ώστε η δύναμη να αφορά και το πρόσημο.' : 'Αντικαθιστούμε το x σε κάθε όρο και εκτελούμε πρώτα τις δυνάμεις.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ANATOMY_PRESETS.map(([label, values]) => <button key={label} type="button" className={buttonClass(false)} onClick={() => setAnatomy(values)}>{label}</button>)}
          </div>
        </>}

        {mode === 1 && <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Παράδειγμα">
            {REDUCTION_EXAMPLES.map((item, i) => <button key={item.label} type="button" aria-pressed={example === i} className={buttonClass(example === i)} onClick={() => { setExample(i); setStep(0); }}>{item.label}</button>)}
          </div>
          <div className={cardClass}>
            <div className="overflow-x-auto"><MathText className="text-xl" text={`$$${expressionLatex(chosen.terms)}$$`} /></div>
            <p className="mt-3 text-base leading-relaxed"><strong>Πρόβλεψε πρώτα:</strong> πόσους όρους θα έχει το πολυώνυμο μετά την αναγωγή και ποιος θα είναι ο βαθμός του;</p>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed" aria-live="polite">
              {reductionSteps.slice(0, step).map(([text, latex]) => (
                <li key={text}>{text}<div className="mt-1 overflow-x-auto"><MathText text={`$$${latex}$$`} /></div></li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={`${buttonClass(true)} disabled:cursor-not-allowed disabled:opacity-50`} disabled={step >= reductionSteps.length} onClick={() => setStep(step + 1)}>Εμφάνισε επόμενο βήμα</button>
              <button type="button" className={buttonClass(false)} onClick={() => setStep(0)}>Δοκίμασε ξανά</button>
            </div>
          </div>
        </>}

        {mode === 2 && <>
          <div className="grid gap-5 sm:grid-cols-2">
            <PolynomialInputs name="P" values={p} onChange={changing(setP)} />
            <PolynomialInputs name="Q" values={q} onChange={changing(setQ)} />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Πράξη">
            {[['+', 'Πρόσθεση'], ['-', 'Αφαίρεση']].map(([symbol, label]) => (
              <button key={symbol} type="button" aria-pressed={op === symbol} className={buttonClass(op === symbol)} onClick={() => changing(setOp)(symbol)}>{label}</button>
            ))}
          </div>
          <div className={cardClass}>
            <p className="text-base leading-relaxed"><strong>Πρόβλεψε πρώτα:</strong> {sign === 1 ? 'ποιο είναι το άθροισμα P(x)+Q(x) και ποιος ο βαθμός του;' : 'ποια πρόσημα αλλάζουν στην αφαίρεση P(x)−Q(x) και ποιο είναι το αποτέλεσμα;'}</p>
            <button type="button" aria-expanded={shown} className={`${buttonClass(shown)} mt-3`} onClick={() => setShown(current => !current)}>{shown ? 'Κρύψε το αποτέλεσμα' : 'Δείξε το αποτέλεσμα'}</button>
          </div>
          {shown && <>
            <div className={`${cardClass} overflow-x-auto`} role="status" aria-live="polite">
              <table className="w-full text-left text-base">
                <caption className="sr-only">Κατακόρυφη διάταξη σε στήλες ομοίων όρων</caption>
                <thead><tr className="text-sm text-muted-foreground"><th scope="col" className="py-1 pr-3">Πολυώνυμο</th>{[2, 1, 0].map(power => <th key={power} scope="col" className="px-3">{COLUMN_NAMES[power]}</th>)}</tr></thead>
                <tbody>
                  {row('P(x)', p)}
                  {row(sign === 1 ? 'Q(x)' : '−Q(x)', second)}
                  {row(sign === 1 ? 'Άθροισμα' : 'Διαφορά', resultRow)}
                </tbody>
              </table>
              <p className="mt-3 text-base leading-relaxed">
                {sign === 1 ? 'Η παρένθεση με + μπροστά φεύγει χωρίς καμία αλλαγή. Προσθέτουμε τους συντελεστές σε κάθε στήλη.'
                  : 'Αφαιρώ σημαίνει προσθέτω το αντίθετο: στη γραμμή −Q(x) έχει αλλάξει το πρόσημο κάθε όρου του Q(x).'}
              </p>
              <div className="mt-3 overflow-x-auto"><MathText className="text-lg font-bold" text={`$$${openedLatex(P, Q, sign)}=${polynomialLatex(result)}$$`} /></div>
              <p className="mt-2 text-base leading-relaxed">
                {resultDegree === null ? 'Όλοι οι όροι απαλείφθηκαν: το αποτέλεσμα είναι το μηδενικό πολυώνυμο.'
                  : resultDegree < Math.max(degree(P) ?? 0, degree(Q) ?? 0) ? `Οι μεγιστοβάθμιοι όροι απαλείφθηκαν και ο βαθμός έπεσε σε ${resultDegree}.`
                    : `Ο βαθμός του αποτελέσματος είναι ${resultDegree}.`}
              </p>
            </div>
            <div className={cardClass}>
              <h4 className="font-bold">Έλεγχος με αριθμητική τιμή</h4>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Τιμή για τον έλεγχο">
                {CHECK_VALUES.map((item, i) => <button key={item} type="button" aria-pressed={checkIndex === i} className={buttonClass(checkIndex === i)} onClick={() => setCheckIndex(i)}>{`x=${minus(item)}`}</button>)}
              </div>
              <p className="mt-3 text-base leading-relaxed">
                Για x={minus(check)}: P({minus(check)}) = {minus(evaluate(P, check))} και Q({minus(check)}) = {minus(evaluate(Q, check))}, άρα P{sign === 1 ? '+' : '−'}Q = {minus(operationValue)}. Το αποτέλεσμα δίνει {minus(evaluate(result, check))}: οι δύο τιμές συμφωνούν.
              </p>
              {mistake && (
                <p className="mt-3 rounded-lg bg-rose-50 p-3 text-base leading-relaxed text-rose-900 dark:bg-rose-500/10 dark:text-rose-200">
                  <MathText text={`**Συχνό λάθος:** $${polynomialLatex(mistake)}$. Άλλαξε πρόσημο μόνο ο πρώτος όρος του Q(x). ${mistakeValue === operationValue
                    ? `Για αυτή την τιμή δίνει τυχαία το ίδιο αποτέλεσμα, ${minus(mistakeValue)}. Δοκίμασε άλλη τιμή.`
                    : `Εδώ δίνει ${minus(mistakeValue)} αντί για ${minus(operationValue)}.`}`} />
                </p>
              )}
              <p className="mt-3 text-sm text-muted-foreground">Ένα αριθμητικό παράδειγμα μπορεί να αποκαλύψει λάθος, αλλά δεν αποδεικνύει την ισότητα. Την εξασφαλίζουν οι ιδιότητες των πράξεων.</p>
            </div>
          </>}
          <div className="flex flex-wrap gap-2">
            {SUM_PRESETS.map(([label, first, secondValues, operation]) => <button key={label} type="button" className={buttonClass(false)} onClick={() => preset(first, secondValues, operation)}>{label}</button>)}
          </div>
        </>}
      </div>
    </section>
  );
}
