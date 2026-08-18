"use client";

import { useEffect, useMemo, useState } from "react";
import { EXAMS, questions as sourceQuestions } from "../data/questions";
import {
  answerProgress,
  markLatestAttemptCorrect,
  applyEdits,
  EDITS_KEY,
  loadEdits,
  loadProgress,
  PROGRESS_KEY,
  saveEdits,
  saveProgress,
  setQuestionStatus,
} from "../lib/progress";
import {
  applyQuestionEditWithCommonSetup,
  applySharedFigureImage,
  inferCommonSetupQuestionIds,
  removeQuestionEditFromCommonSetup,
} from "../lib/question-edits";
import {
  DISPLAY_OPTION_IDS,
  correctOptionIds,
  displayedAnswerLabel,
  displayedOptionLabel,
  isCorrectSelection,
  optionIdForDisplayedKey,
  remapSolutionOptionReferences,
  shouldIgnoreAnswerShortcut,
  shuffledOptionIds,
  type OptionId,
} from "../lib/answers";
import {
  questionsAvailableForMode,
  questionsForExam,
  shuffleQuestionsBySetupGroup,
  uniqueQuestionsById,
} from "../lib/question-selection";
import { resolveAssetUrl } from "../lib/assets";
import { loadImageFile } from "../lib/images";
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
import "./exam-ui.css";

type Screen = "setup" | "session" | "results";
type SessionSize = "5" | "10" | "all";
type SessionAnswer = {
  questionId: string;
  selectedIds: OptionId[];
  optionOrder: OptionId[];
  correct: boolean;
};
type ExamSettings = {
  feedbackAfterEach: boolean;
  showFinalReview: boolean;
  showProgressBar: boolean;
};

const EXAM_SETTINGS_KEY = "iml-exam-settings-v1";
const DEFAULT_EXAM_SETTINGS: ExamSettings = {
  feedbackAfterEach: false,
  showFinalReview: true,
  showProgressBar: true,
};
const MODE_TITLE: Record<SessionMode, string> = {
  practice: "Practice",
  review: "Review",
  exam: "Exam",
};

function loadExamSettings(): ExamSettings {
  if (typeof window === "undefined") return DEFAULT_EXAM_SETTINGS;
  try {
    return { ...DEFAULT_EXAM_SETTINGS, ...JSON.parse(window.localStorage.getItem(EXAM_SETTINGS_KEY) || "{}") };
  } catch {
    return DEFAULT_EXAM_SETTINGS;
  }
}

