import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Trophy, Flame, Zap, Moon, Sun } from "lucide-react";
import { getProgress, subscribe, computeXp, levelInfo } from "@/lib/progress";
import { getTheme, toggleTheme } from "@/lib/theme";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(getProgress());
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => subscribe(setProgress), []);

  const xp = computeXp(progress);
  const { level } = levelInfo(xp);
  const streak = progress.streak.count;

  const navItem = (to, label, Icon, mobileClass = "") => {
    const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
    return (
      <button
        data-testid={`nav-${label}`}
        onClick={() => navigate(to)}
        className={`${mobileClass} items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3.5 ${
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-5xl items-center justify-between gap-1.5 px-3 sm:gap-3 sm:px-4">
        <Link to="/" data-testid="logo-link" aria-label="MathTopon — Αρχική" className="group min-w-0 shrink-0 translate-y-1 sm:ml-3">
          <img
            src={`${process.env.PUBLIC_URL}/mathtopon-logo.svg`}
            alt="MathTopon — Ο τόπος των Μαθηματικών"
            className="h-auto w-[8.75rem] max-w-full transition-transform duration-200 group-hover:scale-[1.02] min-[380px]:w-[9.5rem] sm:w-[12rem] md:w-[14.5rem]"
          />
        </Link>

        <nav aria-label="Κύρια πλοήγηση" className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          {navItem("/", "Αρχική", Home, "hidden sm:flex")}
          {navItem("/achievements", "Επιτεύγματα", Trophy, "flex")}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div data-testid="streak-badge" className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold sm:flex">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {streak}<span className="font-medium text-muted-foreground">σερί</span>
          </div>
          <div data-testid="xp-badge" aria-label={`${xp} πόντοι`} title={`${xp} πόντοι`} className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold sm:flex">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {xp}<span className="font-medium text-muted-foreground"><span className="lg:hidden">π.</span><span className="hidden lg:inline">πόντοι</span></span>
          </div>
          <div data-testid="level-badge" aria-label={`Επίπεδο ${level}`} title={`Επίπεδο ${level}`} className="shrink-0 whitespace-nowrap rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-2 py-1 text-xs font-bold text-white sm:px-2.5">
            <span className="sm:hidden">Επ. {level}</span>
            <span className="hidden sm:inline">Επίπεδο {level}</span>
          </div>
          <button
            data-testid="theme-toggle"
            onClick={() => setTheme(toggleTheme())}
            className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-2 lg:px-3"
            aria-label={theme === "dark" ? "Ενεργοποίηση ημερήσιας οθόνης" : "Ενεργοποίηση βραδινής οθόνης"}
            title={theme === "dark" ? "Ημερήσια οθόνη" : "Βραδινή οθόνη"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden text-xs font-bold lg:inline">
              {theme === "dark" ? "Ημερήσια οθόνη" : "Βραδινή οθόνη"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
