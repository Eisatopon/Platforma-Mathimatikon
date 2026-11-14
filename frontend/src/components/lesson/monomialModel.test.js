import { fraction, rationalOperation } from './realOperationsModel';
import {
  monomial, isZero, mainPartLatex, mainPartText, monomialLatex, expandedLatex, degree, relation,
  addMonomials, sumLatex, multiplyMonomials, divideMonomials, quotientLatex, evaluate, evaluateQuotient,
  commonMistake, CHECK_VALUES,
} from './monomialModel';

const same = (p, q) => p.n === q.n && p.d === q.d;
const COEFFICIENTS = [-6, -3, -1, 0, 1, 2, 5];
const EXPONENTS = [0, 1, 2, 4];
const ALL = COEFFICIENTS.flatMap(c => EXPONENTS.flatMap(x => EXPONENTS.map(y => monomial(c, 1, x, y))));

test('rejects invalid input and normalises the zero monomial', () => {
  expect(monomial(1, 0, 1, 1)).toBeNull();
  expect(monomial(1, 1, -1, 0)).toBeNull();
  expect(monomial(1, 1, 1.5, 0)).toBeNull();
  expect(monomial(0, 3, 2, 1)).toEqual({ c: { n: 0, d: 1 }, x: 0, y: 0 });
  expect(isZero(monomial(0, 1, 4, 4))).toBe(true);
  expect(degree(monomial(0, 1, 2, 1))).toBeNull();
});

test('writes coefficient, main part and degree with the usual conventions', () => {
  expect(monomialLatex(monomial(3, 1, 2, 1))).toBe('3x^{2}y');
  expect(monomialLatex(monomial(-1, 1, 2, 1))).toBe('-x^{2}y');
  expect(monomialLatex(monomial(1, 1, 1, 0))).toBe('x');
  expect(monomialLatex(monomial(-3, 2, 0, 3))).toBe('-\\frac{3}{2}y^{3}');
  expect(monomialLatex(monomial(5, 1, 0, 0))).toBe('5');
  expect(monomialLatex(monomial(-1, 1, 0, 0))).toBe('-1');
  expect(monomialLatex(monomial(0, 1, 3, 3))).toBe('0');
  expect(mainPartLatex(0, 0)).toBe('');
  expect(mainPartText(2, 1)).toBe('x²y');
  expect(mainPartText(1, 4)).toBe('xy⁴');
  expect(expandedLatex(monomial(-3, 1, 2, 1))).toBe('\\left(-3\\right)\\cdot x\\cdot x\\cdot y');
  expect(expandedLatex(monomial(4, 1, 0, 0))).toBe('4');
  expect(degree(monomial(-4, 1, 2, 1))).toEqual({ x: 2, y: 1, total: 3 });
  expect(degree(monomial(7, 1, 0, 0))).toEqual({ x: 0, y: 0, total: 0 });
});

test('classifies pairs of monomials', () => {
  expect(relation(monomial(3, 1, 2, 1), monomial(-5, 1, 2, 1))).toBe('like');
  expect(relation(monomial(3, 1, 2, 1), monomial(3, 1, 1, 2))).toBe('unlike');
  expect(relation(monomial(3, 1, 2, 1), monomial(6, 2, 2, 1))).toBe('equal');
  expect(relation(monomial(3, 1, 2, 1), monomial(-3, 1, 2, 1))).toBe('opposite');
  expect(relation(monomial(0, 1, 2, 1), monomial(-3, 1, 2, 1))).toBe('zero');
});

test('addition and subtraction combine only like monomials and agree with numeric values', () => {
  for (const a of ALL) for (const b of ALL) for (const sign of [1, -1]) {
    const result = addMonomials(a, b, sign);
    const kind = relation(a, b);
    expect(result.kind).toBe(kind === 'unlike' ? 'sum' : 'monomial');
    if (result.kind !== 'monomial') continue;
    for (const { x, y } of CHECK_VALUES) {
      const expected = rationalOperation(evaluate(a, x, y), evaluate(b, x, y), sign === 1 ? '+' : '-');
      expect(same(evaluate(result.value, x, y), expected)).toBe(true);
    }
    if (kind === 'opposite' && sign === 1) expect(isZero(result.value)).toBe(true);
    if (kind === 'equal' && sign === -1) expect(isZero(result.value)).toBe(true);
  }
  expect(monomialLatex(addMonomials(monomial(3, 1, 2, 0), monomial(2, 1, 2, 0)).value)).toBe('5x^{2}');
  expect(sumLatex(monomial(3, 1, 2, 0), monomial(-2, 1, 1, 0), 1)).toBe('3x^{2}+\\left(-2x\\right)');
  expect(sumLatex(monomial(3, 1, 2, 0), monomial(2, 1, 1, 0), -1)).toBe('3x^{2}-2x');
});

