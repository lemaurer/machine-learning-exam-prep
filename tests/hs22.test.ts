import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import "../data/hs24-additions";
import "../data/fs25-additions";
import "../data/fs24-additions";
import "../data/hs23-additions";
import "../data/fs23-additions";
import "../data/hs22-additions";
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS, isCorrectSelection } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

const hs22 = () => questionsForExam(questions, "HS22");

const POINTS = [
  1,1,1,1,1,1,1,1,1,2,2,2,2,2,1,2,1,4,4,4,4,1,1,2,3,3,3,2,2,2,3,1,2,2,4,1,2,1,1,2,1,4,2,1,
];

const OPTION_COUNTS = [
  2,2,2,2,2,2,2,2,2,4,4,3,3,6,6,6,6,4,4,4,4,2,2,4,4,4,4,4,3,5,5,2,2,4,5,2,4,2,2,4,4,3,4,7,
];

const ANSWERS: Record<number, string[]> = {
  1:["A"],2:["B"],3:["A"],4:["B"],5:["B"],6:["A"],7:["A"],8:["B"],9:["A"],10:["D"],
  11:["B"],12:["C"],13:["A"],14:["D"],15:["C"],16:["F"],17:["A"],18:["A","D"],19:["C"],20:["C"],
  21:["C","D"],22:["B"],23:["B"],24:["A"],25:["B","D"],26:["B"],27:["A"],28:["B"],29:["A"],30:["A"],
  31:["A"],32:["B"],33:["A"],34:["D"],35:["C","D"],36:["B"],37:["D"],38:["A"],39:["A"],40:["C"],
  41:["A"],42:["C"],43:["A"],44:["A"],
};

test("exam selector includes HS22 in chronological order", () => {
  assert.deepEqual(EXAMS.map((exam) => exam.id), ["HS25", "FS25", "HS24", "FS24", "HS23", "FS23", "HS22"]);
  assert.ok(EXAMS.some((exam) => exam.id === "HS22" && exam.label === "HS22 · February 2023"));
});

test("HS22 contains every supplied question exactly once in order", () => {
  const exam = hs22();
  assert.equal(exam.length, 44);
  assert.deepEqual(exam.map((question) => question.number), Array.from({ length: 44 }, (_, index) => index + 1));
  assert.equal(new Set(exam.map((question) => question.id)).size, 44);
});

test("HS22 point values reproduce the supplied 85-point exam", () => {
  const exam = hs22();
  const actualPoints = exam.map((question) => {
    const match = question.source.match(/· (\d+) point/);
    assert.ok(match, `Question ${question.number} has a point value in source metadata`);
    return Number(match[1]);
  });
  assert.deepEqual(actualPoints, POINTS);
  assert.equal(actualPoints.reduce((sum, points) => sum + points, 0), 85);
});

test("HS22 answer option counts and labels match the supplied answer sheet", () => {
  const exam = hs22();
  assert.equal(OPTION_COUNTS.length, 44);
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

test("HS22 derived answer key is complete and explicitly labeled as derived", () => {
  const exam = hs22();
  assert.equal(Object.keys(ANSWERS).length, 44);
  for (const question of exam) {
    assert.deepEqual(correctOptionIds(question), ANSWERS[question.number], `Question ${question.number}`);
    assert.match(question.explanation, /^Derived answer/);
    assert.match(question.source, /answer derived/);
  }
});

test("HS22 all-that-apply questions retain multi-select behavior", () => {
  const exam = hs22();
  assert.deepEqual(exam.filter((question) => question.multipleSelect).map((question) => question.number), [18,21,25,26,35]);
  const q18 = exam.find((question) => question.number === 18)!;
  assert.equal(isCorrectSelection(q18, ["A","D"]), true);
  assert.equal(isCorrectSelection(q18, ["A"]), false);
  const q35 = exam.find((question) => question.number === 35)!;
  assert.equal(isCorrectSelection(q35, ["C","D"]), true);
  assert.equal(isCorrectSelection(q35, ["C"]), false);
});

test("HS22 figure references match the supplied exam and Q14-17 use two figure slots", () => {
  const exam = hs22();
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 1).map((question) => question.number), [10,11]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 2).map((question) => question.number), [12,13]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 3).map((question) => question.number), [14,15,16,17]);
  assert.deepEqual(exam.filter((question) => question.secondFigureNumber === 4).map((question) => question.number), [14,15,16,17]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 5).map((question) => question.number), [29]);
  assert.deepEqual(
    exam.filter((question) => question.figureNumber || question.secondFigureNumber).map((question) => question.number),
    [10,11,12,13,14,15,16,17,29],
  );
});

test("HS22 common setups remain grouped exactly where later questions depend on them", () => {
  const exam = hs22();
  const setup = (number: number) => exam.find((question) => question.number === number)?.setup;
  assert.equal(setup(10), setup(11));
  assert.equal(setup(12), setup(13));
  assert.equal(setup(14), setup(17));
  assert.equal(setup(19), setup(20));
  assert.equal(setup(30), setup(33));
  assert.equal(setup(34), setup(35));
  assert.equal(setup(37), setup(40));
  assert.equal(setup(42), setup(44));
});

test("HS22 source anchors guard against accidental transcription gaps", () => {
  const exam = hs22();
  assert.equal(exam.find((question) => question.number === 1)?.prompt, "For all values of $a$ and $b$, $f(w)$ is a convex function of $w$.");
  assert.equal(exam.find((question) => question.number === 18)?.prompt, "Which of the following are true? Mark all that apply.");
  assert.match(exam.find((question) => question.number === 26)?.prompt ?? "", /Select all that apply\.$/);
  assert.match(exam.find((question) => question.number === 44)?.prompt ?? "", /^Starting from \$\\lambda\^\{\(0\)\}=1\$/);
  assert.deepEqual(exam.find((question) => question.number === 44)?.options.map((option) => option.id), ["A","B","C","D","E","F","G"]);
});
