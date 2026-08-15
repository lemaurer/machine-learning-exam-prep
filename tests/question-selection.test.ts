import assert from "node:assert/strict";
import test from "node:test";
import "../data/hs25-additions";
import { questions } from "../data/questions";
import { answerProgress, setQuestionStatus } from "../lib/progress";
import { questionsAvailableForMode, questionsForExam, uniqueQuestionsById } from "../lib/question-selection";
import type { ProgressStore } from "../types/question";

function normalizedPrompt(prompt: string) {
  return prompt
    .replace(/\\\\/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.$`]/g, "")
    .trim()
    .toLowerCase();
}

test("the supplied bank contains 23 questions with unique ids and question texts", () => {
  assert.equal(questions.length, 23);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  assert.equal(new Set(questions.map((question) => normalizedPrompt(question.prompt))).size, questions.length);
});

test("the complete source keeps the Lasso closed-form question as Question 6 without duplicating it", () => {
  const closedForm = questions.filter((question) => normalizedPrompt(question.prompt).includes("lasso solution") && normalizedPrompt(question.prompt).includes("closed form via matrix inversion"));
  assert.equal(closedForm.length, 1);
  assert.equal(closedForm[0].number, 6);

  const questionFive = questions.find((question) => question.number === 5 && question.prompt.includes("lasso penalty encourages sparsity"));
  assert.ok(questionFive);
});

test("a duplicated source entry can never create a repeated session question", () => {
  const duplicatedBank = [questions[0], questions[0], questions[1]];
  assert.deepEqual(
    uniqueQuestionsById(duplicatedBank).map((question) => question.id),
    [questions[0].id, questions[1].id],
  );
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

test("an exam run contains every question from the selected exam in question-number order", () => {
  const selected = questionsForExam(questions, "HS25");
  const numbers = selected.map((question) => question.number);
  const sortedNumbers = [...numbers].sort((a, b) => a - b);

  assert.deepEqual(numbers, sortedNumbers);
  assert.equal(selected.length, questions.length);
});

test("incorrect answers enter Review and a correct review answer moves to Done", () => {
  const missed = answerProgress(undefined, "A", false, new Date("2026-01-01T00:00:00Z"));
  assert.equal(missed.status, "review");

  const corrected = answerProgress(missed, "B", true, new Date("2026-01-02T00:00:00Z"));
  assert.equal(corrected.status, "done");
  assert.equal(corrected.attempts, 2);
});
