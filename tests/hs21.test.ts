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
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

const hs21 = () => questionsForExam(questions, "HS21");

const POINTS = [
  4,3,1,1,1,3,2,1,1,1,1,3,2,2,4,1,1,1,2,2,2,1,1,1,1,1,1,1,1,3,2,2,1,1,1,1,3,2,2,3,2,2,1,1,1,2,2,1,1,1,
];

const OPTION_COUNTS = [
  8,4,2,2,2,8,5,2,2,2,2,8,4,8,8,2,2,2,4,4,4,2,2,2,2,2,2,2,2,8,8,4,2,2,2,2,6,4,4,4,4,4,2,2,2,6,5,2,2,2,
];

const ANSWERS: Record<number, string[]> = {
  1:["E"],2:["A"],3:["A"],4:["A"],5:["A"],6:["B"],7:["B"],8:["B"],9:["A"],10:["B"],
  11:["B"],12:["E"],13:["A"],14:["E"],15:["C"],16:["B"],17:["B"],18:["A"],19:["D"],20:["A"],
  21:["A"],22:["B"],23:["A"],24:["A"],25:["A"],26:["A"],27:["B"],28:["B"],29:["A"],30:["A"],
  31:["C"],32:["A"],33:["A"],34:["B"],35:["B"],36:["B"],37:["C"],38:["D"],39:["A"],40:["A"],
  41:["A"],42:["A"],43:["A"],44:["A"],45:["A"],46:["C"],47:["B"],48:["B"],49:["A"],50:["B"],
};

test("exam selector includes HS21 after the 2022 summer exam", () => {
  const ids = EXAMS.map((exam) => exam.id);
  assert.ok(ids.includes("HS21"));
  assert.ok(ids.indexOf("HS21") > ids.indexOf("FS22"));
  assert.ok(EXAMS.some((exam) => exam.id === "HS21" && exam.label === "HS21 · January 2022"));
});

test("HS21 contains every supplied question exactly once in order", () => {
  const exam = hs21();
  assert.equal(exam.length, 50);
  assert.deepEqual(exam.map((question) => question.number), Array.from({ length: 50 }, (_, index) => index + 1));
  assert.equal(new Set(exam.map((question) => question.id)).size, 50);
});

test("HS21 point values reproduce the supplied 82-point question pack", () => {
  const exam = hs21();
  const actualPoints = exam.map((question) => {
    const match = question.source.match(/· (\d+) point/);
    assert.ok(match, `Question ${question.number} has a point value in source metadata`);
    return Number(match[1]);
  });
  assert.deepEqual(actualPoints, POINTS);
  assert.equal(actualPoints.reduce((sum, points) => sum + points, 0), 82);
});

test("HS21 answer option counts and labels match the supplied question pack", () => {
  const exam = hs21();
  assert.equal(OPTION_COUNTS.length, 50);
  for (const question of exam) {
    const count = OPTION_COUNTS[question.number - 1];
    assert.equal(question.options.length, count, `Question ${question.number} option count`);
    assert.deepEqual(
      question.options.map((option) => option.id),
      DISPLAY_OPTION_IDS.slice(0, count),
      `Question ${question.number} option labels`,
    );
  }
});

test("HS21 derived answer key is complete and explicitly labeled as derived", () => {
  const exam = hs21();
  assert.equal(Object.keys(ANSWERS).length, 50);
  for (const question of exam) {
    assert.deepEqual(correctOptionIds(question), ANSWERS[question.number], `Question ${question.number}`);
    assert.match(question.explanation, /^Derived answer/);
    assert.match(question.source, /answer derived/);
  }
});

test("HS21 has no multi-select questions", () => {
  assert.deepEqual(hs21().filter((question) => question.multipleSelect).map((question) => question.number), []);
});

test("HS21 figure-dependent questions retain separate upload slots", () => {
  const exam = hs21();
  const figures = exam.filter((question) => inferFigureNumber(question)).map((question) => [question.number, inferFigureNumber(question)]);
  assert.deepEqual(figures, [[12,12],[21,1],[22,2],[38,3],[46,4]]);
});

test("HS21 common setups remain grouped for shared source sections", () => {
  const exam = hs21();
  const setup = (number: number) => exam.find((question) => question.number === number)?.setup;
  assert.equal(setup(1), setup(2));
  assert.equal(setup(3), setup(6));
  assert.equal(setup(19), setup(25));
  assert.equal(setup(26), setup(32));
  assert.equal(setup(37), setup(38));
  assert.equal(setup(39), setup(42));
  assert.equal(setup(47), setup(50));
});

test("HS21 source anchors guard against accidental transcription gaps", () => {
  const exam = hs21();
  assert.match(exam.find((question) => question.number === 1)?.prompt ?? "", /What is the estimator/);
  assert.equal(exam.find((question) => question.number === 3)?.prompt, "When $n\\ge d$, the empirical risk $\\hat R_{\\mathcal D}$, has a unique minimizer.");
  assert.match(exam.find((question) => question.number === 12)?.prompt ?? "", /maximum margin/);
  assert.equal(exam.find((question) => question.number === 15)?.options.length, 8);
  assert.match(exam.find((question) => question.number === 38)?.prompt ?? "", /overestimation errors of the predictor are less critical than underestimation errors/);
  assert.match(exam.find((question) => question.number === 47)?.prompt ?? "", /what is \$D\^\*\(x\)\?/);
  assert.equal(exam.find((question) => question.number === 50)?.prompt.endsWith("Decision Trees."), true);
});
