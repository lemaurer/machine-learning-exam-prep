import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./fs24-common";
import { fs24Questions as q01to10 } from "./fs24-questions-01-10";
import { fs24Questions as q11to20 } from "./fs24-questions-11-20";
import { fs24Questions as q21to30 } from "./fs24-questions-21-30";
import { fs24Questions as q31to40 } from "./fs24-questions-31-40";

const fs24Questions = [...q01to10, ...q11to20, ...q21to30, ...q31to40];
const withoutFs24 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutFs24, ...fs24Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
