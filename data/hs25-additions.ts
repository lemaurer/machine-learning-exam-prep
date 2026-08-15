import type { Question } from "../types/question";
import { questions } from "./questions";

const LAPLACE_GMM_SETUP = "We model arrival times at a gym using a two-component Laplace GMM:\n\n$$p(x \\mid z=k) = \\frac{1}{2b_k} \\exp\\left( -\\frac{|x - \\mu_k|}{b_k} \\right)$$";

const additionalQuestions: Question[] = [
  {
    id: "hs25-q01",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 1,
    title: "Convexity of empirical squared risk",
    prompt: "$R_D(w)$ is a convex function in $w$.",
    options: [{ id: "A", text: "True" }, { id: "B", text: "False" }],
    correctOptionId: "A",
    explanation: "Since the objective is a quadratic function of the parameters $w$ with a positive semi-definite matrix $X^\\top X$, the empirical squared loss $L(w) = \\frac{1}{2N} \\lVert y - Xw\\rVert_2^2$ is always convex.",
    topic: "Kernels & Regression",
    difficulty: "Foundation",
    source: "HS25 · Question 1 · 1 point",
  },
  {
    id: "hs25-q02",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 2,
    title: "Uniqueness of empirical risk minimizers",
    prompt: "The empirical risk minimizer $\\hat{w}$ is always unique for any dataset $D$.",
    options: [{ id: "A", text: "True" }, { id: "B", text: "False" }],
    correctOptionId: "B",
    explanation: "When the feature dimension $d > N$, the design matrix $X$ need not have full column rank. Then multiple parameter vectors can attain the same global minimum, so the empirical risk minimizer is not always unique.",
    topic: "Kernels & Regression",
    difficulty: "Foundation",
    source: "HS25 · Question 2 · 1 point",
  },
  {
    id: "hs25-q05-penalty",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 5,
    title: "Lasso and ridge sparsity",
    prompt: "The lasso penalty encourages sparsity, i.e., coefficients being exactly zero, while the ridge penalty only shrinks coefficients towards zero.",
    options: [{ id: "A", text: "True" }, { id: "B", text: "False" }],
    correctOptionId: "A",
    explanation: "The geometry of the $\\ell_1$-ball used by Lasso has sharp corners on the coordinate axes, which makes solutions with exactly zero coefficients common. The smooth $\\ell_2$-ball used by Ridge shrinks coefficients toward zero but typically does not set them exactly to zero.",
    topic: "Kernels & Regression",
    difficulty: "Foundation",
    source: "HS25 · Question 5 · 1 point",
  },
  {
    id: "hs25-q15",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 15,
    title: "Weight decay as L2 regularization",
    prompt: "We train a neural network with parameters $\\theta \\in \\mathbb{R}^d$. With learning rate $\\eta > 0$ and weight decay $\\alpha > 0$, the update while minimizing $L_1(\\theta)$ is\n\n$$\\theta^{(t+1)} = \\theta^{(t)}(1 - \\alpha) - \\eta \\nabla L_1(\\theta^{(t)}).$$\n\nIn a second run we minimize $L_2(\\theta)$ with the same learning rate but without weight decay:\n\n$$\\theta^{(t+1)} = \\theta^{(t)} - \\eta \\nabla L_2(\\theta^{(t)}).$$\n\nWhat must $L_2(\\theta)$ be for the two gradient updates to be identical for any $\\alpha$ and $\\eta$?",
    options: [
      { id: "A", text: "$L_2(\\theta) = L_1(\\theta) + \\frac{\\alpha}{2\\eta} \\lVert\\theta\\rVert_2^2$" },
      { id: "B", text: "$L_2(\\theta) = L_1(\\theta) + \\frac{\\alpha}{\\eta} \\lVert\\theta\\rVert_2^2$" },
      { id: "C", text: "$L_2(\\theta) = L_1(\\theta) + \\frac{\\alpha}{2} \\lVert\\theta\\rVert_2^2$" },
      { id: "D", text: "$L_2(\\theta) = L_1(\\theta) + \\alpha \\lVert\\theta\\rVert_2^2$" },
    ],
    correctOptionId: "A",
    explanation: "Equating the two updates gives $\\nabla L_2(\\theta) = \\nabla L_1(\\theta) + \\frac{\\alpha}{\\eta}\\theta$. Integrating with respect to $\\theta$ yields $L_2(\\theta) = L_1(\\theta) + \\frac{\\alpha}{2\\eta}\\lVert\\theta\\rVert_2^2$.",
    topic: "Neural Networks",
    difficulty: "Advanced",
    source: "HS25 · Question 15 · 4 points",
  },
  {
    id: "hs25-q22",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 22,
    title: "Irreducible noise",
    prompt: "Irreducible noise can be reduced by increasing the model's capacity.",
    options: [{ id: "A", text: "True" }, { id: "B", text: "False" }],
    correctOptionId: "B",
    explanation: "Irreducible noise $\\sigma^2$ is inherent to the data-generating distribution and cannot be reduced by changing the model capacity or model class.",
    topic: "Kernels & Regression",
    difficulty: "Foundation",
    source: "HS25 · Question 22 · 1 point",
  },
  {
    id: "hs25-q25",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 25,
    title: "Closed-form ridge solution",
    prompt: "Does there always exist a closed form solution for $\\hat{w} = \\operatorname{argmin}_{w\\in\\mathbb{R}^d} L(w)$ for Ridge regression?",
    options: [{ id: "A", text: "True" }, { id: "B", text: "False" }],
    correctOptionId: "A",
    explanation: "Yes. With $\\lambda > 0$, the Ridge penalty makes $X^\\top X + N\\lambda I_d$ strictly positive definite and therefore invertible, yielding a unique closed-form solution.",
    topic: "Kernels & Regression",
    difficulty: "Intermediate",
    source: "HS25 · Question 25 · 2 points",
  },
  {
    id: "hs25-q26",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 26,
    title: "Ridge gradient-descent contraction matrix",
    prompt: "We would like to find the learning rates $\\eta$ for which gradient descent converges to the Ridge minimizer $\\hat{w}$. We seek an expression of the form\n\n$$w^{(t)} - \\hat{w} = M^t(w^{(0)} - \\hat{w}),$$\n\nwhere $M$ is a $d \\times d$ matrix. The update is $w^{(t+1)} = w^{(t)} - \\eta \\nabla L(w^{(t)})$. What is the correct expression for $M$?",
    options: [
      { id: "A", text: "$M = I_d - 2\\eta(X^\\top X + \\lambda I_d)$" },
      { id: "B", text: "$M = I_d - \\frac{2\\eta}{N}(X^\\top X + \\lambda I_d)$" },
      { id: "C", text: "$M = \\left(I_d - \\frac{2\\eta}{N}(X^\\top X + N\\lambda I_d)\\right)^{-1}$" },
      { id: "D", text: "$M = \\left(I_d - 2\\eta(X^\\top X + \\lambda I_d)\\right)^{-1}$" },
      { id: "E", text: "$M = I_d - \\frac{2\\eta}{N}(X^\\top X + N\\lambda I_d)$" },
      { id: "F", text: "$M = I_d - 2\\eta(X^\\top X + N\\lambda I_d)$" },
    ],
    correctOptionId: "E",
    explanation: "Using the scaling in the supplied exam, subtracting the optimality condition $\\nabla L(\\hat{w})=0$ from the gradient-descent update gives\n\n$$w^{(t+1)} - \\hat{w} = \\left[I_d - \\frac{2\\eta}{N}(X^\\top X + N\\lambda I_d)\\right](w^{(t)} - \\hat{w}).$$\n\nTherefore $M = I_d - \\frac{2\\eta}{N}(X^\\top X + N\\lambda I_d)$, which is option E.",
    topic: "Kernels & Regression",
    difficulty: "Advanced",
    source: "HS25 · Question 26 · 4 points",
  },
  {
    id: "hs25-q38",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 38,
    title: "Beta-Bernoulli posterior",
    prompt: "We model coin flips as independent Bernoulli draws with unknown probability of heads $\\theta \\in (0,1)$. We assume $\\theta \\sim \\operatorname{Beta}(1,1)$ and observe heads ($x_1=1$), then tails ($x_2=0$). What is the posterior distribution after both observations?",
    options: [
      { id: "A", text: "$\\operatorname{Beta}(3,1)$" },
      { id: "B", text: "$\\operatorname{Beta}(2,1)$" },
      { id: "C", text: "$\\operatorname{Beta}(1,2)$" },
      { id: "D", text: "$\\operatorname{Beta}(2,2)$" },
    ],
    correctOptionId: "D",
    explanation: "By Beta-Bernoulli conjugacy, $\\theta \\mid D \\sim \\operatorname{Beta}(\\alpha + N_{heads}, \\beta + N_{tails}) = \\operatorname{Beta}(1+1, 1+1) = \\operatorname{Beta}(2,2)$.",
    topic: "Probabilistic Modeling",
    difficulty: "Intermediate",
    source: "HS25 · Question 38 · 3 points",
  },
  {
    id: "hs25-q40",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 40,
    title: "Laplace mixture E-step responsibility",
    setup: LAPLACE_GMM_SETUP,
    prompt: "In the E-step, what is the posterior group probability $p(z=1 \\mid x; \\theta)$?",
    options: [
      { id: "A", text: "$\\frac{1}{1 + \\frac{q b_0}{(1-q)b_1} \\exp\\left( \\frac{|x-\\mu_1|}{b_1} - \\frac{|x-\\mu_0|}{b_0} \\right)}$" },
      { id: "B", text: "$\\frac{1}{1 + \\frac{(1-q)b_1}{q b_0} \\exp\\left( \\frac{|x-\\mu_1|}{b_1} - \\frac{|x-\\mu_0|}{b_0} \\right)}$" },
      { id: "C", text: "$\\frac{1}{1 + \\frac{q b_0}{(1-q)b_1} \\exp\\left( \\frac{|x-\\mu_0|}{b_0} - \\frac{|x-\\mu_1|}{b_1} \\right)}$" },
      { id: "D", text: "$\\frac{1}{1 + \\frac{(1-q)b_1}{q b_0} \\exp\\left( \\frac{|x-\\mu_0|}{b_0} - \\frac{|x-\\mu_1|}{b_1} \\right)}$" },
    ],
    correctOptionId: "B",
    explanation: "Bayes' rule gives $p(z=1\\mid x) = \\frac{q p(x\\mid z=1)}{q p(x\\mid z=1) + (1-q)p(x\\mid z=0)}$. Substituting the two Laplace densities and simplifying gives option B.",
    topic: "Probabilistic Modeling",
    difficulty: "Advanced",
    source: "HS25 · Question 40 · 4 points",
  },
  {
    id: "hs25-q41",
    examId: "HS25",
    examLabel: "HS25 · February 2026",
    number: 41,
    title: "Laplace mixture mixing-weight update",
    setup: LAPLACE_GMM_SETUP,
    prompt: "In the M-step, what is the update for the prior probability $q$?",
    options: [
      { id: "A", text: "$q = \\frac{1}{N} \\sum_{n=1}^N \\gamma_0(x_n)$" },
      { id: "B", text: "$q = \\frac{1}{N} \\sum_{n=1}^N \\gamma_1(x_n)$" },
      { id: "C", text: "$q = \\frac{\\sum_{n=1}^N \\gamma_0(x_n)}{\\sum_{n=1}^N \\gamma_1(x_n)}$" },
      { id: "D", text: "$q = \\frac{\\sum_{n=1}^N \\gamma_1(x_n)}{\\sum_{n=1}^N \\gamma_0(x_n)}$" },
    ],
    correctOptionId: "B",
    explanation: "Maximizing the expected complete-data log-likelihood with respect to the mixture weight gives $q = \\frac{1}{N}\\sum_{n=1}^N \\gamma_1(x_n)$.",
    topic: "Probabilistic Modeling",
    difficulty: "Advanced",
    source: "HS25 · Question 41 · 4 points",
  },
];

function normalizePrompt(prompt: string) {
  return prompt
    .replace(/\\\\/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.$`]/g, "")
    .trim()
    .toLowerCase();
}

// The previously imported closed-form Lasso question is Question 6 in the
// complete source file. Keep its stable id so existing local progress remains
// attached to the same question, but correct its displayed exam metadata.
const existingLassoClosedForm = questions.find((question) =>
  normalizePrompt(question.prompt).includes("lasso solution")
  && normalizePrompt(question.prompt).includes("closed form via matrix inversion")
);
if (existingLassoClosedForm) {
  existingLassoClosedForm.number = 6;
  existingLassoClosedForm.source = "HS25 · Question 6 · 2 points";
}

const knownIds = new Set(questions.map((question) => question.id));
const knownPrompts = new Set(questions.map((question) => normalizePrompt(question.prompt)));

for (const question of additionalQuestions) {
  const normalized = normalizePrompt(question.prompt);
  if (knownIds.has(question.id) || knownPrompts.has(normalized)) continue;
  questions.push(question);
  knownIds.add(question.id);
  knownPrompts.add(normalized);
}
