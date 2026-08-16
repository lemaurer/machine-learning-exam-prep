import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./fs25-common";
import { fs25Questions as q01to10 } from "./fs25-questions-01-10";
import { fs25Questions as q11to20 } from "./fs25-questions-11-20";
import { fs25Questions as q21to30 } from "./fs25-questions-21-30";
import { fs25Questions as q31to43 } from "./fs25-questions-31-43";

const fs25Questions = [...q01to10, ...q11to20, ...q21to30, ...q31to43];
const withoutFs25 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutFs25, ...fs25Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
