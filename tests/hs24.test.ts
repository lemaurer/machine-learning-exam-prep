import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds } from "../lib/answers";
import { inferCommonSetupQuestionIds, inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

const ANSWERS: Record<number, string[]> = {
  1: ["A"], 2: ["A"], 3: ["B"], 4: ["D"], 5: ["B"], 6: ["A", "E", "F"],
  7: ["A"], 8: ["D"], 9: ["B"], 10: ["A"], 11: ["A"], 12: ["B"], 13: ["B"],
  14: ["A"], 15: ["C"], 16: ["D"], 17: ["B", "C"], 18: ["A"], 19: ["B"], 20: ["A"],
  21: ["A"], 22: ["B"], 23: ["B"], 24: ["D"], 25: ["B"], 26: ["B"], 27: ["B"],
  28: ["B"], 29: ["C"], 30: ["D"], 31: ["B"], 32: ["B"], 33: ["A"], 34: ["B"],
  35: ["A"], 36: ["C"], 37: ["B"], 38: ["A"], 39: ["C"], 40: ["E"], 41: ["A", "B", "C"],
};

test("HS24 contains all 41 supplied questions in original order", () => {
  const hs24 = questionsForExam(questions, "HS24");
  assert.equal(hs24.length, 41);
  assert.deepEqual(hs24.map((question) => question.number), Array.from({ length: 41 }, (_, index) => index + 1));
  assert.equal(new Set(hs24.map((question) => question.id)).size, 41);
});

test("HS24 supplied answer key is preserved", () => {
  const hs24 = questionsForExam(questions, "HS24");
  for (const question of hs24) {
    assert.deepEqual(correctOptionIds(question), ANSWERS[question.number], `HS24 Question ${question.number}`);
  }
});

test("HS24 diamond questions are true multi-select questions", () => {
  for (const number of [6, 17, 41]) {
    const question = questions.find((item) => item.examId === "HS24" && item.number === number)!;
    assert.equal(question.multipleSelect, true);
    assert.ok(correctOptionIds(question).length > 1);
  }
});

test("HS24 is available as its own exam and shared setups stay grouped", () => {
  assert.deepEqual(EXAMS.find((exam) => exam.id === "HS24"), { id: "HS24", label: "HS24 · January 2025" });
  const q3 = questions.find((item) => item.examId === "HS24" && item.number === 3)!;
  const q22 = questions.find((item) => item.examId === "HS24" && item.number === 22)!;
  assert.deepEqual(inferCommonSetupQuestionIds(q3, questions).map((id) => questions.find((q) => q.id === id)!.number), [3, 4, 5, 6]);
  assert.deepEqual(inferCommonSetupQuestionIds(q22, questions).map((id) => questions.find((q) => q.id === id)!.number), [22, 23, 24, 25, 26]);
});

test("HS24 source figures are represented by isolated exam-specific placeholders", () => {
  const figureNumbers = (number: number) => questions
    .filter((question) => question.examId === "HS24" && inferFigureNumber(question) === number)
    .map((question) => question.number);
  assert.deepEqual(figureNumbers(1), [2]);
  assert.deepEqual(figureNumbers(2), [12, 13]);
  assert.deepEqual(figureNumbers(3), [31]);
  assert.deepEqual(figureNumbers(4), [37, 41]);
});

test("HS24 Question 22 preserves the supplied single-answer key and equivalence note", () => {
  const q22 = questions.find((item) => item.examId === "HS24" && item.number === 22)!;
  assert.deepEqual(correctOptionIds(q22), ["B"]);
  assert.match(q22.explanation, /option C is algebraically equivalent/i);
});
