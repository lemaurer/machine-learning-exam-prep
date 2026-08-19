import type { Difficulty, Question, QuestionOption, Topic } from "../types/question";

export type OptionId = QuestionOption["id"];
export const EXAM_ID = "FS21";
export const EXAM_LABEL = "FS21 · August 2021";
export const opts = (...items: Array<[OptionId, string]>): QuestionOption[] => items.map(([id, text]) => ({ id, text }));

export function q({ number, points, title, prompt, options, correct, topic, difficulty, setup, figureNumber, figureAlt, figureCaption, explanation }: {
  number: number;
  points: number;
  title: string;
  prompt: string;
  options: QuestionOption[];
  correct: OptionId[];
  topic: Topic;
  difficulty: Difficulty;
  setup?: string;
  figureNumber?: number;
  figureAlt?: string;
  figureCaption?: string;
  explanation?: string;
}): Question {
  return {
    id: `fs21-q${String(number).padStart(2, "0")}`,
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
    source: `FS21 · Question ${number} · ${points} point${points === 1 ? "" : "s"} · answer derived (supplied questions pack has no solution key)`,
    figureNumber,
    figureAlt,
    figureCaption,
  };
}

export const DERIVED = "Derived answer (the supplied FS21 questions pack contains no official solution key): ";

export const REGRESSION_SETUP = String.raw`We are given a dataset consisting of $n$ labeled training points $\mathcal D=\{(x_1,y_1),\ldots,(x_n,y_n)\}$, where $x_i\in\mathbb R^d$ are the feature vectors and $y_i\in\mathbb R$ are the labels. The design matrix $X\in\mathbb R^{n\times d}$ contains as rows the feature vectors $x_i\in\mathbb R^d$. The label vector is denoted by $y=(y_1,\ldots,y_n)^\top\in\mathbb R^n$. We assume that $X$ is full rank i.e., $\operatorname{rank}(X)=\min(n,d)$. The empirical risk with the squared loss is defined as follows:

$$\hat R_{\mathcal D}(w)=\frac1n\sum_{i=1}^n(w^\top x_i-y_i)^2=\frac1n\|y-Xw\|_2^2.\tag{1}$$

The goal is to find $w\in\mathbb R^d$ that minimizes the empirical risk.`;

export const MODEL_EVAL_SETUP = String.raw`Assume that you have access to a dataset $\mathcal D=\{(x_1,y_1),\ldots,(x_n,y_n)\}$ of $n=10000$ data samples $(x_i,y_i)$ that are drawn i.i.d. (independently and identically distributed) from some (unknown) distribution $p(x,y)$. You now need to decide how to split this dataset into a training set $\mathcal D_{\rm train}$ and a validation set $\mathcal D_{\rm val}$ so that you can run the following standard procedure to learn and evaluate a regression model:

Step 1: Training the regression model on $\mathcal D_{\rm train}$ by minimizing the empirical risk

$$\hat f_{\mathcal D_{\rm train}}=\arg\min_f\left(\hat R_{\mathcal D_{\rm train}}(f)\triangleq\frac1{|\mathcal D_{\rm train}|}\sum_{(x_i,y_i)\in\mathcal D_{\rm train}}(y_i-f(x_i))^2\right).\tag{2}$$

Step 2: Estimating the true (population) risk of the learned model $R(\hat f_{\mathcal D_{\rm train}})$ by computing the empirical risk on $\mathcal D_{\rm val}$ defined as

$$\hat R_{\mathcal D_{\rm val}}(\hat f_{\mathcal D_{\rm train}})=\frac1{|\mathcal D_{\rm val}|}\sum_{(x_i,y_i)\in\mathcal D_{\rm val}}(y_i-\hat f_{\mathcal D_{\rm train}}(x_i))^2.\tag{3}$$

Remember that for a fixed estimator $f(x)$, the true (population) risk is defined as $R(f)=\mathbb E_{(x,y)\sim p}[(y-f(x))^2]$.`;

export const HUBER_SETUP = String.raw`Consider the so-called Huber loss $\ell_{H,\delta}:\mathbb R\to\mathbb R$ for a fixed constant $\delta>0$, defined as follows:

$$\ell_{H,\delta}(a):=\begin{cases}\frac12a^2&\text{if }|a|\le\delta,\\\delta\left(|a|-\frac12\delta\right)&\text{if }|a|>\delta,\end{cases}$$

and represented in Figure 1. This loss is often employed to obtain estimators that are more robust to outliers in the training set. Furthermore, we denote as $\ell_{\rm abs}(a):=|a|$ and $\ell_{\rm sq}(a):=\frac12a^2$ the absolute value and squared losses, respectively.`;

