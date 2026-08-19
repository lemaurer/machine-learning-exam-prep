import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import "../data/fs24-additions";
import "../data/hs23-additions";
import "../data/fs23-additions";
import "../data/hs22-additions";
import "../data/fs22-additions";
import { questions } from "../data/questions";
import { questionPoints, weightedProgressScore, weightedSessionScore } from "../lib/scoring";
import type { ProgressStore } from "../types/question";

test("every question in the bank exposes a positive point value", () => {
  for (const question of questions) {
    assert.match(question.source, /(?:^|·)\s*\d+\s+points?\b/i, `${question.examId} Q${question.number}`);
    assert.ok(questionPoints(question) > 0, `${question.examId} Q${question.number}`);
  }
});

test("progress accuracy is weighted by question points", () => {
  const onePoint = questions.find((question) => question.examId === "HS22" && question.number === 1)!;
  const fourPoint = questions.find((question) => question.examId === "HS22" && question.number === 18)!;
  assert.equal(questionPoints(onePoint), 1);
  assert.equal(questionPoints(fourPoint), 4);

  const progress: ProgressStore = {
    [onePoint.id]: {
      status: "review",
      attempts: 1,
      correct: 0,
      incorrect: 1,
      lastAnswerId: "B",
      lastAnsweredAt: "2026-08-19T00:00:00.000Z",
    },
    [fourPoint.id]: {
      status: "done",
      attempts: 1,
      correct: 1,
      incorrect: 0,
      lastAnswerId: "A",
      lastAnsweredAt: "2026-08-19T00:00:00.000Z",
    },
  };

  assert.deepEqual(weightedProgressScore([onePoint, fourPoint], progress), {
    earnedPoints: 4,
    possiblePoints: 5,
    percentage: 80,
  });
});

test("session and exam score is weighted by available points", () => {
  const onePoint = questions.find((question) => question.examId === "HS22" && question.number === 1)!;
  const fourPoint = questions.find((question) => question.examId === "HS22" && question.number === 18)!;

  assert.deepEqual(weightedSessionScore([onePoint, fourPoint], [
    { questionId: onePoint.id, correct: false },
    { questionId: fourPoint.id, correct: true },
  ]), {
    earnedPoints: 4,
    possiblePoints: 5,
    percentage: 80,
  });
});
