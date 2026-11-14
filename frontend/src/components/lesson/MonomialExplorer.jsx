import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { rationalOperation, fractionLatex } from './realOperationsModel';
import {
  monomial, isZero, mainPartLatex, mainPartText, monomialLatex, expandedLatex, degree, relation,
  addMonomials, sumLatex, multiplyMonomials, divideMonomials, quotientLatex, evaluate, evaluateQuotient,
  commonMistake, CHECK_VALUES,
} from './monomialModel';

const MODES = ['Ανατομία μονωνύμου', 'Όμοια; Πρόσθεση και αφαίρεση', 'Πολλαπλασιασμός και διαίρεση'];
const INITIAL = { a: [3, 2, 1], b: [2, 2, 1] };
const ANATOMY_PRESETS = [
  ['Κρυφός συντελεστής', [-1, 1, 2, 1]],
  ['Σταθερό μονώνυμο', [5, 1, 0, 0]],
  ['Μηδενικό μονώνυμο', [0, 1, 2, 1]],
  ['Αρχικά δεδομένα', [-3, 2, 2, 1]],
];
const SUM_PRESETS = [
  ['Όμοια', [3, 2, 1], [2, 2, 1]],
  ['Ανόμοια', [3, 2, 1], [2, 1, 2]],
  ['Αντίθετα', [3, 2, 1], [-3, 2, 1]],
];
const PRODUCT_PRESETS = [
  ['Πηλίκο που είναι μονώνυμο', [6, 3, 2], [2, 1, 1]],
  ['Πηλίκο που δεν είναι μονώνυμο', [6, 2, 0], [3, 3, 0]],
  ['Διαιρέτης το 0', [6, 2, 1], [0, 1, 1]],
];
const OPERATION_SYMBOL = { '+': '+', '-': '-', '*': '\\cdot', '/': ':' };
const OPERATION_TEXT = { '+': '+', '-': '−', '*': '·', '/': ':' };

const buttonClass = active => `rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-border bg-background hover:border-indigo-500'}`;
const cardClass = 'rounded-xl border border-border bg-card p-4';
const power = (name, exponent) => (exponent === 1 ? name : `${name}^{${exponent}}`);
const wrapNegative = (latex, negative) => (negative ? `\\left(${latex}\\right)` : latex);
const wrapped = m => wrapNegative(monomialLatex(m), m.c.n < 0);
const pieces = m => mainPartText(m.x, m.y) || '1';

function Slider({ label, value, onChange, min, max }) {
  return (
    <label className="block text-sm font-bold">
      {label}: <strong>{value}</strong>
      <input className="mt-2 block w-full accent-indigo-700" type="range" aria-label={label} min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))} />
    </label>
  );
}

function MonomialInputs({ name, values, onChange }) {
  const [coefficient, x, y] = values;
  const set = index => value => onChange(values.map((old, i) => (i === index ? value : old)));
  return (
    <div className={`${cardClass} space-y-3`}>
      <Slider label={`Συντελεστής του ${name}`} value={coefficient} onChange={set(0)} min={-6} max={6} />
      <Slider label={`Εκθέτης του x στο ${name}`} value={x} onChange={set(1)} min={0} max={4} />
      <Slider label={`Εκθέτης του y στο ${name}`} value={y} onChange={set(2)} min={0} max={4} />
      <p className="text-lg font-bold">{name} = <MathText text={`$${monomialLatex(monomial(coefficient, 1, x, y))}$`} /></p>
    </div>
  );
}

