import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import "../data/fs24-additions";
import "../data/hs23-additions";
import "../data/fs23-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS, isCorrectSelection } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

test("FS23 contains all 45 supplied questions in original order", () => {
  const fs23 = questionsForExam(questions, "FS23");
  assert.equal(fs23.length, 45);
  assert.deepEqual(fs23.map((question) => question.number), Array.from({ length: 45 }, (_, index) => index + 1));
  assert.equal(new Set(fs23.map((question) => question.id)).size, 45);
});

test("FS23 derived answer key is preserved", () => {
  const expected: Record<number, string[]> = {
    1:["B"],2:["A"],3:["B"],4:["A"],5:["A"],6:["B"],7:["A"],8:["C"],9:["D"],10:["B"],
    11:["A"],12:["A"],13:["A"],14:["B"],15:["A"],16:["B"],17:["A"],18:["B"],19:["C"],20:["A"],
    21:["C"],22:["B"],23:["B"],24:["B"],25:["A"],26:["B"],27:["D"],28:["B"],29:["D"],30:["A"],
    31:["B","C","D"],32:["C"],33:["H"],34:["G"],35:["B"],36:["C"],37:["B"],38:["A"],39:["A"],40:["B"],
    41:["D"],42:["C"],43:["E"],44:["A"],45:["A"],
  };
  for (const question of questionsForExam(questions, "FS23")) {
    assert.deepEqual(correctOptionIds(question), expected[question.number], `Question ${question.number}`);
    assert.match(question.explanation, /^Derived answer/);
  }
});

test("FS23 diamond questions retain multi-select behavior", () => {
  const fs23 = questionsForExam(questions, "FS23");
  assert.deepEqual(fs23.filter((question) => question.multipleSelect).map((question) => question.number), [31, 32]);
  const q31 = fs23.find((question) => question.number === 31)!;
  assert.equal(isCorrectSelection(q31, ["B", "C", "D"]), true);
  assert.equal(isCorrectSelection(q31, ["B", "C"]), false);
});

test("FS23 is registered and figures stay exam-local", () => {
  assert.ok(EXAMS.some((exam) => exam.id === "FS23" && exam.label === "FS23 · August 2023"));
  const fs23 = questionsForExam(questions, "FS23");
  assert.deepEqual(fs23.filter((question) => inferFigureNumber(question) === 1).map((question) => question.number), [8,9,10,11]);
  assert.deepEqual(fs23.filter((question) => inferFigureNumber(question) === 2).map((question) => question.number), [22]);
  assert.deepEqual(fs23.filter((question) => inferFigureNumber(question) === 3).map((question) => question.number), [28]);
  assert.deepEqual(fs23.filter((question) => inferFigureNumber(question) === 4).map((question) => question.number), [29]);
  assert.deepEqual(fs23.filter((question) => inferFigureNumber(question) === 5).map((question) => question.number), [37]);
});

test("FS23 supports the eight-choice kernel PCA questions", () => {
  const fs23 = questionsForExam(questions, "FS23");
  assert.deepEqual(fs23.find((question) => question.number === 33)?.options.map((option) => option.id), ["A","B","C","D","E","F","G","H"]);
  assert.deepEqual(fs23.find((question) => question.number === 34)?.options.map((option) => option.id), ["A","B","C","D","E","F","G","H"]);
  assert.ok(DISPLAY_OPTION_IDS.includes("H"));
});

test("FS23 common setups preserve dependent groups", () => {
  const fs23 = questionsForExam(questions, "FS23");
  assert.equal(fs23.find((question) => question.number === 6)?.setup, fs23.find((question) => question.number === 7)?.setup);
  assert.equal(fs23.find((question) => question.number === 8)?.setup, fs23.find((question) => question.number === 11)?.setup);
  assert.equal(fs23.find((question) => question.number === 25)?.setup, fs23.find((question) => question.number === 29)?.setup);
  assert.equal(fs23.find((question) => question.number === 41)?.setup, fs23.find((question) => question.number === 45)?.setup);
});
