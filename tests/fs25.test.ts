import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, isCorrectSelection } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

test("FS25 contains all 43 supplied questions in original order", () => {
  const fs25 = questionsForExam(questions, "FS25");
  assert.equal(fs25.length, 43);
  assert.deepEqual(fs25.map((question) => question.number), Array.from({ length: 43 }, (_, index) => index + 1));
  assert.equal(new Set(fs25.map((question) => question.id)).size, 43);
});

test("FS25 supplied answer key is preserved", () => {
  const expected: Record<number, string[]> = {
    1:["A"],2:["B"],3:["B"],4:["A","C"],5:["A"],6:["A"],7:["B"],8:["A"],9:["A"],10:["B"],
    11:["A"],12:["C"],13:["B"],14:["B"],15:["A"],16:["A"],17:["A"],18:["B"],19:["C"],20:["C"],
    21:["A"],22:["A"],23:["C"],24:["F"],25:["D"],26:["B"],27:["A"],28:["B"],29:["B"],30:["B"],
    31:["B","C"],32:["A"],33:["D"],34:["A"],35:["C"],36:["B"],37:["C"],38:["B"],39:["A"],40:["C"],
    41:["B"],42:["B"],43:["C"],
  };
  for (const question of questionsForExam(questions, "FS25")) {
    assert.deepEqual(correctOptionIds(question), expected[question.number], `Question ${question.number}`);
  }
});

test("FS25 diamond questions retain multi-select behavior", () => {
  const fs25 = questionsForExam(questions, "FS25");
  const diamondNumbers = fs25.filter((question) => question.multipleSelect).map((question) => question.number);
  assert.deepEqual(diamondNumbers, [4, 6, 31, 33]);
  const q4 = fs25.find((question) => question.number === 4)!;
  const q31 = fs25.find((question) => question.number === 31)!;
  assert.equal(isCorrectSelection(q4, ["A", "C"]), true);
  assert.equal(isCorrectSelection(q4, ["A"]), false);
  assert.equal(isCorrectSelection(q31, ["B", "C"]), true);
});

test("FS25 is registered separately and its figures stay exam-local", () => {
  assert.ok(EXAMS.some((exam) => exam.id === "FS25" && exam.label === "FS25 · August 2025"));
  const fs25 = questionsForExam(questions, "FS25");
  assert.deepEqual(fs25.filter((question) => inferFigureNumber(question) === 2).map((question) => question.number), [8, 9]);
  assert.deepEqual(fs25.filter((question) => inferFigureNumber(question) === 3).map((question) => question.number), [10, 11, 12]);
  assert.deepEqual(fs25.filter((question) => inferFigureNumber(question) === 7).map((question) => question.number), [32, 33]);
});

test("FS25 shared setups keep dependent questions groupable", () => {
  const fs25 = questionsForExam(questions, "FS25");
  assert.equal(fs25.find((question) => question.number === 1)?.setup, fs25.find((question) => question.number === 3)?.setup);
  assert.equal(fs25.find((question) => question.number === 10)?.setup, fs25.find((question) => question.number === 12)?.setup);
  assert.equal(fs25.find((question) => question.number === 41)?.setup, fs25.find((question) => question.number === 43)?.setup);
});
