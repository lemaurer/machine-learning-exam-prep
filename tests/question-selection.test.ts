import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import { questions } from "../data/questions";
import {
  displayedAnswerLabel,
  displayedOptionLabel,
  isCorrectSelection,
  optionIdForDisplayedKey,
  shouldIgnoreAnswerShortcut,
  shuffledOptionIds,
} from "../lib/answers";
import {
  applyQuestionEditWithCommonSetup,
  applySharedFigureImage,
  inferCommonSetupQuestionIds,
  inferFigureNumber,
  removeQuestionEditFromCommonSetup,
} from "../lib/question-edits";
import { answerProgress, applyEdits, setQuestionStatus } from "../lib/progress";
import { questionsAvailableForMode, questionsForExam, shuffleQuestionsBySetupGroup, uniqueQuestionsById } from "../lib/question-selection";
import type { ProgressStore } from "../types/question";

function normalizedPrompt(prompt: string) {
  return prompt
    .replace(/\\\\/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.$`]/g, "")
    .trim()
    .toLowerCase();
}

test("HS25 contains all 42 supplied questions exactly once", () => {
  const hs25 = questionsForExam(questions, "HS25");
  assert.equal(hs25.length, 42);
  assert.deepEqual(hs25.map((question) => question.number), Array.from({ length: 42 }, (_, index) => index + 1));
  assert.equal(new Set(hs25.map((question) => question.id)).size, 42);
  assert.equal(new Set(hs25.map((question) => normalizedPrompt(question.prompt))).size, 42);
});

test("the corrected source wording is used for the previously partial questions", () => {
  const q1 = questions.find((question) => question.examId === "HS25" && question.number === 1);
  const q2 = questions.find((question) => question.examId === "HS25" && question.number === 2);
  const q22 = questions.find((question) => question.examId === "HS25" && question.number === 22);
  assert.ok(q1?.prompt.includes("strictly positive"));
  assert.ok(q2?.prompt.includes("unique optimal solution"));
  assert.ok(q22?.prompt.includes("characterizes the bias"));
});

test("the Lasso questions are numbered 5 and 6 without duplication", () => {
  const questionFive = questions.find((question) => question.examId === "HS25" && question.number === 5);
  const questionSix = questions.find((question) => question.examId === "HS25" && question.number === 6);
  assert.ok(questionFive?.prompt.includes("lasso penalty encourages sparsity"));
  assert.ok(questionSix?.prompt.includes("closed form via matrix inversion"));
});

test("a duplicated source entry can never create a repeated session question", () => {
  const duplicatedBank = [questions[0], questions[0], questions[1]];
  assert.deepEqual(uniqueQuestionsById(duplicatedBank).map((question) => question.id), [questions[0].id, questions[1].id]);
});

test("Practice receives new questions, Review receives review questions, and Exam ignores study progress", () => {
  const progress: ProgressStore = {
    [questions[0].id]: setQuestionStatus(undefined, "done"),
    [questions[1].id]: setQuestionStatus(undefined, "review"),
  };
  const sample = questions.slice(0, 3);

  assert.deepEqual(questionsAvailableForMode(sample, progress, "practice").map((question) => question.id), [questions[2].id]);
  assert.deepEqual(questionsAvailableForMode(sample, progress, "exam").map((question) => question.id), sample.map((question) => question.id));
  assert.deepEqual(questionsAvailableForMode(sample, progress, "review").map((question) => question.id), [questions[1].id]);
});

test("exam mode always returns HS25 in original question-number order", () => {
  const selected = questionsForExam(questions, "HS25");
  assert.deepEqual(selected.map((question) => question.number), Array.from({ length: 42 }, (_, index) => index + 1));
});

test("practice shuffling keeps questions with the same setup adjacent and ordered", () => {
  const sampleNumbers = [7, 8, 9, 10, 11, 12];
  const sample = sampleNumbers.map((number) => questions.find((question) => question.number === number)!);
  const grouped = shuffleQuestionsBySetupGroup(sample, () => 0);
  const numbers = grouped.map((question) => question.number);

  const seven = numbers.indexOf(7);
  assert.deepEqual(numbers.slice(seven, seven + 2), [7, 8]);

  const nine = numbers.indexOf(9);
  assert.deepEqual(numbers.slice(nine, nine + 3), [9, 10, 11]);
});

test("diamond questions support exact multiple-answer selection", () => {
  const q2 = questions.find((question) => question.number === 2)!;
  const q27 = questions.find((question) => question.number === 27)!;
  const q33 = questions.find((question) => question.number === 33)!;
  assert.equal(q2.multipleSelect, true);
  assert.equal(q27.multipleSelect, true);
  assert.equal(q33.multipleSelect, true);
  assert.equal(isCorrectSelection(q2, ["C"]), true);
  assert.equal(isCorrectSelection(q2, ["A", "C"]), false);
  assert.equal(isCorrectSelection(q27, ["A", "B"]), true);
  assert.equal(isCorrectSelection(q27, ["A"]), false);
  assert.equal(isCorrectSelection(q33, ["B", "D"]), true);
  assert.equal(isCorrectSelection(q33, ["B", "D", "E"]), false);
});

test("displayed answer letters are randomized without changing answer correctness", () => {
  const q2 = questions.find((question) => question.number === 2)!;
  const originalIds = q2.options.map((option) => option.id);
  const order = shuffledOptionIds(q2, () => 0);

  assert.deepEqual(originalIds, ["A", "B", "C"]);
  assert.deepEqual(order, ["B", "C", "A"]);
  assert.deepEqual(q2.options.map((option) => option.id), originalIds, "shuffling must not mutate the source question");
  assert.equal(optionIdForDisplayedKey("A", order), "B");
  assert.equal(displayedOptionLabel("C", order), "B");
  assert.equal(displayedAnswerLabel(["C"], order), "B");
  assert.equal(isCorrectSelection(q2, ["C"]), true, "correctness must still use the underlying answer content");
});

test("Command, Control, and Alt shortcuts are never interpreted as answers", () => {
  assert.equal(shouldIgnoreAnswerShortcut({ metaKey: true, ctrlKey: false, altKey: false }), true);
  assert.equal(shouldIgnoreAnswerShortcut({ metaKey: false, ctrlKey: true, altKey: false }), true);
  assert.equal(shouldIgnoreAnswerShortcut({ metaKey: false, ctrlKey: false, altKey: true }), true);
  assert.equal(shouldIgnoreAnswerShortcut({ metaKey: false, ctrlKey: false, altKey: false }), false);
});

test("missing source figures are represented by numbered placeholders", () => {
  assert.equal(inferFigureNumber(questions.find((question) => question.number === 13)!), 2);
  assert.equal(inferFigureNumber(questions.find((question) => question.number === 14)!), 3);
  assert.equal(inferFigureNumber(questions.find((question) => question.number === 33)!), 6);
  assert.equal(questions.find((question) => question.number === 13)?.figure, undefined);
  assert.equal(questions.find((question) => question.number === 14)?.figure, undefined);
  assert.equal(questions.find((question) => question.number === 33)?.figure, undefined);
});

test("common setups can be edited once and shared across a question group", () => {
  const questionSeven = questions.find((question) => question.number === 7)!;
  const questionEight = questions.find((question) => question.number === 8)!;

  assert.deepEqual(inferCommonSetupQuestionIds(questionSeven, questions).sort(), [questionSeven.id, questionEight.id].sort());

  const edits = applyQuestionEditWithCommonSetup({}, questionSeven.id, { setup: "Updated shared kernel setup", prompt: "Only question 7 changes" }, [questionSeven.id, questionEight.id]);
  assert.equal(edits[questionSeven.id]?.setup, "Updated shared kernel setup");
  assert.equal(edits[questionEight.id]?.setup, "Updated shared kernel setup");
  assert.equal(edits[questionEight.id]?.prompt, undefined);
  assert.equal(applyEdits(questionEight, edits[questionEight.id]).setup, "Updated shared kernel setup");

  const afterReset = removeQuestionEditFromCommonSetup(edits, questionSeven.id);
  assert.equal(afterReset[questionSeven.id], undefined);
  assert.equal(afterReset[questionEight.id]?.commonSetupQuestionIds, undefined);
});

test("figures are identified by number and an edit propagates to every question using that figure", () => {
  const figureOneQuestions = questions.filter((question) => inferFigureNumber(question) === 1);
  assert.deepEqual(figureOneQuestions.map((question) => question.number), [9, 10, 11]);

  const editedFrom = figureOneQuestions[0]!;
  const figureQuestionIds = figureOneQuestions.map((question) => question.id);
  const edits = applyQuestionEditWithCommonSetup({}, editedFrom.id, {
    figureNumber: 1,
    figure: "/figures/replacement-figure-1.png",
    figureAlt: "Updated shared Figure 1",
    figureCaption: "Updated shared Figure 1 caption",
    sharedFigureQuestionIds: figureQuestionIds,
  }, []);

  for (const question of figureOneQuestions) {
    const updated = applyEdits(question, edits[question.id]);
    assert.equal(updated.figureNumber, 1);
    assert.equal(updated.figure, "/figures/replacement-figure-1.png");
    assert.equal(updated.figureAlt, "Updated shared Figure 1");
    assert.equal(updated.figureCaption, "Updated shared Figure 1 caption");
  }
});

test("direct placeholder upload applies the image to every use of that figure number", () => {
  const figureFourQuestions = questions.filter((question) => inferFigureNumber(question) === 4);
  assert.deepEqual(figureFourQuestions.map((question) => question.number), [16, 17]);

  const uploadedFigure = "data:image/webp;base64,shared-figure-four";
  const edits = applySharedFigureImage({}, figureFourQuestions[0]!, questions, uploadedFigure);

  for (const question of figureFourQuestions) {
    const updated = applyEdits(question, edits[question.id]);
    assert.equal(updated.figureNumber, 4);
    assert.equal(updated.figure, uploadedFigure);
  }

  const figureFive = questions.find((question) => inferFigureNumber(question) === 5)!;
  assert.equal(edits[figureFive.id], undefined);
});

test("progress stores multiple selected answers", () => {
  const missed = answerProgress(undefined, ["A", "C"], false, new Date("2026-01-01T00:00:00Z"));
  assert.equal(missed.status, "review");
  assert.deepEqual(missed.lastAnswerIds, ["A", "C"]);

  const corrected = answerProgress(missed, ["B", "D"], true, new Date("2026-01-02T00:00:00Z"));
  assert.equal(corrected.status, "done");
  assert.equal(corrected.attempts, 2);
  assert.deepEqual(corrected.lastAnswerIds, ["B", "D"]);
});
