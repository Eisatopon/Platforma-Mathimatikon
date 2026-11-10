import { toHtml } from "./MathText";

describe("MathText typography", () => {
  test("αποδίδει έναν απλό αριθμό με τη γραμματοσειρά του κειμένου", () => {
    const html = toHtml("Η αξία του $7$ στον αριθμό $2.741$.", true);
    expect(html).toContain('<span class="math-number">7</span>');
    expect(html).toContain('<span class="math-number">2.741</span>');
    expect(html).not.toContain("katex");
  });

  test("διατηρεί το KaTeX για πραγματικές μαθηματικές παραστάσεις", () => {
    const html = toHtml("$x^2+1$", true);
    expect(html).toContain("katex");
  });

  test("μεγεθύνει στοχευμένα τα κλάσματα", () => {
    const html = toHtml("$\\frac{3}{8}$", true);
    expect(html).toContain("mfrac");
    expect(html).toContain("dfrac");
  });
});
