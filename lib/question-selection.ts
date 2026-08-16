import "../data/hs25-additions";
import type { ProgressStore, Question, SessionMode } from "../types/question";

function normalizedPrompt(prompt: string) {
  return prompt.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizedSetup(setup?: string) {
  return setup?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
}

export function uniqueQuestionsById(questions: Question[]) {
  const seenIds = new Set<string>();
  const seenPrompts = new Set<string>();
  return questions.filter((question) => {
    // Identical wording is valid across different exams. Only suppress a
    // repeated prompt when it occurs inside the same exam bank.
    const prompt = `${question.examId}::${normalizedPrompt(question.prompt)}`;
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

export function shuffleQuestionsBySetupGroup(
  questions: Question[],
  random: () => number = Math.random,
) {
  const groups = new Map<string, Question[]>();

  for (const question of uniqueQuestionsById(questions)) {
    const setup = normalizedSetup(question.setup);
    const key = setup ? `${question.examId}::${setup}` : `question::${question.id}`;
    const group = groups.get(key) ?? [];
    group.push(question);
    groups.set(key, group);
  }

  const shuffledGroups = [...groups.values()].map((group) =>
    [...group].sort((left, right) => left.number - right.number),
  );

  for (let index = shuffledGroups.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffledGroups[index], shuffledGroups[swapIndex]] = [shuffledGroups[swapIndex], shuffledGroups[index]];
  }

  return shuffledGroups.flat();
}
