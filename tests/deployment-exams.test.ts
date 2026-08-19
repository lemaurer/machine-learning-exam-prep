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
import { EXAMS, questions } from "../data/questions";
import { questionsForExam } from "../lib/question-selection";

const EXPECTED_IDS = [
  "HS25",
  "FS25",
  "HS24",
  "FS24",
  "HS23",
  "FS23",
  "HS22",
  "FS22",
  "HS21",
  "FS21",
];

test("production exam selector contains every imported exam in chronological order", () => {
  assert.deepEqual(EXAMS.map((exam) => exam.id), EXPECTED_IDS);
});

test("every production exam has questions", () => {
  for (const examId of EXPECTED_IDS) {
    assert.ok(questionsForExam(questions, examId).length > 0, `${examId} must contain questions`);
  }
});

test("the three oldest newly imported exams are complete enough to deploy", () => {
  assert.equal(questionsForExam(questions, "FS22").length, 48);
  assert.equal(questionsForExam(questions, "HS21").length, 50);
  assert.equal(questionsForExam(questions, "FS21").length, 53);
});
