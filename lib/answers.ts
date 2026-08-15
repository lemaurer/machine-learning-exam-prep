import type { Question, QuestionOption } from "../types/question";

export type OptionId = QuestionOption["id"];

export function correctOptionIds(question: Question): OptionId[] {
  return question.correctOptionIds?.length ? question.correctOptionIds : [question.correctOptionId];
}

export function isCorrectSelection(question: Question, selectedIds: OptionId[]) {
  const expected = [...correctOptionIds(question)].sort();
  const selected = [...new Set(selectedIds)].sort();
  return selected.length === expected.length && selected.every((id, index) => id === expected[index]);
}

export function answerLabel(ids: OptionId[]) {
  return ids.length ? ids.join(", ") : "Skipped";
}
