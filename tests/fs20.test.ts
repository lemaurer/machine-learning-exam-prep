import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/fs25-additions";
import "../data/hs24-additions";
import "../data/fs24-additions";
import "../data/hs23-additions";
import "../data/fs23-additions";
import "../data/hs22-additions";
import "../data/fs22-additions";
import "../data/hs21-additions";
import "../data/fs21-additions";
import "../data/fs20-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

const fs20 = () => questionsForExam(questions, "FS20");

const POINTS = [
  3,3,3,3,3,3,3,3,3,3,3,3,
  1,1,1,1,1,
  3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
  1,1,1,1,
  3,3,3,3,
];

const OPTION_COUNTS = [
  4,4,4,4,4,4,4,4,8,8,8,8,
  2,2,2,2,2,8,4,8,8,
  4,4,4,4,4,4,
  4,4,4,4,4,4,4,4,4,4,4,4,4,
  8,8,8,8,
  2,2,2,2,
  8,8,8,8,
];

const MULTI_SELECT = [1,3,5,6,19,22,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40];

const ANSWERS: Record<number, string[]> = {
  1:["B"],2:["A"],3:["A","D"],4:["A"],5:["B"],6:["B","C"],7:["B"],8:["C"],9:["H"],10:["A"],
  11:["C"],12:["A"],13:["B"],14:["B"],15:["A"],16:["B"],17:["A"],18:["B"],19:["A"],20:["E"],
  21:["C"],22:["B","C","D"],23:["B"],24:["D"],25:["A"],26:["A","D"],27:["C"],28:["A","B","D"],29:["A","D"],30:["A","B","C"],
  31:["D"],32:["A","D"],33:["C","D"],34:["A","C"],35:["B","D"],36:["B"],37:["A"],38:["A","B","C"],39:["C"],40:["A","B"],
  41:["E"],42:["G"],43:["B"],44:["H"],45:["B"],46:["A"],47:["A"],48:["B"],49:["E"],50:["G"],
  51:["A"],52:["F"],
};

test("exam selector includes FS20 as the oldest imported exam", () => {
  assert.equal(EXAMS.at(-1)?.id, "FS20");
  assert.ok(EXAMS.some((exam) => exam.id === "FS20" && exam.label === "FS20 · August 2020"));
});

test("FS20 contains every supplied question exactly once in order", () => {
  const exam = fs20();
  assert.equal(exam.length, 52);
  assert.deepEqual(exam.map((question) => question.number), Array.from({ length: 52 }, (_, index) => index + 1));
  assert.equal(new Set(exam.map((question) => question.id)).size, 52);
});

test("FS20 point weighting matches the supplied exam rules", () => {
  const exam = fs20();
  assert.equal(POINTS.length, 52);
  const actual = exam.map((question) => {
    const match = question.source.match(/· (\d+) point/);
    assert.ok(match, `Question ${question.number} has point metadata`);
    return Number(match[1]);
  });
  assert.deepEqual(actual, POINTS);
  assert.equal(actual.reduce((sum, points) => sum + points, 0), 138);
  assert.deepEqual(exam.filter((question) => question.options.length === 2).map((question) => question.number), [13,14,15,16,17,45,46,47,48]);
});

test("FS20 answer option counts and labels match the supplied question pack", () => {
  const exam = fs20();
  assert.equal(OPTION_COUNTS.length, 52);
  for (const question of exam) {
    const count = OPTION_COUNTS[question.number - 1];
    assert.equal(question.options.length, count, `Question ${question.number} option count`);
    assert.deepEqual(question.options.map((option) => option.id), DISPLAY_OPTION_IDS.slice(0, count), `Question ${question.number} option labels`);
  }
});

test("FS20 club-marked questions retain multi-select behavior", () => {
  assert.deepEqual(fs20().filter((question) => question.multipleSelect).map((question) => question.number), MULTI_SELECT);
});

test("FS20 derived answer key is complete and explicitly labeled as derived", () => {
  const exam = fs20();
  assert.equal(Object.keys(ANSWERS).length, 52);
  for (const question of exam) {
    assert.deepEqual(correctOptionIds(question), ANSWERS[question.number], `Question ${question.number}`);
    assert.match(question.explanation, /^Derived answer/);
    assert.match(question.source, /answer derived/);
  }
});

test("FS20 figure references are exam-local and editable by card membership", () => {
  const exam = fs20();
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 1).map((question) => question.number), [4]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 2).map((question) => question.number), [18,19,20,21]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 3).map((question) => question.number), [41,42,43,44]);
});

test("FS20 shared setups keep dependent question blocks together", () => {
  const exam = fs20();
  const setup = (number: number) => exam.find((question) => question.number === number)?.setup;
  assert.equal(setup(7), setup(12));
  assert.equal(setup(13), setup(17));
  assert.equal(setup(18), setup(19));
  assert.equal(setup(26), setup(27));
  assert.equal(setup(41), setup(44));
  assert.equal(setup(45), setup(48));
  assert.equal(setup(49), setup(52));
});

test("FS20 source anchors guard against transcription gaps", () => {
  const exam = fs20();
  assert.match(exam.find((q) => q.number === 1)?.prompt ?? "", /will never increase the least squares loss/);
  assert.match(exam.find((q) => q.number === 11)?.prompt ?? "", /line search/);
  assert.match(exam.find((q) => q.number === 20)?.prompt ?? "", /1\/100/);
  assert.match(exam.find((q) => q.number === 25)?.prompt ?? "", /temperature parameter/);
  assert.match(exam.find((q) => q.number === 33)?.prompt ?? "", /0\.8/);
  assert.match(exam.find((q) => q.number === 41)?.prompt ?? "", /3D convolutional layer/);
  assert.match(exam.find((q) => q.number === 49)?.prompt ?? "", /expectation step/);
  assert.match(exam.find((q) => q.number === 52)?.prompt ?? "", /converge to/);
});
