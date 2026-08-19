import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./hs22-common";
import { hs22Questions as q01to17 } from "./hs22-questions-01-17";
import { hs22Questions as q18to35 } from "./hs22-questions-18-35";
import { hs22Questions as q36to44 } from "./hs22-questions-36-44";
import { sortExamsChronologically } from "../lib/exam-order";

const hs22Questions = [...q01to17, ...q18to35, ...q36to44];
const withoutHs22 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutHs22, ...hs22Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
sortExamsChronologically(EXAMS);
