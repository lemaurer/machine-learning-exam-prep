import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./fs22-common";
import { fs22Questions as q01to16 } from "./fs22-questions-01-16";
import { fs22Questions as q17to35 } from "./fs22-questions-17-35";
import { fs22Questions as q36to48 } from "./fs22-questions-36-48";
import { sortExamsChronologically } from "../lib/exam-order";

const fs22Questions = [...q01to16, ...q17to35, ...q36to48];
const withoutFs22 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutFs22, ...fs22Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
sortExamsChronologically(EXAMS);