function anatomyNote(m) {
  if (isZero(m)) return 'Με συντελεστή 0 ολόκληρο το γινόμενο είναι 0. Το μηδενικό μονώνυμο δεν έχει κύριο μέρος και δεν έχει βαθμό.';
  const notes = [];
  if (m.x + m.y === 0) notes.push('Χωρίς μεταβλητές έχουμε σταθερό μονώνυμο. Ο βαθμός του είναι 0.');
  else {
    if (m.c.d === 1 && Math.abs(m.c.n) === 1) notes.push(`Ο συντελεστής ${m.c.n === 1 ? '1' : '−1'} δεν γράφεται, αλλά υπάρχει.`);
    if (m.x === 1 || m.y === 1) notes.push('Ο εκθέτης 1 δεν γράφεται.');
    notes.push(`Ο βαθμός ως προς x και y είναι το άθροισμα των εκθετών: ${m.x}+${m.y}=${m.x + m.y}.`);
  }
  return notes.join(' ');
}

function relationText(a, b) {
  const mainA = mainPartLatex(a.x, a.y), mainB = mainPartLatex(b.x, b.y);
  const shared = mainA ? `το ίδιο κύριο μέρος $${mainA}$` : 'κανένα κύριο μέρος: είναι σταθερά μονώνυμα';
  return {
    zero: 'Ένα από τα δύο είναι το μηδενικό μονώνυμο. Η πρόσθεση ή η αφαίρεση του 0 δεν αλλάζει το άλλο μονώνυμο.',
    unlike: `Τα κύρια μέρη ${mainA ? `$${mainA}$` : '(κανένα)'} και ${mainB ? `$${mainB}$` : '(κανένα)'} διαφέρουν: τα Α και Β δεν είναι όμοια.`,
    like: `Τα Α και Β έχουν ${shared}. Είναι όμοια.`,
    equal: `Τα Α και Β έχουν ${shared} και ίσους συντελεστές. Είναι ίσα.`,
    opposite: `Τα Α και Β έχουν ${shared} και αντίθετους συντελεστές. Είναι αντίθετα.`,
  }[relation(a, b)];
}

function exponentStep(name, p, q, op) {
  if (p === 0 && q === 0) return null;
  if (op === '*') {
    if (p === 0 || q === 0) return `Το ${name} υπάρχει μόνο στο ${q === 0 ? 'Α' : 'Β'}: μεταφέρεται ως $${power(name, p + q)}$.`;
    return `Μεταβλητή ${name}: $${power(name, p)}\\cdot ${power(name, q)}=${name}^{${p}+${q}}=${power(name, p + q)}$. Οι εκθέτες προστίθενται.`;
  }
  if (q === 0) return `Το ${name} υπάρχει μόνο στο Α: μένει $${power(name, p)}$.`;
  if (p === 0) return `Το ${name} υπάρχει μόνο στο Β: μένει στον παρονομαστή ως $${power(name, q)}$.`;
  if (p === q) return `Μεταβλητή ${name}: $${power(name, p)}:${power(name, q)}=1$. Οι ίσες δυνάμεις απλοποιούνται.`;
  if (p > q) return `Μεταβλητή ${name}: $${power(name, p)}:${power(name, q)}=${name}^{${p}-${q}}=${power(name, p - q)}$. Οι εκθέτες αφαιρούνται.`;
  return `Μεταβλητή ${name}: $${power(name, p)}:${power(name, q)}=\\frac{1}{${power(name, q - p)}}$. Το ${name} μένει στον παρονομαστή.`;
}

