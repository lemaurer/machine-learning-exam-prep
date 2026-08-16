import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./fs23-common";
import { fs23Questions as q01to13 } from "./fs23-questions-01-13";
import { fs23Questions as q14to29 } from "./fs23-questions-14-29";
import { fs23Questions as q30to45 } from "./fs23-questions-30-45";
import { sortExamsChronologically } from "../lib/exam-order";

const fs23Questions = [...q01to13, ...q14to29, ...q30to45];
const withoutFs23 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutFs23, ...fs23Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
sortExamsChronologically(EXAMS);
