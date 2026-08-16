import type { Difficulty, Question, QuestionOption, Topic } from "../types/question";

export type OptionId = QuestionOption["id"];
export const EXAM_ID = "FS25";
export const EXAM_LABEL = "FS25 · August 2025";
export const opts = (...items: Array<[OptionId, string]>): QuestionOption[] => items.map(([id, text]) => ({ id, text }));

export function q({ number, points, title, prompt, options, correct, topic, difficulty, setup, multipleSelect = false, figureNumber, figureAlt, figureCaption, explanation }: {
  number: number; points: number; title: string; prompt: string; options: QuestionOption[]; correct: OptionId[];
  topic: Topic; difficulty: Difficulty; setup?: string; multipleSelect?: boolean; figureNumber?: number; figureAlt?: string; figureCaption?: string; explanation: string;
}): Question {
  return {
    id: `fs25-q${String(number).padStart(2, "0")}`, examId: EXAM_ID, examLabel: EXAM_LABEL, number, title, setup, prompt, options,
    correctOptionId: correct[0], correctOptionIds: correct, multipleSelect, explanation, topic, difficulty,
    source: `FS25 · Question ${number} · ${points} point${points === 1 ? "" : "s"}`, figureNumber, figureAlt, figureCaption,
  };
}

export const CLASSIFICATION_SETUP = "Consider a logistic regression model $f_{\\log}(x)=w^\\top x$ with parameters $w\\in\\mathbb{R}^d$. For an input $x\\in\\mathbb{R}^d$, the model predicts binary labels $\\hat y\\in\\{-1,+1\\}$:\n$$\\hat y=\\begin{cases}+1 & \\text{if } f_{\\log}(x)>0,\\\\-1 & \\text{if } f_{\\log}(x)\\leq 0.\\end{cases}$$\nFor a label $y$, consider the three loss functions\n$$\\begin{aligned}\\ell_1(y,f_{\\log}(x)) &= \\mathbb{I}[y\\cdot f_{\\log}(x)<0] && \\text{(0-1 loss)}\\\\\n\\ell_2(y,f_{\\log}(x)) &= \\log(1+\\exp(-yf_{\\log}(x))) && \\text{(logistic loss)}\\\\\n\\ell_3(y,f_{\\log}(x)) &= \\exp(-yf_{\\log}(x)) && \\text{(exponential loss)}.\\end{aligned}$$\nHere $\\mathbb{I}$ is an indicator function.";
export const SEPARABLE_SETUP = "Consider a linearly separable dataset with binary labels. We study two classifiers: the max-margin classifier and the logistic regression classifier. After training, these classifiers have weights $w_{\\mathrm{MM}}$ and $w_{\\mathrm{LR}}$, respectively.";
export const THRESHOLD_SETUP = "Consider logistic regression $f_{\\log}(x)=w^\\top x$ with $w\\in\\mathbb{R}^d$ and input $x\\in\\mathbb{R}^d$. We may choose a threshold $\\tau\\in\\mathbb{R}$, with predictions\n$$\\hat y_\\tau=\\begin{cases}+1 & \\text{if } f_{\\log}(x)>\\tau,\\\\-1 & \\text{if } f_{\\log}(x)<\\tau.\\end{cases}$$";
export const ROC_SETUP = "Consider logistic regression $f_{\\log}(x)=w^\\top x$ with $w\\in\\mathbb{R}^d$ and input $x\\in\\mathbb{R}^d$. We may choose a threshold $\\tau\\in\\mathbb{R}$, with predictions\n$$\\hat y_\\tau=\\begin{cases}+1 & \\text{if } f_{\\log}(x)>\\tau,\\\\-1 & \\text{if } f_{\\log}(x)<\\tau.\\end{cases}$$\n\nFigure 2 presents the receiver operating characteristic (ROC) curves of three logistic classifiers $f^A_{\\log},f^B_{\\log},f^C_{\\log}$ with adjustable threshold $\\tau\\in\\mathbb{R}$.";
export const KERNEL_COMPARE_SETUP = "Consider a non-linearly separable dataset. We train three SVM classifiers with\n$$\\begin{aligned}\nk_1(x,x')&=(x^\\top x'+1)^2,\\\\\nk_2(x,x')&=\\exp\\left(-\\frac{\\|x-x'\\|^2}{2\\sigma^2}\\right),\\qquad \\sigma=0.1,\\\\\nk_3(x,x')&=(x^\\top x'+1)^{50}.\n\\end{aligned}$$\nFigure 3 shows the decision boundaries produced by these three classifiers.";
export const JACOBIAN_SETUP = "Consider vector-valued functions $f^{(1)}:\\mathbb{R}^d\\to\\mathbb{R}^n$, $f^{(2)}:\\mathbb{R}^n\\to\\mathbb{R}^m$, and $f^{(3)}:\\mathbb{R}^m\\to\\mathbb{R}^k$, with\n$$g(x)=f^{(3)}\\left(f^{(2)}\\left(f^{(1)}(x)\\right)\\right).$$\nDenote the Jacobian of $f^{(\\ell)}$ by $J^{(\\ell)}$.";
export const BACKPROP_SETUP = "Suppose we are training a feed-forward neural network with activation $\\varphi(\\cdot)$. We use backpropagation and store all intermediate values from the forward and backward passes when computing the loss $L$. We calculate gradients until the $(\\ell+1)$-st layer. Let\n$$\\delta^{(\\ell)}=\\frac{\\partial L}{\\partial z^{(\\ell)}},\\qquad z^{(\\ell+1)}=W^{(\\ell)}\\varphi(z^{(\\ell)})$$\nbe the error signal at layer $\\ell$.";
export const GD_SETUP = "For Questions 24–25, consider $f(x)=x^2-6x+8$, which is minimized at $x=3$.";
export const PCA_DATA_SETUP = "Consider four observations $\\mathcal{D}=\\{x_1,x_2,x_3,x_4\\}\\subset\\mathbb{R}^2$ depicted in Figure 7, with $x_1=(1,2)$, $x_2=(-1,-2)$, $x_3=(4,3)$, and $x_4=(-4,-3)$.";
export const PCA_COV_SETUP = "For Questions 34–35, the empirical covariance matrix of a centered dataset is\n$$\\Sigma=\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}.$$";
export const KPCA_SETUP = "Assume there exists a kernel $k$ such that the centered kernel matrix for $\\{x_1,x_2,x_3\\}$ is\n$$K=\\begin{pmatrix}5&-3&0\\\\-3&5&0\\\\0&0&5\\end{pmatrix},$$\nand the eigenvalue and eigenvector corresponding to the first kernel principal component are $\\lambda_1=8$ and $v_1=(-\\frac{1}{\\sqrt{2}},\\frac{1}{\\sqrt{2}},0)^\\top$. We want to represent $x_1=(1,2)$ by its first kernel PCA feature $z_1\\in\\mathbb{R}$.";
export const EM_SETUP = "We model machine failure times with two latent failure modes. For each machine $n\\in\\{1,\\ldots,N\\}$, observe $x_n\\in\\mathbb{R}_{>0}$ and let $z_n\\in\\{0,1\\}$ denote the latent failure mechanism, with\n$$p(z_n=1)=q.$$\nConditional on $z_n$,\n$$x_n\\mid z_n=k\\sim\\operatorname{Exponential}(\\lambda_k),\\qquad p(x_n\\mid z_n=k)=\\lambda_k\\exp(-\\lambda_kx_n),\\qquad x_n\\geq0.$$\nWe apply soft EM to estimate $\\theta=\\{q,\\lambda_0,\\lambda_1\\}$ and the posterior group probabilities $p(z_n\\mid x_n;\\theta)$.";
