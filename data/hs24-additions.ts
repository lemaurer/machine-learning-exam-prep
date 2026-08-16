import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./hs24-common";
import { hs24Questions as q01to10 } from "./hs24-questions-01-10";
import { hs24Questions as q11to20 } from "./hs24-questions-11-20";
import { hs24Questions as q21to30 } from "./hs24-questions-21-30";
import { hs24Questions as q31to41 } from "./hs24-questions-31-41";

const hs24Questions = [...q01to10, ...q11to20, ...q21to30, ...q31to41];
const withoutHs24 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutHs24, ...hs24Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
