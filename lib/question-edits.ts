import type { EditStore, Question, QuestionEdit } from "../types/question";
import { questions as sourceQuestions } from "../data/questions";
import { applyEdits } from "./progress";

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

function validFigureNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function hiddenWithout(edit: QuestionEdit, figureNumber: number) {
  const hidden = [...new Set(edit.hiddenFigureNumbers ?? [])].filter((number) => number !== figureNumber);
  return hidden.length ? hidden : undefined;
}

function hiddenWith(edit: QuestionEdit, figureNumber: number) {
  return [...new Set([...(edit.hiddenFigureNumbers ?? []), figureNumber])].sort((a, b) => a - b);
}

function clearPrimaryFigureFields(edit: QuestionEdit) {
  const next = { ...edit };
  delete next.figureNumber;
  delete next.figure;
  delete next.figureAlt;
  delete next.figureCaption;
  return next;
}

function clearSecondFigureFields(edit: QuestionEdit) {
  const next = { ...edit };
  delete next.secondFigureNumber;
  delete next.secondFigure;
  delete next.secondFigureAlt;
  delete next.secondFigureCaption;
  return next;
}

export function inferFigureNumber(question: Question) {
  if (validFigureNumber(question.figureNumber)) return question.figureNumber;

  for (const value of [question.figure, question.figureCaption, question.figureAlt]) {
    if (!value) continue;
    const match = value.match(/(?:figure|fig)[\s_.-]*(\d+)/i);
    if (match) return Number(match[1]);
  }

  return undefined;
}

export function inferFigureNumbers(question: Question) {
  return [...new Set([
    inferFigureNumber(question),
    validFigureNumber(question.secondFigureNumber) ? question.secondFigureNumber : undefined,
  ].filter((value): value is number => typeof value === "number"))];
}

export function inferCommonSetupQuestionIds(
  question: Question,
  questions: Question[],
  edit?: QuestionEdit,
) {
  const explicit = uniqueIds(edit?.commonSetupQuestionIds ?? []);
  if (explicit.length > 1) return explicit;
  if (!question.setup) return [];

  const inferred = questions
    .filter((candidate) => candidate.examId === question.examId && candidate.setup === question.setup)
    .map((candidate) => candidate.id);

  return inferred.length > 1 ? inferred : [];
}

export function figureQuestionIdsForNumber(questions: Question[], examId: string, figureNumber: number) {
  return questions
    .filter((candidate) => candidate.examId === examId && inferFigureNumbers(candidate).includes(figureNumber))
    .map((candidate) => candidate.id);
}

type FigurePayload = {
  figureNumber: number;
  figure?: string;
  figureAlt?: string;
  figureCaption?: string;
};

function applyFigureMembership(
  current: EditStore,
  questions: Question[],
  payload: FigurePayload,
  requestedMemberIds: string[],
  preferredSlot: "primary" | "secondary",
  groupField: "sharedFigureQuestionIds" | "secondSharedFigureQuestionIds",
) {
  const figureNumber = payload.figureNumber;
  const memberIds = uniqueIds(requestedMemberIds);
  const groupValue = memberIds.length > 1 ? memberIds : undefined;
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const previousMembers = questions
    .filter((question) => inferFigureNumbers(applyEdits(question, current[question.id])).includes(figureNumber))
    .map((question) => question.id);
  const idsToVisit = uniqueIds([...previousMembers, ...memberIds]);
  const next: EditStore = { ...current };

  for (const memberId of idsToVisit) {
    const source = questionById.get(memberId);
    let edit: QuestionEdit = { ...(next[memberId] ?? {}) };
    const isSelected = memberIds.includes(memberId);

    if (!isSelected) {
      const effective = source ? applyEdits(source, edit) : undefined;
      if (effective?.figureNumber === figureNumber || edit.figureNumber === figureNumber) edit = clearPrimaryFigureFields(edit);
      if (effective?.secondFigureNumber === figureNumber || edit.secondFigureNumber === figureNumber) edit = clearSecondFigureFields(edit);
      edit.hiddenFigureNumbers = hiddenWith(edit, figureNumber);
      delete edit[groupField];
      next[memberId] = edit;
      continue;
    }

    edit.hiddenFigureNumbers = hiddenWithout(edit, figureNumber);
    edit[groupField] = groupValue;
    const effective = source ? applyEdits(source, edit) : undefined;

    let slot: "primary" | "secondary" = preferredSlot;
    if (effective?.figureNumber === figureNumber || edit.figureNumber === figureNumber) slot = "primary";
    else if (effective?.secondFigureNumber === figureNumber || edit.secondFigureNumber === figureNumber) slot = "secondary";
    else if (preferredSlot === "primary" && effective?.figureNumber && !effective.secondFigureNumber) slot = "secondary";
    else if (preferredSlot === "secondary" && effective?.secondFigureNumber && !effective.figureNumber) slot = "primary";

    if (slot === "primary") {
      edit.figureNumber = figureNumber;
      edit.figure = payload.figure;
      edit.figureAlt = payload.figureAlt;
      edit.figureCaption = payload.figureCaption;
    } else {
      edit.secondFigureNumber = figureNumber;
      edit.secondFigure = payload.figure;
      edit.secondFigureAlt = payload.figureAlt;
      edit.secondFigureCaption = payload.figureCaption;
    }
    next[memberId] = edit;
  }

  return next;
}

