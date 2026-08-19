import type {
  EditStore,
  ProgressStore,
  Question,
  QuestionEdit,
  QuestionOption,
  QuestionProgress,
} from "../types/question";
import { prepareEditImagesForStorage } from "./images";

export const PROGRESS_KEY = "iml-exam-prep-progress-v1";
export const EDITS_KEY = "iml-exam-prep-edits-v1";

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function cleanLegacyFigureEdits(edits: EditStore): EditStore {
  let changed = false;
  const next: EditStore = Object.fromEntries(Object.entries(edits).map(([id, original]) => {
    const edit: QuestionEdit = { ...original };

    if (id === "hs22-q10" && edit.figureNumber === 4) {
      delete edit.figureNumber;
      delete edit.figure;
      delete edit.figureAlt;
      delete edit.figureCaption;
      changed = true;
    }
    if (id === "hs22-q10" && edit.secondFigureNumber === 4) {
      delete edit.secondFigureNumber;
      delete edit.secondFigure;
      delete edit.secondFigureAlt;
      delete edit.secondFigureCaption;
      changed = true;
    }
    if (edit.figureNumber === 4 && edit.sharedFigureQuestionIds?.includes("hs22-q10")) {
      edit.sharedFigureQuestionIds = edit.sharedFigureQuestionIds.filter((memberId) => memberId !== "hs22-q10");
      changed = true;
    }
    if (edit.secondFigureNumber === 4 && edit.secondSharedFigureQuestionIds?.includes("hs22-q10")) {
      edit.secondSharedFigureQuestionIds = edit.secondSharedFigureQuestionIds.filter((memberId) => memberId !== "hs22-q10");
      changed = true;
    }

    return [id, edit];
  }));
  return changed ? next : edits;
}

export function loadProgress() {
  return loadJson<ProgressStore>(PROGRESS_KEY, {});
}

export function saveProgress(progress: ProgressStore) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Could not save study progress.", error);
  }
}

export function loadEdits() {
  return cleanLegacyFigureEdits(loadJson<EditStore>(EDITS_KEY, {}));
}

export function saveEdits(edits: EditStore) {
  try {
    window.localStorage.setItem(EDITS_KEY, JSON.stringify(prepareEditImagesForStorage(edits)));
    return true;
  } catch (error) {
    console.error("Could not save question edits.", error);
    return false;
  }
}

export function applyEdits(question: Question, edit?: QuestionEdit): Question {
  if (!edit) return question;
  const {
    commonSetupQuestionIds,
    sharedFigureQuestionIds,
    secondSharedFigureQuestionIds,
    hiddenFigureNumbers = [],
    ...questionEdit
  } = edit;
  void commonSetupQuestionIds;
  void sharedFigureQuestionIds;
  void secondSharedFigureQuestionIds;

  const merged: Question = { ...question, ...questionEdit, id: question.id, examId: question.examId };
  const hidden = new Set(hiddenFigureNumbers);

  if (merged.figureNumber && hidden.has(merged.figureNumber)) {
    merged.figureNumber = undefined;
    merged.figure = undefined;
    merged.figureAlt = undefined;
    merged.figureCaption = undefined;
  }
  if (merged.secondFigureNumber && hidden.has(merged.secondFigureNumber)) {
    merged.secondFigureNumber = undefined;
    merged.secondFigure = undefined;
    merged.secondFigureAlt = undefined;
    merged.secondFigureCaption = undefined;
  }

  return merged;
}

export function answerProgress(
  previous: QuestionProgress | undefined,
  answerIds: QuestionOption["id"] | QuestionOption["id"][],
  correct: boolean,
  now = new Date(),
): QuestionProgress {
  const selected = Array.isArray(answerIds) ? answerIds : [answerIds];
  return {
    status: correct ? "done" : "review",
    attempts: (previous?.attempts ?? 0) + 1,
    correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
    incorrect: (previous?.incorrect ?? 0) + (correct ? 0 : 1),
    lastAnswerId: selected[0] ?? previous?.lastAnswerId ?? "A",
    lastAnswerIds: selected,
    lastAnsweredAt: now.toISOString(),
  };
}

export function markLatestAttemptCorrect(previous: QuestionProgress | undefined): QuestionProgress | undefined {
  if (!previous || previous.incorrect <= 0) return previous;
  return {
    ...previous,
    status: "done",
    correct: previous.correct + 1,
    incorrect: previous.incorrect - 1,
  };
}

export function setQuestionStatus(
  previous: QuestionProgress | undefined,
  status: QuestionProgress["status"],
): QuestionProgress {
  return {
    status,
    attempts: previous?.attempts ?? 0,
    correct: previous?.correct ?? 0,
    incorrect: previous?.incorrect ?? 0,
    lastAnswerId: previous?.lastAnswerId ?? "A",
    lastAnswerIds: previous?.lastAnswerIds ?? (previous?.lastAnswerId ? [previous.lastAnswerId] : []),
    lastAnsweredAt: previous?.lastAnsweredAt ?? new Date().toISOString(),
  };
}

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
