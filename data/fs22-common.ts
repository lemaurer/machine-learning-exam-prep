import type { Difficulty, Question, QuestionOption, Topic } from "../types/question";

export type OptionId = QuestionOption["id"];
export const EXAM_ID = "FS22";
export const EXAM_LABEL = "FS22 · August 2022";
export const opts = (...items: Array<[OptionId, string]>): QuestionOption[] => items.map(([id, text]) => ({ id, text }));

export function q({ number, points, title, prompt, options, correct, topic, difficulty, setup, multipleSelect = false, figureNumber, figureAlt, figureCaption, secondFigureNumber, secondFigureAlt, secondFigureCaption, explanation }: {
  number: number; points: number; title: string; prompt: string; options: QuestionOption[]; correct: OptionId[];
  topic: Topic; difficulty: Difficulty; setup?: string; multipleSelect?: boolean; figureNumber?: number; figureAlt?: string; figureCaption?: string;
  secondFigureNumber?: number; secondFigureAlt?: string; secondFigureCaption?: string; explanation?: string;
}): Question {
  return {
    id: `fs22-q${String(number).padStart(2, "0")}`, examId: EXAM_ID, examLabel: EXAM_LABEL, number, title, setup, prompt, options,
    correctOptionId: correct[0], correctOptionIds: correct, multipleSelect,
    explanation: explanation ?? `Official answer sheet: ${correct.join(", ")}.`, topic, difficulty,
    source: `FS22 · Question ${number} · ${points} point${points === 1 ? "" : "s"} · official answer sheet supplied in exam PDF`,
    figureNumber, figureAlt, figureCaption, secondFigureNumber, secondFigureAlt, secondFigureCaption,
  };
}

export const SGD_SETUP = "For this section (questions 5, 6, and 7), suppose that $\\ell$ is a convex differentiable loss function, and $L$ is the corresponding training loss, defined over $n$ datapoints,\n$$L(w)=\\frac1n\\sum_{i=1}^n\\ell(f_w(x_i),y_i).$$\nWe use stochastic gradient descent (SGD) to minimize $L$: at each iteration $t$, we select an index $I_t$ uniformly at random from $\\{1,\\ldots,n\\}$, and perform the update\n$$w^{t+1}=w^t-\\eta\\nabla L_{I_t}(w^t),$$\nwhere $\\nabla L_{I_t}(w):=\\nabla_w\\ell(f_w(x_{I_t}),y_{I_t})$ is the stochastic gradient, and $\\eta>0$ is the step-size.";

export const LOSS_MIN_SETUP = "We are given the data $\\{(x_i,y_i)\\}_{i=1}^n$ where $x_i\\in\\mathbb{R}^d$, $y_i\\in\\{0,1,2,\\ldots\\}$, $n\\ge1$, and $d\\ge1$ can be greater, equal, or smaller than $n$. We minimize the following loss function with respect to the parameter $w\\in\\mathbb{R}^d$:\n$$L(w):=\\sum_{i=1}^n \\exp(\\langle w,x_i\\rangle)-y_i\\langle w,x_i\\rangle.$$";

export const SVM_FEATURE_SETUP = "One can still use Hard-margin SVM if the data is not linearly separable if one finds a feature map $\\phi$ that makes the data linearly separable. In that case, SVM can be trained on the transformed dataset. In the next three questions, we ask you to match each dataset in Figure 1 with one of the transformations below:\n\n• $\\phi_1:(x_1,x_2)\\mapsto(x_1,x_1^2)$\n\n• $\\phi_2:(x_1,x_2)\\mapsto x_1x_2$\n\n• $\\phi_3:(x_1,x_2)\\mapsto x_1^2+x_2^2$\n\n• $\\phi_4:(x_1,x_2)\\mapsto(x_2,x_2^2)$\n\nIn the figure, we depicted two different classes with triangles and circles.";

export const BAYES_SETUP = "Suppose we have a classification problem with classes labeled as $1,\\ldots,K$ and an extra class “unsure” labeled as $K+1$. For a decision rule $f:\\mathbb{R}^d\\to\\{1,\\ldots,K+1\\}$, we use the following loss:\n$$\\ell(f(x),y)=\\begin{cases}0&\\text{if }f(x)=y\\text{ and }f(x)\\in\\{1,\\ldots,K\\},\\\\l_{\\rm mis}&\\text{if }f(x)\\ne y\\text{ and }f(x)\\in\\{1,\\ldots,K\\},\\\\l_{\\rm uns}&\\text{if }f(x)=K+1.\\end{cases}$$\nThis means that for a correct classification we pay no penalty, for a misclassified point we pay $l_{\\rm mis}>0$, and for an “unsure” answer, we pay $l_{\\rm uns}\\ge0$. We assume that the data is generated according to some known distribution $P_{X,Y}$. For a fixed $x$, the risk of a decision rule $f$ at $x$ is defined as\n$$R(f\\mid x):=\\mathbb{E}[\\ell(f(X),Y)\\mid X=x].$$\nThe goal of this problem is to construct a Bayes optimal classifier corresponding to this loss, which is a classifier that minimizes the above risk for every $x\\in\\mathbb{R}^d$.";