export function applySharedFigureImage(
  current: EditStore,
  question: Question,
  questions: Question[],
  figure: string,
  explicitFigureNumber?: number,
) {
  const figureNumber = explicitFigureNumber ?? inferFigureNumber(question);
  if (!validFigureNumber(figureNumber)) return current;

  const bank = questions.length ? questions : sourceQuestions;
  const effectiveQuestions = bank.map((candidate) => applyEdits(candidate, current[candidate.id]));
  const members = effectiveQuestions.filter(
    (candidate) => candidate.examId === question.examId && inferFigureNumbers(candidate).includes(figureNumber),
  );
  const next: EditStore = { ...current };

  for (const member of members) {
    const existing: QuestionEdit = { ...(next[member.id] ?? {}) };
    if (member.secondFigureNumber === figureNumber) {
      existing.secondFigureNumber = figureNumber;
      existing.secondFigure = figure;
      existing.secondFigureAlt = member.secondFigureAlt ?? `Figure ${figureNumber}`;
      existing.secondFigureCaption = member.secondFigureCaption;
    } else {
      existing.figureNumber = figureNumber;
      existing.figure = figure;
      existing.figureAlt = member.figureAlt ?? `Figure ${figureNumber}`;
      existing.figureCaption = member.figureCaption;
    }
    existing.hiddenFigureNumbers = hiddenWithout(existing, figureNumber);
    next[member.id] = existing;
  }

  return next;
}

export function applyQuestionEditWithCommonSetup(
  current: EditStore,
  questionId: string,
  edit: QuestionEdit,
  commonSetupQuestionIds: string[],
  questions: Question[] = [],
) {
  let next: EditStore = { ...current };
  const previousGroup = uniqueIds(current[questionId]?.commonSetupQuestionIds ?? []);
  const requestedGroup = uniqueIds(commonSetupQuestionIds);
  const group = requestedGroup.length > 1 ? requestedGroup : [];
  const commonSetupQuestionIdsValue = group.length ? group : undefined;

  const {
    figureNumber,
    figure,
    figureAlt,
    figureCaption,
    secondFigureNumber,
    secondFigure,
    secondFigureAlt,
    secondFigureCaption,
    sharedFigureQuestionIds,
    secondSharedFigureQuestionIds,
    hiddenFigureNumbers,
    ...nonFigureEdit
  } = edit;

  next[questionId] = {
    ...(current[questionId] ?? {}),
    ...nonFigureEdit,
    commonSetupQuestionIds: commonSetupQuestionIdsValue,
    hiddenFigureNumbers: hiddenFigureNumbers ?? current[questionId]?.hiddenFigureNumbers,
  };

  for (const memberId of group) {
    if (memberId === questionId) continue;
    next[memberId] = {
      ...(current[memberId] ?? {}),
      setup: edit.setup,
      commonSetupQuestionIds: group,
    };
  }

  for (const removedId of previousGroup.filter((id) => !group.includes(id))) {
    const member = current[removedId];
    if (!member) continue;
    const { commonSetupQuestionIds: removed, ...rest } = member;
    void removed;
    next[removedId] = rest;
  }

  const bank = questions.length ? questions : sourceQuestions;
  const owner = bank.find((candidate) => candidate.id === questionId);
  const examQuestions = owner ? bank.filter((candidate) => candidate.examId === owner.examId) : bank;

  if (validFigureNumber(figureNumber)) {
    const members = sharedFigureQuestionIds ?? (owner ? figureQuestionIdsForNumber(examQuestions, owner.examId, figureNumber) : [questionId]);
    next = applyFigureMembership(next, examQuestions, {
      figureNumber,
      figure,
      figureAlt,
      figureCaption,
    }, members, "primary", "sharedFigureQuestionIds");
  }

  if (validFigureNumber(secondFigureNumber)) {
    const members = secondSharedFigureQuestionIds ?? (owner ? figureQuestionIdsForNumber(examQuestions, owner.examId, secondFigureNumber) : [questionId]);
    next = applyFigureMembership(next, examQuestions, {
      figureNumber: secondFigureNumber,
      figure: secondFigure,
      figureAlt: secondFigureAlt,
      figureCaption: secondFigureCaption,
    }, members, "secondary", "secondSharedFigureQuestionIds");
  }

  return next;
}

