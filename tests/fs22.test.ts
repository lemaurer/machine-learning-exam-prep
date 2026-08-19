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
import { EXAMS, questions } from "../data/questions";
import { correctOptionIds, DISPLAY_OPTION_IDS, isCorrectSelection } from "../lib/answers";
import { inferFigureNumber } from "../lib/question-edits";
import { questionsForExam } from "../lib/question-selection";

const fs22 = () => questionsForExam(questions, "FS22");

const POINTS = [
  1,1,1,1,1,1,1,2,2,4,1,1,1,1,1,2,1,1,1,1,3,1,2,3,2,2,2,1,1,1,2,3,4,3,2,1,1,1,3,1,3,3,3,2,2,3,2,2,
];

const OPTION_COUNTS = [
  2,2,2,2,2,2,2,4,4,4,5,5,5,2,2,6,3,5,3,2,5,4,4,5,4,4,4,4,5,5,5,4,5,4,6,3,2,2,4,4,6,4,4,4,4,4,4,4,
];

const ANSWERS: Record<number, string[]> = {
  1:["A"],2:["B"],3:["A"],4:["A"],5:["B"],6:["B"],7:["B"],8:["C"],9:["C"],10:["B","C","D"],
  11:["C"],12:["B"],13:["E"],14:["A"],15:["B"],16:["B"],17:["B"],18:["C"],19:["C"],20:["A"],
  21:["A"],22:["C"],23:["A"],24:["B"],25:["B"],26:["D"],27:["B"],28:["A"],29:["A"],30:["C"],
  31:["D"],32:["B","D"],33:["A"],34:["B","C","D"],35:["A"],36:["A"],37:["A"],38:["B"],39:["D"],40:["C"],
  41:["B"],42:["A","C","D"],43:["B","D"],44:["A"],45:["B"],46:["A"],47:["A"],48:["C"],
};

test("exam selector includes FS22 in chronological order", () => {
  assert.deepEqual(EXAMS.map((exam) => exam.id), ["HS25", "FS25", "HS24", "FS24", "HS23", "FS23", "HS22", "FS22"]);
  assert.ok(EXAMS.some((exam) => exam.id === "FS22" && exam.label === "FS22 · August 2022"));
});

test("FS22 contains every supplied question exactly once in order", () => {
  const exam = fs22();
  assert.equal(exam.length, 48);
  assert.deepEqual(exam.map((question) => question.number), Array.from({ length: 48 }, (_, index) => index + 1));
  assert.equal(new Set(exam.map((question) => question.id)).size, 48);
});

test("FS22 point values reproduce the supplied 85-point exam", () => {
  const exam = fs22();
  const actualPoints = exam.map((question) => {
    const match = question.source.match(/· (\d+) point/);
    assert.ok(match, `Question ${question.number} has a point value in source metadata`);
    return Number(match[1]);
  });
  assert.deepEqual(actualPoints, POINTS);
  assert.equal(actualPoints.reduce((sum, points) => sum + points, 0), 85);
});

test("FS22 answer option counts and labels match the supplied answer sheet", () => {
  const exam = fs22();
  assert.equal(OPTION_COUNTS.length, 48);
  for (const question of exam) {
    const count = OPTION_COUNTS[question.number - 1];
    assert.equal(question.options.length, count, `Question ${question.number} option count`);
    assert.deepEqual(question.options.map((option) => option.id), DISPLAY_OPTION_IDS.slice(0, count), `Question ${question.number} option labels`);
  }
});

test("FS22 official filled answer sheet is preserved exactly", () => {
  const exam = fs22();
  assert.equal(Object.keys(ANSWERS).length, 48);
  for (const question of exam) {
    assert.deepEqual(correctOptionIds(question), ANSWERS[question.number], `Question ${question.number}`);
    assert.match(question.source, /official answer sheet supplied in exam PDF/);
  }
});

test("FS22 diamond questions retain multi-select behavior", () => {
  const exam = fs22();
  assert.deepEqual(exam.filter((question) => question.multipleSelect).map((question) => question.number), [10,32,34,42,43]);
  assert.equal(isCorrectSelection(exam.find((q) => q.number === 10)!, ["B","C","D"]), true);
  assert.equal(isCorrectSelection(exam.find((q) => q.number === 10)!, ["B","C"]), false);
  assert.equal(isCorrectSelection(exam.find((q) => q.number === 42)!, ["A","C","D"]), true);
  assert.equal(isCorrectSelection(exam.find((q) => q.number === 43)!, ["B","D"]), true);
});

test("FS22 figure references match the supplied exam including the two-figure regression question", () => {
  const exam = fs22();
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 1).map((question) => question.number), [11,12,13]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 2).map((question) => question.number), [29,30,31]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 3).map((question) => question.number), [34,35]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 4).map((question) => question.number), [36]);
  assert.deepEqual(exam.filter((question) => question.secondFigureNumber === 5).map((question) => question.number), [36]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 6).map((question) => question.number), [42]);
  assert.deepEqual(exam.filter((question) => inferFigureNumber(question) === 7).map((question) => question.number), [43]);
});

test("FS22 common setups preserve dependent question groups", () => {
  const exam = fs22();
  const setup = (number: number) => exam.find((question) => question.number === number)?.setup;
  assert.equal(setup(5), setup(7));
  assert.equal(setup(8), setup(9));
  assert.equal(setup(11), setup(13));
  assert.equal(setup(17), setup(21));
  assert.equal(setup(22), setup(24));
  assert.equal(setup(25), setup(28));
  assert.equal(setup(29), setup(31));
  assert.equal(setup(32), setup(35));
  assert.equal(setup(36), setup(37));
  assert.equal(setup(38), setup(39));
  assert.equal(setup(40), setup(41));
  assert.equal(setup(42), setup(43));
  assert.equal(setup(45), setup(46));
  assert.equal(setup(47), setup(48));
});

test("FS22 transcription anchors guard the beginning, middle, and end of the exam", () => {
  const exam = fs22();
  assert.equal(exam.find((q) => q.number === 1)?.prompt, "If $f$ is a differentiable convex function and $\\nabla f(w)=0$, then $w$ is a global minimum of $f$.");
  assert.match(exam.find((q) => q.number === 10)?.prompt ?? "", /Mark all that apply\.$/);
  assert.match(exam.find((q) => q.number === 31)?.prompt ?? "", /Consider the point \$\(0,1\)\$/);
  assert.equal(exam.find((q) => q.number === 48)?.prompt, "What is the value of $\\pi_0^{(t+1)}$?");
});
