import assert from "node:assert/strict";
import test from "node:test";
import { applyEdits } from "../lib/progress";
import {
  applyQuestionEditWithCommonSetup,
  figureQuestionIdsForNumber,
  sanitizeKnownBadFigureAssignments,
} from "../lib/question-edits";
import type { EditStore, Question } from "../types/question";

function question(partial: Partial<Question> & Pick<Question, "id" | "number">): Question {
  return {
    id: partial.id,
    examId: "HS22",
    examLabel: "HS22 · February 2023",
    number: partial.number,
    title: `Question ${partial.number}`,
    prompt: "prompt",
    options: [{ id: "A", text: "True" }, { id: "B", text: "False" }],
    correctOptionId: "A",
    correctOptionIds: ["A"],
    explanation: "explanation",
    topic: "Neural Networks",
    difficulty: "Foundation",
    source: `HS22 · Question ${partial.number} · 1 point`,
    ...partial,
  };
}

const q10 = question({ id: "hs22-q10", number: 10, figureNumber: 1, figureCaption: "Figure 1" });
const q11 = question({ id: "hs22-q11", number: 11, figureNumber: 1, figureCaption: "Figure 1" });
const q14 = question({ id: "hs22-q14", number: 14, figureNumber: 3, figureCaption: "Figure 3", secondFigureNumber: 4, secondFigureCaption: "Figure 4" });
const q15 = question({ id: "hs22-q15", number: 15, figureNumber: 3, figureCaption: "Figure 3", secondFigureNumber: 4, secondFigureCaption: "Figure 4" });
const bank = [q10, q11, q14, q15];

test("HS22 Figure 4 membership never leaks onto Question 10", () => {
  const edits = applyQuestionEditWithCommonSetup({}, q14.id, {
    figureNumber: 3,
    figureCaption: "Figure 3",
    sharedFigureQuestionIds: [q14.id, q15.id],
    secondFigureNumber: 4,
    secondFigureCaption: "Figure 4",
    secondSharedFigureQuestionIds: [q14.id, q15.id],
  }, [], bank);

  const effectiveQ10 = applyEdits(q10, edits[q10.id]);
  assert.equal(effectiveQ10.figureNumber, 1);
  assert.equal(effectiveQ10.secondFigureNumber, undefined);
  assert.deepEqual(figureQuestionIdsForNumber(bank.map((item) => applyEdits(item, edits[item.id])), "HS22", 4), [q14.id, q15.id]);
});

test("removing a card from a second-figure membership actually hides that supplied figure", () => {
  const initial = applyQuestionEditWithCommonSetup({}, q14.id, {
    figureNumber: 3,
    figureCaption: "Figure 3",
    sharedFigureQuestionIds: [q14.id, q15.id],
    secondFigureNumber: 4,
    secondFigureCaption: "Figure 4",
    secondSharedFigureQuestionIds: [q14.id, q15.id],
  }, [], bank);

  const next = applyQuestionEditWithCommonSetup(initial, q14.id, {
    figureNumber: 3,
    figureCaption: "Figure 3",
    sharedFigureQuestionIds: [q14.id, q15.id],
    secondFigureNumber: 4,
    secondFigureCaption: "Figure 4",
    secondSharedFigureQuestionIds: [q14.id],
  }, [], bank.map((item) => applyEdits(item, initial[item.id])));

  const effectiveQ14 = applyEdits(q14, next[q14.id]);
  const effectiveQ15 = applyEdits(q15, next[q15.id]);
  assert.equal(effectiveQ14.figureNumber, 3);
  assert.equal(effectiveQ14.secondFigureNumber, 4);
  assert.equal(effectiveQ15.figureNumber, 3, "removing Figure 4 must not remove Figure 3");
  assert.equal(effectiveQ15.secondFigureNumber, undefined, "Figure 4 is removed from Q15");
  assert.ok(next[q15.id]?.hiddenFigureNumbers?.includes(4));
});

test("legacy HS22 Q10 Figure 4 corruption is cleaned back to the supplied Figure 1", () => {
  const corrupt: EditStore = {
    [q10.id]: {
      figureNumber: 4,
      figure: "bad-figure-4.png",
      figureCaption: "Figure 4",
      sharedFigureQuestionIds: [q10.id, q14.id, q15.id],
    },
    [q14.id]: {
      secondFigureNumber: 4,
      secondSharedFigureQuestionIds: [q10.id, q14.id, q15.id],
    },
  };

  const cleaned = sanitizeKnownBadFigureAssignments(corrupt);
  const effectiveQ10 = applyEdits(q10, cleaned[q10.id]);
  assert.equal(effectiveQ10.figureNumber, 1);
  assert.equal(effectiveQ10.secondFigureNumber, undefined);
  assert.equal(cleaned[q14.id]?.secondSharedFigureQuestionIds?.includes(q10.id), false);
});
