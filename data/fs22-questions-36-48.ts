import { q, opts, REGULARIZED_SETUP, OLS_SETUP, MODEL_SELECTION_SETUP, EM_SETUP } from "./fs22-common";
import type { Question } from "../types/question";

const OLS_RISK_SETUP = `${OLS_SETUP}\n\nLet $y_{\\rm test}=x_{\\rm test}^\\top w^*+\\varepsilon_{\\rm test}$, where $\\varepsilon_{\\rm test}\\sim\\mathcal N(0,\\sigma^2)$. We define the risk at $x_{\\rm test}$ as\n$$R(x_{\\rm test}):=\\mathbb E_{\\varepsilon,\\varepsilon_{\\rm test}}[(y_{\\rm test}-x_{\\rm test}^\\top\\hat w)^2]$$\n$$=(x_{\\rm test}^\\top w^*-\\mathbb E_\\varepsilon[x_{\\rm test}^\\top\\hat w])^2+\\mathbb E_\\varepsilon[(x_{\\rm test}^\\top\\hat w-\\mathbb E_\\varepsilon[x_{\\rm test}^\\top\\hat w])^2]+\\mathbb E_{\\varepsilon_{\\rm test}}[(y_{\\rm test}-x_{\\rm test}^\\top w^*)^2].$$\nThe three terms $B,V,N$ represent the squared Bias, Variance, and the effect of Noise.`;

const EM_E_SETUP = `${EM_SETUP}\n\nWe run the EM algorithm on this data. The vector $\\theta^{(t)}$ denotes the parameters at the $t$-th iteration of the algorithm. At iteration $(t+1)$, we perform the E-step by computing:\n$$Q(\\theta;\\theta^{(t)}):=\\mathbb E_{z_{1:n}}[\\log p(x_{1:n},z_{1:n}\\mid\\theta)\\mid x_{1:n},\\theta^{(t)}].$$\nRecall that $\\gamma_1(x_i)=P(z_i=1\\mid x_i,\\theta^{(t)})$, and define $\\gamma_0(x_i)=1-\\gamma_1(x_i)$.`;

const EM_M_SETUP = `${EM_E_SETUP}\n\nThen, we take the M-step and obtain $\\theta^{(t+1)}$ via\n$$\\theta^{(t+1)}=\\arg\\max_\\theta Q(\\theta;\\theta^{(t)}).$$\nRecall that $\\theta^{(t)}=(\\lambda_0^{(t)},\\lambda_1^{(t)},\\pi_0^{(t)},\\pi_1^{(t)})$.`;

