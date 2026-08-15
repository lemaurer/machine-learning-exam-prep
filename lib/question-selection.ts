import type { ProgressStore, Question, SessionMode } from "../types/question";

export function uniqueQuestionsById(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
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
