import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import "../data/fs24-additions";
import "../data/hs23-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS, isCorrectSelection, optionIdForDisplayedKey } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

test("HS23 contains all 44 supplied questions in original order", () => {
  const hs23 = questionsForExam(questions, "HS23");
  assert.equal(hs23.length, 44);
  assert.deepEqual(hs23.map((question) => question.number), Array.from({ length: 44 }, (_, index) => index + 1));
  assert.equal(new Set(hs23.map((question) => question.id)).size, 44);
});

test("HS23 supplied answer key is preserved", () => {
  const expected: Record<number, string[]> = {
    1:["B"],2:["A"],3:["A"],4:["C"],5:["B","E"],6:["B"],7:["C"],8:["D"],9:["B"],10:["B"],
    11:["D"],12:["D"],13:["C"],14:["A"],15:["B"],16:["E"],17:["F"],18:["A"],19:["B"],20:["A","B"],
    21:["B"],22:["D"],23:["A"],24:["B"],25:["D"],26:["B"],27:["G"],28:["G"],29:["A","B","C"],30:["A"],
    31:["B"],32:["A"],33:["B"],34:["B"],35:["A"],36:["A"],37:["A"],38:["B"],39:["B"],40:["A"],
    41:["B"],42:["B"],43:["B"],44:["C"],
  };
  for (const question of questionsForExam(questions, "HS23")) {
    assert.deepEqual(correctOptionIds(question), expected[question.number], `Question ${question.number}`);
  }
});

test("HS23 club questions retain multi-select behavior", () => {
  const hs23 = questionsForExam(questions, "HS23");
  assert.deepEqual(hs23.filter((question) => question.multipleSelect).map((question) => question.number), [5, 20, 29]);
  const q5 = hs23.find((question) => question.number === 5)!;
  const q29 = hs23.find((question) => question.number === 29)!;
  assert.equal(isCorrectSelection(q5, ["B", "E"]), true);
  assert.equal(isCorrectSelection(q5, ["B"]), false);
  assert.equal(isCorrectSelection(q29, ["A", "B", "C"]), true);
});

test("HS23 supports answer choices through I", () => {
  const q28 = questionsForExam(questions, "HS23").find((question) => question.number === 28)!;
  assert.deepEqual(q28.options.map((option) => option.id), ["A","B","C","D","E","F","G","H","I"]);
  assert.deepEqual(DISPLAY_OPTION_IDS, ["A","B","C","D","E","F","G","H","I"]);
  assert.equal(optionIdForDisplayedKey("I", q28.options.map((option) => option.id)), "I");
});

test("HS23 is registered separately and its figures stay exam-local", () => {
  assert.ok(EXAMS.some((exam) => exam.id === "HS23" && exam.label === "HS23 · January 2024"));
  const hs23 = questionsForExam(questions, "HS23");
  assert.deepEqual(hs23.filter((question) => inferFigureNumber(question) === 1).map((question) => question.number), [4]);
  assert.deepEqual(hs23.filter((question) => inferFigureNumber(question) === 2).map((question) => question.number), [12,13,14,15,16,17]);
  assert.deepEqual(hs23.filter((question) => inferFigureNumber(question) === 3).map((question) => question.number), [3]);
});

test("HS23 shared setups keep dependent questions groupable", () => {
  const hs23 = questionsForExam(questions, "HS23");
  assert.equal(hs23.find((question) => question.number === 5)?.setup, hs23.find((question) => question.number === 8)?.setup);
  assert.equal(hs23.find((question) => question.number === 12)?.setup, hs23.find((question) => question.number === 17)?.setup);
  assert.equal(hs23.find((question) => question.number === 21)?.setup, hs23.find((question) => question.number === 23)?.setup);
  assert.equal(hs23.find((question) => question.number === 35)?.setup, hs23.find((question) => question.number === 37)?.setup);
  assert.equal(hs23.find((question) => question.number === 41)?.setup, hs23.find((question) => question.number === 44)?.setup);
});
