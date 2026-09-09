import { useEffect, useState } from "react";
import { Eye, EyeOff, PencilLine } from "lucide-react";
import { MathText } from "@/components/MathText";

export const GuidedPractice = ({ lessonId, item }) => {
  const key = `guided-practice-${lessonId}`;
  const [answer, setAnswer] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setAnswer(localStorage.getItem(key) || "");
    setShow(false);
  }, [key]);

  if (!item?.prompt) return null;

  const update = (value) => {
    setAnswer(value);
    localStorage.setItem(key, value);
  };

  return (
    <div className="rounded-xl border border-sky-300/70 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
      <div className="flex items-center gap-2 font-extrabold text-sky-800 dark:text-sky-300">
        <PencilLine className="h-5 w-5" /> Παράδειγμα με καθοδήγηση
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Λύσε το πριν εμφανίσεις τη λύση. Η απάντησή σου αποθηκεύεται στη συσκευή.</p>
      <MathText className="mt-3 block text-[15px] font-bold" text={item.prompt} />
      {item.hint && <MathText className="mt-2 block text-sm text-sky-800/80 dark:text-sky-200/80" text={`Υπόδειξη: ${item.hint}`} />}
      <textarea
        value={answer}
        onChange={(event) => update(event.target.value)}
        rows={3}
        placeholder="Γράψε τη στρατηγική και τη λύση σου…"
        className="mt-3 w-full resize-y rounded-lg border border-sky-200 bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-sky-400/40 dark:border-sky-500/30"
      />
      <button onClick={() => setShow((value) => !value)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-300 bg-background px-3 py-1.5 text-sm font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/10">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {show ? "Απόκρυψη λύσης" : "Έλεγχος λύσης"}
      </button>
      {show && <MathText className="mt-3 block rounded-lg bg-background p-3 text-[15px] leading-relaxed" text={item.solution} />}
    </div>
  );
};
