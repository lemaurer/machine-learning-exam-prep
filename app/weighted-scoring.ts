import { questions } from "../data/questions";
import { loadProgress } from "../lib/progress";
import { questionPoints, weightedProgressScore } from "../lib/scoring";

function setText(element: Element | null, value: string) {
  if (element && element.textContent !== value) element.textContent = value;
}

function patchProgressAccuracy() {
  const score = weightedProgressScore(questions, loadProgress());
  const display = score.possiblePoints ? `${score.percentage}%` : "—";

  const header = document.querySelector<HTMLElement>(".header-stat");
  if (header) {
    setText(header.querySelector("span"), display);
    setText(header.querySelector("small"), "weighted accuracy");
  }

  const cells = Array.from(document.querySelectorAll<HTMLElement>(".stat-grid > div"));
  const accuracyCell = cells.find((cell) => {
    const label = cell.querySelector("span")?.textContent?.trim().toLowerCase();
    return label === "accuracy" || label === "weighted accuracy";
  });
  if (accuracyCell) {
    setText(accuracyCell.querySelector("strong"), display);
    setText(accuracyCell.querySelector("span"), "weighted accuracy");
  }
}

function questionFromResultItem(item: HTMLElement) {
  const meta = item.querySelector<HTMLElement>(".result-question small")?.textContent ?? "";
  const match = meta.match(/^\s*((?:HS|FS)\d{2})\s*·\s*Question\s+(\d+)/i);
  if (!match) return undefined;
  const examId = match[1].toUpperCase();
  const number = Number(match[2]);
  return questions.find((question) => question.examId === examId && question.number === number);
}

function patchResultScore() {
  const page = document.querySelector<HTMLElement>(".results-page");
  if (!page) return;

  const items = Array.from(page.querySelectorAll<HTMLElement>(".answer-item"));
  if (!items.length) return;

  let earnedPoints = 0;
  let possiblePoints = 0;
  for (const item of items) {
    const question = questionFromResultItem(item);
    if (!question) continue;
    const points = questionPoints(question);
    possiblePoints += points;
    if (item.classList.contains("correct")) earnedPoints += points;
  }
  if (!possiblePoints) return;

  const percentage = Math.round((earnedPoints / possiblePoints) * 100);
  const ring = page.querySelector<HTMLElement>(".score-ring");
  if (ring) ring.style.setProperty("--score", `${percentage * 3.6}deg`);
  setText(ring?.querySelector("strong") ?? null, `${percentage}%`);
  setText(ring?.querySelector("span") ?? null, `${earnedPoints} / ${possiblePoints} points`);

  const headline = page.querySelector<HTMLElement>(".result-hero h1");
  setText(headline, percentage === 100 ? "Complete precision." : percentage >= 70 ? "A strong pass." : "Useful diagnosis.");
}

let frame = 0;
function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    patchProgressAccuracy();
    patchResultScore();
  });
}

export function installWeightedScoringPresentation() {
  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("storage", schedule);
}
