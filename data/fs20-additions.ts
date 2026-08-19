import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./fs20-common";
import { fs20Questions as q01to18 } from "./fs20-questions-01-18";
import { fs20Questions as q19to36 } from "./fs20-questions-19-36";
import { fs20Questions as q37to52 } from "./fs20-questions-37-52";
import { sortExamsChronologically } from "../lib/exam-order";

const fs20Questions = [...q01to18, ...q19to36, ...q37to52];
const withoutFs20 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutFs20, ...fs20Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
sortExamsChronologically(EXAMS);
