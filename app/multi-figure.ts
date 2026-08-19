import { questions } from "../data/questions";
import { EDITS_KEY, applyEdits, loadEdits, saveEdits } from "../lib/progress";
import { applySharedFigureImage } from "../lib/question-edits";
import { loadImageFile, resolveStoredImageSource } from "../lib/images";
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
  return applyEdits(question, loadEdits()[question.id]);
}

function displayedFigureLabel(caption: string | undefined, figureNumber: number) {
  return caption?.match(/^\s*(Figure\s+\d+)/i)?.[1] ?? `Figure ${figureNumber}`;
}

function captionElement(text?: string) {
  if (!text) return undefined;
  const caption = document.createElement("figcaption");
  caption.textContent = text;
  return caption;
}

function useImageSource(image: HTMLImageElement, source: string) {
  void resolveStoredImageSource(source)
    .then((resolved) => {
      if (!resolved || !image.isConnected) return;
      image.src = resolveAssetUrl(resolved) ?? resolved;
    })
    .catch((error) => console.error("Could not restore figure image.", error));
}

function saveSecondFigure(question: Question, figure: string) {
  const current = loadEdits();
  const effective = effectiveQuestion(question);
  if (!effective.secondFigureNumber) return;
  const next = applySharedFigureImage(current, effective, questions, figure, effective.secondFigureNumber);
  saveEdits(next);
}

function relabelPrimaryPlaceholder(card: HTMLElement, question: Question) {
  if (!question.figureNumber) return;
  const label = card.querySelector<HTMLElement>(":scope > .figure-placeholder-shell:not(.secondary-figure-slot) .figure-dropzone-number");
  if (label) label.textContent = displayedFigureLabel(question.figureCaption, question.figureNumber);
}

function renderSecondFigure(card: HTMLElement, sourceQuestion: Question) {
  const question = effectiveQuestion(sourceQuestion);
  const figureNumber = question.secondFigureNumber;
  if (!figureNumber) return;

  relabelPrimaryPlaceholder(card, question);

  const existing = card.querySelector<HTMLElement>(`:scope > [data-secondary-figure="${figureNumber}"]`);
  if (existing) return;

  const shell = document.createElement("figure");
  shell.dataset.secondaryFigure = String(figureNumber);
  shell.className = "figure-placeholder-shell secondary-figure-slot";

  if (question.secondFigure) {
    const image = document.createElement("img");
    image.alt = question.secondFigureAlt ?? displayedFigureLabel(question.secondFigureCaption, figureNumber);
    shell.appendChild(image);
    useImageSource(image, question.secondFigure);
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
    numberLabel.textContent = displayedFigureLabel(question.secondFigureCaption, figureNumber);
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
        saveSecondFigure(sourceQuestion, figure);
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
      if (!question) return;
      const effective = effectiveQuestion(question);
      if (effective.secondFigureNumber) renderSecondFigure(card, question);
      else card.querySelectorAll(":scope > .secondary-figure-slot").forEach((node) => node.remove());
    });
  });
}

export function installMultiFigureSupport() {
  schedule();
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => !(mutation.target instanceof Element && mutation.target.closest(".secondary-figure-slot")))) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("storage", (event) => {
    if (event.key !== EDITS_KEY) return;
    document.querySelectorAll(".secondary-figure-slot").forEach((node) => node.remove());
    schedule();
  });
}
