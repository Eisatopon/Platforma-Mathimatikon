const KEY = "math-gym-progress-v1";

const empty = () => ({ completed: {}, mastery: {}, streak: { count: 0, lastDate: null } });

export function getProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw);
    return { completed: p.completed || {}, mastery: p.mastery || {}, streak: p.streak || { count: 0, lastDate: null } };
  } catch {
    return empty();
  }
}

function save(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("progress-updated"));
}

export function subscribe(cb) {
  const handler = () => cb(getProgress());
  window.addEventListener("progress-updated", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("progress-updated", handler);
    window.removeEventListener("storage", handler);
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function recordLessonResult(lessonId, correct, total) {
  const p = getProgress();
  const prev = p.completed[lessonId];
  // keep best score
  if (!prev || correct > prev.correct) {
    p.completed[lessonId] = { correct, total, ts: Date.now() };
  }
  // streak
  const today = todayStr();
  const last = p.streak.lastDate;
  if (last !== today) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = y.toISOString().slice(0, 10);
    p.streak.count = last === yStr ? p.streak.count + 1 : 1;
    p.streak.lastDate = today;
  }
  if (p.streak.count < 1) p.streak.count = 1;
  save(p);
  return p;
}

const REVIEW_INTERVALS = [1, 1, 3, 7];

export const MASTERY_LEVELS = [
  { key: "not-started", label: "Δεν ξεκίνησε" },
  { key: "practising", label: "Σε εξάσκηση" },
  { key: "proficient", label: "Ικανοποιητική κατάκτηση" },
  { key: "mastered", label: "Κατακτήθηκε" },
];

export function getLessonMastery(progress, lessonId) {
  const value = progress.mastery?.[lessonId];
  return value || { level: 0, attempts: 0, dueAt: null, lastScore: null };
}

export function recordPracticeResult(lessonId, { firstTryCorrect, secondTryCorrect, total }) {
  const p = getProgress();
  const previous = getLessonMastery(p, lessonId);
  const score = total ? (firstTryCorrect + secondTryCorrect * 0.5) / total : 0;
  let level = previous.level || 0;

  // Mastery is earned over repeated successful sessions, not a single quiz.
  if (score >= 0.8) level = Math.min(3, level + 1);
  else if (score < 0.5) level = Math.max(1, level - 1);
  else level = Math.max(1, level);

  const due = new Date();
  due.setDate(due.getDate() + REVIEW_INTERVALS[level]);
  p.mastery[lessonId] = {
    level,
    attempts: (previous.attempts || 0) + 1,
    lastScore: Math.round(score * 100),
    firstTryAccuracy: total ? Math.round((firstTryCorrect / total) * 100) : 0,
    lastPractisedAt: Date.now(),
    dueAt: due.getTime(),
  };

  // Keep the existing XP/achievement model compatible.
  const equivalentCorrect = Math.round(firstTryCorrect + secondTryCorrect * 0.5);
  const old = p.completed[lessonId];
  if (!old || equivalentCorrect > old.correct) {
    p.completed[lessonId] = { correct: equivalentCorrect, total, ts: Date.now() };
  }
  updateStreak(p);
  save(p);
  return p.mastery[lessonId];
}

function updateStreak(p) {
  const today = todayStr();
  const last = p.streak.lastDate;
  if (last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    p.streak.count = last === yesterday.toISOString().slice(0, 10) ? p.streak.count + 1 : 1;
    p.streak.lastDate = today;
  }
}

export function isReviewDue(progress, lessonId, now = Date.now()) {
  const mastery = getLessonMastery(progress, lessonId);
  return mastery.level > 0 && mastery.dueAt && mastery.dueAt <= now;
}

export function resetProgress() {
  save(empty());
}

export function computeXp(progress) {
  return Object.values(progress.completed).reduce((s, c) => s + c.correct * 10, 0);
}

export function levelInfo(xp) {
  const per = 400;
  const level = Math.floor(xp / per) + 1;
  return { level, xpInLevel: xp % per, per };
}

export function isCompleted(progress, lessonId) {
  return !!progress.completed[lessonId];
}

export function completedInGrade(progress, gradeId) {
  return Object.keys(progress.completed).filter((id) => id.split("-")[0] === gradeId).length;
}

export function computeStats(progress, grades) {
  const completedIds = Object.keys(progress.completed);
  const completedCount = completedIds.length;
  const totalLessons = grades.reduce((s, g) => s + g.lessonCount, 0);
  const xp = computeXp(progress);
  const { level, xpInLevel, per } = levelInfo(xp);
  const overallPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const badges = computeBadges(progress, grades).filter((b) => b.unlocked).length;
  return {
    xp, level, xpInLevel, per, streak: progress.streak.count,
    completedCount, totalLessons, overallPct, badges,
  };
}

export function computeBadges(progress, grades) {
  const completedIds = Object.keys(progress.completed);
  const completedCount = completedIds.length;
  const totalLessons = grades.reduce((s, g) => s + g.lessonCount, 0);
  const perfect = completedIds.some((id) => {
    const c = progress.completed[id];
    return c.total > 0 && c.correct === c.total;
  });
  const gradeComplete = grades.some((g) => {
    const have = completedInGrade(progress, g.id);
    return g.lessonCount > 0 && have >= g.lessonCount;
  });
  const overallPct = totalLessons ? completedCount / totalLessons : 0;
  return [
    { key: "first", title: "Πρώτο Βήμα", desc: "Ολοκλήρωσε το 1ο σου μάθημα", icon: "Footprints", unlocked: completedCount >= 1 },
    { key: "fit", title: "Σε Φόρμα", desc: "Ολοκλήρωσε 5 μαθήματα", icon: "Dumbbell", unlocked: completedCount >= 5 },
    { key: "diligent", title: "Επιμελής", desc: "Ολοκλήρωσε 10 μαθήματα", icon: "GraduationCap", unlocked: completedCount >= 10 },
    { key: "perfect", title: "Άριστα!", desc: "Πέτυχε 100% σε ένα κουίζ", icon: "Star", unlocked: perfect },
    { key: "streak", title: "Συνέπεια", desc: "Streak 3 ημερών", icon: "Flame", unlocked: progress.streak.count >= 3 },
    { key: "grademaster", title: "Κατακτητής Τάξης", desc: "Ολοκλήρωσε μια ολόκληρη τάξη", icon: "Crown", unlocked: gradeComplete },
    { key: "half", title: "Στα Μισά", desc: "Έφτασες στο 50% συνολικά", icon: "Target", unlocked: overallPct >= 0.5 },
    { key: "mathematician", title: "Μαθηματικός", desc: "Ολοκλήρωσε τα πάντα (100%)", icon: "Trophy", unlocked: overallPct >= 1 },
  ];
}
