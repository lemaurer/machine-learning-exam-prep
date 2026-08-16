import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "../app/globals.css";
import "../data/hs25-additions";
import { ExamPrepApp } from "../app/ExamPrepApp";

const root = document.getElementById("root");

if (!root) throw new Error("Missing application root.");

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
