import type { Difficulty, Question, QuestionOption, Topic } from "../types/question";

export type OptionId = QuestionOption["id"];
export const EXAM_ID = "HS21";
export const EXAM_LABEL = "HS21 · January 2022";
export const opts = (...items: Array<[OptionId, string]>): QuestionOption[] => items.map(([id, text]) => ({ id, text }));

export function q({ number, points, title, prompt, options, correct, topic, difficulty, setup, figureNumber, figureAlt, figureCaption, explanation }: {
  number: number; points: number; title: string; prompt: string; options: QuestionOption[]; correct: OptionId[];
  topic: Topic; difficulty: Difficulty; setup?: string; figureNumber?: number; figureAlt?: string; figureCaption?: string; explanation?: string;
}): Question {
  return {
    id: `hs21-q${String(number).padStart(2, "0")}`,
    examId: EXAM_ID,
    examLabel: EXAM_LABEL,
    number,
    title,
    setup,
    prompt,
    options,
    correctOptionId: correct[0],
    correctOptionIds: correct,
    explanation: explanation ?? `${DERIVED}${correct.join(", ")}.`,
    topic,
    difficulty,
    source: `HS21 · Question ${number} · ${points} point${points === 1 ? "" : "s"} · answer derived (supplied questions pack has no solution key)`,
    figureNumber,
    figureAlt,
    figureCaption,
  };
}

export const DERIVED = "Derived answer (the supplied HS21 questions pack contains no official solution key): ";

export const REGRESSION_SETUP = `We are given a dataset consisting of $n$ labeled training points $\\mathcal D=\\{(x_1,y_1),\\ldots,(x_n,y_n)\\}$, where $x_i\\in\\mathbb R^d$ are the feature vectors and $y_i\\in\\mathbb R$ are the labels. Here samples are generated independently from a distribution $p(x,y)$ for which the following holds:

$$y=w^{*\\top}x+\\epsilon\\quad\\text{where }\\epsilon\\sim\\mathcal N(0,\\sigma^2).$$

The true underlying parameters $w^*\\in\\mathbb R^d$ are unknown. The rows of the design matrix $X\\in\\mathbb R^{n\\times d}$ are the feature vectors $x_i\\in\\mathbb R^d$. The label vector is denoted by $y=(y_1,\\ldots,y_n)^\\top\\in\\mathbb R^n$. In all of Section 1, we assume $X$ is full rank i.e., $\\operatorname{rank}(X)=\\min(n,d)$.

Recall from lecture that the empirical risk is defined as follows:

$$\\hat R_{\\mathcal D}(w)=\\sum_{i=1}^n(w^\\top x_i-y_i)^2=\\|y-Xw\\|_2^2.\\tag{1}$$

The goal is to find $w\\in\\mathbb R^d$ that minimizes the empirical risk.`;

export const OLS_SVD_SETUP = `${REGRESSION_SETUP}

Let $X$ have a singular value decomposition $X=U\\Lambda^{1/2}V^\\top$. Here $U\\in\\mathbb R^{n\\times n}$ and $V\\in\\mathbb R^{d\\times d}$ are orthogonal, and $\\Lambda^{1/2}\\in\\mathbb R^{n\\times d}$ has the singular values $\\sigma_i>0$ on its diagonal and is zero elsewhere, i.e., $\\sigma_i=\\Lambda^{1/2}_{i,i}$, or equivalently $\\sigma_i^2=\\Lambda_{i,i}$.`;

export const RIDGE_SETUP = `${REGRESSION_SETUP}

To avoid overfitting to the data, we add a regularization term to the empirical risk and minimize the following objective

$$l_{\\mathcal D}(w)\\triangleq\\hat R_{\\mathcal D}(w)+\\lambda\\|w\\|_2^2=\\sum_{i=1}^n(w^\\top x_i-y_i)^2+\\lambda\\|w\\|_2^2,\\qquad\\lambda>0.\\tag{2}$$

The minimizer of Equation (2) is denoted by $\\hat w_\\lambda\\in\\mathbb R^d$.`;

