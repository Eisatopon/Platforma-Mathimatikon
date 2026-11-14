import {
  polynomial, fromTerms, isZero, degree, constantTerm, terms, termLatex, expressionLatex, polynomialLatex,
  add, negate, subtract, evaluate, substitutionLatex, termValuesLatex, groupLikeTerms, groupedLatex, coefficientSumsLatex,
  openedLatex, firstTermOnlyMistake, REDUCTION_EXAMPLES, CHECK_VALUES,
} from './polynomialModel';

const RANGE = [-5, -1, 0, 2];
const SAMPLES = RANGE.flatMap(a => RANGE.flatMap(b => RANGE.map(c => polynomial([c, b, a]))));

test('normalises coefficients and rejects invalid input', () => {
  expect(polynomial([1, 2, 0, 0])).toEqual([1, 2]);
  expect(polynomial([0, 0, 0])).toEqual([]);
  expect(polynomial([1, 0.5])).toBeNull();
  expect(polynomial('x')).toBeNull();
  expect(fromTerms([[3, 2], [-2, 1], [5, 0], [1, 1], [-3, 2]])).toEqual([5, -1]);
  expect(fromTerms([])).toEqual([]);
});

test('degree, constant term and terms follow the reduced form', () => {
  expect(degree(polynomial([5, 0, -3, 2]))).toBe(3);
  expect(degree(polynomial([5, 2, 0, 0]))).toBe(1);
  expect(degree(polynomial([4]))).toBe(0);
  expect(degree(polynomial([0, 0]))).toBeNull();
  expect(isZero(polynomial([0]))).toBe(true);
  expect(constantTerm(polynomial([-7, 0, 1]))).toBe(-7);
  expect(constantTerm(polynomial([]))).toBe(0);
  expect(terms(polynomial([5, 0, -3, 2]))).toEqual([[2, 3], [-3, 2], [5, 0]]);
});

test('writes polynomials with the usual sign and coefficient conventions', () => {
  expect(polynomialLatex(polynomial([5, 0, -3, 2]))).toBe('2x^{3}-3x^{2}+5');
  expect(polynomialLatex(polynomial([-1, 1, -1]))).toBe('-x^{2}+x-1');
  expect(polynomialLatex(polynomial([0, -1]))).toBe('-x');
  expect(polynomialLatex(polynomial([1]))).toBe('1');
  expect(polynomialLatex(polynomial([]))).toBe('0');
  expect(termLatex(-1, 2)).toBe('-x^{2}');
  expect(termLatex(0, 2)).toBe('0');
  expect(termLatex(-4, 0)).toBe('-4');
  expect(expressionLatex([[3, 2], [-2, 1], [5, 0], [1, 1], [-4, 2]])).toBe('3x^{2}-2x+5+x-4x^{2}');
  expect(expressionLatex([[0, 2], [0, 0]])).toBe('0');
});

test('addition, negation and subtraction agree with numeric values', () => {
  expect(polynomialLatex(subtract(polynomial([5, -2, 3]), polynomial([-2, 3, 1])))).toBe('2x^{2}-5x+7');
  expect(polynomialLatex(add(polynomial([-1, 3, 2]), polynomial([4, 1, -2])))).toBe('4x+3');
  for (const p of SAMPLES) for (const q of SAMPLES) for (const x of [...CHECK_VALUES, 0, -4]) {
    expect(evaluate(add(p, q), x)).toBe(evaluate(p, x) + evaluate(q, x));
    expect(evaluate(subtract(p, q), x)).toBe(evaluate(p, x) - evaluate(q, x));
    expect(evaluate(negate(q), x) + evaluate(q, x)).toBe(0);
  }
  for (const p of SAMPLES) { expect(isZero(subtract(p, p))).toBe(true); expect(add(p, polynomial([]))).toEqual(p); }
});

