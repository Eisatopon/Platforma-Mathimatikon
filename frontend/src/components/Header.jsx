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

  const navItem = (to, label, Icon) => {
    const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
    return (
      <button
        data-testid={`nav-${label}`}
        onClick={() => navigate(to)}
        className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
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
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2.5">
          <img
            src={`${process.env.PUBLIC_URL}/mathtopon-mark.svg`}
            alt=""
            aria-hidden="true"
            className="-translate-y-1.5 h-11 w-14 shrink-0"
          />
          <div className="leading-tight">
            <div className="text-[18px] font-extrabold tracking-tight">
              <span className="text-[#1F4E7B] dark:text-[#75B7E3]">Math</span><span className="text-foreground">Topon</span>
            </div>
            <div className="text-[11px] font-medium text-foreground/65">Ο τόπος των Μαθηματικών</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItem("/", "Αρχική", Home)}
          {navItem("/achievements", "Επιτεύγματα", Trophy)}
        </nav>

        <div className="flex items-center gap-1.5">
          <div data-testid="streak-badge" className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold sm:flex">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {streak}<span className="font-medium text-muted-foreground">σερί</span>
          </div>
          <div data-testid="xp-badge" className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold sm:flex">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {xp}<span className="font-medium text-muted-foreground">XP</span>
          </div>
          <div data-testid="level-badge" className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-2.5 py-1 text-xs font-bold text-white">
            Lv {level}
          </div>
          <button
            data-testid="theme-toggle"
            onClick={() => setTheme(toggleTheme())}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Εναλλαγή θέματος"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
