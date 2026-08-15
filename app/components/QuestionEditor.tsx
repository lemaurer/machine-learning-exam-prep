"use client";

import { useEffect, useState } from "react";
import { DIFFICULTIES, TOPICS, type Question, type QuestionEdit } from "../../types/question";
import { LatexText } from "./LatexText";
import { resolveAssetUrl } from "../../lib/assets";
import { inferFigureNumber } from "../../lib/question-edits";

function loadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file is not a readable image."));
      image.onload = () => {
        const maximumSide = 1800;
        const scale = Math.min(1, maximumSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Could not prepare that image."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.88));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

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

    onSave({
      setup: draft.setup,
      prompt: draft.prompt,
      options: draft.options,
      correctOptionId: draft.correctOptionId,
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
          <span className="eyebrow">Local question edit</span>
          <h2>Question {question.number}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close editor">×</button>
      </div>

      <label className="editor-field">
        <span>Common setup · LaTeX supported</span>
        <textarea
          value={draft.setup ?? ""}
          onChange={(event) => setDraft({ ...draft, setup: event.target.value || undefined })}
          rows={7}
          placeholder="Optional setup shared by related questions"
        />
      </label>

      <label className="editor-field">
        <span>Common setup applies to question numbers</span>
        <input
          value={commonSetupNumbers}
          onChange={(event) => {
            setCommonSetupNumbers(event.target.value);
            setCommonSetupError("");
          }}
          placeholder="e.g. 7, 8, 9 or 7-9"
        />
        <small>Leave blank to keep the setup specific to this question. If you enter a group, Question {question.number} is included automatically. Editing the common setup later from any member updates the whole group.</small>
      </label>
      {commonSetupError && <p className="editor-error" role="alert">{commonSetupError}</p>}

      {draft.setup && (
        <div className="live-preview">
          <span>Setup rendering</span>
          <div><LatexText text={draft.setup} /></div>
        </div>
      )}

      <label className="editor-field">
        <span>Question · LaTeX supported</span>
        <textarea value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} rows={5} />
      </label>

      <div className="live-preview">
        <span>Live rendering</span>
        <div><LatexText text={draft.prompt} /></div>
      </div>

      <div className="editor-figure-section">
        <div className="editor-figure-heading">
          <strong>Figure</strong>
          <small>Figures are shared by exam and figure number. Editing Figure 4 here updates Figure 4 everywhere it is used in {question.examId}.</small>
        </div>
        <label className="editor-field">
          <span>Figure number</span>
          <input
            inputMode="numeric"
            value={figureNumberText}
            placeholder="e.g. 4"
            onChange={(event) => {
              setFigureNumberText(event.target.value);
              setFigureError("");
            }}
          />
          <small>The number identifies the shared figure within this exam. Existing filenames such as <code>hs25_figure4.png</code> are recognized automatically.</small>
        </label>
        <label className="editor-field">
          <span>Figure path or URL</span>
          <input
            value={draft.figure ?? ""}
            placeholder="/figures/filename.png"
            onChange={(event) => {
              setDraft({ ...draft, figure: event.target.value || undefined });
              setFigureError("");
            }}
          />
        </label>
        <label className="editor-file-button">
          <span>{figureLoading ? "Preparing image…" : "Choose an image from this computer"}</span>
          <input
            type="file"
            accept="image/*"
            disabled={figureLoading}
            onChange={async (event) => {
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
            }}
          />
        </label>
        {figureError && <p className="editor-error" role="alert">{figureError}</p>}
        <label className="editor-field">
          <span>Alternative text</span>
          <input
            value={draft.figureAlt ?? ""}
            placeholder="Describe the figure for accessibility"
            onChange={(event) => setDraft({ ...draft, figureAlt: event.target.value || undefined })}
          />
        </label>
        <label className="editor-field">
          <span>Figure caption · LaTeX supported</span>
          <input
            value={draft.figureCaption ?? ""}
            placeholder="Caption shown below the figure"
            onChange={(event) => setDraft({ ...draft, figureCaption: event.target.value || undefined })}
          />
        </label>
        {draft.figure && (
          <figure className="editor-figure-preview">
            <img src={resolveAssetUrl(draft.figure)} alt={draft.figureAlt || "Figure preview"} />
            {draft.figureCaption && <figcaption><LatexText text={draft.figureCaption} /></figcaption>}
          </figure>
        )}
        {draft.figure && <button className="text-button danger" onClick={() => setDraft({ ...draft, figure: undefined, figureAlt: undefined, figureCaption: undefined })}>Remove figure</button>}
      </div>

      <div className="editor-options">
        {draft.options.map((option, index) => (
          <label key={option.id} className="editor-field option-edit">
            <span>Option {option.id}</span>
            <input
              value={option.text}
              onChange={(event) => {
                const next = [...draft.options];
                next[index] = { ...option, text: event.target.value };
                setDraft({ ...draft, options: next });
              }}
            />
            <small><LatexText text={option.text} /></small>
          </label>
        ))}
      </div>

      <div className="editor-selects">
        <label className="editor-field">
          <span>Correct answer</span>
          <select value={draft.correctOptionId} onChange={(event) => setDraft({ ...draft, correctOptionId: event.target.value as Question["correctOptionId"] })}>
            {draft.options.map((option) => <option key={option.id}>{option.id}</option>)}
          </select>
        </label>
        <label className="editor-field">
          <span>Topic</span>
          <select value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value as Question["topic"] })}>
            {TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
          </select>
        </label>
        <label className="editor-field">
          <span>Difficulty</span>
          <select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as Question["difficulty"] })}>
            {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
          </select>
        </label>
      </div>

      <label className="editor-field">
        <span>Explanation · LaTeX supported</span>
        <textarea value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} rows={7} />
      </label>
      <div className="live-preview explanation-preview">
        <span>Explanation preview</span>
        <div><LatexText text={draft.explanation} /></div>
      </div>

      <div className="editor-actions">
        {hasLocalEdit && <button className="text-button danger" onClick={onReset}>Restore supplied version</button>}
        <button className="primary-button compact" onClick={save}>Save locally</button>
      </div>
    </aside>
  );
}
