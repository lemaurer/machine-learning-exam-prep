"use client";

import { useEffect, useMemo, useState } from "react";
import { EXAMS, questions as sourceQuestions } from "../data/questions";
import {
  answerProgress,
  applyEdits,
  EDITS_KEY,
  loadEdits,
  loadProgress,
  PROGRESS_KEY,
  saveEdits,
  saveProgress,
  setQuestionStatus,
  shuffle,
} from "../lib/progress";
import {
  applyQuestionEditWithCommonSetup,
  inferCommonSetupQuestionIds,
  removeQuestionEditFromCommonSetup,
} from "../lib/question-edits";
import { questionsAvailableForMode, questionsForExam, uniqueQuestionsById } from "../lib/question-selection";
import { resolveAssetUrl } from "../lib/assets";
import {
  DIFFICULTIES,
  TOPICS,
  type Difficulty,
  type EditStore,
  type ProgressStore,
  type Question,
  type QuestionEdit,
  type QuestionOption,
  type SessionMode,
  type Topic,
} from "../types/question";
import { LatexText } from "./components/LatexText";
import { QuestionEditor } from "./components/QuestionEditor";

type Screen = "setup" | "session" | "results";
type SessionSize = "5" | "10" | "all";
type SessionAnswer = {
  questionId: string;
  selectedId: QuestionOption["id"] | null;
  correct: boolean;
};

const MODE_COPY: Record<SessionMode, { eyebrow: string; title: string; body: string }> = {
  practice: {
    eyebrow: "Learn with feedback",
    title: "Practice the questions once, carefully.",
    body: "Answer one supplied exam question at a time. Feedback and the provided solution appear immediately; answered questions leave this mode. Skipped questions remain untouched for later.",
  },
  review: {
    eyebrow: "Return to weak spots",
    title: "Clear your review bin.",
    body: "Incorrect answers and questions you save for later collect here. A question disappears from Review as soon as you answer it correctly. Skipping leaves it in Review.",
  },
  exam: {
    eyebrow: "Work without hints",
    title: "Simulate a complete exam run.",
    body: "Choose one supplied exam and work through every question in its original order. No feedback is shown during the attempt, and your normal Done/Review progress is not changed.",
  },
};

