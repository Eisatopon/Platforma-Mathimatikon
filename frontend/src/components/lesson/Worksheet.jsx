import { useEffect, useState } from "react";
import { MathText } from "@/components/MathText";
import { EmptyState } from "@/components/lesson/EmptyState";

const LEVELS = [
  { key: "A", label: "Επίπεδο Α", sub: "Βασικές", cls: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", ring: "border-emerald-500/30" },
  { key: "B", label: "Επίπεδο Β", sub: "Μεσαίες", cls: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", ring: "border-orange-500/30" },
  { key: "C", label: "Επίπεδο Γ", sub: "Προχωρημένες", cls: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500", ring: "border-rose-500/30" },
];

export const Worksheet = ({ lessonId, worksheet }) => {
  const storeKey = `worksheet-answers-${lessonId}`;
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    try {
      setAnswers(JSON.parse(localStorage.getItem(storeKey) || "{}"));
    } catch {
      setAnswers({});
    }
  }, [storeKey]);

  const save = (key, val) => {
    const nextA = { ...answers, [key]: val };
    setAnswers(nextA);
    localStorage.setItem(storeKey, JSON.stringify(nextA));
  };

  const empty = LEVELS.every((l) => !(worksheet?.[l.key] || []).length);
  if (empty) {
    return <EmptyState message="Δεν έχουν προστεθεί ακόμη ασκήσεις φύλλου εργασίας." hint="Θα εμφανιστούν εδώ σε 3 επίπεδα δυσκολίας (Α/Β/Γ) με πεδίο απάντησης." />;
  }

  return (
    <div className="space-y-6">
      {LEVELS.map((lvl) => {
        const items = worksheet?.[lvl.key] || [];
        if (!items.length) return null;
        return (
          <div key={lvl.key} className={`rounded-xl border-2 ${lvl.ring} bg-card p-4`}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${lvl.dot}`} />
              <span className={`font-extrabold ${lvl.cls}`}>{lvl.label}</span>
              <span className="text-xs text-muted-foreground">· {lvl.sub}</span>
            </div>
            <ol className="space-y-4">
              {items.map((ex, i) => {
                const key = `${lvl.key}-${i}`;
                return (
                  <li key={key} className="flex gap-3">
                    <span className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold ${lvl.dot} text-white`}>{i + 1}</span>
                    <div className="flex-1">
                      <MathText className="text-[15px] leading-relaxed" text={ex} />
                      <textarea
                        data-testid={`worksheet-answer-${key}`}
                        value={answers[key] || ""}
                        onChange={(e) => save(key, e.target.value)}
                        placeholder="Η απάντησή σου…"
                        rows={2}
                        className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
      <p className="text-center text-xs text-muted-foreground">Οι απαντήσεις σου αποθηκεύονται τοπικά στη συσκευή σου.</p>
    </div>
  );
};
