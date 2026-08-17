import { questions } from "../data/questions";
import { EDITS_KEY, loadEdits, saveEdits } from "../lib/progress";
import { applySharedFigureImage, inferFigureNumber, inferFigureNumbers } from "../lib/question-edits";
import { loadImageFile } from "../lib/images";
import { resolveAssetUrl } from "../lib/assets";
import type { Question } from "../types/question";

function currentQuestionForCard(card: HTMLElement) {
  const examId = card.querySelector<HTMLElement>(".question-meta > span")?.textContent?.trim();
  const questionLabel = card.querySelector<HTMLElement>(".exam-heading > span")?.textContent ?? "";
  const number = Number(questionLabel.match(/Question\s+(\d+)/i)?.[1]);
  if (!examId || !number) return undefined;
  return questions.find((question) => question.examId === examId && question.number === number);
}

function effectiveQuestion(question: Question): Question {
  const edit = loadEdits()[question.id];
  if (!edit) return question;
  const { commonSetupQuestionIds, sharedFigureQuestionIds, ...fields } = edit;
  void commonSetupQuestionIds;
  void sharedFigureQuestionIds;
  return { ...question, ...fields };
}

function captionElement(text?: string) {
  if (!text) return undefined;
  const caption = document.createElement("figcaption");
  caption.textContent = text;
  return caption;
}

function renderSecondFigure(card: HTMLElement, sourceQuestion: Question) {
  const question = effectiveQuestion(sourceQuestion);
  const figureNumber = question.secondFigureNumber;
  if (!figureNumber) return;

  const existing = card.querySelector<HTMLElement>(`:scope > [data-secondary-figure="${figureNumber}"]`);
  if (existing) return;

  const shell = document.createElement("figure");
  shell.dataset.secondaryFigure = String(figureNumber);
  shell.className = "figure-placeholder-shell secondary-figure-slot";

  if (question.secondFigure) {
    const image = document.createElement("img");
    image.src = resolveAssetUrl(question.secondFigure);
    image.alt = question.secondFigureAlt ?? `Figure ${figureNumber}`;
    shell.appendChild(image);
    const caption = captionElement(question.secondFigureCaption);
    if (caption) shell.appendChild(caption);
  } else {
    const label = document.createElement("label");
    label.className = "figure-dropzone";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    const numberLabel = document.createElement("span");
    numberLabel.className = "figure-dropzone-number";
    numberLabel.textContent = `Figure ${figureNumber}`;
    const strong = document.createElement("strong");
    strong.textContent = "Drop an image here";
    const small = document.createElement("small");
    small.textContent = "or click to choose an image";

    label.append(input, numberLabel, strong, small);
    shell.appendChild(label);
    const caption = captionElement(question.secondFigureCaption);
    if (caption) shell.appendChild(caption);

    const useFile = async (file?: File) => {
      if (!file || input.disabled) return;
      input.disabled = true;
      strong.textContent = "Preparing image…";
      small.textContent = "Resizing and compressing for the question bank";
      try {
        const figure = await loadImageFile(file);
        const current = loadEdits();
        const next = applySharedFigureImage(current, question, questions, figure, figureNumber);
        saveEdits(next);

        // Keep this open session immediately in sync as well. React reads the
        // same question objects on subsequent navigation, while localStorage
        // remains the durable source across reloads.
        for (const candidate of questions) {
          if (candidate.examId !== question.examId || !inferFigureNumbers(candidate).includes(figureNumber)) continue;
          if (candidate.secondFigureNumber === figureNumber) candidate.secondFigure = figure;
          else if (inferFigureNumber(candidate) === figureNumber) candidate.figure = figure;
        }

        shell.remove();
        renderSecondFigure(card, sourceQuestion);
        window.dispatchEvent(new Event("resize"));
      } catch (error) {
        input.disabled = false;
        strong.textContent = "Drop an image here";
        small.textContent = error instanceof Error ? error.message : "Could not use that image.";
      }
    };

    label.addEventListener("dragenter", (event) => { event.preventDefault(); label.classList.add("drag-active"); });
    label.addEventListener("dragover", (event) => { event.preventDefault(); label.classList.add("drag-active"); });
    label.addEventListener("dragleave", (event) => { event.preventDefault(); label.classList.remove("drag-active"); });
    label.addEventListener("drop", (event) => {
      event.preventDefault();
      label.classList.remove("drag-active");
      void useFile(event.dataTransfer?.files?.[0]);
    });
    input.addEventListener("change", () => void useFile(input.files?.[0]));
  }

  const prompt = card.querySelector<HTMLElement>(":scope > .prompt");
  if (prompt) card.insertBefore(shell, prompt);
  else card.appendChild(shell);
}

let frame = 0;
function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>(".question-card").forEach((card) => {
      const question = currentQuestionForCard(card);
      if (question?.secondFigureNumber) renderSecondFigure(card, question);
    });
  });
}

export function installMultiFigureSupport() {
  schedule();
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => !(mutation.target instanceof Element && mutation.target.closest(".secondary-figure-slot")))) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // A reset performed in another tab/window should also refresh secondary slots.
  window.addEventListener("storage", (event) => {
    if (event.key !== EDITS_KEY) return;
    document.querySelectorAll(".secondary-figure-slot").forEach((node) => node.remove());
    schedule();
  });
}
