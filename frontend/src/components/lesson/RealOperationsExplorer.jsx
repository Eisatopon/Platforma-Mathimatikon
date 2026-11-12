import { useState } from 'react';
import { MathText } from '@/components/MathText';
import { fraction, rationalOperation, fractionLatex, powerComparison, PRIORITY_EXAMPLES } from './realOperationsModel';

const MODES = ['Πρόσημα και κλάσματα', 'Δυνάμεις και παρενθέσεις', 'Σειρά πράξεων'];
const buttonClass = active => `rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? 'border-teal-700 bg-teal-700 text-white' : 'border-border bg-background hover:border-teal-600'}`;
const fmt = v => Number(v).toLocaleString('el-GR', { maximumFractionDigits: 3 });
const symbols = { '+': '+', '-': '-', '*': '\\cdot', '/': '\\div' };

export function RealOperationsExplorer() {
  const [mode, setMode] = useState(0);
  const [an, setAn] = useState(-3), [ad, setAd] = useState(2);
  const [bn, setBn] = useState(5), [bd, setBd] = useState(2);
  const [op, setOp] = useState('+');
  const [magnitude, setMagnitude] = useState(3), [exponent, setExponent] = useState(2);
  const [example, setExample] = useState(0), [step, setStep] = useState(0);
  const a = fraction(an, ad), b = fraction(bn, bd), result = rationalOperation(a, b, op);
  const av = a.n / a.d, bv = b.n / b.d;
  const displacement = op === '+' ? bv : -bv;
  const endpoint = av + displacement;
  const x = v => 300 + 20 * v;
  const powers = powerComparison(magnitude, exponent);
  const chosen = PRIORITY_EXAMPLES[example];
  const control = (label, value, setter, min, max) => <label className="block text-sm font-bold">{label}: <strong>{value}</strong><input className="mt-2 block w-full accent-teal-700" type="range" aria-label={label} min={min} max={max} value={value} onChange={e => setter(Number(e.target.value))}/></label>;
  const preset = (na, da, nb, db, operation) => { setAn(na); setAd(da); setBn(nb); setBd(db); setOp(operation); };
  return <section className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:border-teal-500/30 dark:from-teal-500/10 dark:via-card dark:to-cyan-500/10">
    <header className="border-b border-teal-200 p-4 sm:p-5 dark:border-teal-500/30"><div className="text-xs font-extrabold uppercase tracking-widest text-teal-800 dark:text-teal-300">Δυναμική διερεύνηση</div><h3 className="mt-1 text-xl font-black">Εργαστήριο πραγματικών αριθμών</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Πρόβλεψε το αποτέλεσμα, άλλαξε τα δεδομένα και εξήγησε τον κανόνα που παρατηρείς. Τα κλάσματα υπολογίζονται ακριβώς· οι δεκαδικές ενδείξεις του άξονα είναι προσεγγίσεις.</p></header>
    <div className="space-y-5 p-4 sm:p-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Επιλογή διερεύνησης">{MODES.map((name, i) => <button type="button" key={name} aria-pressed={mode === i} onClick={() => setMode(i)} className={buttonClass(mode === i)}>{name}</button>)}</div>
      {mode === 0 && <>
        <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-3 rounded-xl border border-border bg-card p-4">{control('Αριθμητής α', an, setAn, -6, 6)}{control('Παρονομαστής α', ad, setAd, 1, 4)}<MathText text={`$\\alpha=${fractionLatex(a)}$`}/></div><div className="space-y-3 rounded-xl border border-border bg-card p-4">{control('Αριθμητής β', bn, setBn, -6, 6)}{control('Παρονομαστής β', bd, setBd, 1, 4)}<MathText text={`$\\beta=${fractionLatex(b)}$`}/></div></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Πράξη">{[['+', 'Πρόσθεση'], ['-', 'Αφαίρεση'], ['*', 'Πολλαπλασιασμός'], ['/', 'Διαίρεση']].map(([value, label]) => <button key={value} type="button" aria-pressed={op === value} className={buttonClass(op === value)} onClick={() => setOp(value)}>{label}</button>)}</div>
        <div className="rounded-xl bg-card p-4 text-center text-xl font-bold" role="status" aria-live="polite"><MathText text={`$$\\left(${fractionLatex(a)}\\right)${symbols[op]}\\left(${fractionLatex(b)}\\right)${result ? `=${fractionLatex(result)}` : ''}$$`}/>{!result && <p className="mt-2 text-base text-rose-700 dark:text-rose-300">Η διαίρεση δεν ορίζεται.</p>}</div>
        {(op === '+' || op === '-') ? <div className="rounded-xl border border-border bg-card p-3"><svg viewBox="0 0 600 150" className="w-full" role="img" aria-label={`Από το 0 στο ${fmt(av)} και μετατόπιση ${fmt(displacement)} προς το ${fmt(endpoint)}`}>
          <line x1="30" y1="100" x2="570" y2="100" stroke="currentColor" strokeWidth="2"/>
          {[-12, -9, -6, -3, 0, 3, 6, 9, 12].map(v => <g key={v}><line x1={x(v)} y1="95" x2={x(v)} y2="105" stroke="currentColor"/><text x={x(v)} y="125" textAnchor="middle" fill="currentColor" fontSize="14">{v}</text></g>)}
          <line x1={x(0)} y1="72" x2={x(av)} y2="72" stroke="#2563eb" strokeWidth="4"/><circle cx={x(av)} cy="72" r="5" fill="#2563eb"/>
          <line x1={x(av)} y1="42" x2={x(endpoint)} y2="42" stroke="#0f766e" strokeWidth="4"/>
          {displacement !== 0 && <path d={`M ${x(endpoint) - Math.sign(displacement) * 8} 36 L ${x(endpoint)} 42 L ${x(endpoint) - Math.sign(displacement) * 8} 48`} fill="none" stroke="#0f766e" strokeWidth="3"/>}
          <line x1={x(endpoint)} y1="42" x2={x(endpoint)} y2="100" stroke="#0f766e" strokeDasharray="4 4"/><text x={x(endpoint)} y="25" textAnchor="middle" fill="currentColor" fontSize="15">{fmt(endpoint)}</text>
        </svg><p className="text-base leading-relaxed">Μπλε: η θέση του α. Πράσινο: {op === '+' ? 'προσθέτουμε τον β' : 'αφαιρούμε τον β, δηλαδή προσθέτουμε τον αντίθετό του'}. Η δεύτερη κίνηση είναι {displacement > 0 ? 'προς τα δεξιά' : displacement < 0 ? 'προς τα αριστερά' : 'μηδενική'}.</p></div> : <p className="rounded-xl bg-card p-4 text-base leading-relaxed">{!result ? 'Διαίρεση με το μηδέν δεν ορίζεται, ακόμη και όταν ο διαιρετέος είναι μηδέν.' : result.n === 0 ? 'Το αποτέλεσμα είναι μηδέν. Στον πολλαπλασιασμό αρκεί ένας μηδενικός παράγοντας· στη διαίρεση ο διαιρέτης πρέπει να είναι μη μηδενικός.' : `${op === '*' ? 'Στο γινόμενο' : 'Στο πηλίκο'} δύο μη μηδενικών αριθμών, τα ίδια πρόσημα δίνουν θετικό και τα διαφορετικά αρνητικό αποτέλεσμα. ${op === '/' ? 'Πολλαπλασιάζουμε τον α με τον αντίστροφο του β.' : 'Πολλαπλασιάζουμε αριθμητές και παρονομαστές και απλοποιούμε.'}`}</p>}
        <div className="flex flex-wrap gap-2"><button type="button" className={buttonClass(false)} onClick={() => preset(-3, 2, -1, 2, '-')}>Αφαίρεση αρνητικού</button><button type="button" className={buttonClass(false)} onClick={() => preset(-3, 2, 0, 1, '/')}>Διαίρεση με μηδέν</button><button type="button" className={buttonClass(false)} onClick={() => preset(-3, 2, 5, 2, '+')}>Αρχικά δεδομένα</button></div>
      </>}
      {mode === 1 && <>
        <div className="grid gap-4 sm:grid-cols-2">{control('Θετικός αριθμός α', magnitude, setMagnitude, 1, 5)}{control('Θετικός ακέραιος εκθέτης ν', exponent, setExponent, 1, 5)}</div>
        <div className="grid gap-3 sm:grid-cols-2" role="status" aria-live="polite"><div className="rounded-xl border border-border bg-card p-4"><h4 className="mb-3 font-bold">Βάση ο αρνητικός αριθμός</h4><MathText text={`$$(-${magnitude})^{${exponent}}=${powers.withParentheses}$$`}/></div><div className="rounded-xl border border-border bg-card p-4"><h4 className="mb-3 font-bold">Πρώτα δύναμη, έπειτα αντίθετος</h4><MathText text={`$$-${magnitude}^{${exponent}}=-(${magnitude}^{${exponent}})=${powers.withoutParentheses}$$`}/></div></div>
        <p className="rounded-xl bg-card p-4 text-base leading-relaxed">{exponent % 2 === 0 ? 'Ο εκθέτης είναι άρτιος: το τετράγωνο ή η άρτια δύναμη αρνητικού είναι θετική, ενώ το μείον έξω από τη δύναμη παραμένει. Οι δύο τιμές διαφέρουν.' : 'Ο εκθέτης είναι περιττός: και οι δύο τιμές είναι αρνητικές και εδώ συμπίπτουν. Οι παραστάσεις όμως εξακολουθούν να έχουν διαφορετική βάση.'} Δοκίμασε διαδοχικά ν=2 και ν=3.</p>
      </>}
      {mode === 2 && <>
        <div className="flex flex-wrap gap-2">{PRIORITY_EXAMPLES.map((item, i) => <button key={item.label} type="button" className={buttonClass(example === i)} aria-pressed={example === i} onClick={() => { setExample(i); setStep(0); }}>{item.label}</button>)}</div>
        <div className="rounded-xl border border-border bg-card p-4"><MathText className="text-xl" text={`$$${chosen.expression}$$`}/><p className="mt-3 text-base">Πριν εμφανίσεις τα βήματα, γράψε ποια πράξη θα κάνεις πρώτη και πρόβλεψε το πρόσημο.</p><ol className="mt-4 space-y-3" aria-live="polite">{chosen.steps.slice(0, step).map(([label, expression], i) => <li key={i} className="rounded-xl bg-secondary p-3"><strong>{i + 1}. {label}</strong><MathText text={`$$${expression}$$`}/></li>)}</ol><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={step === chosen.steps.length} className={`${buttonClass(true)} disabled:opacity-40`} onClick={() => setStep(s => Math.min(s + 1, chosen.steps.length))}>Εμφάνισε επόμενο βήμα</button><button type="button" className={buttonClass(false)} onClick={() => setStep(0)}>Δοκίμασε ξανά</button></div></div>
      </>}
    </div>
  </section>;
}
