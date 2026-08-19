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
import "../data/hs21-additions";
import "../data/fs21-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

const fs21 = () => questionsForExam(questions, "FS21");

const POINTS = [
  1,1,3,1,1,1,1,1,1,3,3,4,1,1,1,2,4,3,3,1,1,1,1,3,3,4,1,1,1,1,1,3,1,1,2,3,2,3,2,2,2,2,3,3,4,2,1,1,1,3,1,1,2,
];

const OPTION_COUNTS = [
  2,2,8,2,2,2,2,2,2,8,8,6,2,2,2,4,8,4,6,2,2,2,2,4,4,4,2,2,2,2,2,8,2,2,6,4,6,4,8,3,4,5,4,8,8,8,2,2,2,8,2,2,8,
];

const ANSWERS: Record<number, string[]> = {
  1:["A"],2:["A"],3:["E"],4:["A"],5:["B"],6:["B"],7:["B"],8:["B"],9:["A"],10:["B"],
  11:["G"],12:["C"],13:["A"],14:["B"],15:["A"],16:["C"],17:["D"],18:["D"],19:["E"],20:["B"],
  21:["B"],22:["B"],23:["B"],24:["B"],25:["C"],26:["A"],27:["A"],28:["A"],29:["A"],30:["A"],
  31:["B"],32:["G"],33:["B"],34:["B"],35:["A"],36:["C"],37:["E"],38:["C"],39:["D"],40:["A"],
  41:["C"],42:["E"],43:["C"],44:["B"],45:["D"],46:["D"],47:["B"],48:["B"],49:["B"],50:["C"],
  51:["A"],52:["A"],53:["C"],
};

test("exam selector includes every imported exam through FS21 in chronological order", () => {
  assert.deepEqual(EXAMS.map((exam) => exam.id), ["HS25","FS25","HS24","FS24","HS23","FS23","HS22","FS22","HS21","FS21"]);
  assert.ok(EXAMS.some((exam) => exam.id === "FS21" && exam.label === "FS21 · August 2021"));
});

test("FS21 contains every supplied question exactly once in order", () => {
  const exam = fs21();
  assert.equal(exam.length, 53);
  assert.deepEqual(exam.map((question) => question.number), Array.from({ length: 53 }, (_, index) => index + 1));
  assert.equal(new Set(exam.map((question) => question.id)).size, 53);
});

test("FS21 point values reproduce the supplied 100-point exam", () => {
  const exam = fs21();
  const actualPoints = exam.map((question) => {
    const match = question.source.match(/· (\d+) point/);
    assert.ok(match, `Question ${question.number} has a point value in source metadata`);
    return Number(match[1]);
  });
  assert.deepEqual(actualPoints, POINTS);
  assert.equal(actualPoints.reduce((sum, points) => sum + points, 0), 100);
});

test("FS21 answer option counts and labels match the supplied question pack", () => {
  const exam = fs21();
  assert.equal(OPTION_COUNTS.length, 53);
  for (const question of exam) {
    const count = OPTION_COUNTS[question.number - 1];
    assert.equal(question.options.length, count, `Question ${question.number} option count`);
    assert.deepEqual(question.options.map((option) => option.id), DISPLAY_OPTION_IDS.slice(0, count), `Question ${question.number} option labels`);
  }
});

test("FS21 derived answer key is complete and explicitly labeled as derived", () => {
  const exam = fs21();
  assert.equal(Object.keys(ANSWERS).length, 53);
  for (const question of exam) {
    assert.deepEqual(correctOptionIds(question), ANSWERS[question.number], `Question ${question.number}`);
    assert.match(question.explanation, /^Derived answer/);
    assert.match(question.source, /answer derived/);
  }
});

test("FS21 contains only single-answer and true-false questions", () => {
  assert.deepEqual(fs21().filter((question) => question.multipleSelect).map((question) => question.number), []);
});

test("FS21 figure-dependent questions retain upload slots", () => {
  const exam = fs21();
  const figures = exam.filter((question) => inferFigureNumber(question)).map((question) => [question.number, inferFigureNumber(question)]);
  assert.deepEqual(figures, [[13,1],[17,2],[35,35],[37,3],[39,39]]);
});

test("FS21 common setups keep dependent questions together", () => {
  const exam = fs21();
  const setup = (number: number) => exam.find((question) => question.number === number)?.setup;
  assert.equal(setup(1), setup(5));
  assert.equal(setup(6), setup(9));
  assert.equal(setup(13), setup(15));
  assert.equal(setup(24), setup(29));
  assert.equal(setup(30), setup(32));
  assert.equal(setup(33), setup(38));
  assert.equal(setup(43), setup(46));
  assert.equal(setup(47), setup(50));
  assert.equal(setup(51), setup(53));
});

test("FS21 source anchors guard against transcription gaps", () => {
  const exam = fs21();
  assert.equal(exam.find((q) => q.number === 1)?.prompt, "$\\hat R_{\\mathcal D}(w)$ is a convex function in $w$.");
  assert.match(exam.find((q) => q.number === 10)?.prompt ?? "", /false discovery rate/);
  assert.match(exam.find((q) => q.number === 17)?.prompt ?? "", /Figure 2/);
  assert.equal(exam.find((q) => q.number === 32)?.options.length, 8);
  assert.match(exam.find((q) => q.number === 43)?.prompt ?? "", /likelihood \$p\(X\)\$/);
  assert.match(exam.find((q) => q.number === 53)?.prompt ?? "", /probability of \$D\$ classifying \$x\$ as being from the generator/);
});
