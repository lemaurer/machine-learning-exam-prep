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

const REMAPPED_LABEL_START = "\uE000";
const REMAPPED_LABEL_END = "\uE001";

function protectedDisplayedLabel(optionId: OptionId, optionOrder: OptionId[]) {
  const displayed = displayedOptionLabel(optionId, optionOrder);
  const index = DISPLAY_OPTION_IDS.indexOf(displayed);
  return `${REMAPPED_LABEL_START}${index}${REMAPPED_LABEL_END}`;
}

function remapLetterList(value: string, optionOrder: OptionId[]) {
  return value.replace(/[A-F]/gi, (letter) => protectedDisplayedLabel(letter.toUpperCase() as OptionId, optionOrder));
}

function restoreProtectedLabels(value: string) {
  const pattern = new RegExp(`${REMAPPED_LABEL_START}(\\d)${REMAPPED_LABEL_END}`, "g");
  return value.replace(pattern, (_match, index: string) => DISPLAY_OPTION_IDS[Number(index)] ?? "");
}

function remapSolutionTextChunk(text: string, optionOrder: OptionId[]) {
  let result = text;

  // Explicit option-reference markup. This is the safest convention for edited
  // solutions: [[C]] or [[A, B]] always means answer-option IDs, never a math label.
  result = result.replace(
    /\[\[\s*([A-F](?:\s*(?:(?:,|\/|&|\+)\s*|\s+and\s+)[A-F])*)\s*\]\]/gi,
    (_match, ids: string) => remapLetterList(ids, optionOrder),
  );

  // Natural-language answer references such as "Option C", "Answer: B", or
  // "Correct answers A and B". We deliberately do not replace arbitrary A-F
  // letters so labels such as "Plot B" remain stable.
  result = result.replace(
    /\b((?:correct\s+)?(?:answer|answers|option|options|choice|choices)\s*(?::|=|is|are)?\s*)([A-F](?:\s*(?:(?:,|\/|&|\+)\s*|\s+and\s+)[A-F])*)\b/gi,
    (_match, prefix: string, ids: string) => `${prefix}${remapLetterList(ids, optionOrder)}`,
  );

  // Standard solution keys often begin with "C.", "C)", "C:" or "(C)".
  result = result.replace(
    /^(\s*)\(([A-F])\)(?=\s|$)/i,
    (_match, whitespace: string, id: string) => `${whitespace}(${protectedDisplayedLabel(id.toUpperCase() as OptionId, optionOrder)})`,
  );
  result = result.replace(
    /^(\s*)([A-F])(?=\s*[.):\-]\s)/i,
    (_match, whitespace: string, id: string) => `${whitespace}${protectedDisplayedLabel(id.toUpperCase() as OptionId, optionOrder)}`,
  );

  // "B is correct" / "A and C are the correct answers" is unambiguous enough
  // outside LaTeX and lets normal prose solutions follow the shuffled labels.
  result = result.replace(
    /\b([A-F](?:\s*(?:(?:,|&|\+)\s*|\s+and\s+)[A-F])*)\s+(is|are)\s+(the\s+)?correct(?=\b)/gi,
    (_match, ids: string, verb: string, article: string | undefined) => `${remapLetterList(ids, optionOrder)} ${verb} ${article ?? ""}correct`,
  );

  // If the whole solution is just an answer key such as "C" or "A, B", map it.
  if (/^\s*[A-F](?:\s*(?:(?:,|\/|&|\+)\s*|\s+and\s+)[A-F])*\s*$/i.test(result)) {
    result = remapLetterList(result, optionOrder);
  }

  return restoreProtectedLabels(result);
}

/**
 * Rewrites only answer-option references in a solution from the source A-F IDs
 * to the letters currently shown after shuffling. LaTeX spans are protected so
 * mathematical labels such as $A$, $B$, and $C$ are never rewritten.
 */
export function remapSolutionOptionReferences(text: string, optionOrder: OptionId[]) {
  if (!text || !optionOrder.length) return text;

  const mathPattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]*\$)/g;
  let output = "";
  let cursor = 0;

  for (const match of text.matchAll(mathPattern)) {
    const index = match.index ?? 0;
    output += remapSolutionTextChunk(text.slice(cursor, index), optionOrder);
    output += match[0];
    cursor = index + match[0].length;
  }

  output += remapSolutionTextChunk(text.slice(cursor), optionOrder);
  return output;
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
