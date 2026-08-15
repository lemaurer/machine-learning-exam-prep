import type { EditStore, Question, QuestionEdit } from "../types/question";

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
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

  next[questionId] = {
    ...edit,
    commonSetupQuestionIds: commonSetupQuestionIdsValue,
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

  return next;
}

export function removeQuestionEditFromCommonSetup(current: EditStore, questionId: string) {
  const next: EditStore = { ...current };
  const group = uniqueIds(current[questionId]?.commonSetupQuestionIds ?? []);
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

  return next;
}
