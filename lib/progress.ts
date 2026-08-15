import type {
  EditStore,
  ProgressStore,
  Question,
  QuestionEdit,
  QuestionOption,
  QuestionProgress,
} from "../types/question";

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

export function loadProgress() {
  return loadJson<ProgressStore>(PROGRESS_KEY, {});
}

export function saveProgress(progress: ProgressStore) {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadEdits() {
  return loadJson<EditStore>(EDITS_KEY, {});
}

export function saveEdits(edits: EditStore) {
  window.localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
}

export function applyEdits(question: Question, edit?: QuestionEdit): Question {
  if (!edit) return question;
  const { commonSetupQuestionIds, ...questionEdit } = edit;
  void commonSetupQuestionIds;
  return { ...question, ...questionEdit, id: question.id, examId: question.examId };
}

export function answerProgress(
  previous: QuestionProgress | undefined,
  answerId: QuestionOption["id"],
  correct: boolean,
  now = new Date(),
): QuestionProgress {
  return {
    status: correct ? "done" : "review",
    attempts: (previous?.attempts ?? 0) + 1,
    correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
    incorrect: (previous?.incorrect ?? 0) + (correct ? 0 : 1),
    lastAnswerId: answerId,
    lastAnsweredAt: now.toISOString(),
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
