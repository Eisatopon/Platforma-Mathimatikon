import { Calculator, Sigma, Shapes, BarChart3 } from "lucide-react";

export const gradeStyles = {
  blue: {
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    iconText: "text-blue-600 dark:text-blue-400",
    pct: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
    banner: "from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10",
  },
  violet: {
    iconBg: "bg-violet-100 dark:bg-violet-500/15",
    iconText: "text-violet-600 dark:text-violet-400",
    pct: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    banner: "from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10",
  },
  rose: {
    iconBg: "bg-rose-100 dark:bg-rose-500/15",
    iconText: "text-rose-600 dark:text-rose-400",
    pct: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    banner: "from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10",
  },
};

export const categoryIcon = {
  Αριθμητική: Calculator,
  Άλγεβρα: Sigma,
  Γεωμετρία: Shapes,
  Στατιστική: BarChart3,
};

export const categoryColor = {
  Αριθμητική: "text-sky-600 dark:text-sky-400",
  Άλγεβρα: "text-indigo-600 dark:text-indigo-400",
  Γεωμετρία: "text-emerald-600 dark:text-emerald-400",
  Στατιστική: "text-amber-600 dark:text-amber-400",
};