export const NN_SETUP = "Consider the following two-layer neural network, which accepts an input $x\\in\\mathbb{R}^d$, has one hidden layer of width $m$ and produces an $r$-dimensional output $y\\in\\mathbb{R}^r$. The forward pass through the network is as follows:\n$$\\text{For }j=1,\\ldots,m:\quad z_j:=\\sigma\\left(\\sum_{i=1}^d w^{(1)}_{ji}x_i\\right),\\qquad \\sigma(a):=\\frac1{1+e^{-a}},$$\n$$\\text{For }k=1,\\ldots,r:\quad y_k:=\\sum_{j=1}^m w^{(2)}_{kj}z_j.$$\nWe use the squared loss to train the neural network, so that the loss for a particular input vector $x\\in\\mathbb{R}^d$ is given by\n$$L=\\frac12\\|y-t\\|^2,$$\nwhere $y\\in\\mathbb{R}^r$ is the output of the network, and $t\\in\\mathbb{R}^r$ is the label vector, both corresponding to the input vector $x$.";

export const CNN_SETUP = "Consider a convolutional layer which takes as input an RGB image, meaning that each pixel has three color channels. The input images are $32\\times32$ pixels. The layer has three filters, each operating on windows of $4\\times4$ pixels.";

export const PCA_FIGURE_SETUP = "We perform PCA on the 2-dimensional dataset shown in Figure 2. Vectors $(v_1,\\ldots,v_5)$ in the figure indicate possible directions of the principal components. Note that these vectors are scaled in the figure for easier readability, and only their direction is relevant.";

export const PCA_RECON_SETUP = "Assume we have a centered dataset $x_1,\\ldots,x_n\\in\\mathbb{R}^d$, $d>1$, and we want to perform dimensionality reduction via PCA. For any $k\\in\\{1,\\ldots,d\\}$, we solve the following optimization problem:\n$$L^{(k)}:=\\min_{W\\in\\mathbb{R}^{d\\times k},\\,W^\\top W=I_k}\\frac1n\\sum_{i=1}^n\\|WW^\\top x_i-x_i\\|^2.\\tag{1}$$\nwhere $I_k$ is the $k\\times k$ identity matrix. We also define $L^{(0)}:=\\frac1n\\sum_{i=1}^n\\|x_i\\|^2$, and denote by $\\lambda_1\\ge\\cdots\\ge\\lambda_d$ the eigenvalues of the empirical covariance matrix of the data.";

export const REGRESSION_BASE_SETUP = "For Questions 36 to 41, we consider the following standard setting:\n\nWe are given the training data $\\{(x_i,y_i)\\}_{i=1}^n$ where $x_i\\in\\mathbb{R}^d$ and $y_i\\in\\mathbb{R}$. This data is generated via\n$$y_i=x_i^\\top w^*+\\varepsilon_i,\\qquad i=1,\\ldots,n$$\nwhere the true $w^*\\in\\mathbb{R}^d$ is unknown, and $\\varepsilon_i$ are i.i.d. samples from the Normal distribution $\\mathcal{N}(0,\\sigma^2)$. We collect the labels in a vector $y\\in\\mathbb{R}^n$, the features in a matrix $X\\in\\mathbb{R}^{n\\times d}$, and the noise in a vector $\\varepsilon\\in\\mathbb{R}^n$. With this notation, we can write $y=Xw^*+\\varepsilon$.";

export const REGULARIZED_SETUP = `${REGRESSION_BASE_SETUP}\n\nTo estimate $w^*$ from data, we consider two estimators\n$$\\hat w_\\lambda^{(1)}:=\\arg\\min_w\\frac12\\|y-Xw\\|_2^2+\\lambda\\|w\\|_1,$$\n$$\\hat w_\\lambda^{(2)}:=\\arg\\min_w\\frac12\\|y-Xw\\|_2^2+\\frac\\lambda2\\|w\\|_2^2,$$\nthat depend on a parameter $\\lambda>0$.`;

export const OLS_SETUP = `${REGRESSION_BASE_SETUP}\n\nIn this subsection (Questions 38–41), we assume that $X^\\top X$ is invertible. To estimate $w^*$ from data, this time we use the following estimator\n$$\\hat w:=\\arg\\min_w\\|y-Xw\\|_2^2.$$`;

export const MODEL_SELECTION_SETUP = "Consider a training dataset $D_{\\rm train}$ of apartment prices, where each apartment has 30 different features. This dataset may have some redundant features, so we train our machine learning model using only $d\\le30$ features. We use a validation dataset $D_{\\rm val}$, and consider the bias, variance, training error and validation error of our model, for different values of $d$. Training and validation errors are the squared error loss on $D_{\\rm train}$ and $D_{\\rm val}$, respectively.";

export const EM_SETUP = "We consider a mixture of two exponential distributions, where a random variable $X$ is constructed as follows: first the class $Z\\in\\{0,1\\}$ is chosen according to\n$$P(Z=0)=\\pi_0,\\qquad P(Z=1)=\\pi_1=1-\\pi_0.$$\nThen the random variable $X$ is sampled from an exponential distribution with parameter $\\lambda_0$ or $\\lambda_1$, depending on the class $Z$. Formally, we have the following conditional densities:\n$$p(x\\mid Z=0)=\\begin{cases}\\lambda_0e^{-\\lambda_0x}&x\\ge0,\\\\0&\\text{otherwise},\\end{cases}\\qquad p(x\\mid Z=1)=\\begin{cases}\\lambda_1e^{-\\lambda_1x}&x\\ge0,\\\\0&\\text{otherwise}.\\end{cases}$$\nWe are given $n$ i.i.d. observations $x_{1:n}=(x_1,\\ldots,x_n)$ from the generative model described above. Let $z_{1:n}=(z_1,\\ldots,z_n)$ be the hidden variables, where $z_i=0$ if the $i$-th observation belongs to class 0, and $z_i=1$ if it belongs to class 1. We denote by $\\theta=(\\lambda_0,\\lambda_1,\\pi_0,\\pi_1)$ the vector of all parameters.";
