const radians = (degrees) => degrees * Math.PI / 180;
export const sideLength = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const centroid = (vertices) => ({ x: vertices.reduce((sum, p) => sum + p.x, 0) / 3, y: vertices.reduce((sum, p) => sum + p.y, 0) / 3 });

export function measureTriangle(vertices) {
  const sides = [sideLength(vertices[0], vertices[1]), sideLength(vertices[0], vertices[2]), sideLength(vertices[1], vertices[2])];
  const angles = vertices.map((vertex, i) => {
    const p = vertices[(i + 1) % 3];
    const q = vertices[(i + 2) % 3];
    const cosine = ((p.x - vertex.x) * (q.x - vertex.x) + (p.y - vertex.y) * (q.y - vertex.y)) / (sideLength(vertex, p) * sideLength(vertex, q));
    return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
  });
  return { sides, angles };
}

function fromSSS(ab, ac, bc) {
  const x = (ab * ab + ac * ac - bc * bc) / (2 * ab);
  const ySquared = ac * ac - x * x;
  if (ySquared <= 0) throw new RangeError("Οι πλευρές δεν σχηματίζουν μη εκφυλισμένο τρίγωνο.");
  return [{ x: 0, y: 0 }, { x: ab, y: 0 }, { x, y: Math.sqrt(ySquared) }];
}

function fromASA(ab, angleA, angleB) {
  const angleC = 180 - angleA - angleB;
  const ac = ab * Math.sin(radians(angleB)) / Math.sin(radians(angleC));
  return [{ x: 0, y: 0 }, { x: ab, y: 0 }, { x: ac * Math.cos(radians(angleA)), y: ac * Math.sin(radians(angleA)) }];
}

export const CONGRUENCE_MODES = [
  { id: "sss", label: "ΠΠΠ", parameter: "Μήκος ΒΓ και ΕΖ", min: 2, max: 9, step: 0.5, initial: 4, unit: "" },
  { id: "sas", label: "ΠΓΠ", parameter: "Γωνία Α και Δ", min: 30, max: 120, step: 5, initial: 60, unit: "°" },
  { id: "asa", label: "ΓΠΓ", parameter: "Γωνία Α και Δ", min: 20, max: 70, step: 5, initial: 50, unit: "°" },
  { id: "aaa", label: "ΓΓΓ: αρκεί;", parameter: "Μεγέθυνση δεύτερου τριγώνου", min: 1.2, max: 1.8, step: 0.1, initial: 1.5, unit: " φορές" },
  { id: "ssa", label: "ΠΠΓ: αρκεί;", initial: 0 },
];