export const fs22Questions: Question[] = [
  q({ number:36, points:1, title:"Lasso and ridge coefficient paths", prompt:"Figure 4 and Figure 5 show the values of the first 4 individual coordinates of two different estimators that depend on a parameter $\\lambda$, as a function of $\\lambda$. Match each plot to the corresponding estimator. In both plots, the $\\lambda$-axis is in logarithmic scale.", options:opts(
    ["A","Figure 4 corresponds to $\\hat w^{(1)}$, and Figure 5 to $\\hat w^{(2)}$."],
    ["B","Figure 4 corresponds to $\\hat w^{(2)}$, and Figure 5 to $\\hat w^{(1)}$."],
    ["C","Figure 4 corresponds to $\\hat w^{(1)}$, but Figure 5 does not correspond to $\\hat w^{(1)}$ or $\\hat w^{(2)}$."]
  ), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation", setup:REGULARIZED_SETUP, figureNumber:4, figureAlt:"Regularization coefficient paths in Figure 4.", figureCaption:"Figure 4", secondFigureNumber:5, secondFigureAlt:"Regularization coefficient paths in Figure 5.", secondFigureCaption:"Figure 5" }),
  q({ number:37, points:1, title:"Lasso support under orthonormal design", prompt:"Let $\\hat w^{(1)}_\\lambda[c]$ be the $c$-th coordinate of the vector $\\hat w^{(1)}_\\lambda$. If the columns of $X$ are orthonormal, then for all $c=1,\\ldots,d$ it holds that: If $\\hat w^{(1)}_\\lambda[c]\\ne0$, then $\\hat w^{(1)}_{\\lambda'}[c]\\ne0$ for all $0<\\lambda'\\le\\lambda$.", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Intermediate", setup:REGULARIZED_SETUP }),
  q({ number:38, points:1, title:"OLS closed form", prompt:"What is the value of $\\hat w$?", options:opts(["A","$X^\\top(XX^\\top)^{-1}y$"],["B","$(X^\\top X)^{-1}X^\\top y$"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation", setup:OLS_SETUP }),
  q({ number:39, points:3, title:"Expected OLS prediction", prompt:"Using $\\hat w$, we predict the output at a test input $x_{\\rm test}$ as $x_{\\rm test}^\\top\\hat w$. What is the expected value of our prediction? In other words, calculate $\\mathbb E_\\varepsilon[x_{\\rm test}^\\top\\hat w]$ where the expectation is over $\\varepsilon$.", options:opts(
    ["A","$\\sigma\\sum_{i=1}^n x_{\\rm test}^\\top(X^\\top X)^{-1}x_i$"],
    ["B","$x_{\\rm test}^\\top w^*+\\sigma\\sum_{i=1}^n x_{\\rm test}^\\top(X^\\top X)^{-1}x_i$"],
    ["C","$0$"],
    ["D","$x_{\\rm test}^\\top w^*$"]
  ), correct:["D"], topic:"Kernels & Regression", difficulty:"Intermediate", setup:OLS_SETUP }),
  q({ number:40, points:1, title:"OLS squared bias", prompt:"What is the value of $B(x_{\\rm test})$?", options:opts(
    ["A","$\\sigma^2\\left(\\sum_{i=1}^n x_{\\rm test}^\\top(X^\\top X)^{-1}x_i\\right)^2$"],
    ["B","$(x_{\\rm test}^\\top w^*)^2+\\left(\\sigma^2\\sum_{i=1}^n x_{\\rm test}^\\top(X^\\top X)^{-1}x_i\\right)^2$"],
    ["C","$0$"],
    ["D","$(x_{\\rm test}^\\top w^*)^2$"]
  ), correct:["C"], topic:"Kernels & Regression", difficulty:"Foundation", setup:OLS_RISK_SETUP }),
  q({ number:41, points:3, title:"OLS prediction variance", prompt:"What is the value of $V(x_{\\rm test})$? Hint: If $a\\in\\mathbb{R}^n$ and $\\varepsilon\\sim\\mathcal N(0,\\sigma^2I)$ is an $n$-dimensional Gaussian vector, then $\\operatorname{Var}(a^\\top\\varepsilon)=\\sigma^2a^\\top a$.", options:opts(
    ["A","$\\sigma^2$"],
    ["B","$\\sigma^2x_{\\rm test}^\\top(X^\\top X)^{-1}x_{\\rm test}$"],
    ["C","$\\sigma^2\\sum_{i=1}^n x_{\\rm test}^\\top(X^\\top X)^{-1}X^\\top x_i$"],
    ["D","$\\sigma^2\\left(1+\\sum_{i=1}^n x_{\\rm test}^\\top(X^\\top X)^{-1}X^\\top x_i\\right)$"],
    ["E","$\\sigma^2\\left(1+x_{\\rm test}^\\top(X^\\top X)^{-1}x_{\\rm test}\\right)$"],
    ["F","$n\\sigma^2$"]
  ), correct:["B"], topic:"Kernels & Regression", difficulty:"Intermediate", setup:OLS_RISK_SETUP }),
  q({ number:42, points:3, title:"Model selection decreasing curve", prompt:"Which quantities might be the $y$-axis of Figure 6? Mark all that apply.", options:opts(["A","Bias"],["B","Variance"],["C","Training error"],["D","Validation error"]), correct:["A","C","D"], multipleSelect:true, topic:"Optimization & Model Selection", difficulty:"Intermediate", setup:MODEL_SELECTION_SETUP, figureNumber:6, figureAlt:"A decreasing curve as the number of selected features d increases.", figureCaption:"Figure 6 · Related to Question 42." }),
  q({ number:43, points:3, title:"Model selection increasing curve", prompt:"Which quantities might be the $y$-axis of Figure 7? Mark all that apply.", options:opts(["A","Bias"],["B","Variance"],["C","Training error"],["D","Validation error"]), correct:["B","D"], multipleSelect:true, topic:"Optimization & Model Selection", difficulty:"Intermediate", setup:MODEL_SELECTION_SETUP, figureNumber:7, figureAlt:"An increasing curve as the number of selected features d increases.", figureCaption:"Figure 7 · Related to Question 43." }),
  q({ number:44, points:2, title:"Complete-data likelihood for exponential mixture", prompt:"Which one is the complete-data likelihood $p(x_{1:n},z_{1:n}\\mid\\theta)$?", options:opts(
    ["A","$\\prod_{i=1}^n(\\pi_0\\lambda_0e^{-\\lambda_0x_i})^{1-z_i}(\\pi_1\\lambda_1e^{-\\lambda_1x_i})^{z_i}$"],
    ["B","$\\prod_{i=1}^n(\\lambda_0e^{-\\lambda_0x_i})^{1-z_i}(\\lambda_1e^{-\\lambda_1x_i})^{z_i}$"],
    ["C","$\\prod_{i=1}^n\\left((\\pi_0\\lambda_0e^{-\\lambda_0x_i})^{1-z_i}+(\\pi_1\\lambda_1e^{-\\lambda_1x_i})^{z_i}\\right)$"],
    ["D","$\\prod_{i=1}^n\\left((\\lambda_0e^{-\\lambda_0x_i})^{1-z_i}+(\\lambda_1e^{-\\lambda_1x_i})^{z_i}\\right)$"]
  ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_SETUP }),
  q({ number:45, points:2, title:"EM Q-function", prompt:"What is the value of $Q(\\theta;\\theta^{(t)})$?", options:opts(
    ["A","$\\sum_{i=1}^n\\gamma_0(x_i)(\\log\\lambda_0-\\lambda_0x_i)+\\gamma_1(x_i)(\\log\\lambda_1-\\lambda_1x_i)$"],
    ["B","$\\sum_{i=1}^n\\gamma_0(x_i)(\\log(\\pi_0\\lambda_0)-\\lambda_0x_i)+\\gamma_1(x_i)(\\log(\\pi_1\\lambda_1)-\\lambda_1x_i)$"],
    ["C","$\\sum_{i=1}^n(\\pi_0\\lambda_0e^{-\\lambda_0x_i})^{\\gamma_0(x_i)}+(\\pi_1\\lambda_1e^{-\\lambda_1x_i})^{\\gamma_1(x_i)}$"],
    ["D","$\\sum_{i=1}^n(\\lambda_0e^{-\\lambda_0x_i})^{\\gamma_0(x_i)}+(\\lambda_1e^{-\\lambda_1x_i})^{\\gamma_1(x_i)}$"]
  ), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_E_SETUP }),
  q({ number:46, points:3, title:"EM responsibility", prompt:"What is the value of $\\gamma_1(x_i)$?", options:opts(
    ["A","$\\frac{\\pi_1^{(t)}\\lambda_1^{(t)}e^{-\\lambda_1^{(t)}x_i}}{\\pi_0^{(t)}\\lambda_0^{(t)}e^{-\\lambda_0^{(t)}x_i}+\\pi_1^{(t)}\\lambda_1^{(t)}e^{-\\lambda_1^{(t)}x_i}}$"],
    ["B","$\\pi_1^{(t)}\\lambda_1^{(t)}e^{-\\lambda_1^{(t)}x_i}$"],
    ["C","$\\pi_0^{(t)}\\lambda_0^{(t)}e^{-\\lambda_0^{(t)}x_i}+\\pi_1^{(t)}\\lambda_1^{(t)}e^{-\\lambda_1^{(t)}x_i}$"],
    ["D","$\\frac{\\lambda_1^{(t)}e^{-\\lambda_1^{(t)}x_i}}{\\lambda_0^{(t)}e^{-\\lambda_0^{(t)}x_i}+\\lambda_1^{(t)}e^{-\\lambda_1^{(t)}x_i}}$"]
  ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_E_SETUP }),
  q({ number:47, points:2, title:"EM exponential-rate M-step", prompt:"What is the value of $\\lambda_0^{(t+1)}$?", options:opts(
    ["A","$\\frac{\\sum_i\\gamma_0(x_i)}{\\sum_i x_i\\gamma_0(x_i)}$"],
    ["B","$\\frac{\\sum_i x_i\\gamma_0(x_i)}{\\sum_i\\gamma_0(x_i)}$"],
    ["C","$\\frac{\\sum_i x_i}{\\sum_i\\gamma_0(x_i)}$"],
    ["D","$\\frac{\\sum_i\\gamma_0(x_i)}{\\sum_i x_i}$"]
  ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_M_SETUP }),
  q({ number:48, points:2, title:"EM mixture-weight M-step", prompt:"What is the value of $\\pi_0^{(t+1)}$?", options:opts(
    ["A","$\\frac{\\sum_i\\gamma_1(x_i)}{n}$"],
    ["B","$\\sum_i\\gamma_1(x_i)$"],
    ["C","$\\frac{\\sum_i\\gamma_0(x_i)}{n}$"],
    ["D","$\\sum_i\\gamma_0(x_i)$"]
  ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_M_SETUP }),
];
