import { questions } from "../data/questions";
import { EDITS_KEY, loadEdits, saveEdits } from "../lib/progress";
import { inferFigureNumber } from "../lib/question-edits";
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

function currentOpenQuestion() {
  const card = document.querySelector<HTMLElement>(".question-card");
  return card ? currentQuestionForCard(card) : undefined;
}

function effectiveQuestion(question: Question): Question {
  const edit = loadEdits()[question.id];
  if (!edit) return question;
  const { commonSetupQuestionIds, sharedFigureQuestionIds, ...fields } = edit;
  void commonSetupQuestionIds;
  void sharedFigureQuestionIds;
  return { ...question, ...fields };
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

function saveSecondFigure(question: Question, figure: string) {
  const current = loadEdits();
  const effective = effectiveQuestion(question);
  saveEdits({
    ...current,
    [question.id]: {
      ...(current[question.id] ?? {}),
      secondFigureNumber: effective.secondFigureNumber,
      secondFigure: figure,
      secondFigureAlt: effective.secondFigureAlt,
      secondFigureCaption: effective.secondFigureCaption,
    },
  });
  question.secondFigure = figure;
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
    image.src = resolveAssetUrl(question.secondFigure);
    image.alt = question.secondFigureAlt ?? displayedFigureLabel(question.secondFigureCaption, figureNumber);
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

function renderSecondFigureEditor(panel: HTMLElement, sourceQuestion: Question) {
  const question = effectiveQuestion(sourceQuestion);
  const figureNumber = question.secondFigureNumber;
  if (!figureNumber || panel.querySelector("[data-second-figure-editor]")) return;

  const section = document.createElement("div");
  section.className = "editor-figure-section";
  section.dataset.secondFigureEditor = "true";

  const heading = document.createElement("div");
  heading.className = "editor-figure-heading";
  const strongHeading = document.createElement("strong");
  strongHeading.textContent = `Second figure · ${displayedFigureLabel(question.secondFigureCaption, figureNumber)}`;
  const help = document.createElement("small");
  help.textContent = "This is a separate image slot for this question.";
  heading.append(strongHeading, help);
  section.appendChild(heading);

  const upload = document.createElement("label");
  upload.className = "editor-file-button";
  const uploadText = document.createElement("span");
  uploadText.textContent = question.secondFigure ? "Replace second figure" : "Choose second figure from this computer";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  upload.append(uploadText, input);
  section.appendChild(upload);

  const preview = document.createElement("div");
  section.appendChild(preview);

  const renderPreview = () => {
    preview.replaceChildren();
    const effective = effectiveQuestion(sourceQuestion);
    if (effective.secondFigure) {
      const figure = document.createElement("figure");
      figure.className = "editor-figure-preview";
      const image = document.createElement("img");
      image.src = resolveAssetUrl(effective.secondFigure);
      image.alt = effective.secondFigureAlt ?? displayedFigureLabel(effective.secondFigureCaption, figureNumber);
      figure.appendChild(image);
      const caption = captionElement(effective.secondFigureCaption);
      if (caption) figure.appendChild(caption);
      preview.appendChild(figure);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "live-preview";
      const label = document.createElement("span");
      label.textContent = "Figure placeholder";
      const body = document.createElement("div");
      body.textContent = `${displayedFigureLabel(effective.secondFigureCaption, figureNumber)} has no image yet.`;
      placeholder.append(label, body);
      preview.appendChild(placeholder);
    }
  };

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    input.disabled = true;
    uploadText.textContent = "Preparing image…";
    try {
      const figure = await loadImageFile(file);
      saveSecondFigure(sourceQuestion, figure);
      uploadText.textContent = "Replace second figure";
      renderPreview();
      document.querySelectorAll(".secondary-figure-slot").forEach((node) => node.remove());
      schedule();
    } catch (error) {
      uploadText.textContent = error instanceof Error ? error.message : "Could not use that image.";
    } finally {
      input.disabled = false;
    }
  });

  renderPreview();
  const options = panel.querySelector<HTMLElement>(".editor-options");
  if (options) panel.insertBefore(section, options);
  else panel.appendChild(section);
}

let frame = 0;
function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>(".question-card").forEach((card) => {
      const question = currentQuestionForCard(card);
      if (question?.secondFigureNumber) renderSecondFigure(card, question);
    });

    const panel = document.querySelector<HTMLElement>(".editor-panel");
    const question = currentOpenQuestion();
    if (panel && question?.secondFigureNumber) renderSecondFigureEditor(panel, question);
  });
}

export function installMultiFigureSupport() {
  schedule();
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => !(mutation.target instanceof Element && mutation.target.closest("[data-second-figure-editor], .secondary-figure-slot")))) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("storage", (event) => {
    if (event.key !== EDITS_KEY) return;
    document.querySelectorAll(".secondary-figure-slot, [data-second-figure-editor]").forEach((node) => node.remove());
    schedule();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const saveButton = target.closest<HTMLButtonElement>(".editor-actions .primary-button");
    const question = currentOpenQuestion();
    if (!saveButton || !question?.secondFigureNumber) return;
    const preserved = loadEdits()[question.id];
    const secondFields = preserved ? {
      secondFigureNumber: preserved.secondFigureNumber,
      secondFigure: preserved.secondFigure,
      secondFigureAlt: preserved.secondFigureAlt,
      secondFigureCaption: preserved.secondFigureCaption,
    } : undefined;
    if (!secondFields?.secondFigureNumber) return;
    setTimeout(() => {
      const current = loadEdits();
      saveEdits({ ...current, [question.id]: { ...(current[question.id] ?? {}), ...secondFields } });
    }, 0);
  }, true);
}
