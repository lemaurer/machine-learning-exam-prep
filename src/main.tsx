import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import katex from "katex";
import "katex/dist/katex.min.css";
import "../app/globals.css";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import "../data/fs24-additions";
import "../data/hs23-additions";
import "../data/fs23-additions";
import "../data/hs22-additions";
import "../data/fs22-additions";
import { ExamPrepApp } from "../app/ExamPrepApp";
import { installMultiFigureSupport } from "../app/multi-figure";
import "../app/session-tight.css";

const root = document.getElementById("root");

if (!root) throw new Error("Missing application root.");

/*
 * Question prompts already use the React LatexText component. Question titles
 * are plain text in the current screen component, so render any inline $...$
 * fragments in those headings with the same KaTeX engine.
 */
function renderQuestionHeadingMath() {
  document.querySelectorAll<HTMLElement>(".exam-heading h1").forEach((heading) => {
    const source = heading.textContent ?? "";
    if (!/\$[^$\n]+\$/.test(source)) return;

    const parts = source.split(/(\$[^$\n]+\$)/g).filter(Boolean);
    heading.replaceChildren(...parts.map((part) => {
      if (!(part.startsWith("$") && part.endsWith("$"))) return document.createTextNode(part);
      const span = document.createElement("span");
      span.className = "latex-inline";
      span.innerHTML = katex.renderToString(part.slice(1, -1), {
        displayMode: false,
        throwOnError: false,
        strict: "ignore",
        output: "htmlAndMathml",
      });
      return span;
    }));
  });
}

let answerLayoutFrame = 0;

function getAnswerMeasureRoot() {
  let measureRoot = document.getElementById("answer-measure-root");
  if (!measureRoot) {
    measureRoot = document.createElement("div");
    measureRoot.id = "answer-measure-root";
    measureRoot.setAttribute("aria-hidden", "true");
    document.body.appendChild(measureRoot);
  }
  return measureRoot;
}

function measureNaturalAnswerWidth(button: HTMLButtonElement) {
  const clone = button.cloneNode(true) as HTMLButtonElement;
  clone.classList.add("answer-measure");
  clone.removeAttribute("disabled");
  getAnswerMeasureRoot().appendChild(clone);
  const width = clone.getBoundingClientRect().width;
  clone.remove();
  return width;
}

function classifyAnswerGrid(grid: HTMLElement) {
  const buttons = Array.from(grid.querySelectorAll<HTMLButtonElement>(":scope > .answer-button"));
  if (!buttons.length) return;

  grid.classList.remove("answer-layout-compact", "answer-layout-balanced", "answer-layout-stacked");
  grid.style.removeProperty("--answer-columns");
  grid.style.setProperty("--answer-fit-scale", "1");

  const gridWidth = grid.getBoundingClientRect().width;
  if (!gridWidth) return;

  const naturalWidths = buttons.map(measureNaturalAnswerWidth);
  const maxNaturalWidth = Math.max(...naturalWidths);
  const maxTextLength = Math.max(...buttons.map((button) => {
    const content = button.querySelector<HTMLElement>(":scope > span:last-child");
    return (content?.textContent ?? "").trim().length;
  }));
  const hasDisplayMath = buttons.some((button) => Boolean(button.querySelector(".latex-display, .katex-display")));

  const gap = 8;
  const compactColumns = buttons.length <= 4 ? buttons.length : buttons.length <= 6 ? 3 : 2;
  const compactColumnWidth = (gridWidth - gap * (compactColumns - 1)) / compactColumns;
  const balancedColumnWidth = (gridWidth - gap) / 2;
  const desktop = window.innerWidth > 850;

  const canUseCompact = desktop
    && !hasDisplayMath
    && maxTextLength <= 32
    && maxNaturalWidth <= compactColumnWidth;
  const canUseBalanced = desktop
    && !hasDisplayMath
    && maxTextLength <= 82
    && maxNaturalWidth <= balancedColumnWidth;

  if (canUseCompact) {
    grid.classList.add("answer-layout-compact");
    grid.style.setProperty("--answer-columns", String(compactColumns));
    return;
  }

  if (canUseBalanced) {
    grid.classList.add("answer-layout-balanced");
    return;
  }

  grid.classList.add("answer-layout-stacked");
  const fitScale = Math.min(1, (gridWidth - 8) / maxNaturalWidth);
  grid.style.setProperty("--answer-fit-scale", String(Math.max(0.62, fitScale)));
}

function adaptAnswerLayouts() {
  document.querySelectorAll<HTMLElement>(".answer-grid").forEach(classifyAnswerGrid);
}

function schedulePresentationPass() {
  window.cancelAnimationFrame(answerLayoutFrame);
  answerLayoutFrame = window.requestAnimationFrame(() => {
    renderQuestionHeadingMath();
    adaptAnswerLayouts();
  });
}

const presentationObserver = new MutationObserver((mutations) => {
  const hasRelevantMutation = mutations.some((mutation) => {
    const target = mutation.target;
    return !(target instanceof Element && target.closest("#answer-measure-root"));
  });
  if (hasRelevantMutation) schedulePresentationPass();
});
presentationObserver.observe(document.body, { childList: true, subtree: true });
window.addEventListener("resize", schedulePresentationPass);

/* Multi-select practice submit fix. */
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest<HTMLButtonElement>(".exam-commit .primary-button");
  const commit = button?.closest<HTMLElement>(".exam-commit");
  const instruction = commit?.querySelector<HTMLElement>(":scope > span")?.textContent?.trim();
  if (!button || !instruction?.startsWith("Select all answers that apply.")) return;

  event.preventDefault();
  event.stopPropagation();
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
}, true);

/*
 * Some older exams contain questions with G-I choices. The React shortcut
 * handler predates those exams and handles A-F, so map G-I to the visible
 * answer button here. Modified shortcuts remain untouched.
 */
document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;
  const target = event.target as HTMLElement | null;
  if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
  const key = event.key.toUpperCase();
  if (!/^[G-I]$/.test(key)) return;

  const button = Array.from(document.querySelectorAll<HTMLButtonElement>(".answer-grid > .answer-button"))
    .find((candidate) => candidate.querySelector("kbd")?.textContent?.trim().toUpperCase() === key);
  if (!button || button.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  button.click();
}, true);

installMultiFigureSupport();

createRoot(root).render(
  <StrictMode>
    <ExamPrepApp />
  </StrictMode>,
);
