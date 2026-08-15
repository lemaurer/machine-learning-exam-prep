"use client";

import { useEffect, useState } from "react";
import { DIFFICULTIES, TOPICS, type Question, type QuestionEdit } from "../../types/question";
import { LatexText } from "./LatexText";
import { resolveAssetUrl } from "../../lib/assets";

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

export function QuestionEditor({
  question,
  hasLocalEdit,
  onSave,
  onReset,
  onClose,
}: {
  question: Question;
  hasLocalEdit: boolean;
  onSave: (edit: QuestionEdit) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Question>(question);
  const [figureError, setFigureError] = useState("");
  const [figureLoading, setFigureLoading] = useState(false);

  useEffect(() => setDraft(question), [question]);

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
          <small>Use a path from <code>/public</code>, such as <code>/figures/example.png</code>, or a full image URL.</small>
        </div>
        <label className="editor-field">
          <span>Figure path or URL</span>
          <input
            value={draft.figure ?? ""}
            placeholder="/figures/filename.png"
            onChange={(event) => setDraft({ ...draft, figure: event.target.value || undefined })}
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
        <button
          className="primary-button compact"
          onClick={() => onSave({
            setup: draft.setup,
            prompt: draft.prompt,
            options: draft.options,
            correctOptionId: draft.correctOptionId,
            explanation: draft.explanation,
            topic: draft.topic,
            difficulty: draft.difficulty,
            figure: draft.figure,
            figureAlt: draft.figureAlt,
            figureCaption: draft.figureCaption,
          })}
        >Save locally</button>
      </div>
    </aside>
  );
}