export function ExamPrepApp() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("setup");
  const [mode, setMode] = useState<SessionMode>("practice");
  const [examId, setExamId] = useState("all");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [query, setQuery] = useState("");
  const [sessionSize, setSessionSize] = useState<SessionSize>("5");
  const [examSettings, setExamSettings] = useState<ExamSettings>(DEFAULT_EXAM_SETTINGS);
  const [progress, setProgress] = useState<ProgressStore>({});
  const [edits, setEdits] = useState<EditStore>({});
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<OptionId[]>([]);
  const [displayedOptionIds, setDisplayedOptionIds] = useState<OptionId[]>([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [editing, setEditing] = useState(false);
  const [manuallyCorrectedIds, setManuallyCorrectedIds] = useState<string[]>([]);

  useEffect(() => {
    const knownIds = new Set(sourceQuestions.map((question) => question.id));
    setProgress(Object.fromEntries(Object.entries(loadProgress()).filter(([id]) => knownIds.has(id))));
    setEdits(Object.fromEntries(Object.entries(loadEdits()).filter(([id]) => knownIds.has(id))));
    setExamSettings(loadExamSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(EXAM_SETTINGS_KEY, JSON.stringify(examSettings));
  }, [examSettings, ready]);

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
        && (!topics.length || topics.includes(question.topic))
        && (difficulty === "all" || question.difficulty === difficulty)
        && matchesQuery;
    });
  }, [questions, examId, topics, difficulty, query]);

  const availableQuestions = useMemo(() => {
    if (mode === "exam") return examId === "all" ? [] : questionsForExam(questions, examId);
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
      : shuffleQuestionsBySetupGroup(availableQuestions).slice(0, count);
    if (!selected.length) return;
    setSessionIds(selected.map((question) => question.id));
    setQuestionIndex(0);
    setSelectedIds([]);
    setDisplayedOptionIds(shuffledOptionIds(selected[0]));
    setFeedbackVisible(false);
    setSessionAnswers([]);
    setManuallyCorrectedIds([]);
    setEditing(false);
    setScreen("session");
  }

  function submitPracticeAnswer(answerIds = selectedIds) {
    if (!currentQuestion || feedbackVisible || !answerIds.length) return;
    const correct = isCorrectSelection(currentQuestion, answerIds);
    setSessionAnswers((answers) => [...answers, {
      questionId: currentQuestion.id,
      selectedIds: [...answerIds],
      optionOrder: [...displayedOptionIds],
      correct,
    }]);
    persistProgress((current) => ({
      ...current,
      [currentQuestion.id]: answerProgress(current[currentQuestion.id], answerIds, correct),
    }));
    setFeedbackVisible(true);
  }

  function chooseAnswer(answerId: QuestionOption["id"]) {
    if (!currentQuestion || feedbackVisible) return;
    if (currentQuestion.multipleSelect) {
      setSelectedIds((current) => current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId]);
      return;
    }

    const answerIds = [answerId];
    setSelectedIds(answerIds);
    if (mode !== "exam") submitPracticeAnswer(answerIds);
  }

  function commitExamAnswer() {
    if (!currentQuestion || feedbackVisible || !selectedIds.length) return;
    const correct = isCorrectSelection(currentQuestion, selectedIds);
    setSessionAnswers((answers) => [...answers, {
      questionId: currentQuestion.id,
      selectedIds: [...selectedIds],
      optionOrder: [...displayedOptionIds],
      correct,
    }]);
    if (examSettings.feedbackAfterEach) {
      setFeedbackVisible(true);
      return;
    }
    advance(true);
  }

  function skipQuestion() {
    if (!currentQuestion || feedbackVisible) return;
    setSessionAnswers((answers) => [...answers, {
      questionId: currentQuestion.id,
      selectedIds: [],
      optionOrder: [...displayedOptionIds],
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
    const nextIndex = questionIndex + 1;
    const nextQuestion = questions.find((question) => question.id === sessionIds[nextIndex]);
    setQuestionIndex(nextIndex);
    setSelectedIds([]);
    setDisplayedOptionIds(nextQuestion ? shuffledOptionIds(nextQuestion) : []);
    setFeedbackVisible(false);
    setEditing(false);
  }

  function queueForReview(questionId: string) {
    persistProgress((current) => ({ ...current, [questionId]: setQuestionStatus(current[questionId], "review") }));
  }

  function markDone(questionId: string) {
    persistProgress((current) => ({ ...current, [questionId]: setQuestionStatus(current[questionId], "done") }));
  }

  function markCurrentAnswerCorrect() {
    if (!currentQuestion || !feedbackVisible || mode === "exam") return;

    setSessionAnswers((answers) => {
      const next = [...answers];
      for (let index = next.length - 1; index >= 0; index -= 1) {
        if (next[index].questionId === currentQuestion.id && !next[index].correct) {
          next[index] = { ...next[index], correct: true };
          break;
        }
      }
      return next;
    });
    setManuallyCorrectedIds((ids) => ids.includes(currentQuestion.id) ? ids : [...ids, currentQuestion.id]);
    persistProgress((current) => {
      const corrected = markLatestAttemptCorrect(current[currentQuestion.id]);
      return corrected ? { ...current, [currentQuestion.id]: corrected } : current;
    });
  }

  function saveQuestionEdit(questionId: string, edit: QuestionEdit, commonSetupQuestionIds: string[]) {
    setEdits((current) => {
      const next = applyQuestionEditWithCommonSetup(current, questionId, edit, commonSetupQuestionIds);
      saveEdits(next);
      return next;
    });
    setEditing(false);
  }

  function saveFigureImage(question: Question, figure: string) {
    setEdits((current) => {
      const next = applySharedFigureImage(current, question, questions, figure);
      saveEdits(next);
      return next;
    });
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
      if (shouldIgnoreAnswerShortcut(event)) return;

      const key = event.key.toUpperCase();
      const trueOptionId = currentQuestion.options.find((option) => option.text.toLowerCase() === "true")?.id;
      const falseOptionId = currentQuestion.options.find((option) => option.text.toLowerCase() === "false")?.id;
      const displayedKeyOptionId = /^[A-F]$/.test(key)
        ? optionIdForDisplayedKey(key, displayedOptionIds)
        : undefined;

      if (!feedbackVisible && displayedKeyOptionId) {
        chooseAnswer(displayedKeyOptionId);
      } else if (!feedbackVisible && key === "T" && trueOptionId) {
        chooseAnswer(trueOptionId);
      } else if (!feedbackVisible && key === "F" && falseOptionId) {
        chooseAnswer(falseOptionId);
      } else if (!feedbackVisible && key === "S") {
        skipQuestion();
      } else if (event.key === "Enter") {
        if (mode === "exam") {
          if (feedbackVisible) advance(true);
          else commitExamAnswer();
        } else if (feedbackVisible) {
          advance(true);
        } else if (currentQuestion.multipleSelect) {
          submitPracticeAnswer();
        }
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
          topics={topics}
          difficulty={difficulty}
          query={query}
          sessionSize={sessionSize}
          examSettings={examSettings}
          setExamId={setExamId}
          setTopics={setTopics}
          setDifficulty={setDifficulty}
          setQuery={setQuery}
          setSessionSize={setSessionSize}
          setExamSettings={setExamSettings}
          availableQuestions={availableQuestions}
          reviewQuestions={mode === "review" ? availableQuestions : reviewQuestions}
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
          selectedIds={selectedIds}
          displayedOptionIds={displayedOptionIds}
          feedbackVisible={feedbackVisible}
          showProgressBar={mode !== "exam" || examSettings.showProgressBar}
          status={progress[currentQuestion.id]?.status ?? "new"}
          manuallyCorrected={manuallyCorrectedIds.includes(currentQuestion.id)}
          onChoose={chooseAnswer}
          onSubmit={mode === "exam" ? commitExamAnswer : submitPracticeAnswer}
          onNext={() => advance(true)}
          onSkip={skipQuestion}
          onEdit={() => setEditing(true)}
          onEnd={endSession}
          onQueueReview={() => queueForReview(currentQuestion.id)}
          onMarkCorrect={markCurrentAnswerCorrect}
          onFigureUpload={(figure) => saveFigureImage(currentQuestion, figure)}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          mode={mode}
          answers={sessionAnswers}
          questions={questions}
          progress={progress}
          showAnswerReview={mode !== "exam" || examSettings.showFinalReview}
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
  topics,
  difficulty,
  query,
  sessionSize,
  examSettings,
  setExamId,
  setTopics,
  setDifficulty,
  setQuery,
  setSessionSize,
  setExamSettings,
  availableQuestions,
  reviewQuestions,
  totals,
  editedCount,
  onStart,
  onMarkDone,
  onResetProgress,
  onResetEdits,
}: {
  mode: SessionMode;
  examId: string;
  topics: Topic[];
  difficulty: Difficulty | "all";
  query: string;
  sessionSize: SessionSize;
  examSettings: ExamSettings;
  setExamId: (value: string) => void;
  setTopics: (value: Topic[]) => void;
  setDifficulty: (value: Difficulty | "all") => void;
  setQuery: (value: string) => void;
  setSessionSize: (value: SessionSize) => void;
  setExamSettings: (value: ExamSettings) => void;
  availableQuestions: Question[];
  reviewQuestions: Question[];
  totals: { newCount: number; done: number; review: number; attempts: number; accuracy: number };
  editedCount: number;
  onStart: () => void;
  onMarkDone: (id: string) => void;
  onResetProgress: () => void;
  onResetEdits: () => void;
}) {
  const startCount = mode === "exam"
    ? availableQuestions.length
    : sessionSize === "all"
      ? availableQuestions.length
      : Math.min(Number(sessionSize), availableQuestions.length);
  const selectedExam = EXAMS.find((exam) => exam.id === examId);
  const updateExamSetting = <K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) => {
    setExamSettings({ ...examSettings, [key]: value });
  };
  const toggleTopic = (topic: Topic) => {
    setTopics(topics.includes(topic) ? topics.filter((item) => item !== topic) : [...topics, topic]);
  };

  return (
    <div className="setup-layout compact-setup-layout">
      <section className="setup-main">
        <div className="compact-hero">
          <h1>{MODE_TITLE[mode]}</h1>
          <span>{availableQuestions.length} available</span>
        </div>

        <div className="setup-card compact-setup-card">
          {mode === "exam" ? (
            <div className="filter-grid compact-filters exam-filter-row">
              <label><span>Exam</span><select value={examId} onChange={(event) => setExamId(event.target.value)}>{EXAMS.map((exam) => <option value={exam.id} key={exam.id}>{exam.label}</option>)}</select></label>
            </div>
          ) : (
            <>
              <div className="filter-grid compact-filters">
                <label><span>Exam</span><select value={examId} onChange={(event) => setExamId(event.target.value)}><option value="all">All exams</option>{EXAMS.map((exam) => <option value={exam.id} key={exam.id}>{exam.label}</option>)}</select></label>
                <label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | "all")}><option value="all">All levels</option>{DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Search</span><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Number, title, text" /></label>
              </div>
              <div className="topic-filter">
                <span className="field-title">Topics</span>
                <div className="topic-chips" role="group" aria-label="Filter by topics">
                  <button className={!topics.length ? "active" : ""} onClick={() => setTopics([])} aria-pressed={!topics.length}>All</button>
                  {TOPICS.map((item) => (
                    <button key={item} className={topics.includes(item) ? "active" : ""} onClick={() => toggleTopic(item)} aria-pressed={topics.includes(item)}>{item}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === "exam" ? (
            <>
              <div className="length-row compact-length-row">
                <div><span className="field-title">Complete exam</span><small>{availableQuestions.length} questions · ordered by question number</small></div>
                <span className="local-pill">{selectedExam?.id ?? "Exam"}</span>
              </div>
              <div className="exam-settings compact-exam-settings">
                <div className="exam-settings-heading"><strong>Options</strong></div>
                <div className="exam-settings-grid">
                  <label className="exam-setting"><input type="checkbox" checked={examSettings.feedbackAfterEach} onChange={(event) => updateExamSetting("feedbackAfterEach", event.target.checked)} /><span><strong>Feedback after each</strong></span></label>
                  <label className="exam-setting"><input type="checkbox" checked={examSettings.showFinalReview} onChange={(event) => updateExamSetting("showFinalReview", event.target.checked)} /><span><strong>Final review</strong></span></label>
                  <label className="exam-setting"><input type="checkbox" checked={examSettings.showProgressBar} onChange={(event) => updateExamSetting("showProgressBar", event.target.checked)} /><span><strong>Progress bar</strong></span></label>
                </div>
              </div>
            </>
          ) : (
            <div className="length-row compact-length-row">
              <div><span className="field-title">Session</span><small>{availableQuestions.length} matching</small></div>
              <div className="segmented" role="group" aria-label="Session length">
                {(["5", "10", "all"] as SessionSize[]).map((size) => <button key={size} className={sessionSize === size ? "active" : ""} onClick={() => setSessionSize(size)}>{size === "all" ? "All" : size}</button>)}
              </div>
            </div>
          )}

          {mode === "review" && (
            <div className="review-bin compact-review-bin">
              <div className="review-heading"><strong>Review bin</strong><span>{reviewQuestions.length} matching</span></div>
              {reviewQuestions.length ? reviewQuestions.map((question) => (
                <div className="review-row" key={question.id}>
                  <span className="status-dot" />
                  <div><small>{question.examId} · Q{question.number}</small><p><LatexText text={question.prompt} /></p></div>
                  <button className="text-button" onClick={() => onMarkDone(question.id)}>Done</button>
                </div>
              )) : <div className="empty-state compact-empty"><strong>Review is clear.</strong></div>}
            </div>
          )}

          <div className="start-row compact-start-row">
            <button className="primary-button" disabled={!availableQuestions.length} onClick={onStart}>{availableQuestions.length ? `${mode === "exam" ? "Begin exam" : mode === "review" ? "Start review" : "Start practice"} · ${startCount}` : mode === "review" ? "Review is clear" : "No matching questions"}<span>→</span></button>
          </div>
        </div>
      </section>

      <aside className="stats-panel compact-stats-panel">
        <div className="stats-heading"><span className="eyebrow">Progress</span><span className="local-pill">Autosaved</span></div>
        <div className="stat-grid compact-stat-grid">
          <div><strong>{totals.newCount}</strong><span>new</span></div>
          <div><strong>{totals.done}</strong><span>done</span></div>
          <div><strong>{totals.review}</strong><span>review</span></div>
          <div><strong>{totals.attempts ? `${totals.accuracy}%` : "—"}</strong><span>accuracy</span></div>
        </div>
        <div className="bank-summary">{sourceQuestions.length} questions · {EXAMS.length} exam{EXAMS.length === 1 ? "" : "s"}</div>
        <div className="local-actions compact-local-actions">
          <button className="text-button" onClick={onResetProgress}>Reset progress</button>
          {editedCount > 0 && <button className="text-button" onClick={onResetEdits}>Restore {editedCount} edit{editedCount === 1 ? "" : "s"}</button>}
        </div>
      </aside>
    </div>
  );
}

function FigureBlock({ question, onUpload }: { question: Question; onUpload: (figure: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  async function useFile(file?: File) {
    if (!file || loading) return;
    setError("");
    setLoading(true);
    try {
      const figure = await loadImageFile(file);
      onUpload(figure);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use that image.");
    } finally {
      setLoading(false);
    }
  }

  if (question.figure) {
    return <figure><img src={resolveAssetUrl(question.figure)} alt={question.figureAlt ?? `Figure ${question.figureNumber ?? ""}`} />{question.figureCaption && <figcaption><LatexText text={question.figureCaption} /></figcaption>}</figure>;
  }
  if (!question.figureNumber) return null;
  return (
    <figure className="figure-placeholder-shell">
      <label
        className={`figure-dropzone ${dragActive ? "drag-active" : ""} ${loading ? "loading" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          void useFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input type="file" accept="image/*" disabled={loading} onChange={(event) => void useFile(event.target.files?.[0])} />
        <span className="figure-dropzone-number">Figure {question.figureNumber}</span>
        <strong>{loading ? "Preparing image…" : "Drop an image here"}</strong>
        <small>{loading ? "Resizing and compressing for the question bank" : "or click to choose an image"}</small>
      </label>
      {error && <p className="figure-dropzone-error" role="alert">{error}</p>}
      {question.figureCaption && <figcaption><LatexText text={question.figureCaption} /></figcaption>}
    </figure>
  );
}

function SessionScreen({
  mode,
  question,
  index,
  total,
  selectedIds,
  displayedOptionIds,
  feedbackVisible,
  showProgressBar,
  status,
  manuallyCorrected,
  onChoose,
  onSubmit,
  onNext,
  onSkip,
  onEdit,
  onEnd,
  onQueueReview,
  onMarkCorrect,
  onFigureUpload,
}: {
  mode: SessionMode;
  question: Question;
  index: number;
  total: number;
  selectedIds: OptionId[];
  displayedOptionIds: OptionId[];
  feedbackVisible: boolean;
  showProgressBar: boolean;
  status: "new" | "done" | "review";
  manuallyCorrected: boolean;
  onChoose: (id: QuestionOption["id"]) => void;
  onSubmit: () => void;
  onNext: () => void;
  onSkip: () => void;
  onEdit: () => void;
  onEnd: () => void;
  onQueueReview: () => void;
  onMarkCorrect: () => void;
  onFigureUpload: (figure: string) => void;
}) {
  const expectedIds = correctOptionIds(question);
  const isCorrect = feedbackVisible && (manuallyCorrected || isCorrectSelection(question, selectedIds));
  const optionOrder = displayedOptionIds.length === question.options.length
    ? displayedOptionIds
    : question.options.map((option) => option.id);
  const orderedOptions = optionOrder
    .map((id) => question.options.find((option) => option.id === id))
    .filter((option): option is QuestionOption => Boolean(option));
  const selectedLabel = displayedAnswerLabel(selectedIds, optionOrder);
  const expectedLabel = displayedAnswerLabel(expectedIds, optionOrder);
  const longOptions = orderedOptions.some((option) => option.text.replace(/\$+/g, "").length > 48);

  return (
    <div className="session-page">
      <div className="session-toolbar">
        <div><span className="mode-label">{mode === "exam" ? question.examLabel : `${mode} session`}</span><strong>Question {index + 1}<span> of {total}</span></strong></div>
        <div className="session-actions"><button className="text-button" onClick={onEdit}>Edit question</button><button className="text-button" onClick={onEnd}>End session</button></div>
      </div>
      {showProgressBar && <div className="progress-track"><span style={{ width: `${((index + (feedbackVisible ? 1 : 0)) / total) * 100}%` }} /></div>}

      <article className="question-card">
        <div className="question-meta"><span>{question.examId}</span><span>{question.topic}</span><span>{question.difficulty}</span><span>{question.source}</span>{question.multipleSelect && <span>Mark all that apply</span>}</div>
        <div className="exam-heading"><span>Question {question.number}</span><h1>{question.title}</h1></div>
        {question.setup && <div className="question-setup"><LatexText text={question.setup} /></div>}
        <FigureBlock question={question} onUpload={onFigureUpload} />
        <div className="prompt"><LatexText text={question.prompt} /></div>

        <div className={`answer-grid options-${question.options.length} ${longOptions ? "long-options" : ""}`}>
          {orderedOptions.map((option, optionIndex) => {
            const selected = selectedIds.includes(option.id);
            const correct = feedbackVisible && expectedIds.includes(option.id);
            const incorrect = feedbackVisible && selected && !correct;
            const displayId = DISPLAY_OPTION_IDS[optionIndex] ?? option.id;
            return (
              <button
                key={option.id}
                className={`answer-button ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`}
                disabled={feedbackVisible}
                onClick={() => onChoose(option.id)}
              >
                <kbd>{displayId}</kbd>
                <span><LatexText text={option.text} /></span>
              </button>
            );
          })}
        </div>

        {mode === "exam" && !feedbackVisible && (
          <div className="exam-commit">
            <span>{selectedIds.length ? `${selectedLabel} selected.${question.multipleSelect ? " Select all that apply, then lock the answer." : ""}` : question.multipleSelect ? "Select all answers that apply, or skip." : "Choose an answer, or skip this question."}</span>
            <div className="session-actions">
              <button className="secondary-button compact" onClick={onSkip}>Skip question</button>
              <button className="primary-button compact" disabled={!selectedIds.length} onClick={onSubmit}>{index + 1 === total ? "Finish exam" : "Lock answer & continue"}<span>→</span></button>
            </div>
          </div>
        )}

        {mode !== "exam" && !feedbackVisible && question.multipleSelect && (
          <div className="exam-commit">
            <span>Select all answers that apply. Your selection is checked only when you submit it.</span>
            <div className="session-actions">
              <button className="secondary-button compact" onClick={onSkip}>Skip question</button>
              <button className="primary-button compact" disabled={!selectedIds.length} onClick={onSubmit}>Check answer <span>→</span></button>
            </div>
          </div>
        )}

        {mode !== "exam" && !feedbackVisible && !question.multipleSelect && (
          <div className="next-row"><div><span>Skip leaves this question and its progress exactly as it is.</span></div><button className="secondary-button compact" onClick={onSkip}>Skip question <span>→</span></button></div>
        )}

        {feedbackVisible && (
          <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`} role="status">
            <div className="feedback-icon">{isCorrect ? "✓" : "×"}</div>
            <div><strong>{manuallyCorrected ? "Marked correct manually" : isCorrect ? "Correct" : `Incorrect · Correct answer${expectedIds.length > 1 ? "s" : ""}: ${expectedLabel}`}</strong><p><LatexText text={remapSolutionOptionReferences(question.explanation, optionOrder)} /></p><small>{question.source}</small></div>
          </div>
        )}

        {feedbackVisible && mode === "exam" && (
          <div className="next-row"><div><span className="exam-feedback-note">Exam progress remains unchanged.</span></div><button className="primary-button compact" onClick={onNext}>{index + 1 === total ? "See exam result" : "Next question"}<span>→</span></button></div>
        )}

        {feedbackVisible && mode !== "exam" && (
          <div className="next-row">
            <div className="session-actions">
              {!isCorrect && <button className="secondary-button compact" onClick={onMarkCorrect}>Mark as correct</button>}
              {status === "review" ? <span>Saved in Review</span> : <button className="secondary-button compact" onClick={onQueueReview}>Save to Review for later</button>}
            </div>
            <button className="primary-button compact" onClick={onNext}>{index + 1 === total ? "See session review" : "Next question"}<span>→</span></button>
          </div>
        )}
      </article>
    </div>
  );
}

function ResultsScreen({
  mode,
  answers,
  questions,
  progress,
  showAnswerReview,
  onQueueReview,
  onDone,
  onReturn,
  onOpenReview,
}: {
  mode: SessionMode;
  answers: SessionAnswer[];
  questions: Question[];
  progress: ProgressStore;
  showAnswerReview: boolean;
  onQueueReview: (id: string) => void;
  onDone: (id: string) => void;
  onReturn: () => void;
  onOpenReview: () => void;
}) {
  const score = answers.filter((answer) => answer.correct).length;
  const skipped = answers.filter((answer) => answer.selectedIds.length === 0).length;
  const incorrectAnswered = answers.filter((answer) => answer.selectedIds.length > 0 && !answer.correct).length;
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

      {showAnswerReview && (
        <section className="answer-review">
          <div className="answer-review-heading"><div><span className="eyebrow">Complete answer review</span><h2>Every question and solution</h2></div><span>{answers.length} questions · {skipped} skipped</span></div>
          <div className="answer-list">
            {answers.map((answer, index) => {
              const question = questions.find((item) => item.id === answer.questionId);
              if (!question) return null;
              const expectedIds = correctOptionIds(question);
              const optionRank = new Map(answer.optionOrder.map((id, rank) => [id, rank]));
              const selectedOptions = question.options
                .filter((option) => answer.selectedIds.includes(option.id))
                .sort((left, right) => (optionRank.get(left.id) ?? 99) - (optionRank.get(right.id) ?? 99));
              const correctOptions = question.options
                .filter((option) => expectedIds.includes(option.id))
                .sort((left, right) => (optionRank.get(left.id) ?? 99) - (optionRank.get(right.id) ?? 99));
              const isReview = progress[question.id]?.status === "review";
              const wasSkipped = answer.selectedIds.length === 0;
              return <details key={question.id} className={`answer-item ${answer.correct ? "correct" : "incorrect"}`} open={mode === "exam" || !answer.correct}>
                <summary><span className="result-index">{String(index + 1).padStart(2, "0")}</span><span className="result-mark">{wasSkipped ? "—" : answer.correct ? "✓" : "×"}</span><span className="result-question"><small>{question.examId} · Question {question.number} · {question.topic}</small><LatexText text={question.prompt} /></span><span className="result-answer">{displayedAnswerLabel(answer.selectedIds, answer.optionOrder)} / {displayedAnswerLabel(expectedIds, answer.optionOrder)}</span></summary>
                <div className="answer-detail">
                  {question.setup && <div className="answer-setup"><LatexText text={question.setup} /></div>}
                  {wasSkipped ? <p><strong>Your answer:</strong> Skipped.</p> : <p><strong>Your answer:</strong> {selectedOptions.map((option) => `${displayedOptionLabel(option.id, answer.optionOrder)}. ${option.text}`).join(" · ")}</p>}
                  <p><strong>Correct answer{expectedIds.length > 1 ? "s" : ""}:</strong> {correctOptions.map((option) => `${displayedOptionLabel(option.id, answer.optionOrder)}. ${option.text}`).join(" · ")}</p>
                  <div className="solution-copy"><LatexText text={remapSolutionOptionReferences(question.explanation, answer.optionOrder)} /></div>
                  <div className="review-toggle">{isReview ? <><span>In Review</span><button className="text-button" onClick={() => onDone(question.id)}>Move to Done</button></> : <button className="secondary-button compact" onClick={() => onQueueReview(question.id)}>Save to Review</button>}</div>
                </div>
              </details>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}