export function ExamPrepApp() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("setup");
  const [mode, setMode] = useState<SessionMode>("practice");
  const [examId, setExamId] = useState("all");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [query, setQuery] = useState("");
  const [sessionSize, setSessionSize] = useState<SessionSize>("5");
  const [progress, setProgress] = useState<ProgressStore>({});
  const [edits, setEdits] = useState<EditStore>({});
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<QuestionOption["id"] | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const knownIds = new Set(sourceQuestions.map((question) => question.id));
    setProgress(Object.fromEntries(Object.entries(loadProgress()).filter(([id]) => knownIds.has(id))));
    setEdits(Object.fromEntries(Object.entries(loadEdits()).filter(([id]) => knownIds.has(id))));
    setReady(true);
  }, []);

  const questions = useMemo(
    () => uniqueQuestionsById(sourceQuestions.map((question) => applyEdits(question, edits[question.id]))),
    [edits],
  );

  const filteredQuestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return questions.filter((question) => {
      const matchesQuery = !needle || [
        question.examId,
        question.examLabel,
        `question ${question.number}`,
        String(question.number),
        question.title,
        question.setup ?? "",
        question.prompt,
        question.topic,
      ].some((value) => value.toLowerCase().includes(needle));
      return (examId === "all" || question.examId === examId)
        && (topic === "all" || question.topic === topic)
        && (difficulty === "all" || question.difficulty === difficulty)
        && matchesQuery;
    });
  }, [questions, examId, topic, difficulty, query]);

  const availableQuestions = useMemo(() => {
    if (mode === "exam") {
      return examId === "all" ? [] : questionsForExam(questions, examId);
    }
    return questionsAvailableForMode(filteredQuestions, progress, mode);
  }, [examId, filteredQuestions, mode, progress, questions]);

  const reviewQuestions = useMemo(
    () => questions.filter((question) => progress[question.id]?.status === "review"),
    [questions, progress],
  );

  const totals = useMemo(() => {
    const records = Object.values(progress);
    const correct = records.reduce((sum, record) => sum + record.correct, 0);
    const attempts = records.reduce((sum, record) => sum + record.attempts, 0);
    return {
      newCount: questions.filter((question) => !progress[question.id] || progress[question.id].status === "new").length,
      done: questions.filter((question) => progress[question.id]?.status === "done").length,
      review: reviewQuestions.length,
      attempts,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    };
  }, [progress, questions, reviewQuestions.length]);

  const currentQuestion = sessionIds[questionIndex]
    ? questions.find((question) => question.id === sessionIds[questionIndex])
    : undefined;

  function persistProgress(updater: (current: ProgressStore) => ProgressStore) {
    setProgress((current) => {
      const next = updater(current);
      saveProgress(next);
      return next;
    });
  }

  function switchMode(nextMode: SessionMode) {
    setMode(nextMode);
    if (nextMode === "exam" && examId === "all" && EXAMS[0]) setExamId(EXAMS[0].id);
    setScreen("setup");
    setEditing(false);
  }

  function startSession() {
    const count = sessionSize === "all" ? availableQuestions.length : Number(sessionSize);
    const selected = mode === "exam"
      ? availableQuestions
      : shuffle(availableQuestions).slice(0, count);
    if (!selected.length) return;
    setSessionIds(selected.map((question) => question.id));
    setQuestionIndex(0);
    setSelectedId(null);
    setFeedbackVisible(false);
    setSessionAnswers([]);
    setEditing(false);
    setScreen("session");
  }

  function chooseAnswer(answerId: QuestionOption["id"]) {
    if (!currentQuestion || feedbackVisible) return;
    setSelectedId(answerId);
    if (mode === "exam") return;

    const correct = answerId === currentQuestion.correctOptionId;
    const answer = { questionId: currentQuestion.id, selectedId: answerId, correct };
    setSessionAnswers((answers) => [...answers, answer]);
    persistProgress((current) => ({
      ...current,
      [currentQuestion.id]: answerProgress(current[currentQuestion.id], answerId, correct),
    }));
    setFeedbackVisible(true);
  }

  function commitExamAnswer() {
    if (!currentQuestion || !selectedId) return;
    const correct = selectedId === currentQuestion.correctOptionId;
    const answer = { questionId: currentQuestion.id, selectedId, correct };
    setSessionAnswers((answers) => [...answers, answer]);
    advance(true);
  }

  function skipQuestion() {
    if (!currentQuestion || feedbackVisible) return;
    setSessionAnswers((answers) => [...answers, {
      questionId: currentQuestion.id,
      selectedId: null,
      correct: false,
    }]);
    advance(true);
  }

  function advance(force = false) {
    if (!force && !feedbackVisible) return;
    if (questionIndex === sessionIds.length - 1) {
      setEditing(false);
      setScreen("results");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedId(null);
    setFeedbackVisible(false);
    setEditing(false);
  }

  function queueForReview(questionId: string) {
    persistProgress((current) => ({
      ...current,
      [questionId]: setQuestionStatus(current[questionId], "review"),
    }));
  }

  function markDone(questionId: string) {
    persistProgress((current) => ({
      ...current,
      [questionId]: setQuestionStatus(current[questionId], "done"),
    }));
  }

  function saveQuestionEdit(questionId: string, edit: QuestionEdit, commonSetupQuestionIds: string[]) {
    setEdits((current) => {
      const next = applyQuestionEditWithCommonSetup(current, questionId, edit, commonSetupQuestionIds);
      saveEdits(next);
      return next;
    });
    setEditing(false);
  }

  function resetQuestionEdit(questionId: string) {
    setEdits((current) => {
      const next = removeQuestionEditFromCommonSetup(current, questionId);
      saveEdits(next);
      return next;
    });
    setEditing(false);
  }

  function resetProgress() {
    if (!window.confirm("Reset all Done and Review progress? Question edits will remain.")) return;
    window.localStorage.removeItem(PROGRESS_KEY);
    setProgress({});
  }

  function resetAllEdits() {
    if (!window.confirm("Restore every question to the supplied exam version?")) return;
    window.localStorage.removeItem(EDITS_KEY);
    setEdits({});
  }

  function endSession() {
    const wording = mode === "exam"
      ? "End this exam attempt? The unfinished attempt will be discarded and study progress will remain unchanged."
      : "End this session? Answers already submitted remain saved; skipped questions stay unchanged.";
    if (!window.confirm(wording)) return;
    setEditing(false);
    setScreen("setup");
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (screen !== "session" || editing || !currentQuestion) return;
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const key = event.key.toUpperCase();
      const trueFalse = currentQuestion.options.length === 2
        && currentQuestion.options[0]?.text.toLowerCase() === "true"
        && currentQuestion.options[1]?.text.toLowerCase() === "false";
      if (!feedbackVisible && /^[A-D]$/.test(key) && currentQuestion.options.some((option) => option.id === key)) {
        chooseAnswer(key as QuestionOption["id"]);
      } else if (!feedbackVisible && trueFalse && key === "T") {
        chooseAnswer("A");
      } else if (!feedbackVisible && trueFalse && key === "F") {
        chooseAnswer("B");
      } else if (!feedbackVisible && key === "S") {
        skipQuestion();
      } else if (event.key === "Enter") {
        if (mode === "exam") commitExamAnswer();
        else advance();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!ready) return <main className="app-loading">Preparing the supplied question bank…</main>;

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("setup")} aria-label="Return to study setup">
          <span className="brand-mark">IML</span>
          <span><strong>Exam Preparation</strong><small>ETH Zürich · Machine Learning</small></span>
        </button>
        <nav className="mode-nav" aria-label="Study mode">
          {(["practice", "review", "exam"] as SessionMode[]).map((item) => (
            <button key={item} className={mode === item ? "active" : ""} onClick={() => switchMode(item)}>
              {item[0].toUpperCase() + item.slice(1)}
              {item === "review" && totals.review > 0 && <span className="nav-count">{totals.review}</span>}
            </button>
          ))}
        </nav>
        <div className="header-stat"><span>{totals.attempts ? `${totals.accuracy}%` : "—"}</span><small>accuracy</small></div>
      </header>

      {screen === "setup" && (
        <SetupScreen
          mode={mode}
          examId={examId}
          topic={topic}
          difficulty={difficulty}
          query={query}
          sessionSize={sessionSize}
          setExamId={setExamId}
          setTopic={setTopic}
          setDifficulty={setDifficulty}
          setQuery={setQuery}
          setSessionSize={setSessionSize}
          availableQuestions={availableQuestions}
          reviewQuestions={reviewQuestions}
          progress={progress}
          totals={totals}
          editedCount={Object.keys(edits).length}
          onStart={startSession}
          onMarkDone={markDone}
          onResetProgress={resetProgress}
          onResetEdits={resetAllEdits}
        />
      )}

      {screen === "session" && currentQuestion && (
        <SessionScreen
          mode={mode}
          question={currentQuestion}
          index={questionIndex}
          total={sessionIds.length}
          selectedId={selectedId}
          feedbackVisible={feedbackVisible}
          status={progress[currentQuestion.id]?.status ?? "new"}
          onChoose={chooseAnswer}
          onNext={mode === "exam" ? commitExamAnswer : () => advance()}
          onSkip={skipQuestion}
          onEdit={() => setEditing(true)}
          onEnd={endSession}
          onQueueReview={() => queueForReview(currentQuestion.id)}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          mode={mode}
          answers={sessionAnswers}
          questions={questions}
          progress={progress}
          onQueueReview={queueForReview}
          onDone={markDone}
          onReturn={() => setScreen("setup")}
          onOpenReview={() => { setMode("review"); setScreen("setup"); }}
        />
      )}

      {editing && currentQuestion && (
        <QuestionEditor
          question={currentQuestion}
          examQuestions={questions.filter((question) => question.examId === currentQuestion.examId)}
          sharedSetupQuestionIds={inferCommonSetupQuestionIds(currentQuestion, questions, edits[currentQuestion.id])}
          hasLocalEdit={Boolean(edits[currentQuestion.id])}
          onSave={(edit, commonSetupQuestionIds) => saveQuestionEdit(currentQuestion.id, edit, commonSetupQuestionIds)}
          onReset={() => resetQuestionEdit(currentQuestion.id)}
          onClose={() => setEditing(false)}
        />
      )}
    </main>
  );
}

