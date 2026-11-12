import { fraction, rationalOperation, fractionLatex, powerComparison } from './realOperationsModel';

test('normalizes signs, reduces fractions and rejects undefined input', () => {
  expect(fraction(6, -8)).toEqual({ n: -3, d: 4 });
  expect(fraction(0, -8)).toEqual({ n: 0, d: 1 });
  expect(fraction(1, 0)).toBeNull();
  expect(fraction(1.5, 2)).toBeNull();
  expect(fractionLatex(fraction(-3, 2))).toBe('-\\frac{3}{2}');
});
test.each(['+', '-', '*', '/'])('bounded rational %s stays exact and respects zero', op => {
  for (let an = -6; an <= 6; an++) for (let bn = -6; bn <= 6; bn++) {
    for (let ad = 1; ad <= 4; ad++) for (let bd = 1; bd <= 4; bd++) {
      const actual = rationalOperation(fraction(an, ad), fraction(bn, bd), op);
      if (op === '/' && bn === 0) { expect(actual).toBeNull(); continue; }
      const numerator = op === '+' ? an * bd + bn * ad : op === '-' ? an * bd - bn * ad : op === '*' ? an * bn : an * bd;
      const denominator = op === '/' ? ad * bn : ad * bd;
      expect(actual.n * denominator === numerator * actual.d).toBe(true);
      expect(actual.d).toBeGreaterThan(0);
    }
  }
});
test.each([1, 2, 3, 4, 5])('power comparison respects exponent %i', n => {
  for (let a = 1; a <= 5; a++) {
    const power = Array(n).fill(a).reduce((p, value) => p * value, 1);
    expect(powerComparison(a, n)).toEqual({ withParentheses: n % 2 === 0 ? power : -power, withoutParentheses: -power });
  }
});
