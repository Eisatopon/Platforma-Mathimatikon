export function getTheme() {
  return localStorage.getItem("theme") || "light";
}

export function applyTheme(t) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
  window.dispatchEvent(new Event("theme-updated"));
  return next;
}