function SetupScreen({
  mode,
  examId,
  topic,
  difficulty,
  query,
  sessionSize,
  setExamId,
  setTopic,
  setDifficulty,
  setQuery,
  setSessionSize,
  availableQuestions,
  reviewQuestions,
  progress,
  totals,
  editedCount,
  onStart,
  onMarkDone,
  onResetProgress,
  onResetEdits,
}: {
  mode: SessionMode;
  examId: string;
  topic: Topic | "all";
  difficulty: Difficulty | "all";
  query: string;
  sessionSize: SessionSize;
  setExamId: (value: string) => void;
  setTopic: (value: Topic | "all") => void;
  setDifficulty: (value: Difficulty | "all") => void;
  setQuery: (value: string) => void;
  setSessionSize: (value: SessionSize) => void;
  availableQuestions: Question[];
  reviewQuestions: Question[];
  progress: ProgressStore;
  totals: { newCount: number; done: number; review: number; attempts: number; accuracy: number };
  editedCount: number;
  onStart: () => void;
  onMarkDone: (id: string) => void;
  onResetProgress: () => void;
  onResetEdits: () => void;
}) {
  const copy = MODE_COPY[mode];
  const startCount = mode === "exam"
    ? availableQuestions.length
    : sessionSize === "all"
      ? availableQuestions.length
      : Math.min(Number(sessionSize), availableQuestions.length);
  const selectedExam = EXAMS.find((exam) => exam.id === examId);

  return (
    <div className="setup-layout">
      <section className="setup-main">
        <div className="hero-copy">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </div>

        <div className="setup-card">
          {mode === "exam" ? (
            <div className="filter-grid">
              <label><span>Exam</span><select value={examId} onChange={(event) => setExamId(event.target.value)}>{EXAMS.map((exam) => <option value={exam.id} key={exam.id}>{exam.label}</option>)}</select></label>
            </div>
          ) : (
            <div className="filter-grid">
              <label><span>Exam</span><select value={examId} onChange={(event) => setExamId(event.target.value)}><option value="all">All exams</option>{EXAMS.map((exam) => <option value={exam.id} key={exam.id}>{exam.label}</option>)}</select></label>
              <label><span>Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value as Topic | "all")}><option value="all">All topics</option>{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | "all")}><option value="all">All levels</option>{DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Find a question</span><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Number, title, or text" /></label>
            </div>
          )}

          {mode === "exam" ? (
            <div className="length-row">
              <div><span className="field-title">Complete exam</span><small>{availableQuestions.length} question{availableQuestions.length === 1 ? "" : "s"} · original question-number order · progress unchanged</small></div>
              <span className="local-pill">{selectedExam?.id ?? "Exam"}</span>
            </div>
          ) : (
            <div className="length-row">
              <div><span className="field-title">Session length</span><small>{availableQuestions.length} matching question{availableQuestions.length === 1 ? "" : "s"} available</small></div>
              <div className="segmented" role="group" aria-label="Session length">
                {(["5", "10", "all"] as SessionSize[]).map((size) => <button key={size} className={sessionSize === size ? "active" : ""} onClick={() => setSessionSize(size)}>{size === "all" ? "All" : size}</button>)}
              </div>
            </div>
          )}

          {mode === "review" && (
            <div className="review-bin">
              <div className="review-heading"><strong>Review bin</strong><span>{reviewQuestions.length} saved</span></div>
              {reviewQuestions.length ? reviewQuestions.map((question) => (
                <div className="review-row" key={question.id}>
                  <span className="status-dot" />
                  <div><small>{question.examId} · Question {question.number}</small><p><LatexText text={question.prompt} /></p></div>
                  <button className="text-button" onClick={() => onMarkDone(question.id)}>Move to Done</button>
                </div>
              )) : <div className="empty-state"><span>✓</span><div><strong>Your review bin is clear.</strong><p>Missed or manually saved questions will appear here.</p></div></div>}
            </div>
          )}

          <div className="start-row">
            <button className="primary-button" disabled={!availableQuestions.length} onClick={onStart}>{availableQuestions.length ? `${mode === "exam" ? "Begin exam" : mode === "review" ? "Start review" : "Start practice"} · ${startCount}` : mode === "review" ? "Review bin is clear" : mode === "exam" ? "No questions in this exam" : "No unanswered questions"}<span>→</span></button>
            <span className="shortcut-hint"><kbd>A</kbd>–<kbd>D</kbd> · <kbd>S</kbd> skip · True/False also <kbd>T</kbd>/<kbd>F</kbd></span>
          </div>
        </div>
      </section>

      <aside className="stats-panel">
        <div className="stats-heading"><span className="eyebrow">Study progress</span><span className="local-pill">Autosaved</span></div>
        <div className="stat-grid">
          <div><strong>{totals.newCount}</strong><span>new</span></div>
          <div><strong>{totals.done}</strong><span>done</span></div>
          <div><strong>{totals.review}</strong><span>in review</span></div>
          <div><strong>{totals.attempts ? `${totals.accuracy}%` : "—"}</strong><span>accuracy</span></div>
        </div>
        <div className="source-note"><span>Question bank</span><strong>{sourceQuestions.length} supplied questions · {EXAMS.length} exam{EXAMS.length === 1 ? "" : "s"}</strong><p>Imported from the supplied exam material. No additional questions have been generated.</p></div>
        <div className="local-actions">
          <button className="text-button" onClick={onResetProgress}>Reset Done & Review progress</button>
          {editedCount > 0 && <button className="text-button" onClick={onResetEdits}>Restore {editedCount} edit{editedCount === 1 ? "" : "s"}</button>}
        </div>
      </aside>
    </div>
  );
}