/** Remove a legacy corrupt assignment that could place HS22 Figure 4 on Question 10. */
export function sanitizeKnownBadFigureAssignments(current: EditStore) {
  let changed = false;
  const next: EditStore = Object.fromEntries(Object.entries(current).map(([id, raw]) => {
    let edit: QuestionEdit = { ...raw };

    if (id === "hs22-q10") {
      if (edit.figureNumber === 4) {
        edit = clearPrimaryFigureFields(edit);
        changed = true;
      }
      if (edit.secondFigureNumber === 4) {
        edit = clearSecondFigureFields(edit);
        changed = true;
      }
    }

    if (edit.figureNumber === 4 && edit.sharedFigureQuestionIds?.includes("hs22-q10")) {
      edit.sharedFigureQuestionIds = edit.sharedFigureQuestionIds.filter((memberId) => memberId !== "hs22-q10");
      changed = true;
    }
    if (edit.secondFigureNumber === 4 && edit.secondSharedFigureQuestionIds?.includes("hs22-q10")) {
      edit.secondSharedFigureQuestionIds = edit.secondSharedFigureQuestionIds.filter((memberId) => memberId !== "hs22-q10");
      changed = true;
    }

    return [id, edit];
  }));

  return changed ? next : current;
}

export function removeQuestionEditFromCommonSetup(current: EditStore, questionId: string) {
  const next: EditStore = { ...current };
  const group = uniqueIds(current[questionId]?.commonSetupQuestionIds ?? []);
  const figureGroup = uniqueIds(current[questionId]?.sharedFigureQuestionIds ?? []);
  const secondFigureGroup = uniqueIds(current[questionId]?.secondSharedFigureQuestionIds ?? []);
  delete next[questionId];

  const remainingGroup = group.filter((id) => id !== questionId);
  for (const memberId of remainingGroup) {
    const member = next[memberId];
    if (!member) continue;
    next[memberId] = {
      ...member,
      commonSetupQuestionIds: remainingGroup.length > 1 ? remainingGroup : undefined,
    };
  }

  const remainingFigureGroup = figureGroup.filter((id) => id !== questionId);
  for (const memberId of remainingFigureGroup) {
    const member = next[memberId];
    if (!member) continue;
    next[memberId] = {
      ...member,
      sharedFigureQuestionIds: remainingFigureGroup.length > 1 ? remainingFigureGroup : undefined,
    };
  }

  const remainingSecondFigureGroup = secondFigureGroup.filter((id) => id !== questionId);
  for (const memberId of remainingSecondFigureGroup) {
    const member = next[memberId];
    if (!member) continue;
    next[memberId] = {
      ...member,
      secondSharedFigureQuestionIds: remainingSecondFigureGroup.length > 1 ? remainingSecondFigureGroup : undefined,
    };
  }

  return next;
}
