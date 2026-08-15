import type { Question, QuestionOption } from "../types/question";

export type OptionId = QuestionOption["id"];

export const DISPLAY_OPTION_IDS: OptionId[] = ["A", "B", "C", "D", "E", "F"];

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

export function shuffledOptionIds(question: Question, random = Math.random): OptionId[] {
  const ids = question.options.map((option) => option.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  return ids;
}

export function displayedOptionLabel(optionId: OptionId, optionOrder: OptionId[]): OptionId {
  const index = optionOrder.indexOf(optionId);
  return index >= 0 ? (DISPLAY_OPTION_IDS[index] ?? optionId) : optionId;
}

export function displayedAnswerLabel(ids: OptionId[], optionOrder: OptionId[]) {
  if (!ids.length) return "Skipped";
  return [...new Set(ids)]
    .sort((left, right) => optionOrder.indexOf(left) - optionOrder.indexOf(right))
    .map((id) => displayedOptionLabel(id, optionOrder))
    .join(", ");
}

export function optionIdForDisplayedKey(key: string, optionOrder: OptionId[]): OptionId | undefined {
  const displayIndex = DISPLAY_OPTION_IDS.indexOf(key.toUpperCase() as OptionId);
  return displayIndex >= 0 ? optionOrder[displayIndex] : undefined;
}

export function shouldIgnoreAnswerShortcut(event: {
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  isComposing?: boolean;
}) {
  return event.metaKey || event.ctrlKey || event.altKey || Boolean(event.isComposing);
}
