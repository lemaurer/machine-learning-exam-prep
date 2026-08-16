import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import "../data/fs24-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, isCorrectSelection } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

test("FS24 contains all 40 supplied questions in original order", () => {
  const fs24 = questionsForExam(questions, "FS24");
  assert.equal(fs24.length, 40);
  assert.deepEqual(fs24.map((question) => question.number), Array.from({ length: 40 }, (_, index) => index + 1));
  assert.equal(new Set(fs24.map((question) => question.id)).size, 40);
});

test("FS24 supplied answer key is preserved", () => {
  const expected: Record<number, string[]> = {
    1:["B"],2:["C"],3:["B"],4:["C"],5:["C"],6:["A"],7:["B"],8:["B"],9:["A"],10:["B"],
    11:["B","C","D"],12:["B"],13:["B"],14:["A"],15:["C"],16:["A"],17:["A"],18:["C","D"],19:["C"],20:["A"],
    21:["B"],22:["A"],23:["C"],24:["B"],25:["A"],26:["D"],27:["B"],28:["C"],29:["A"],30:["B"],
    31:["C"],32:["D"],33:["B"],34:["A"],35:["C"],36:["A"],37:["B"],38:["A"],39:["D"],40:["A","C"],
  };
  for (const question of questionsForExam(questions, "FS24")) {
    assert.deepEqual(correctOptionIds(question), expected[question.number], `Question ${question.number}`);
  }
});

test("FS24 diamond questions retain exact multi-select behavior", () => {
  const fs24 = questionsForExam(questions, "FS24");
  assert.deepEqual(fs24.filter((q) => q.multipleSelect).map((q) => q.number), [11,18,22,40]);
  assert.equal(isCorrectSelection(fs24.find((q) => q.number === 11)!, ["B","C","D"]), true);
  assert.equal(isCorrectSelection(fs24.find((q) => q.number === 18)!, ["C","D"]), true);
  assert.equal(isCorrectSelection(fs24.find((q) => q.number === 40)!, ["A","C"]), true);
});

test("FS24 is registered separately and figure groups remain exam-local", () => {
  assert.ok(EXAMS.some((exam) => exam.id === "FS24" && exam.label === "FS24 · August 2024"));
  const fs24 = questionsForExam(questions, "FS24");
  assert.deepEqual(fs24.filter((q) => inferFigureNumber(q) === 1).map((q) => q.number), [5,6,7]);
  assert.deepEqual(fs24.filter((q) => inferFigureNumber(q) === 2).map((q) => q.number), [31,32]);
  assert.deepEqual(fs24.filter((q) => inferFigureNumber(q) === 6).map((q) => q.number), [37,38,39,40]);
});

test("FS24 shared setups keep dependent questions groupable", () => {
  const fs24 = questionsForExam(questions, "FS24");
  assert.equal(fs24.find((q) => q.number === 5)?.setup, fs24.find((q) => q.number === 7)?.setup);
  assert.equal(fs24.find((q) => q.number === 25)?.setup, fs24.find((q) => q.number === 27)?.setup);
  assert.equal(fs24.find((q) => q.number === 37)?.setup, fs24.find((q) => q.number === 40)?.setup);
});
