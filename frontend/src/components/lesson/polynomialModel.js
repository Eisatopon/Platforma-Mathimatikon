// Exact model for polynomials in x with integer coefficients.
// A polynomial is an array of coefficients indexed by the power of x; the zero polynomial is [].

export function polynomial(coefficients) {
  if (!Array.isArray(coefficients) || !coefficients.every(Number.isSafeInteger)) return null;
  const trimmed = [...coefficients];
  while (trimmed.length && trimmed[trimmed.length - 1] === 0) trimmed.pop();
  return trimmed;
}
// Builds a polynomial from terms given in any order, e.g. [[3, 2], [-2, 1]] for 3x^2 - 2x.
export function fromTerms(terms) {
  const size = terms.reduce((max, [, power]) => Math.max(max, power + 1), 0);
  const coefficients = Array(size).fill(0);
  terms.forEach(([coefficient, power]) => { coefficients[power] += coefficient; });
  return polynomial(coefficients);
}
export const isZero = p => p.length === 0;
export const degree = p => (isZero(p) ? null : p.length - 1);
export const constantTerm = p => p[0] || 0;
// Non-zero terms as [coefficient, power], highest power first.
export function terms(p) {
  return p.map((coefficient, power) => [coefficient, power]).filter(([coefficient]) => coefficient !== 0).reverse();
}

const variablePart = power => (power === 0 ? '' : power === 1 ? 'x' : `x^{${power}}`);
// A single term without its sign, e.g. 3x^{2}, x, 5.
function magnitudeLatex(coefficient, power) {
  const size = Math.abs(coefficient);
  return power === 0 ? String(size) : (size === 1 ? '' : size) + variablePart(power);
}
export function termLatex(coefficient, power) {
  return coefficient === 0 ? '0' : (coefficient < 0 ? '-' : '') + magnitudeLatex(coefficient, power);
}
// Writes terms in the given order with the usual sign conventions.
export function expressionLatex(termList) {
  const shown = termList.filter(([coefficient]) => coefficient !== 0);
  if (!shown.length) return '0';
  return shown.map(([coefficient, power], index) => {
    const sign = coefficient < 0 ? '-' : index === 0 ? '' : '+';
    return sign + magnitudeLatex(coefficient, power);
  }).join('');
}
export const polynomialLatex = p => expressionLatex(terms(p));

export function add(p, q) {
  return polynomial(Array.from({ length: Math.max(p.length, q.length) }, (_, power) => (p[power] || 0) + (q[power] || 0)));
}
export const negate = p => p.map(coefficient => (coefficient === 0 ? 0 : -coefficient));
export const subtract = (p, q) => add(p, negate(q));

export function evaluate(p, x) {
  return p.reduceRight((value, coefficient) => value * x + coefficient, 0);
}
// The substitution written out, with a negative value in parentheses: 2\cdot(-1)^{2}-3\cdot(-1)+5.
export function substitutionLatex(p, x) {
  if (isZero(p)) return '0';
  const value = x < 0 ? `(${x})` : String(x);
  return terms(p).map(([coefficient, power], index) => {
    const sign = coefficient < 0 ? '-' : index === 0 ? '' : '+';
    const size = Math.abs(coefficient);
    if (power === 0) return sign + size;
    const base = power === 1 ? value : `${value}^{${power}}`;
    return sign + (size === 1 ? base : `${size}\\cdot${base}`);
  }).join('');
}
// The value of every term, ready to be added: 2-(-3)+5 is shown as 2+3+5.
export function termValuesLatex(p, x) {
  const values = terms(p).map(([coefficient, power]) => coefficient * x ** power);
  if (!values.length) return '0';
  return values.map((value, index) => (value < 0 ? '-' : index === 0 ? '' : '+') + Math.abs(value)).join('');
}

// Groups like terms of an unsorted expression, highest power first.
export function groupLikeTerms(termList) {
  const powers = [...new Set(termList.map(([, power]) => power))].sort((a, b) => b - a);
  return powers.map(power => {
    const coefficients = termList.filter(([, p]) => p === power).map(([coefficient]) => coefficient);
    return { power, coefficients, sum: coefficients.reduce((total, value) => total + value, 0) };
  });
}
export function groupedLatex(termList) {
  return groupLikeTerms(termList).map((group, index) => {
    const inner = expressionLatex(group.coefficients.map(coefficient => [coefficient, group.power]));
    if (group.coefficients.length === 1) return (index > 0 && !inner.startsWith('-') ? '+' : '') + inner;
    return `${index > 0 ? '+' : ''}\\left(${inner}\\right)`;
  }).join('');
}
// The reduction written out: the coefficients of every group are added, the variable part stays.
export function coefficientSumsLatex(termList) {
  return groupLikeTerms(termList).map((group, index) => {
    if (group.coefficients.length === 1) {
      const single = expressionLatex([[group.coefficients[0], group.power]]);
      return (index > 0 && !single.startsWith('-') ? '+' : '') + single;
    }
    const sum = group.coefficients.map((coefficient, i) => (coefficient < 0 ? '-' : i === 0 ? '' : '+') + Math.abs(coefficient)).join('');
    return `${index > 0 ? '+' : ''}\\left(${sum}\\right)${variablePart(group.power)}`;
  }).join('');
}

// The parentheses removed: every term of q keeps (sign = 1) or changes (sign = -1) its sign.
export function openedLatex(p, q, sign = 1) {
  return expressionLatex([...terms(p), ...terms(q).map(([coefficient, power]) => [sign * coefficient, power])]);
}
// The typical subtraction error: only the first term of q changes sign. Null when it is not an error.
export function firstTermOnlyMistake(p, q) {
  const [first, ...rest] = terms(q);
  if (!first || !rest.length) return null;
  return add(p, fromTerms([[-first[0], first[1]], ...rest]));
}

export const REDUCTION_EXAMPLES = [
  { label: 'Ανακατεμένοι όροι', terms: [[3, 2], [-2, 1], [5, 0], [1, 1], [-4, 2], [1, 3], [-1, 0]] },
  { label: 'Ο βαθμός πέφτει', terms: [[1, 3], [2, 1], [4, 0], [-1, 3], [3, 1]] },
  { label: 'Όλα απαλείφονται', terms: [[2, 1], [-3, 0], [3, 0], [-2, 1]] },
  { label: 'Τέσσερις ομάδες', terms: [[5, 0], [-1, 2], [4, 3], [2, 2], [-6, 1], [1, 3], [1, 1], [-2, 0]] },
];
export const CHECK_VALUES = [2, -1, 3];
