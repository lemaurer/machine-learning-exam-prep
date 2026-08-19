import { EXAMS, questions } from "./questions";
import { EXAM_ID, EXAM_LABEL } from "./hs21-common";
import { hs21Questions as q01to18 } from "./hs21-questions-01-18";
import { hs21Questions as q19to36 } from "./hs21-questions-19-36";
import { hs21Questions as q37to50 } from "./hs21-questions-37-50";
import { sortExamsChronologically } from "../lib/exam-order";

const hs21Questions = [...q01to18, ...q19to36, ...q37to50];
const withoutHs21 = questions.filter((question) => question.examId !== EXAM_ID);
questions.splice(0, questions.length, ...withoutHs21, ...hs21Questions);
if (!EXAMS.some((exam) => exam.id === EXAM_ID)) EXAMS.push({ id: EXAM_ID, label: EXAM_LABEL });
sortExamsChronologically(EXAMS);