test('evaluation and written substitution', () => {
  const p = polynomial([3, -2, 1]);
  expect(evaluate(p, -1)).toBe(6);
  expect(substitutionLatex(p, -1)).toBe('(-1)^{2}-2\\cdot(-1)+3');
  expect(termValuesLatex(p, -1)).toBe('1+2+3');
  expect(substitutionLatex(polynomial([5, 0, -3, 2]), 2)).toBe('2\\cdot2^{3}-3\\cdot2^{2}+5');
  expect(termValuesLatex(polynomial([5, 0, -3, 2]), 2)).toBe('16-12+5');
  expect(substitutionLatex(polynomial([0, -1]), -2)).toBe('-(-2)');
  expect(termValuesLatex(polynomial([0, -1]), -2)).toBe('2');
  expect(substitutionLatex(polynomial([]), 2)).toBe('0');
  expect(termValuesLatex(polynomial([]), 2)).toBe('0');
  expect(evaluate(polynomial([]), 7)).toBe(0);
});

test('groups like terms and keeps the value of every example', () => {
  const first = REDUCTION_EXAMPLES[0].terms;
  expect(groupLikeTerms(first)).toEqual([
    { power: 3, coefficients: [1], sum: 1 }, { power: 2, coefficients: [3, -4], sum: -1 },
    { power: 1, coefficients: [-2, 1], sum: -1 }, { power: 0, coefficients: [5, -1], sum: 4 },
  ]);
  expect(groupedLatex(first)).toBe('x^{3}+\\left(3x^{2}-4x^{2}\\right)+\\left(-2x+x\\right)+\\left(5-1\\right)');
  expect(polynomialLatex(fromTerms(first))).toBe('x^{3}-x^{2}-x+4');
  expect(coefficientSumsLatex(first)).toBe('x^{3}+\\left(3-4\\right)x^{2}+\\left(-2+1\\right)x+\\left(5-1\\right)');
  expect(coefficientSumsLatex([[2, 1], [-3, 0]])).toBe('2x-3');
  expect(coefficientSumsLatex([[-1, 2], [4, 0], [-2, 2]])).toBe('\\left(-1-2\\right)x^{2}+4');
  expect(degree(fromTerms(REDUCTION_EXAMPLES[1].terms))).toBe(1);
  expect(isZero(fromTerms(REDUCTION_EXAMPLES[2].terms))).toBe(true);
  expect(groupedLatex([[2, 1], [-3, 0]])).toBe('2x-3');
  for (const example of REDUCTION_EXAMPLES) {
    const reduced = fromTerms(example.terms);
    for (const x of CHECK_VALUES) {
      const direct = example.terms.reduce((total, [coefficient, power]) => total + coefficient * x ** power, 0);
      expect(evaluate(reduced, x)).toBe(direct);
      expect(groupLikeTerms(example.terms).reduce((total, group) => total + group.sum * x ** group.power, 0)).toBe(direct);
    }
  }
});

test('removing parentheses changes every sign in a subtraction', () => {
  const p = polynomial([5, -2, 3]), q = polynomial([-2, 3, 1]);
  expect(openedLatex(p, q, 1)).toBe('3x^{2}-2x+5+x^{2}+3x-2');
  expect(openedLatex(p, q, -1)).toBe('3x^{2}-2x+5-x^{2}-3x+2');
  expect(openedLatex(polynomial([]), q, -1)).toBe('-x^{2}-3x+2');
  expect(openedLatex(p, polynomial([]), -1)).toBe('3x^{2}-2x+5');
});

test('the first-term-only mistake is reported only when it is a wrong answer', () => {
  expect(polynomialLatex(firstTermOnlyMistake(polynomial([1, -2, 3]), polynomial([3, -4, 1])))).toBe('2x^{2}-6x+4');
  expect(firstTermOnlyMistake(polynomial([1, 2]), polynomial([0, 0, 3]))).toBeNull();
  expect(firstTermOnlyMistake(polynomial([1, 2]), polynomial([]))).toBeNull();
  for (const p of SAMPLES) for (const q of SAMPLES) {
    const mistake = firstTermOnlyMistake(p, q);
    if (mistake) expect(polynomialLatex(mistake)).not.toBe(polynomialLatex(subtract(p, q)));
  }
});
