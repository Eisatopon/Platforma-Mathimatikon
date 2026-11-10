import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPlainText(value) {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderKatex(expr, display) {
  try {
    return katex.renderToString(expr, { throwOnError: false, displayMode: display });
  } catch {
    return escapeHtml(expr);
  }
}

function isSimpleNumber(expression) {
  return /^[+-]?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?%?$/.test(expression.trim());
}

function renderInlineExpression(expression, largeFractions) {
  const trimmed = expression.trim();
  if (isSimpleNumber(trimmed)) {
    return `<span class="math-number">${escapeHtml(trimmed)}</span>`;
  }
  const normalized = largeFractions ? trimmed.replace(/\\frac/g, "\\dfrac") : trimmed;
  return renderKatex(normalized, false);
}

export function toHtml(input, largeFractions = false) {
  if (input == null) return "";
  const s = String(input);
  if (s.includes("$")) {
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g;
    return s
      .split(regex)
      .map((p) => {
        if (p.startsWith("$$") && p.endsWith("$$")) return renderKatex(p.slice(2, -2), true);
        if (p.startsWith("$") && p.endsWith("$")) {
          return renderInlineExpression(p.slice(1, -1), largeFractions);
        }
        return formatPlainText(p);
      })
      .join("");
  }
  // bare latex detection (used for quiz options)
  if (/[\\^_{}~]/.test(s)) return renderKatex(s, false);
  return formatPlainText(s);
}

export const MathText = ({ text, className, largeFractions = false }) => {
  const html = useMemo(() => toHtml(text, largeFractions), [text, largeFractions]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
