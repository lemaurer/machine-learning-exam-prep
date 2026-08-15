# IML Exam Preparation

A local, device-persistent trainer for supplied ETH Introduction to Machine Learning exam questions. It includes Practice, Review, and Exam modes; KaTeX rendering; A–D and T/F shortcuts; exam/topic/difficulty filters; and local question editing with live rendering.

## Run locally

```bash
npm install
npm run dev
```

Open the local address printed in the terminal (normally `http://localhost:3000`). Progress and local question edits are stored in this browser only.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. Every push to `main` runs the question-selection tests, builds a static version with the correct repository base path, and deploys it to GitHub Pages. The Pages build can also be checked locally with `npm run pages:build`.

Practice and Exam select only questions whose local status is `new`. Answered questions therefore cannot appear again unless local progress is reset. Incorrect answers move to Review, correct answers move to Done, and duplicate question IDs are removed before a session is assembled.

## Where questions are added

The active question bank is [`data/questions.ts`](data/questions.ts). Types and the allowed topic/difficulty values are in [`types/question.ts`](types/question.ts). Keep every question `id` stable after first use so saved local progress continues to match it.

Use `$...$` for inline LaTeX and `$$...$$` for display LaTeX. Preserve the complete supplied wording. Put shared introductory text in the question's `setup` field and the individual question sentence in `prompt`; the app renders them in the original setup → figure → question order.

Place source figures in `public/figures/` and reference them as `/figures/filename.png`. A figure can also be replaced directly in the question editor by choosing an image from the computer or entering a path/URL. Figure path, alternative text, and caption are saved as a local edit.

## Smooth workflow for the next exam

The preferred source format is the one already supplied: one folder containing a single `.tex` file, its solutions, and its referenced image files. Use consistent blocks of the form `\paragraph{Question N (P points)}`, followed by an `itemize` list whose correct option includes `[Correct]`, and a `\paragraph{Solution & Explanation:}` block.

1. Put the new folder under `/Users/leifmaurer/IML/Exams/`, for example `FS26/`.
2. Create a draft extraction:

   ```bash
   npm run import:latex -- ../Exams/FS26/exam.tex FS26
   ```

3. Review `data/import-drafts/FS26.json`. The importer deliberately creates a draft because shared figures/solutions and topic boundaries need a quick human check.
4. Add the reviewed records to `data/questions.ts`, copy referenced images to `public/figures/`, and run `npm run build`.

The current HS25 bank was reviewed and entered directly from the supplied solution file; no questions were generated.

## Local state model

- `new`: eligible for Practice and Exam.
- `review`: answered incorrectly or manually saved for later; eligible only for Review.
- `done`: answered correctly; excluded from Practice and Exam.

Review answers move to `done` immediately when correct. The Reset action in the app restores all questions to `new` without deleting local text edits.
