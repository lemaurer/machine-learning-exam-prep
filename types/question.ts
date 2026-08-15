export const TOPICS = [
  "Kernels & Regression",
  "Neural Networks",
  "Clustering",
  "Probabilistic Modeling",
] as const;

export const DIFFICULTIES = ["Foundation", "Intermediate", "Advanced"] as const;

export type Topic = (typeof TOPICS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type SessionMode = "practice" | "review" | "exam";
export type QuestionStatus = "new" | "done" | "review";

export type QuestionOption = {
  id: "A" | "B" | "C" | "D" | "E" | "F";
  text: string;
};

export type Question = {
  id: string;
  examId: string;
  examLabel: string;
  number: number;
  title: string;
  setup?: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: QuestionOption["id"];
  explanation: string;
  topic: Topic;
  difficulty: Difficulty;
  source: string;
  figureNumber?: number;
  figure?: string;
  figureAlt?: string;
  figureCaption?: string;
};

export type QuestionProgress = {
  status: QuestionStatus;
  attempts: number;
  correct: number;
  incorrect: number;
  lastAnswerId: QuestionOption["id"];
  lastAnsweredAt: string;
};

export type ProgressStore = Record<string, QuestionProgress>;
export type QuestionEdit = Partial<
  Pick<
    Question,
    "setup" | "prompt" | "options" | "correctOptionId" | "explanation" | "topic" | "difficulty" | "figureNumber" | "figure" | "figureAlt" | "figureCaption"
  >
> & {
  commonSetupQuestionIds?: string[];
  sharedFigureQuestionIds?: string[];
};
export type EditStore = Record<string, QuestionEdit>;
