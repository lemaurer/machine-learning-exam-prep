import assert from "node:assert/strict";
import test from "node:test";
import { questions } from "../data/questions";
import { answerProgress, setQuestionStatus } from "../lib/progress";
import { questionsAvailableForMode, uniqueQuestionsById } from "../lib/question-selection";
import type { ProgressStore } from "../types/question";

test("the supplied bank contains 13 questions with stable unique ids", () => {
  assert.equal(questions.length, 13);
  assert.equal(new Set(questions.map((question) => question.id)).size, 13);
});

test("a duplicated source entry can never create a repeated session question", () => {
  const duplicatedBank = [questions[0], questions[0], questions[1]];
  assert.deepEqual(
    uniqueQuestionsById(duplicatedBank).map((question) => question.id),
    [questions[0].id, questions[1].id],
  );
});

test("Practice and Exam only receive new questions, while Review only receives review questions", () => {
  const progress: ProgressStore = {
    [questions[0].id]: setQuestionStatus(undefined, "done"),
    [questions[1].id]: setQuestionStatus(undefined, "review"),
  };
  const sample = questions.slice(0, 3);

  assert.deepEqual(questionsAvailableForMode(sample, progress, "practice").map((question) => question.id), [questions[2].id]);
  assert.deepEqual(questionsAvailableForMode(sample, progress, "exam").map((question) => question.id), [questions[2].id]);
  assert.deepEqual(questionsAvailableForMode(sample, progress, "review").map((question) => question.id), [questions[1].id]);
});

test("incorrect answers enter Review and a correct review answer moves to Done", () => {
  const missed = answerProgress(undefined, "A", false, new Date("2026-01-01T00:00:00Z"));
  assert.equal(missed.status, "review");

  const corrected = answerProgress(missed, "B", true, new Date("2026-01-02T00:00:00Z"));
  assert.equal(corrected.status, "done");
  assert.equal(corrected.attempts, 2);
});

