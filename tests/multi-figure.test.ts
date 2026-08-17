import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import { questions } from "../data/questions";
import { applySharedFigureImage, inferFigureNumbers } from "../lib/question-edits";

test("HS24 Question 31 uses two independent figure slots", () => {
  const question = questions.find((item) => item.examId === "HS24" && item.number === 31)!;
  assert.deepEqual(inferFigureNumbers(question), [3, 5]);
  assert.match(question.figureCaption ?? "", /^Figure 1\b/);
  assert.match(question.secondFigureCaption ?? "", /^Figure 2\b/);
  assert.doesNotMatch(question.setup ?? "", /combined image/i);
});

test("uploading HS24 Question 31 Figure 2 cannot overwrite another HS24 figure", () => {
  const question = questions.find((item) => item.examId === "HS24" && item.number === 31)!;
  const earlierFigure2Question = questions.find((item) => item.examId === "HS24" && item.number === 12)!;
  const next = applySharedFigureImage({}, question, questions, "data:image/webp;base64,secondary", question.secondFigureNumber);

  assert.equal(next[question.id]?.secondFigure, "data:image/webp;base64,secondary");
  assert.equal(next[question.id]?.figure, undefined);
  assert.equal(next[earlierFigure2Question.id], undefined);
});
