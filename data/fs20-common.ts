import type { Difficulty, Question, QuestionOption, Topic } from "../types/question";

export type OptionId = QuestionOption["id"];
export const EXAM_ID = "FS20";
export const EXAM_LABEL = "FS20 · August 2020";
export const DERIVED = "Derived answer (the supplied FS20 questions pack contains no official solution key): ";
export const opts = (...items: Array<[OptionId, string]>): QuestionOption[] => items.map(([id, text]) => ({ id, text }));

export function q({ number, points, title, prompt, options, correct, topic, difficulty, setup, multipleSelect = false, figureNumber, figureAlt, figureCaption, explanation }: {
  number: number;
  points: number;
  title: string;
  prompt: string;
  options: QuestionOption[];
  correct: OptionId[];
  topic: Topic;
  difficulty: Difficulty;
  setup?: string;
  multipleSelect?: boolean;
  figureNumber?: number;
  figureAlt?: string;
  figureCaption?: string;
  explanation?: string;
}): Question {
  return {
    id: `fs20-q${String(number).padStart(2, "0")}`,
    examId: EXAM_ID,
    examLabel: EXAM_LABEL,
    number,
    title,
    setup,
    prompt,
    options,
    correctOptionId: correct[0],
    correctOptionIds: correct,
    multipleSelect,
    explanation: explanation ?? `${DERIVED}${correct.join(", ")}.`,
    topic,
    difficulty,
    source: `FS20 · Question ${number} · ${points} point${points === 1 ? "" : "s"} · answer derived (supplied questions pack has no solution key)`,
    figureNumber,
    figureAlt,
    figureCaption,
  };
}

export const LINEAR_REGRESSION_SETUP = String.raw`Consider the following regression setting: You are given a design matrix $X\in\mathbb R^{n\times d}$ and a target vector $y\in\mathbb R^n$ for a dataset with $n$ samples and features of dimension $d$. For this question, assume that $n>d$ unless otherwise stated. For this dataset, a linear regression model minimises the following objective,

$$L(w)=\|y-Xw\|^2,\tag{1}$$

where $w\in\mathbb R^d$ and $\|\cdot\|$ is the Euclidean norm.`;

export const KERNEL_SETUP = "For each of the following functions $k$, decide if it is a valid kernel function (True) or not (False). Hint: For the questions involving set operations, try to represent a subset as a binary vector.";

export const SVM_SETUP = String.raw`Consider the following binary classification task: You are given a dataset $\{(x_i,y_i)\}_{i\in\mathcal D}$ with $x_i\in\mathbb R^2$ and $y_i\in\{-1,+1\}$ for all $i\in\mathcal D$. This dataset is displayed in Figure 2.

You are asked to fit a linear support vector machine with parameters $w\in\mathbb R^2$ and $b\in\mathbb R$ to minimise the following objective,

$$L(w,b,\mathcal D)=\frac12\|w\|_2^2+\sum_{i\in\mathcal D}\max\{0,1-y_i(w^\top x_i+b)\}.\tag{4}$$

The objective in Equation (4) could be minimised using stochastic gradient descent with a constant step size $\eta$ to perform iterative updates

$$w_{t+1}=w_t-\eta\nabla_wL(w,b,B_t)|_{w=w_t,b=b_t},\tag{5}$$
$$b_{t+1}=b_t-\eta\nabla_bL(w,b,B_t)|_{w=w_t,b=b_t}.\tag{6}$$

For the remainder of this question, define $\left.\frac{d}{dz}\max\{0,z\}\right|_{z=0}=0$.`;

export const BAYESIAN_REGRESSION_SETUP = String.raw`Consider the following Bayesian regression model for fitting a quadratic function,

$$y=(\theta_0+\theta_1x+\theta_2x^2)+\varepsilon,$$
$$\varepsilon\sim\operatorname{Normal}(0,\sigma^2),$$
$$\theta_i\sim\operatorname{Laplace}(0,s)\quad\text{for all }i\in\{0,1,2\},$$

where $\sigma$ and $s$ are assumed to be known. You are given a dataset $\{(x_i,y_i)\}_{i=1}^n$ generated from this model.`;

export const CONV3D_SETUP = String.raw`The two-dimensional convolutional layers seen in class for image processing can be generalized to three dimensions (3D). Input data in 3D arises naturally in spatial modelling and medical imaging. Let $I$ be such a 3D image of shape $W\times H\times D\times C$, where $W$, $H$ and $D$ are width, height and depth of the image respectively, and $C$ is the number of channels. See Figure 3.

Figure 3 shows an example with $W=H=D=8$ and $C=3$ for illustration only. The figure is not to scale. For the questions, assume spatial dimensions $W=H=D=30$ and $C=3$ channels for $I$ and ignore the bias term, i.e. only consider the parameters of the weight matrix.`;

export const EM_GMM_SETUP = "The following statements are about using the Expectation Maximisation (EM) algorithm to learn the parameters and latent (probabilistic) assignments of a Gaussian Mixture Model (GMM). For each of the statements, decide if it is true or false.";

export const DIAGNOSTIC_EM_SETUP = String.raw`In response to a new disease, you decided to develop your own diagnostic test. You convinced four friends Anton (A), Bella (B), Charlie (C) and Dora (D) to volunteer for initial trials. You tested each friend for the disease independently five times and obtained the following test results $\mathcal D$:

Anton: 1, 0, 0, 1, 1

Bella: 0, 1, 0, 0, 0

Charlie: 0, 0, 1, 1, 1

Dora: 1, 1, 1, 1, 1

Here 0 or 1 indicate a negative or positive test outcome respectively. You would like to estimate the true positive rate $\mu_1:=P(X=1\mid Z=1)$ and false positive rate $\mu_0:=P(X=1\mid Z=0)$ of your test. $Z$ is a binary unobserved variable that is 1 if a subject suffers from the disease, and 0 otherwise. $X$ is a binary observed variable that is 1 if your test is positive, and 0 otherwise. In addition, you are interested in estimating $\pi_i=P(Z_i=1\mid\mathcal D)$ for $i\in\{A,B,C,D\}$.

You estimate $\mu_0$, $\mu_1$ and the $\pi_i$ jointly using the soft expectation maximization (EM) algorithm, treating $Z$ as the latent variable and $\mu_0,\mu_1$ as the likelihood parameters. Assume $P(Z_i=1)=0.2$ for each friend independently.`;