export function buildCongruenceModel(modeId, value) {
  const mode = CONGRUENCE_MODES.find((item) => item.id === modeId);
  if (!mode) throw new RangeError("Άγνωστο κριτήριο.");
  const parameter = value ?? mode.initial;
  if (mode.min !== undefined && (!Number.isFinite(parameter) || parameter < mode.min || parameter > mode.max)) throw new RangeError("Η παράμετρος είναι εκτός ορίων.");
  let first;
  let second;
  let givenSides;
  let givenAngles;
  let data;
  let explanation;
  if (modeId === "sss") {
    first = fromSSS(6, 5, parameter);
    givenSides = [1, 2, 3]; givenAngles = [0, 0, 0];
    data = ["$ΑΒ=ΔΕ=6$", "$ΑΓ=ΔΖ=5$", `$ΒΓ=ΕΖ=${parameter}$`];
    explanation = "Οι τρεις πλευρές είναι ίσες μία προς μία. Το ΠΠΠ εξασφαλίζει ισότητα, όποια θέση κι αν έχουν τα τρίγωνα.";
  } else if (modeId === "sas") {
    first = [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 4 * Math.cos(radians(parameter)), y: 4 * Math.sin(radians(parameter)) }];
    givenSides = [1, 2, 0]; givenAngles = [1, 0, 0];
    data = ["$ΑΒ=ΔΕ=6$", "$ΑΓ=ΔΖ=4$", `$\\widehat{Α}=\\widehat{Δ}=${parameter}^\\circ$`];
    explanation = "Η Α βρίσκεται ανάμεσα στις ΑΒ και ΑΓ, όπως η Δ ανάμεσα στις ΔΕ και ΔΖ. Η γωνία είναι περιεχόμενη, άρα εφαρμόζεται το ΠΓΠ.";
  } else if (modeId === "asa") {
    first = fromASA(6, parameter, 40);
    givenSides = [1, 0, 0]; givenAngles = [1, 2, 0];
    data = ["$ΑΒ=ΔΕ=6$", `$\\widehat{Α}=\\widehat{Δ}=${parameter}^\\circ$`, "$\\widehat{Β}=\\widehat{Ε}=40^\\circ$"];
    explanation = "Η ΑΒ έχει άκρα τις κορυφές των δύο γνωστών γωνιών, όπως η ΔΕ. Είναι η περιεχόμενη πλευρά, άρα εφαρμόζεται το ΓΠΓ.";
  } else if (modeId === "aaa") {
    first = fromASA(6, 50, 60);
    second = first.map((point) => ({ x: point.x * parameter, y: point.y * parameter }));
    givenSides = [0, 0, 0]; givenAngles = [1, 2, 3];
    data = ["$\\widehat{Α}=\\widehat{Δ}=50^\\circ$", "$\\widehat{Β}=\\widehat{Ε}=60^\\circ$", "$\\widehat{Γ}=\\widehat{Ζ}=70^\\circ$"];
    explanation = "Οι τρεις γωνίες παραμένουν ίσες, αλλά το δεύτερο τρίγωνο είναι μεγαλύτερο. Το ΓΓΓ δεν είναι κριτήριο ισότητας: το μέγεθος δεν καθορίζεται από τις γωνίες.";
  } else {
    const pointOnRay = (length) => ({ x: 8 - length * Math.cos(radians(30)), y: length * Math.sin(radians(30)) });
    first = [{ x: 0, y: 0 }, { x: 8, y: 0 }, pointOnRay(4 * Math.sqrt(3) - 3)];
    second = [{ x: 0, y: 0 }, { x: 8, y: 0 }, pointOnRay(4 * Math.sqrt(3) + 3)];
    givenSides = [1, 2, 0]; givenAngles = [0, 1, 0];
    data = ["$ΑΒ=ΔΕ=8$", "$ΑΓ=ΔΖ=5$", "$\\widehat{Β}=\\widehat{Ε}=30^\\circ$"];
    explanation = "Η γνωστή γωνία βρίσκεται στη Β, ενώ οι δύο γνωστές πλευρές συναντώνται στην Α. Δεν είναι περιεχόμενη. Τα ίδια δεδομένα δίνουν εδώ δύο διαφορετικά μήκη ΒΓ και ΕΖ· το ΠΠΓ δεν αρκεί γενικά.";
  }
  second ||= first.map((point) => ({ ...point }));
  const firstMeasures = measureTriangle(first);
  const secondMeasures = measureTriangle(second);
  return { mode, parameter, first, second, givenSides, givenAngles, data, explanation, firstMeasures, secondMeasures, congruent: firstMeasures.sides.every((side, index) => Math.abs(side - secondMeasures.sides[index]) < 1e-9), sufficient: ["sss", "sas", "asa"].includes(modeId) };
}

// Rigid transformations preserve lengths and angles; reflection is allowed.
export function transformTriangle(vertices, rotationDegrees, reflected) {
  const centre = centroid(vertices);
  const angle = radians(rotationDegrees);
  return vertices.map((point) => {
    const x = (point.x - centre.x) * (reflected ? -1 : 1);
    const y = point.y - centre.y;
    return { x: centre.x + x * Math.cos(angle) - y * Math.sin(angle), y: centre.y + x * Math.sin(angle) + y * Math.cos(angle) };
  });
}