function AreaModel({ a, b }) {
  const columns = Math.abs(a.c.n), rows = Math.abs(b.c.n);
  // Fixed drawing width keeps the label size steady for every coefficient.
  const cell = 384 / columns, height = 36;
  const product = pieces(multiplyMonomials(a, b));
  const negative = a.c.n < 0 || b.c.n < 0;
  return (
    <div className={cardClass}>
      <div className="mx-auto max-w-md">
        <svg viewBox={`0 0 ${columns * cell + 16} ${rows * height + 16}`} className="w-full" role="img" aria-label={`Ορθογώνιο με ${columns} στήλες και ${rows} γραμμές: ${columns * rows} κελιά ${product}`}>
          {Array.from({ length: rows }).flatMap((_, row) => Array.from({ length: columns }).map((__, column) => (
            <rect key={`${row}-${column}`} x={8 + column * cell} y={8 + row * height} width={cell} height={height} fill="#e0e7ff" stroke="#4338ca" strokeWidth="1.5" />
          )))}
          {Array.from({ length: rows }).flatMap((_, row) => Array.from({ length: columns }).map((__, column) => (
            <text key={`t${row}-${column}`} x={8 + column * cell + cell / 2} y={8 + row * height + height / 2 + 5} textAnchor="middle" fontSize="13" fill="#312e81">{product}</text>
          )))}
        </svg>
      </div>
      <p className="mt-3 text-base leading-relaxed">
        Το Α είναι {columns} φορές το {pieces(a)} και το Β είναι {rows} φορές το {pieces(b)}. Το ορθογώνιο έχει {columns}·{rows}={columns * rows} κελιά και κάθε κελί είναι {product}.
        {negative && ' Το σχήμα μετρά μόνο το πλήθος· το πρόσημο του γινομένου προκύπτει από τον κανόνα των προσήμων.'}
      </p>
    </div>
  );
}

