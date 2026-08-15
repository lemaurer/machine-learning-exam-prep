import type { EditStore, Question, QuestionEdit } from "../types/question";

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

function validFigureNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
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

export function applyQuestionEditWithCommonSetup(
  current: EditStore,
  questionId: string,
  edit: QuestionEdit,
  commonSetupQuestionIds: string[],
) {
  const next: EditStore = { ...current };
  const previousGroup = uniqueIds(current[questionId]?.commonSetupQuestionIds ?? []);
  const requestedGroup = uniqueIds(commonSetupQuestionIds);
  const group = requestedGroup.length > 1 ? requestedGroup : [];
  const commonSetupQuestionIdsValue = group.length ? group : undefined;

  const previousFigureGroup = uniqueIds(current[questionId]?.sharedFigureQuestionIds ?? []);
  const requestedFigureGroup = validFigureNumber(edit.figureNumber)
    ? uniqueIds([questionId, ...(edit.sharedFigureQuestionIds ?? [])])
    : [];
  const sharedFigureQuestionIdsValue = requestedFigureGroup.length > 1 ? requestedFigureGroup : undefined;

  next[questionId] = {
    ...edit,
    commonSetupQuestionIds: commonSetupQuestionIdsValue,
    sharedFigureQuestionIds: sharedFigureQuestionIdsValue,
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

  if (validFigureNumber(edit.figureNumber)) {
    for (const memberId of requestedFigureGroup) {
      next[memberId] = {
        ...(next[memberId] ?? current[memberId] ?? {}),
        figureNumber: edit.figureNumber,
        figure: edit.figure,
        figureAlt: edit.figureAlt,
        figureCaption: edit.figureCaption,
        sharedFigureQuestionIds: sharedFigureQuestionIdsValue,
      };
    }
  }

  const remainingPreviousFigureGroup = previousFigureGroup.filter((id) => !requestedFigureGroup.includes(id));
  if (remainingPreviousFigureGroup.length) {
    const remainingValue = remainingPreviousFigureGroup.length > 1 ? remainingPreviousFigureGroup : undefined;
    for (const memberId of remainingPreviousFigureGroup) {
      const member = next[memberId] ?? current[memberId];
      if (!member) continue;
      next[memberId] = {
        ...member,
        sharedFigureQuestionIds: remainingValue,
      };
    }
  }

  return next;
}

export function removeQuestionEditFromCommonSetup(current: EditStore, questionId: string) {
  const next: EditStore = { ...current };
  const group = uniqueIds(current[questionId]?.commonSetupQuestionIds ?? []);
  const figureGroup = uniqueIds(current[questionId]?.sharedFigureQuestionIds ?? []);
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

  return next;
}