function SessionScreen({
  mode,
  question,
  index,
  total,
  selectedId,
  feedbackVisible,
  status,
  onChoose,
  onNext,
  onSkip,
  onEdit,
  onEnd,
  onQueueReview,
}: {
  mode: SessionMode;
  question: Question;
  index: number;
  total: number;
  selectedId: QuestionOption["id"] | null;
  feedbackVisible: boolean;
  status: "new" | "done" | "review";
  onChoose: (id: QuestionOption["id"]) => void;
  onNext: () => void;
  onSkip: () => void;
  onEdit: () => void;
  onEnd: () => void;
  onQueueReview: () => void;
}) {
  const isCorrect = selectedId === question.correctOptionId;
  const trueFalse = question.options.length === 2 && question.options[0]?.text === "True" && question.options[1]?.text === "False";
  return (
    <div className="session-page">
      <div className="session-toolbar">
        <div><span className="mode-label">{mode === "exam" ? question.examLabel : `${mode} session`}</span><strong>Question {index + 1}<span> of {total}</span></strong></div>
        <div className="session-actions"><button className="text-button" onClick={onEdit}>Edit question</button><button className="text-button" onClick={onEnd}>End session</button></div>
      </div>
      <div className="progress-track"><span style={{ width: `${((index + (feedbackVisible ? 1 : 0)) / total) * 100}%` }} /></div>

      <article className="question-card">
        <div className="question-meta"><span>{question.examId}</span><span>{question.topic}</span><span>{question.difficulty}</span><span>{question.source}</span></div>
        <div className="exam-heading"><span>Question {question.number}</span><h1>{question.title}</h1></div>
        {question.setup && <div className="question-setup"><LatexText text={question.setup} /></div>}
        {question.figure && <figure><img src={resolveAssetUrl(question.figure)} alt={question.figureAlt ?? "Question figure"} />{question.figureCaption && <figcaption><LatexText text={question.figureCaption} /></figcaption>}</figure>}
        <div className="prompt"><LatexText text={question.prompt} /></div>

        <div className={`answer-grid options-${question.options.length}`}>
          {question.options.map((option) => {
            const selected = selectedId === option.id;
            const correct = feedbackVisible && question.correctOptionId === option.id;
            const incorrect = feedbackVisible && selected && !correct;
            const shortcut = trueFalse ? (option.text === "True" ? "T" : "F") : option.id;
            return <button key={option.id} className={`answer-button ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`} disabled={feedbackVisible} onClick={() => onChoose(option.id)}><kbd>{shortcut}</kbd><span className="option-letter">{option.id}</span><span><LatexText text={option.text} /></span></button>;
          })}
        </div>

        {mode === "exam" && (
          <div className="exam-commit">
            <span>{selectedId ? `Option ${selectedId} selected. Lock it in, or skip this question.` : "Choose an answer, or skip this question."}</span>
            <div className="session-actions">
              <button className="secondary-button compact" onClick={onSkip}>Skip question</button>
              <button className="primary-button compact" disabled={!selectedId} onClick={onNext}>{index + 1 === total ? "Finish exam" : "Lock answer & continue"}<span>→</span></button>
            </div>
          </div>
        )}

        {mode !== "exam" && !feedbackVisible && (
          <div className="next-row"><div><span>Skip leaves this question and its progress exactly as it is.</span></div><button className="secondary-button compact" onClick={onSkip}>Skip question <span>→</span></button></div>
        )}

        {feedbackVisible && <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`} role="status"><div className="feedback-icon">{isCorrect ? "✓" : "×"}</div><div><strong>{isCorrect ? "Correct" : `Incorrect · Correct answer: ${question.correctOptionId}`}</strong><p><LatexText text={question.explanation} /></p><small>{question.source}</small></div></div>}

        {feedbackVisible && <div className="next-row"><div>{!isCorrect || status === "review" ? <span>Saved in Review</span> : mode === "review" ? <span>Cleared from Review</span> : <button className="secondary-button compact" onClick={onQueueReview}>Save to Review for later</button>}</div><button className="primary-button compact" onClick={onNext}>{index + 1 === total ? "See session review" : "Next question"}<span>→</span></button></div>}
      </article>
    </div>
  );
}

function ResultsScreen({
  mode,
  answers,
  questions,
  progress,
  onQueueReview,
  onDone,
  onReturn,
  onOpenReview,
}: {
  mode: SessionMode;
  answers: SessionAnswer[];
  questions: Question[];
  progress: ProgressStore;
  onQueueReview: (id: string) => void;
  onDone: (id: string) => void;
  onReturn: () => void;
  onOpenReview: () => void;
}) {
  const score = answers.filter((answer) => answer.correct).length;
  const skipped = answers.filter((answer) => answer.selectedId === null).length;
  const incorrectAnswered = answers.filter((answer) => answer.selectedId !== null && !answer.correct).length;
  const percentage = answers.length ? Math.round((score / answers.length) * 100) : 0;
  const resultCopy = mode === "exam"
    ? `${answers.length - score} question${answers.length - score === 1 ? " was" : "s were"} incorrect or skipped. Exam mode did not change your Done/Review progress.`
    : skipped
      ? `${skipped} skipped question${skipped === 1 ? " was" : "s were"} left unchanged.${incorrectAnswered ? ` ${incorrectAnswered} incorrect answer${incorrectAnswered === 1 ? " was" : "s were"} saved in Review.` : ""}`
      : incorrectAnswered
        ? `${incorrectAnswered} question${incorrectAnswered === 1 ? " was" : "s were"} saved in Review.`
        : "Every answered question was correct.";

  return (
    <div className="results-page">
      <section className="result-hero">
        <span className="eyebrow">{mode === "exam" ? "Exam complete" : "Session complete"}</span>
        <div className="score-ring" style={{ "--score": `${percentage * 3.6}deg` } as React.CSSProperties}><div><strong>{percentage}%</strong><span>{score} / {answers.length} correct</span></div></div>
        <h1>{percentage === 100 ? "Complete precision." : percentage >= 70 ? "A strong pass." : "Useful diagnosis."}</h1>
        <p>{resultCopy}</p>
        <div className="result-actions"><button className="primary-button" onClick={onReturn}>Back to setup <span>→</span></button>{mode !== "exam" && incorrectAnswered > 0 && <button className="secondary-button" onClick={onOpenReview}>Open Review</button>}</div>
      </section>

      <section className="answer-review">
        <div className="answer-review-heading"><div><span className="eyebrow">Complete answer review</span><h2>Every question and solution</h2></div><span>{answers.length} questions · {skipped} skipped</span></div>
        <div className="answer-list">
          {answers.map((answer, index) => {
            const question = questions.find((item) => item.id === answer.questionId);
            if (!question) return null;
            const selected = answer.selectedId ? question.options.find((option) => option.id === answer.selectedId) : undefined;
            const correct = question.options.find((option) => option.id === question.correctOptionId);
            const isReview = progress[question.id]?.status === "review";
            const wasSkipped = answer.selectedId === null;
            return <details key={question.id} className={`answer-item ${answer.correct ? "correct" : "incorrect"}`} open={mode === "exam" || !answer.correct}>
              <summary><span className="result-index">{String(index + 1).padStart(2, "0")}</span><span className="result-mark">{wasSkipped ? "—" : answer.correct ? "✓" : "×"}</span><span className="result-question"><small>{question.examId} · Question {question.number} · {question.topic}</small><LatexText text={question.prompt} /></span><span className="result-answer">{wasSkipped ? `Skipped / ${question.correctOptionId}` : `${answer.selectedId} / ${question.correctOptionId}`}</span></summary>
              <div className="answer-detail">
                {question.setup && <div className="answer-setup"><LatexText text={question.setup} /></div>}
                {wasSkipped ? <p><strong>Your answer:</strong> Skipped.</p> : <p><strong>Your answer:</strong> {answer.selectedId}. <LatexText text={selected?.text ?? ""} /></p>}
                <p><strong>Correct answer:</strong> {question.correctOptionId}. <LatexText text={correct?.text ?? ""} /></p>
                <div className="solution-copy"><LatexText text={question.explanation} /></div>
                <div className="review-toggle">{isReview ? <><span>In Review</span><button className="text-button" onClick={() => onDone(question.id)}>Move to Done</button></> : <button className="secondary-button compact" onClick={() => onQueueReview(question.id)}>Save to Review</button>}</div>
              </div>
            </details>;
          })}
        </div>
      </section>
    </div>
  );
}
