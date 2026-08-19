import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./fs21-common";
import { fs21Questions as q01to18 } from "./fs21-questions-01-18";
import { fs21Questions as q19to36 } from "./fs21-questions-19-36";
import { fs21Questions as q37to53 } from "./fs21-questions-37-53";
import { sortExamsChronologically } from "../lib/exam-order";

const fs21Questions = [...q01to18, ...q19to36, ...q37to53];
const withoutFs21 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutFs21, ...fs21Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
sortExamsChronologically(EXAMS);
