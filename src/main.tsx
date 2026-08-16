import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import katex from "katex";
import "katex/dist/katex.min.css";
import "../app/globals.css";
import "../data/hs25-additions";
import { ExamPrepApp } from "../app/ExamPrepApp";

const root = document.getElementById("root");

if (!root) throw new Error("Missing application root.");

/*
 * Question prompts already use the React LatexText component. Question titles
 * are plain text in the current screen component, so render any inline $...$
 * fragments in those headings with the same KaTeX engine. This keeps titles
 * such as "CNN filter $F_3$" visually consistent with the exam body.
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

const headingObserver = new MutationObserver(renderQuestionHeadingMath);
headingObserver.observe(document.body, { childList: true, subtree: true });

/*
 * Practice multi-select questions submit through the same Enter-key path that
 * already submits the current selection correctly. The React button currently
 * forwards its MouseEvent into the optional answerIds argument, so intercept
 * only that specific practice control and trigger the no-argument submit path.
 */
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

createRoot(root).render(
  <StrictMode>
    <ExamPrepApp />
  </StrictMode>,
);
