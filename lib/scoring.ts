import type { ProgressStore, Question } from "../types/question";

export type WeightedScore = {
  earnedPoints: number;
  possiblePoints: number;
  percentage: number;
};

export type ScoreBreakdown = WeightedScore & {
  key: string;
  label: string;
};

export type ScoreBreakdownDimension = "topic" | "difficulty" | "exam";

export function questionPoints(question: Question): number {
  const match = question.source.match(/(?:^|·)\s*(\d+)\s+points?\b/i);
  const points = match ? Number(match[1]) : Number.NaN;
  return Number.isFinite(points) && points > 0 ? points : 1;
}

export function weightedProgressScore(questions: Question[], progress: ProgressStore): WeightedScore {
  let earnedPoints = 0;
  let possiblePoints = 0;

  for (const question of questions) {
    const record = progress[question.id];
    if (!record?.attempts) continue;
    const points = questionPoints(question);
    earnedPoints += record.correct * points;
    possiblePoints += record.attempts * points;
  }

  return {
    earnedPoints,
    possiblePoints,
    percentage: possiblePoints ? Math.round((earnedPoints / possiblePoints) * 100) : 0,
  };
}

export function weightedSessionScore(
  questions: Question[],
  answers: Array<{ questionId: string; correct: boolean }>,
): WeightedScore {
  let earnedPoints = 0;
  let possiblePoints = 0;
  const byId = new Map(questions.map((question) => [question.id, question]));

  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    if (!question) continue;
    const points = questionPoints(question);
    possiblePoints += points;
    if (answer.correct) earnedPoints += points;
  }

  return {
    earnedPoints,
    possiblePoints,
    percentage: possiblePoints ? Math.round((earnedPoints / possiblePoints) * 100) : 0,
  };
}

function breakdownIdentity(question: Question, dimension: ScoreBreakdownDimension) {
  if (dimension === "topic") return { key: question.topic, label: question.topic };
  if (dimension === "difficulty") return { key: question.difficulty, label: question.difficulty };
  return { key: question.examId, label: question.examId };
}

export function weightedProgressBreakdown(
  questions: Question[],
  progress: ProgressStore,
  dimension: ScoreBreakdownDimension,
): ScoreBreakdown[] {
  const groups = new Map<string, { label: string; questions: Question[] }>();

  for (const question of questions) {
    const { key, label } = breakdownIdentity(question, dimension);
    const group = groups.get(key);
    if (group) group.questions.push(question);
    else groups.set(key, { label, questions: [question] });
  }

  return Array.from(groups, ([key, group]) => ({
    key,
    label: group.label,
    ...weightedProgressScore(group.questions, progress),
  }));
}
