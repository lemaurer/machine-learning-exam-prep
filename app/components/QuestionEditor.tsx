"use client";

import { useEffect, useState } from "react";
import { DIFFICULTIES, TOPICS, type Question, type QuestionEdit } from "../../types/question";
import { LatexText } from "./LatexText";
import { resolveAssetUrl } from "../../lib/assets";
import { inferFigureNumber } from "../../lib/question-edits";
import { correctOptionIds } from "../../lib/answers";
import { loadImageFile } from "../../lib/images";

function parseQuestionNumbers(value: string): number[] | null {
  if (!value.trim()) return [];
  const numbers: number[] = [];

  for (const rawPart of value.split(",")) {
    const part = rawPart.trim();
    if (!part) continue;
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      const low = Math.min(start, end);
      const high = Math.max(start, end);
      for (let number = low; number <= high; number += 1) numbers.push(number);
      continue;
    }
    if (!/^\d+$/.test(part)) return null;
    numbers.push(Number(part));
  }

  return [...new Set(numbers)].sort((left, right) => left - right);
}

export function QuestionEditor({
  question,
  examQuestions,
  sharedSetupQuestionIds,
  hasLocalEdit,
  onSave,
  onReset,
  onClose,
}: {
  question: Question;
  examQuestions: Question[];
  sharedSetupQuestionIds: string[];
  hasLocalEdit: boolean;
  onSave: (edit: QuestionEdit, commonSetupQuestionIds: string[]) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Question>(question);
  const [commonSetupNumbers, setCommonSetupNumbers] = useState("");
  const [commonSetupError, setCommonSetupError] = useState("");
  const [figureNumberText, setFigureNumberText] = useState("");
  const [figureError, setFigureError] = useState("");
  const [figureLoading, setFigureLoading] = useState(false);

  useEffect(() => {
    setDraft(question);
    const numberById = new Map(examQuestions.map((candidate) => [candidate.id, candidate.number]));
    setCommonSetupNumbers(
      sharedSetupQuestionIds
        .map((id) => numberById.get(id))
        .filter((number): number is number => typeof number === "number")
        .sort((left, right) => left - right)
        .join(", "),
    );
    setCommonSetupError("");
    setFigureNumberText(String(inferFigureNumber(question) ?? ""));
    setFigureError("");
  }, [examQuestions, question, sharedSetupQuestionIds]);

  function save() {
    const numbers = parseQuestionNumbers(commonSetupNumbers);
    if (numbers === null) {
      setCommonSetupError("Use question numbers separated by commas, or a range such as 7-9.");
      return;
    }

    const questionByNumber = new Map(examQuestions.map((candidate) => [candidate.number, candidate]));
    const missing = numbers.filter((number) => !questionByNumber.has(number));
    if (missing.length) {
      setCommonSetupError(`Question${missing.length === 1 ? "" : "s"} ${missing.join(", ")} ${missing.length === 1 ? "does" : "do"} not exist in ${question.examId}.`);
      return;
    }

    const commonSetupQuestionIds = numbers.length
      ? [...new Set([question.id, ...numbers.map((number) => questionByNumber.get(number)!.id)])]
      : [];

    const trimmedFigureNumber = figureNumberText.trim();
    const figureNumber = trimmedFigureNumber ? Number(trimmedFigureNumber) : undefined;
    if (trimmedFigureNumber && (!Number.isInteger(figureNumber) || Number(figureNumber) <= 0)) {
      setFigureError("Figure number must be a positive whole number, such as 1 or 4.");
      return;
    }
    if (draft.figure && !figureNumber) {
      setFigureError("Every figure needs a figure number so it can be shared across all questions that use it.");
      return;
    }

    const sharedFigureQuestionIds = figureNumber
      ? [...new Set([
          question.id,
          ...examQuestions
            .filter((candidate) => inferFigureNumber(candidate) === figureNumber)
            .map((candidate) => candidate.id),
        ])]
      : [];
    const correctIds = correctOptionIds(draft);

    onSave({
      setup: draft.setup,
      prompt: draft.prompt,
      options: draft.options,
      correctOptionId: correctIds[0] ?? draft.correctOptionId,
      correctOptionIds: correctIds,
      multipleSelect: draft.multipleSelect,
      explanation: draft.explanation,
      topic: draft.topic,
      difficulty: draft.difficulty,
      figureNumber,
      figure: draft.figure,
      figureAlt: draft.figureAlt,
      figureCaption: draft.figureCaption,
      sharedFigureQuestionIds,
    }, commonSetupQuestionIds);
  }

  return (
    <aside className="editor-panel" aria-label="Question editor">
      <div className="editor-heading">
        <div>
          <span className="eyebrow">Question edit</span>
          <h2>Question {question.number}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close editor">×</button>
      </div>

      <label className="editor-field">
        <span>Common setup · LaTeX supported</span>
        <textarea value={draft.setup ?? ""} onChange={(event) => setDraft({ ...draft, setup: event.target.value || undefined })} rows={7} placeholder="Optional setup shared by related questions" />
      </label>

      <label className="editor-field">
        <span>Common setup applies to question numbers</span>
        <input value={commonSetupNumbers} onChange={(event) => { setCommonSetupNumbers(event.target.value); setCommonSetupError(""); }} placeholder="e.g. 7, 8, 9 or 7-9" />
        <small>Leave blank to keep the setup specific to this question. If you enter a group, Question {question.number} is included automatically. Editing the common setup later from any member updates the whole group.</small>
      </label>
      {commonSetupError && <p className="editor-error" role="alert">{commonSetupError}</p>}

      {draft.setup && <div className="live-preview"><span>Setup rendering</span><div><LatexText text={draft.setup} /></div></div>}

      <label className="editor-field">
        <span>Question · LaTeX supported</span>
        <textarea value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} rows={5} />
      </label>
      <div className="live-preview"><span>Live rendering</span><div><LatexText text={draft.prompt} /></div></div>

      <div className="editor-figure-section">
        <div className="editor-figure-heading">
          <strong>Figure</strong>
          <small>Figures are shared by exam and figure number. Editing Figure 4 here updates Figure 4 everywhere it is used in {question.examId}.</small>
        </div>
        <label className="editor-field">
          <span>Figure number</span>
          <input inputMode="numeric" value={figureNumberText} placeholder="e.g. 4" onChange={(event) => { setFigureNumberText(event.target.value); setFigureError(""); }} />
          <small>The number identifies the shared figure within this exam. Existing filenames such as <code>hs25_figure4.png</code> are recognized automatically.</small>
        </label>
        <label className="editor-field">
          <span>Figure path or URL</span>
          <input value={draft.figure ?? ""} placeholder="/figures/filename.png" onChange={(event) => { setDraft({ ...draft, figure: event.target.value || undefined }); setFigureError(""); }} />
        </label>
        <label className="editor-file-button">
          <span>{figureLoading ? "Preparing image…" : "Choose an image from this computer"}</span>
          <input type="file" accept="image/*" disabled={figureLoading} onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFigureError("");
            setFigureLoading(true);
            try {
              const figure = await loadImageFile(file);
              setDraft((current) => ({ ...current, figure }));
            } catch (error) {
              setFigureError(error instanceof Error ? error.message : "Could not use that image.");
            } finally {
              setFigureLoading(false);
            }
          }} />
        </label>
        {figureError && <p className="editor-error" role="alert">{figureError}</p>}
        <label className="editor-field">
          <span>Alternative text</span>
          <input value={draft.figureAlt ?? ""} placeholder="Describe the figure for accessibility" onChange={(event) => setDraft({ ...draft, figureAlt: event.target.value || undefined })} />
        </label>
        <label className="editor-field">
          <span>Figure caption · LaTeX supported</span>
          <input value={draft.figureCaption ?? ""} placeholder="Caption shown below the figure" onChange={(event) => setDraft({ ...draft, figureCaption: event.target.value || undefined })} />
        </label>
        {draft.figure ? (
          <figure className="editor-figure-preview">
            <img src={resolveAssetUrl(draft.figure)} alt={draft.figureAlt || "Figure preview"} />
            {draft.figureCaption && <figcaption><LatexText text={draft.figureCaption} /></figcaption>}
          </figure>
        ) : figureNumberText.trim() ? (
          <div className="live-preview"><span>Figure placeholder</span><div>Figure {figureNumberText.trim()} is linked but has no image yet.</div></div>
        ) : null}
        {draft.figure && <button className="text-button danger" onClick={() => setDraft({ ...draft, figure: undefined, figureAlt: undefined, figureCaption: undefined })}>Remove figure</button>}
      </div>

      <div className="editor-options">
        {draft.options.map((option, index) => (
          <label key={option.id} className="editor-field option-edit">
            <span>Option {option.id}</span>
            <input value={option.text} onChange={(event) => {
              const next = [...draft.options];
              next[index] = { ...option, text: event.target.value };
              setDraft({ ...draft, options: next });
            }} />
            <small><LatexText text={option.text} /></small>
          </label>
        ))}
      </div>

      <div className="editor-selects">
        <label className="editor-field">
          <span>Question type</span>
          <select value={draft.multipleSelect ? "multiple" : "single"} onChange={(event) => {
            const multipleSelect = event.target.value === "multiple";
            const currentCorrect = correctOptionIds(draft);
            setDraft({
              ...draft,
              multipleSelect,
              correctOptionId: currentCorrect[0] ?? draft.options[0]?.id ?? "A",
              correctOptionIds: multipleSelect ? currentCorrect : [currentCorrect[0] ?? draft.options[0]?.id ?? "A"],
            });
          }}>
            <option value="single">Single answer</option>
            <option value="multiple">Mark all that apply</option>
          </select>
        </label>
        <label className="editor-field">
          <span>Topic</span>
          <select value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value as Question["topic"] })}>{TOPICS.map((topic) => <option key={topic}>{topic}</option>)}</select>
        </label>
        <label className="editor-field">
          <span>Difficulty</span>
          <select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as Question["difficulty"] })}>{DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select>
        </label>
      </div>

      <div className="editor-field">
        <span>Correct answer{draft.multipleSelect ? "s" : ""}</span>
        <div className="segmented" role="group" aria-label="Correct answers">
          {draft.options.map((option) => {
            const currentCorrect = correctOptionIds(draft);
            const active = currentCorrect.includes(option.id);
            return <button key={option.id} type="button" className={active ? "active" : ""} onClick={() => {
              if (!draft.multipleSelect) {
                setDraft({ ...draft, correctOptionId: option.id, correctOptionIds: [option.id] });
                return;
              }
              const nextCorrect = active ? currentCorrect.filter((id) => id !== option.id) : [...currentCorrect, option.id];
              if (!nextCorrect.length) return;
              setDraft({ ...draft, correctOptionId: nextCorrect[0], correctOptionIds: nextCorrect });
            }}>{option.id}</button>;
          })}
        </div>
        <small>{draft.multipleSelect ? "Select every answer that should be required for full credit." : "Select the single correct answer."}</small>
      </div>

      <label className="editor-field">
        <span>Explanation · LaTeX supported</span>
        <textarea value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} rows={7} />
      </label>
      <div className="live-preview explanation-preview"><span>Explanation preview</span><div><LatexText text={draft.explanation} /></div></div>

      <div className="editor-actions">
        {hasLocalEdit && <button className="text-button danger" onClick={onReset}>Restore supplied version</button>}
        <button className="primary-button compact" onClick={save}>Save changes</button>
      </div>
    </aside>
  );
}