export const PCA_SETUP = String.raw`In principal component analysis (PCA), we map the data points $x_i\in\mathbb R^d$, $i=1,\ldots,n$, to $z_i\in\mathbb R^k$, $k\ll d$, by solving the following optimization problem:

$$C_*=\frac1n\min_{W\in\mathbb R^{d\times k},\,W^\top W=I\atop z_1,\ldots,z_n\in\mathbb R^k}\sum_{i=1}^n\|Wz_i-x_i\|_2^2.\tag{4}$$

We denote by $W_*,z_1^*,\ldots,z_n^*$ the optimal solution of Equation (4). Assume the data points are centered, i.e., $\sum_{i=1}^n x_i=0$.`;

export const NN_REG_SETUP = String.raw`We model a regression problem on the dataset $\{(x_i,y_i)\}_{i=1,\ldots,n}$, where inputs $x_i$ and labels $y_i$ are both in $\mathbb R^d$, with a fully connected neural network. We use the sigmoid activation function $\varphi(x)\triangleq\frac1{1+e^{-x}}$. The sigmoid function is applied element-wise to vectors.

Therefore, the whole neural network is a function $f:\mathbb R^d\to\mathbb R^d$,
$$f(x)=W_3\varphi(W_2\varphi(W_1x+b_1)+b_2)+b_3,$$
where $W_j\in\mathbb R^{d\times d}$, $b_j\in\mathbb R^d$, $j\in\{1,2,3\}$. Suppose that during training, we only optimize parameters $W_3,b_3$, while keeping the other parameters fixed. That is, we would like to solve
$$\min_{W_3,b_3}\sum_{i=1}^n\|f(x_i)-y_i\|_2^2.\tag{5}$$`;

export const NN_TRAIN_SETUP = "Consider training a multilayer perceptron (a fully connected neural network) using gradient descent. Answer the following questions.";

export const SOFT_EM_SETUP = String.raw`We utilize the (soft) expectation maximization (EM) algorithm for clustering movies into two clusters based on the actors who star in them. We abbreviate each of the movies '(S)tar Wars', '(T)itanic', 'The (G)odfather', '(I)nterstellar', and 'The (M)atrix' with the first letter of their names. For simplicity, we focus on only four important actors and we represent each movie as a binary (zero-one) feature vector $X\in\{0,1\}^4$, where the $i$th, $i\in\{1,2,3,4\}$, element is equal to one if the actor is in the movie and zero otherwise. Assume there are two clusters $C\in\{0,1\}$.

Feature vectors $X$ for each movie are independently generated in the following way:

• Sample a cluster from the distribution $P(C)$. The distribution $P(C)$ is Bernoulli with unknown parameter $q$, i.e., $P(C=c)=q$ if $c=1$ and $1-q$ if $c=0$.

• $X_i$ is generated by $p(X_i\mid C)$ and $X_i$ is conditionally independent of $X_j$ given $C$ for all $i\ne j$. The distribution $p(X_i\mid C)$, $i\in\{1,2,3,4\}$, is also Bernoulli with unknown parameters. Note that this gives rise to 8 unknown parameters, four for each cluster.

Hint: All questions below can be solved independently of each other.`;

export const GMM_SETUP = String.raw`You have data points $x_1,\ldots,x_n$ that you want to split into two clusters ($y=1$ or $y=2$). You assume a Gaussian mixture model generated by a mixture of two Gaussians: $\mathcal N(\mu_1,\Sigma_1)$ and $\mathcal N(\mu_2,\Sigma_2)$. The mean vectors $\mu_i$ and covariance matrices $\Sigma_i$ of each of the two clusters are unknown. You assume that the prior probability for a point being in class $i$ is known and equal to $w_i$ ($w_1+w_2=1$). You perform the hard expectation maximization (EM) algorithm to cluster the data points.`;

export const GAN_SETUP = String.raw`You train a generative adversarial network (GAN) with neural network discriminator $D$ and neural network generator $G$. Let $z\sim\mathcal N(0,I)$, where $I$ is the identity matrix, represent the random Gaussian input for $G$. The objective during training is given by

$$\min_G\max_D\;\mathbb E_{x\sim p_{\rm data}}[\log D(x)]+\mathbb E_{z\sim\mathcal N(0,I)}[\log(1-D(G(z)))],$$

where $p_{\rm data}$ is the data generating distribution.`;
