import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./hs23-common";
import { hs23Questions as q01to10 } from "./hs23-questions-01-10";
import { hs23Questions as q11to20 } from "./hs23-questions-11-20";
import { hs23Questions as q21to30 } from "./hs23-questions-21-30";
import { hs23Questions as q31to44 } from "./hs23-questions-31-44";

const hs23Questions = [...q01to10, ...q11to20, ...q21to30, ...q31to44];
const withoutHs23 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutHs23, ...hs23Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
