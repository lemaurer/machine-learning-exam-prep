import "../data/hs25-additions";
import type { ProgressStore, Question, SessionMode } from "../types/question";

function normalizedPrompt(prompt: string) {
  return prompt.replace(/\s+/g, " ").trim().toLowerCase();
}

export function uniqueQuestionsById(questions: Question[]) {
  const seenIds = new Set<string>();
  const seenPrompts = new Set<string>();
  return questions.filter((question) => {
    const prompt = normalizedPrompt(question.prompt);
    if (seenIds.has(question.id) || seenPrompts.has(prompt)) return false;
    seenIds.add(question.id);
    seenPrompts.add(prompt);
    return true;
  });
}

export function questionsForExam(questions: Question[], examId: string) {
  return uniqueQuestionsById(questions)
    .filter((question) => question.examId === examId)
    .sort((left, right) => left.number - right.number);
}

export function questionsAvailableForMode(
  questions: Question[],
  progress: ProgressStore,
  mode: SessionMode,
) {
  return uniqueQuestionsById(questions).filter((question) => {
    if (mode === "exam") return true;
    const status = progress[question.id]?.status ?? "new";
    return mode === "review" ? status === "review" : status === "new";
  });
}
