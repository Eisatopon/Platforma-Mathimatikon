// Exact arithmetic for the bounded rational inputs in this lesson.
export function fraction(n, d = 1) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) return null;
  if (n === 0) return { n: 0, d: 1 };
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const g = gcd(Math.abs(n), Math.abs(d));
  return { n: (d < 0 ? -n : n) / g, d: Math.abs(d) / g };
}
export function rationalOperation(a, b, op) {
  if (!a || !b) return null;
  if (op === '+') return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
  if (op === '-') return fraction(a.n * b.d - b.n * a.d, a.d * b.d);
  if (op === '*') return fraction(a.n * b.n, a.d * b.d);
  if (op === '/') return b.n === 0 ? null : fraction(a.n * b.d, a.d * b.n);
  return null;
}
export function fractionLatex(v) {
  if (!v) return '\\text{Δεν ορίζεται}';
  return v.d === 1 ? String(v.n) : `${v.n < 0 ? '-' : ''}\\frac{${Math.abs(v.n)}}{${v.d}}`;
}
export function powerComparison(magnitude, exponent) {
  return { withParentheses: (-magnitude) ** exponent, withoutParentheses: -(magnitude ** exponent) };
}
export const PRIORITY_EXAMPLES = [
  { label: 'Προτεραιότητα', expression: '3-2\\cdot(4-6)^2+\\sqrt9', result: -2,
    steps: [ ['Παρένθεση', '3-2\\cdot(-2)^2+\\sqrt9'], ['Δύναμη και ρίζα', '3-2\\cdot4+3'], ['Πολλαπλασιασμός', '3-8+3'], ['Πρόσθεση και αφαίρεση από αριστερά', '-5+3=-2'] ] },
  { label: 'Ίδια προτεραιότητα', expression: '24\\div6\\cdot2', result: 8,
    steps: [ ['Πρώτα η διαίρεση που βρίσκεται αριστερά', '4\\cdot2'], ['Έπειτα ο πολλαπλασιασμός', '8'] ] },
  { label: 'Επιμεριστική', expression: '-3(2-5)', result: 9,
    steps: [ ['Διανέμω το −3 και στους δύο όρους', '(-3)\\cdot2+(-3)\\cdot(-5)'], ['Πολλαπλασιάζω με σωστά πρόσημα', '-6+15'], ['Προσθέτω', '9'] ] },
  { label: 'Ρίζα και απόλυτη τιμή', expression: '\\sqrt{(-5)^2}-|-2|', result: 3,
    steps: [ ['Υπολογίζω το τετράγωνο και την απόλυτη τιμή', '\\sqrt{25}-2'], ['Η τετραγωνική ρίζα είναι μη αρνητική', '5-2'], ['Αφαιρώ', '3'] ] },
];
