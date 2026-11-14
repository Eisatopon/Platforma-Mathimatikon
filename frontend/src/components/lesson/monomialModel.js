// Exact model for monomials in the two variables x and y with rational coefficients.
import { fraction, rationalOperation, fractionLatex } from './realOperationsModel';

const SUPERSCRIPTS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const isNatural = value => Number.isSafeInteger(value) && value >= 0;
const superscript = n => String(n).split('').map(digit => SUPERSCRIPTS[Number(digit)]).join('');

// The zero monomial is stored without variables: it has no main part and no degree.
export function monomial(numerator, denominator = 1, x = 0, y = 0) {
  const c = fraction(numerator, denominator);
  if (!c || !isNatural(x) || !isNatural(y)) return null;
  return c.n === 0 ? { c, x: 0, y: 0 } : { c, x, y };
}
const fromFraction = (c, x, y) => (c ? monomial(c.n, c.d, x, y) : null);
export const isZero = m => m.c.n === 0;

export function mainPartLatex(x, y) {
  const power = (name, e) => (e === 0 ? '' : e === 1 ? name : `${name}^{${e}}`);
  return power('x', x) + power('y', y);
}
export function mainPartText(x, y) {
  const power = (name, e) => (e === 0 ? '' : e === 1 ? name : name + superscript(e));
  return power('x', x) + power('y', y);
}
export function monomialLatex(m) {
  const main = mainPartLatex(m.x, m.y);
  if (isZero(m) || !main) return fractionLatex(m.c);
  if (m.c.d === 1 && Math.abs(m.c.n) === 1) return (m.c.n < 0 ? '-' : '') + main;
  return fractionLatex(m.c) + main;
}
// Writes the monomial as the product it abbreviates, e.g. -3·x·x·y.
export function expandedLatex(m) {
  const factors = [...Array(m.x).fill('x'), ...Array(m.y).fill('y')];
  if (isZero(m) || !factors.length) return fractionLatex(m.c);
  const coefficient = m.c.n < 0 ? `\\left(${fractionLatex(m.c)}\\right)` : fractionLatex(m.c);
  return [coefficient, ...factors].join('\\cdot ');
}
export function degree(m) {
  return isZero(m) ? null : { x: m.x, y: m.y, total: m.x + m.y };
}

// 'zero' when either monomial is 0, otherwise equal / opposite / like / unlike.
export function relation(a, b) {
  if (isZero(a) || isZero(b)) return 'zero';
  if (a.x !== b.x || a.y !== b.y) return 'unlike';
  if (a.c.n === b.c.n && a.c.d === b.c.d) return 'equal';
  if (a.c.n === -b.c.n && a.c.d === b.c.d) return 'opposite';
  return 'like';
}
// sign = 1 adds, sign = -1 subtracts. Unlike monomials do not combine into one monomial.
export function addMonomials(a, b, sign = 1) {
  const kind = relation(a, b);
  if (kind === 'unlike') return { kind: 'sum' };
  const c = rationalOperation(a.c, b.c, sign === 1 ? '+' : '-');
  const source = isZero(a) ? b : a;
  return { kind: 'monomial', value: fromFraction(c, source.x, source.y) };
}
export function sumLatex(a, b, sign = 1) {
  const second = monomialLatex(b);
  const wrapped = b.c.n < 0 ? `\\left(${second}\\right)` : second;
  return `${monomialLatex(a)}${sign === 1 ? '+' : '-'}${wrapped}`;
}
export function multiplyMonomials(a, b) {
  return fromFraction(rationalOperation(a.c, b.c, '*'), a.x + b.x, a.y + b.y);
}
// The quotient is a monomial only when no variable is left in the denominator.
export function divideMonomials(a, b) {
  if (isZero(b)) return { kind: 'undefined' };
  const c = rationalOperation(a.c, b.c, '/');
  if (isZero(a)) return { kind: 'monomial', value: monomial(0) };
  if (a.x >= b.x && a.y >= b.y) return { kind: 'monomial', value: fromFraction(c, a.x - b.x, a.y - b.y) };
  return {
    kind: 'fraction', c,
    numerator: { x: Math.max(a.x - b.x, 0), y: Math.max(a.y - b.y, 0) },
    denominator: { x: Math.max(b.x - a.x, 0), y: Math.max(b.y - a.y, 0) },
  };
}
export function quotientLatex(q) {
  if (q.kind === 'undefined') return '\\text{Δεν ορίζεται}';
  if (q.kind === 'monomial') return monomialLatex(q.value);
  const top = mainPartLatex(q.numerator.x, q.numerator.y);
  const bottom = mainPartLatex(q.denominator.x, q.denominator.y);
  const magnitude = Math.abs(q.c.n);
  const numerator = top ? (magnitude === 1 ? '' : magnitude) + top : String(magnitude);
  const denominator = (q.c.d === 1 ? '' : q.c.d) + bottom;
  return `${q.c.n < 0 ? '-' : ''}\\frac{${numerator}}{${denominator}}`;
}

const integerPower = (base, exponent) => Array(exponent).fill(base).reduce((product, value) => product * value, 1);
// Exact value for integer x and y.
export function evaluate(m, xValue, yValue) {
  return fraction(m.c.n * integerPower(xValue, m.x) * integerPower(yValue, m.y), m.c.d);
}
export function evaluateQuotient(q, xValue, yValue) {
  if (q.kind === 'undefined') return null;
  if (q.kind === 'monomial') return evaluate(q.value, xValue, yValue);
  const top = fraction(q.c.n * integerPower(xValue, q.numerator.x) * integerPower(yValue, q.numerator.y), q.c.d);
  const bottom = fraction(integerPower(xValue, q.denominator.x) * integerPower(yValue, q.denominator.y), 1);
  return rationalOperation(top, bottom, '/');
}

// A typical wrong answer for the operation, or null when it coincides with the correct result.
export function commonMistake(a, b, op) {
  if (isZero(a) || isZero(b)) return null;
  const same = (m, n) => m.x === n.x && m.y === n.y && m.c.n === n.c.n && m.c.d === n.c.d;
  if (op === '+' || op === '-') {
    if (relation(a, b) === 'unlike') return null;
    const correct = addMonomials(a, b, op === '+' ? 1 : -1).value;
    const wrong = fromFraction(rationalOperation(a.c, b.c, op), a.x + b.x, a.y + b.y);
    if (isZero(wrong) || same(wrong, correct)) return null;
    return { value: wrong, reason: 'Προστέθηκαν και οι εκθέτες, ενώ το κύριο μέρος πρέπει να μείνει ίδιο.' };
  }
  if (op === '*') {
    const correct = multiplyMonomials(a, b);
    const multiplied = fromFraction(rationalOperation(a.c, b.c, '*'), a.x * b.x, a.y * b.y);
    if (!same(multiplied, correct)) return { value: multiplied, reason: 'Πολλαπλασιάστηκαν οι εκθέτες, ενώ στο γινόμενο προστίθενται.' };
    const added = fromFraction(rationalOperation(a.c, b.c, '+'), a.x + b.x, a.y + b.y);
    if (!isZero(added) && !same(added, correct)) return { value: added, reason: 'Προστέθηκαν οι συντελεστές, ενώ στο γινόμενο πολλαπλασιάζονται.' };
  }
  return null;
}

export const CHECK_VALUES = [{ x: 2, y: 3 }, { x: -1, y: 2 }, { x: 3, y: -2 }];