export function MonomialExplorer() {
  const [mode, setMode] = useState(0);
  const [anatomy, setAnatomy] = useState([-3, 2, 2, 1]);
  const [a, setA] = useState(INITIAL.a), [b, setB] = useState(INITIAL.b);
  const [sumOp, setSumOp] = useState('+'), [productOp, setProductOp] = useState('*');
  const [shown, setShown] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);

  // Any change of the data hides the result, so the prediction always comes first.
  const changing = setter => value => { setter(value); setShown(false); };
  const preset = (first, second, operation) => { setA(first); setB(second); if (operation) setProductOp(operation); setShown(false); };

  const single = monomial(...anatomy);
  const singleDegree = degree(single);
  const A = monomial(a[0], 1, a[1], a[2]), B = monomial(b[0], 1, b[1], b[2]);
  const op = mode === 1 ? sumOp : productOp;
  const check = CHECK_VALUES[checkIndex];
  const valueA = evaluate(A, check.x, check.y), valueB = evaluate(B, check.x, check.y);
  const mistake = commonMistake(A, B, op);

  const sum = addMonomials(A, B, sumOp === '+' ? 1 : -1);
  const product = multiplyMonomials(A, B);
  const quotient = divideMonomials(A, B);
  const kind = relation(A, B);
  const expression = `${monomialLatex(A)}${OPERATION_SYMBOL[op]}${wrapped(B)}`;
  const mainA = mainPartLatex(A.x, A.y);

  let sumLine = '';
  if (sum.kind === 'sum') sumLine = sumLatex(A, B, sumOp === '+' ? 1 : -1);
  else if (kind === 'zero') sumLine = `${expression}=${monomialLatex(sum.value)}`;
  else sumLine = `${expression}=\\left(${A.c.n}${sumOp}${wrapNegative(B.c.n, B.c.n < 0)}\\right)${mainA}=${monomialLatex(sum.value)}`;

  const resultValue = mode === 1
    ? (sum.kind === 'monomial' ? evaluate(sum.value, check.x, check.y) : null)
    : productOp === '*' ? evaluate(product, check.x, check.y) : evaluateQuotient(quotient, check.x, check.y);
  const operationValue = op === '/' && isZero(B) ? null : rationalOperation(valueA, valueB, op);
  const mistakeValue = mistake ? evaluate(mistake.value, check.x, check.y) : null;
  const mistakeCoincides = Boolean(mistake) && mistakeValue.n === operationValue.n && mistakeValue.d === operationValue.d;
  const divisorVariables =['x', 'y'].filter((name, i) => [B.x, B.y][i] > 0);

  const productSteps = isZero(A) || isZero(B)
    ? ['Ένας παράγοντας είναι 0, άρα το γινόμενο είναι 0.']
    : [`Συντελεστές: $${wrapNegative(A.c.n, A.c.n < 0)}\\cdot${wrapNegative(B.c.n, B.c.n < 0)}=${product.c.n}$. Πολλαπλασιάζονται.`,
      exponentStep('x', A.x, B.x, '*'), exponentStep('y', A.y, B.y, '*')].filter(Boolean);
  const quotientSteps = isZero(A)
    ? ['Ο διαιρετέος είναι 0 και ο διαιρέτης δεν είναι 0, άρα το πηλίκο είναι 0.']
    : [`Συντελεστές: $${wrapNegative(A.c.n, A.c.n < 0)}:${wrapNegative(B.c.n, B.c.n < 0)}=${fractionLatex(rationalOperation(A.c, B.c, '/'))}$. Διαιρούνται.`,
      exponentStep('x', A.x, B.x, '/'), exponentStep('y', A.y, B.y, '/')].filter(Boolean);

  const checkBlock = (
    <div className={cardClass}>
      <h4 className="font-bold">Έλεγχος με αριθμητική τιμή</h4>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Τιμές για τον έλεγχο">
        {CHECK_VALUES.map((item, i) => (
          <button key={i} type="button" aria-pressed={checkIndex === i} className={buttonClass(checkIndex === i)} onClick={() => setCheckIndex(i)}>{`x=${item.x}, y=${item.y}`.replace(/-/g, '−')}</button>
        ))}
      </div>
      <p className="mt-3 text-base leading-relaxed">
        <MathText text={`Για $x=${check.x}$ και $y=${check.y}$: Α = $${fractionLatex(valueA)}$, Β = $${fractionLatex(valueB)}$, άρα Α${OPERATION_TEXT[op]}Β = $${fractionLatex(operationValue)}$.`} />
        {resultValue && <MathText text={` Το αποτέλεσμα δίνει $${fractionLatex(resultValue)}$: οι δύο τιμές συμφωνούν.`} />}
      </p>
      {mistake && (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-base leading-relaxed text-rose-900 dark:bg-rose-500/10 dark:text-rose-200">
          <MathText text={`**Συχνό λάθος:** $${monomialLatex(mistake.value)}$. ${mistake.reason} ${mistakeCoincides
            ? `Για αυτές τις τιμές δίνει τυχαία το ίδιο αποτέλεσμα, $${fractionLatex(mistakeValue)}$. Δοκίμασε άλλες τιμές.`
            : `Εδώ δίνει $${fractionLatex(mistakeValue)}$ αντί για $${fractionLatex(operationValue)}$.`}`} />
        </p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">Ένα αριθμητικό παράδειγμα μπορεί να αποκαλύψει λάθος, αλλά δεν αποδεικνύει την ισότητα. Την εξασφαλίζουν οι ιδιότητες των πράξεων.</p>
    </div>
  );

  const reveal = question => (
    <div className={cardClass}>
      <p className="text-base leading-relaxed"><strong>Πρόβλεψε πρώτα:</strong> {question}</p>
      <button type="button" aria-expanded={shown} className={`${buttonClass(shown)} mt-3`} onClick={() => setShown(value => !value)}>{shown ? 'Κρύψε το αποτέλεσμα' : 'Δείξε το αποτέλεσμα'}</button>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:via-card dark:to-sky-500/10">
      <header className="border-b border-indigo-200 p-4 sm:p-5 dark:border-indigo-500/30">
        <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-800 dark:text-indigo-300">Δυναμική διερεύνηση</div>
        <h3 className="mt-1 text-xl font-black">Εργαστήριο μονωνύμων</h3>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Άλλαξε συντελεστές και εκθέτες, πρόβλεψε το αποτέλεσμα και έλεγξέ το με αριθμητικές τιμές. Οι συντελεστές υπολογίζονται ακριβώς, ως κλάσματα.</p>
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Επιλογή διερεύνησης">
          {MODES.map((name, i) => <button type="button" key={name} aria-pressed={mode === i} onClick={() => { setMode(i); setShown(false); }} className={buttonClass(mode === i)}>{name}</button>)}
        </div>

        {mode === 0 && <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className={`${cardClass} space-y-3`}>
              <Slider label="Αριθμητής συντελεστή" value={anatomy[0]} onChange={v => setAnatomy([v, anatomy[1], anatomy[2], anatomy[3]])} min={-6} max={6} />
              <Slider label="Παρονομαστής συντελεστή" value={anatomy[1]} onChange={v => setAnatomy([anatomy[0], v, anatomy[2], anatomy[3]])} min={1} max={4} />
            </div>
            <div className={`${cardClass} space-y-3`}>
              <Slider label="Εκθέτης του x" value={anatomy[2]} onChange={v => setAnatomy([anatomy[0], anatomy[1], v, anatomy[3]])} min={0} max={4} />
              <Slider label="Εκθέτης του y" value={anatomy[3]} onChange={v => setAnatomy([anatomy[0], anatomy[1], anatomy[2], v])} min={0} max={4} />
            </div>
          </div>
          <div className="rounded-xl bg-card p-4 text-center" role="status" aria-live="polite">
            <MathText className="text-2xl font-bold" text={`$$${monomialLatex(single)}$$`} />
            <p className="mt-2 text-base text-muted-foreground"><MathText text={`Ως γινόμενο: $${expandedLatex(single)}$`} /></p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Συντελεστής', `$${fractionLatex(single.c)}$`],
              ['Κύριο μέρος', mainPartLatex(single.x, single.y) ? `$${mainPartLatex(single.x, single.y)}$` : 'Δεν υπάρχει'],
              ['Βαθμός ως προς x', singleDegree ? String(singleDegree.x) : 'Δεν ορίζεται'],
              ['Βαθμός ως προς y', singleDegree ? String(singleDegree.y) : 'Δεν ορίζεται'],
              ['Βαθμός ως προς x και y', singleDegree ? String(singleDegree.total) : 'Δεν ορίζεται'],
            ].map(([term, value]) => (
              <div key={term} className={cardClass}>
                <dt className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{term}</dt>
                <dd className="mt-1 text-lg font-bold"><MathText text={value} /></dd>
              </div>
            ))}
          </dl>
          <p className="rounded-xl bg-card p-4 text-base leading-relaxed">{anatomyNote(single)}</p>
          <div className="flex flex-wrap gap-2">
            {ANATOMY_PRESETS.map(([label, values]) => <button key={label} type="button" className={buttonClass(false)} onClick={() => setAnatomy(values)}>{label}</button>)}
          </div>
        </>}

        {mode !== 0 && <>
          <div className="grid gap-5 sm:grid-cols-2">
            <MonomialInputs name="Α" values={a} onChange={changing(setA)} />
            <MonomialInputs name="Β" values={b} onChange={changing(setB)} />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Πράξη">
            {(mode === 1 ? [['+', 'Πρόσθεση'], ['-', 'Αφαίρεση']] : [['*', 'Πολλαπλασιασμός'], ['/', 'Διαίρεση']]).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={op === value} className={buttonClass(op === value)} onClick={() => changing(mode === 1 ? setSumOp : setProductOp)(value)}>{label}</button>
            ))}
          </div>
        </>}

        {mode === 1 && <>
          <div className={`${cardClass} overflow-x-auto`}>
            <table className="w-full text-left text-base">
              <caption className="sr-only">Σύγκριση των εκθετών των Α και Β</caption>
              <thead><tr className="text-sm text-muted-foreground"><th scope="col" className="py-1 pr-3">Σύγκριση</th><th scope="col" className="px-3">Α</th><th scope="col" className="px-3">Β</th><th scope="col" className="pl-3">Συμπέρασμα</th></tr></thead>
              <tbody>
                {[['Εκθέτης του x', A.x, B.x], ['Εκθέτης του y', A.y, B.y]].map(([label, p, q]) => (
                  <tr key={label} className="border-t border-border"><th scope="row" className="py-2 pr-3 font-semibold">{label}</th><td className="px-3">{p}</td><td className="px-3">{q}</td><td className="pl-3 font-bold">{p === q ? 'ίδιος' : 'διαφορετικός'}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-base leading-relaxed" role="status" aria-live="polite"><MathText text={relationText(A, B)} /></p>
          </div>
          {reveal(`γράφεται το Α${sumOp === '+' ? '+' : '−'}Β ως ένα μονώνυμο; Αν ναι, ποιο;`)}
          {shown && <>
            <div className="rounded-xl bg-card p-4 text-center" role="status" aria-live="polite">
              <MathText className="text-xl font-bold" text={`$$${sumLine}$$`} />
              <p className="mt-2 text-base leading-relaxed">
                {sum.kind === 'sum' ? 'Τα μονώνυμα δεν είναι όμοια. Το αποτέλεσμα δεν είναι μονώνυμο και μένει όπως είναι: δεν γίνεται αναγωγή.'
                  : kind === 'zero' ? 'Το 0 δεν αλλάζει το αποτέλεσμα.'
                    : `${sumOp === '+' ? 'Προσθέτουμε' : 'Αφαιρούμε'} τους συντελεστές. Το κύριο μέρος και οι εκθέτες μένουν ίδια.`}
              </p>
            </div>
            {checkBlock}
          </>}
          <div className="flex flex-wrap gap-2">
            {SUM_PRESETS.map(([label, first, second]) => <button key={label} type="button" className={buttonClass(false)} onClick={() => preset(first, second)}>{label}</button>)}
          </div>
        </>}

        {mode === 2 && <>
          {reveal(productOp === '*' ? 'ποιος είναι ο συντελεστής και ποιοι οι εκθέτες του γινομένου Α·Β;' : 'είναι το πηλίκο Α:Β μονώνυμο; Ποιος είναι ο συντελεστής του;')}
          {shown && <>
            <div className={cardClass} role="status" aria-live="polite">
              {productOp === '/' && isZero(B)
                ? <p className="text-base font-bold text-rose-700 dark:text-rose-300">Ο διαιρέτης Β είναι 0. Η διαίρεση δεν ορίζεται.</p>
                : <>
                  <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed">
                    {(productOp === '*' ? productSteps : quotientSteps).map(step => <li key={step}><MathText text={step} /></li>)}
                  </ol>
                  <MathText className="mt-3 block text-center text-xl font-bold" text={`$$${expression}=${productOp === '*' ? monomialLatex(product) : quotientLatex(quotient)}$$`} />
                  {productOp === '/' && <p className="mt-2 text-base leading-relaxed">
                    {quotient.kind === 'monomial' ? 'Το πηλίκο είναι μονώνυμο.' : 'Το πηλίκο δεν είναι μονώνυμο: μένει μεταβλητή στον παρονομαστή.'}
                    {divisorVariables.length > 0 && ` Προϋπόθεση: ${divisorVariables.map(name => `${name}≠0`).join(' και ')}.`}
                  </p>}
                </>}
            </div>
            {productOp === '*' && !isZero(A) && !isZero(B) && <AreaModel a={A} b={B} />}
            {!(productOp === '/' && isZero(B)) && checkBlock}
          </>}
          <div className="flex flex-wrap gap-2">
            {PRODUCT_PRESETS.map(([label, first, second]) => <button key={label} type="button" className={buttonClass(false)} onClick={() => preset(first, second, '/')}>{label}</button>)}
            <button type="button" className={buttonClass(false)} onClick={() => preset(INITIAL.a, INITIAL.b, '*')}>Αρχικά δεδομένα</button>
          </div>
        </>}
      </div>
    </section>
  );
}