export const RIDGE_BIAS_SETUP = `${RIDGE_SETUP}

Remember that for fixed $x\\in\\mathbb R^d$ the bias-variance tradeoff can be written as follows:

$$\\mathbb E_{\\mathcal D,\\epsilon}[(y-\\hat w_\\lambda^\\top x)^2]=(\\mathbb E_{\\mathcal D}[\\hat w_\\lambda^\\top x]-w^{*\\top}x)^2+\\operatorname{Var}_{\\mathcal D}[\\hat w_\\lambda^\\top x]+\\sigma^2.$$

The first term is called the bias term, the second term is called the variance term and the third term is the irreducible noise.`;

export const PCA_SETUP = `In (linear) principal component analysis (PCA), we map the data points $x_i\\in\\mathbb R^d$, $i=1,\\ldots,n$, to $z_i\\in\\mathbb R^k$, $k\\ll d$, by solving the following optimization problem:

$$C_* = \\frac1n\\min_{\\substack{W\\in\\mathbb R^{d\\times k},\\,W^\\top W=I\\\\z_1,\\ldots,z_n\\in\\mathbb R^k}}\\sum_{i=1}^n\\|Wz_i-x_i\\|_2^2.\\tag{3}$$

We denote by $W_*,z_1^*,\\ldots,z_n^*$ the optimal solution of Equation (3). For all questions in section 3, assume the data points are centered i.e., $\\sum_i x_i=0$. Therefore, the empirical covariance of the data is as follows:

$$\\Sigma_x=\\frac1n\\sum_{i=1}^n x_ix_i^\\top.$$`;

export const LINEAR_NN_SETUP = `This subsection is regarding linear networks. For input $x\\in\\mathbb R^{d_0}$, a deep linear network $F:\\mathbb R^{d_0}\\to\\mathbb R$ of depth $K$ will output $F(x)=W_KW_{K-1}\\cdots W_1x$, where each $W_j$ is a matrix of appropriate dimension. We aim to train $F$ to minimize the mean squared error loss on predicting real-valued scalar labels $y$. The loss is specified by

$$\\ell(F)=\\frac1n\\sum_i(y_i-F(x_i))^2,$$

where $i$ ranges over the dataset.`;

export const DECISION_SETUP = `In the following questions, assume that data is generated from some known probabilistic model $P(x,y)$. In both questions, we use the shorthand $p(x)=P(y=+1\\mid x)$.`;

export const EM_SETUP = `In this question, we use the (soft) expectation maximization (EM) algorithm to compute a maximum likelihood estimator (MLE) for the average lifetime of light bulbs. We assume the lifetime of a light bulb is exponentially distributed with unknown mean $\\theta>0$, i.e., its cumulative distribution function is given by

$$F(x)=(1-e^{-x/\\theta})\\mathbf 1_{\\{x\\ge0\\}}.$$

We test $N+M$ independent light bulbs in two independent experiments. In the first experiment, we test the first $N$ light bulbs. Let $Y=(Y_1,\\ldots,Y_N)$, where each random variable $Y_i$ represents the exact lifetime of light bulb $i$. In the second experiment we test the remaining $M$ bulbs, but we only check the light bulbs at some fixed time $t>0$ and record for each bulb whether it is still working or not.

Let $X=(X_1,\\ldots,X_M)$, where the random variable $X_j=1$ if the bulb $j$ from the second experiment was still working at time $t$ and $0$ if it already expired. We denote by $Z=(Z_1,\\ldots,Z_M)$ the unobserved lifetime of the light bulbs from the second experiment.`;

export const GAN_SETUP = `You train a generative adversarial network (GAN) with neural network discriminator $D$ and neural network generator $G$. Let $z\\sim\\mathcal N(0,I)$ represent the random Gaussian (normal) noise input for $G$. Here, $I$ is the identity matrix. The objective during training is given by

$$\\min_G\\max_D\\;\\mathbb E_{x\\sim p_{\\mathrm{data}}}[\\log D(x)]+\\mathbb E_z[\\log(1-D(G(z)))],$$

where $p_{\\mathrm{data}}$ is the data-generating distribution.`;