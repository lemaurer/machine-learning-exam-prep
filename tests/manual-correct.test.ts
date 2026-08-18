import assert from "node:assert/strict";
import test from "node:test";
import { answerProgress, markLatestAttemptCorrect, setQuestionStatus } from "../lib/progress";

// Regression coverage for correcting a mis-click while still allowing Review.
test("manual correction converts the latest incorrect attempt into a correct attempt", () => {
  const wrong = answerProgress(undefined, "A", false, new Date("2026-08-18T12:00:00Z"));
  const corrected = markLatestAttemptCorrect(wrong)!;

  assert.equal(corrected.attempts, 1);
  assert.equal(corrected.correct, 1);
  assert.equal(corrected.incorrect, 0);
  assert.equal(corrected.status, "done");
  assert.deepEqual(corrected.lastAnswerIds, ["A"]);
});

test("a manually corrected question can still be sent to Review without changing accuracy", () => {
  const wrong = answerProgress(undefined, "B", false, new Date("2026-08-18T12:00:00Z"));
  const corrected = markLatestAttemptCorrect(wrong)!;
  const review = setQuestionStatus(corrected, "review");

  assert.equal(review.status, "review");
  assert.equal(review.attempts, 1);
  assert.equal(review.correct, 1);
  assert.equal(review.incorrect, 0);
});

test("manual correction is a no-op when there is no incorrect attempt to fix", () => {
  const right = answerProgress(undefined, "C", true, new Date("2026-08-18T12:00:00Z"));
  assert.deepEqual(markLatestAttemptCorrect(right), right);
  assert.equal(markLatestAttemptCorrect(undefined), undefined);
});
