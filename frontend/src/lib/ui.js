import { Calculator, Sigma, Shapes, BarChart3 } from "lucide-react";

export const gradeStyles = {
  emerald: {
    iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
    iconText: "text-emerald-600 dark:text-emerald-400",
    pct: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    banner: "from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10",
  },
  amber: {
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
    iconText: "text-amber-600 dark:text-amber-400",
    pct: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    banner: "from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10",
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
