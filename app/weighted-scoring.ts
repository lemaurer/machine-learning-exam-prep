import { EXAMS, questions } from "../data/questions";
import { loadProgress } from "../lib/progress";
import {
  questionPoints,
  weightedProgressBreakdown,
  weightedProgressScore,
  type ScoreBreakdownDimension,
} from "../lib/scoring";
import { DIFFICULTIES, TOPICS } from "../types/question";
import "./accuracy-breakdown.css";

const ACCURACY_VISIBILITY_KEY = "iml-show-accuracy-v1";
let breakdownDimension: ScoreBreakdownDimension = "topic";

function accuracyVisible() {
  try {
    return window.localStorage.getItem(ACCURACY_VISIBILITY_KEY) === "true";
  } catch {
    return false;
  }
}

function setAccuracyVisible(visible: boolean) {
  try {
    window.localStorage.setItem(ACCURACY_VISIBILITY_KEY, visible ? "true" : "false");
  } catch {
    // The visibility preference is non-critical; keep the default hidden state.
  }
  document.body.classList.toggle("show-accuracy", visible);
  schedule();
}

function setText(element: Element | null, value: string) {
  if (element && element.textContent !== value) element.textContent = value;
}

function findAccuracyCell() {
  const cells = Array.from(document.querySelectorAll<HTMLElement>(".stat-grid > div"));
  return cells.find((cell) => {
    const label = cell.querySelector("span")?.textContent?.trim().toLowerCase();
    return label === "accuracy" || label === "weighted accuracy";
  });
}

function patchProgressAccuracy() {
  const visible = accuracyVisible();
  document.body.classList.toggle("show-accuracy", visible);

  const header = document.querySelector<HTMLElement>(".header-stat");
  if (header) header.hidden = !visible;

  const accuracyCell = findAccuracyCell();
  if (accuracyCell) accuracyCell.hidden = !visible;

  if (!visible) return;

  const score = weightedProgressScore(questions, loadProgress());
  const display = score.possiblePoints ? `${score.percentage}%` : "—";

  if (header) {
    setText(header.querySelector("span"), display);
    setText(header.querySelector("small"), "weighted accuracy");
  }
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

function orderedBreakdown(dimension: ScoreBreakdownDimension) {
  const rows = weightedProgressBreakdown(questions, loadProgress(), dimension);
  const order = dimension === "topic"
    ? [...TOPICS]
    : dimension === "difficulty"
      ? [...DIFFICULTIES]
      : EXAMS.map((exam) => exam.id);
  const rank = new Map(order.map((key, index) => [key, index]));
  return rows.sort((left, right) => (rank.get(left.key) ?? 999) - (rank.get(right.key) ?? 999));
}

function ensureStatisticsSettings(panel: HTMLElement) {
  let settings = panel.querySelector<HTMLDetailsElement>(":scope > .statistics-settings");
  if (!settings) {
    settings = document.createElement("details");
    settings.className = "statistics-settings";

    const summary = document.createElement("summary");
    summary.textContent = "Settings";

    const label = document.createElement("label");
    label.className = "statistics-setting";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Show accuracy statistics");
    checkbox.addEventListener("change", () => setAccuracyVisible(checkbox.checked));

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = "Show accuracy statistics";
    const hint = document.createElement("small");
    hint.textContent = "Reveal point-weighted overall and category accuracy.";
    copy.append(title, hint);
    label.append(checkbox, copy);
    settings.append(summary, label);

    const actions = panel.querySelector(":scope > .local-actions");
    if (actions) panel.insertBefore(settings, actions);
    else panel.appendChild(settings);
  }

  const checkbox = settings.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (checkbox) checkbox.checked = accuracyVisible();
  return settings;
}

function ensureAccuracyBreakdown(panel: HTMLElement) {
  const existing = panel.querySelector<HTMLElement>(":scope > .accuracy-breakdown");
  if (existing) return existing;

  const details = document.createElement("details");
  details.className = "accuracy-breakdown";

  const summary = document.createElement("summary");
  const summaryTitle = document.createElement("strong");
  summaryTitle.textContent = "Accuracy by category";
  const summaryHint = document.createElement("span");
  summaryHint.textContent = "point-weighted";
  summary.append(summaryTitle, summaryHint);
  details.appendChild(summary);

  const controls = document.createElement("div");
  controls.className = "accuracy-breakdown-controls";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Accuracy breakdown dimension");
  for (const [value, label] of [["topic", "Topic"], ["difficulty", "Difficulty"], ["exam", "Exam"]] as const) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
  select.value = breakdownDimension;
  select.addEventListener("change", () => {
    breakdownDimension = select.value as ScoreBreakdownDimension;
    details.dataset.breakdownSignature = "";
    schedule();
  });
  controls.appendChild(select);
  details.appendChild(controls);

  const list = document.createElement("div");
  list.className = "accuracy-breakdown-list";
  details.appendChild(list);

  const settings = panel.querySelector(":scope > .statistics-settings");
  if (settings) panel.insertBefore(details, settings);
  else panel.appendChild(details);
  return details;
}

function patchAccuracyBreakdown() {
  const panel = document.querySelector<HTMLElement>(".stats-panel");
  if (!panel) return;

  ensureStatisticsSettings(panel);

  if (!accuracyVisible()) {
    panel.querySelector(":scope > .accuracy-breakdown")?.remove();
    return;
  }

  const details = ensureAccuracyBreakdown(panel);
  const rows = orderedBreakdown(breakdownDimension);
  const signature = JSON.stringify([
    breakdownDimension,
    ...rows.map((row) => [row.key, row.earnedPoints, row.possiblePoints, row.percentage]),
  ]);
  if (details.dataset.breakdownSignature === signature) return;
  details.dataset.breakdownSignature = signature;

  const list = details.querySelector<HTMLElement>(".accuracy-breakdown-list");
  if (!list) return;
  const tiles = rows.map((row) => {
    const tile = document.createElement("div");
    tile.className = "accuracy-breakdown-row";

    const heading = document.createElement("div");
    heading.className = "accuracy-breakdown-row-heading";
    const label = document.createElement("span");
    label.textContent = row.label;
    const value = document.createElement("strong");
    value.textContent = row.possiblePoints ? `${row.percentage}%` : "—";
    heading.append(label, value);

    const points = document.createElement("small");
    points.textContent = row.possiblePoints
      ? `${row.earnedPoints} / ${row.possiblePoints} pts`
      : "No attempts";

    const track = document.createElement("div");
    track.className = "accuracy-breakdown-track";
    const fill = document.createElement("span");
    fill.style.width = row.possiblePoints ? `${row.percentage}%` : "0%";
    track.appendChild(fill);

    tile.append(heading, track, points);
    return tile;
  });
  list.replaceChildren(...tiles);
}

let frame = 0;
function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    patchProgressAccuracy();
    patchResultScore();
    patchAccuracyBreakdown();
  });
}

export function installWeightedScoringPresentation() {
  document.body.classList.toggle("show-accuracy", accuracyVisible());
  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("storage", schedule);
}