test('multiplication adds exponents, multiplies coefficients and agrees with numeric values', () => {
  expect(monomialLatex(multiplyMonomials(monomial(-2, 1, 3, 1), monomial(5, 1, 2, 4)))).toBe('-10x^{5}y^{5}');
  for (const a of ALL) for (const b of ALL) {
    const product = multiplyMonomials(a, b);
    if (!isZero(product)) expect([product.x, product.y]).toEqual([a.x + b.x, a.y + b.y]);
    for (const { x, y } of CHECK_VALUES) {
      expect(same(evaluate(product, x, y), rationalOperation(evaluate(a, x, y), evaluate(b, x, y), '*'))).toBe(true);
    }
  }
});

test('division distinguishes monomial quotients, fractions and division by zero', () => {
  expect(divideMonomials(monomial(3, 1, 1, 0), monomial(0, 1, 0, 0))).toEqual({ kind: 'undefined' });
  expect(quotientLatex(divideMonomials(monomial(12, 1, 4, 2), monomial(4, 1, 4, 1)))).toBe('3y');
  expect(quotientLatex(divideMonomials(monomial(6, 1, 2, 0), monomial(3, 1, 3, 0)))).toBe('\\frac{2}{x}');
  expect(quotientLatex(divideMonomials(monomial(8, 1, 3, 1), monomial(2, 1, 1, 2)))).toBe('\\frac{4x^{2}}{y}');
  expect(quotientLatex(divideMonomials(monomial(-5, 1, 1, 1), monomial(3, 1, 2, 0)))).toBe('-\\frac{5y}{3x}');
  expect(quotientLatex(divideMonomials(monomial(1, 1, 0, 0), monomial(2, 1, 1, 0)))).toBe('\\frac{1}{2x}');
  expect(quotientLatex(divideMonomials(monomial(5, 1, 2, 0), monomial(2, 1, 0, 0)))).toBe('\\frac{5}{2}x^{2}');
  expect(quotientLatex(divideMonomials(monomial(0, 1, 0, 0), monomial(2, 1, 1, 0)))).toBe('0');
  for (const a of ALL) for (const b of ALL) {
    const quotient = divideMonomials(a, b);
    if (isZero(b)) { expect(quotient.kind).toBe('undefined'); expect(evaluateQuotient(quotient, 2, 3)).toBeNull(); continue; }
    expect(quotient.kind).toBe(isZero(a) || (a.x >= b.x && a.y >= b.y) ? 'monomial' : 'fraction');
    for (const { x, y } of CHECK_VALUES) {
      expect(same(evaluateQuotient(quotient, x, y), rationalOperation(evaluate(a, x, y), evaluate(b, x, y), '/'))).toBe(true);
    }
  }
});

test('evaluates exactly, including negative values and fractions', () => {
  expect(evaluate(monomial(-3, 2, 2, 1), 2, 3)).toEqual(fraction(-18, 1));
  expect(evaluate(monomial(1, 3, 3, 0), -1, 5)).toEqual(fraction(-1, 3));
  expect(evaluate(monomial(7, 1, 0, 0), 9, 9)).toEqual(fraction(7, 1));
});

test('a reported common mistake is always a wrong answer', () => {
  expect(monomialLatex(commonMistake(monomial(3, 1, 2, 0), monomial(2, 1, 2, 0), '+').value)).toBe('5x^{4}');
  expect(monomialLatex(commonMistake(monomial(2, 1, 3, 0), monomial(3, 1, 2, 0), '*').value)).toBe('6x^{6}');
  expect(monomialLatex(commonMistake(monomial(3, 1, 2, 2), monomial(4, 1, 2, 2), '*').value)).toBe('7x^{4}y^{4}');
  expect(commonMistake(monomial(3, 1, 0, 0), monomial(2, 1, 0, 0), '+')).toBeNull();
  expect(commonMistake(monomial(2, 1, 2, 2), monomial(2, 1, 2, 2), '*')).toBeNull();
  expect(commonMistake(monomial(3, 1, 2, 0), monomial(2, 1, 1, 0), '+')).toBeNull();
  expect(commonMistake(monomial(3, 1, 2, 0), monomial(2, 1, 1, 0), '/')).toBeNull();
  for (const a of ALL) for (const b of ALL) for (const op of ['+', '-', '*']) {
    const mistake = commonMistake(a, b, op);
    if (!mistake) continue;
    const correct = op === '*' ? multiplyMonomials(a, b) : addMonomials(a, b, op === '+' ? 1 : -1).value;
    expect(monomialLatex(mistake.value)).not.toBe(monomialLatex(correct));
    expect(mistake.reason.length).toBeGreaterThan(10);
  }
});
