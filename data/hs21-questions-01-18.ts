import type { Question } from "../types/question";
import { DERIVED, OLS_SVD_SETUP, REGRESSION_SETUP, RIDGE_SETUP, RIDGE_BIAS_SETUP, opts, q } from "./hs21-common";

export const hs21Questions: Question[] = [
  q({
    number: 1, points: 4, title: "OLS estimator from the SVD", setup: OLS_SVD_SETUP,
    prompt: `What is the estimator $\\hat w$ you obtain by minimizing the empirical risk in Equation (1), i.e.,

$$\\hat w\\triangleq\\arg\\min_w\\hat R_{\\mathcal D}(w),$$

in terms of $w^*$, $V$, $\\Lambda$, and $\\tilde\\epsilon\\triangleq U^\\top\\epsilon$?

**Hint:** Since $U$ and $V$ are orthogonal, it holds that, $U^\\top U=UU^\\top=I_{n\\times n}$, $VV^\\top=V^\\top V=I_{d\\times d}$.`,
    options: opts(
      ["A", `$V\\Lambda^{-1}V^\\top U\\Lambda^{1/2}V^\\top(w^*+\\tilde\\epsilon)$`],
      ["B", `$V\\Lambda^{-\\top}U^\\top(w^*+\\tilde\\epsilon)$`],
      ["C", `$V\\Lambda^{-1/2}V^\\top w^*+V\\Lambda^{-1/2}\\tilde\\epsilon$`],
      ["D", `$V\\Lambda^{-1/2}V^\\top w^*+V\\Lambda^{-1}\\tilde\\epsilon$`],
      ["E", `$w^*+V\\Lambda^{-\\top/2}\\tilde\\epsilon$`],
      ["F", `$w^*+V\\Lambda^{-\\top}\\tilde\\epsilon$`],
      ["G", `$w^*+V\\Lambda^\\top\\tilde\\epsilon$`],
      ["H", `$w^*+V\\Lambda^{\\top/2}\\tilde\\epsilon$`],
    ),
    correct: ["E"], topic: "Kernels & Regression", difficulty: "Advanced",
    explanation: `${DERIVED}Using the least-squares inverse together with $X=U\\Lambda^{1/2}V^\\top$ gives $\\hat w=w^*+V\\Lambda^{-\\top/2}\\tilde\\epsilon$.`,
  }),
  q({
    number: 2, points: 3, title: "Covariance under the SVD", setup: OLS_SVD_SETUP,
    prompt: `Assume that the feature vectors of our training set are centered, i.e., $\\sum_{i=1}^n x_i=0$. Compute the following:

(i.) The empirical covariance matrix of our training data-points: $\\Sigma\\triangleq\\frac1n\\sum_{i=1}^n x_ix_i^\\top$.

(ii.) The covariance matrix of the random vector $\\tilde\\epsilon\\triangleq U^\\top\\epsilon$.`,
    options: opts(
      ["A", `(i.) $\\frac1nV(\\Lambda^{1/2})^\\top\\Lambda^{1/2}V^\\top$ (ii.) $\\sigma^2I_{n\\times n}$`],
      ["B", `(i.) $\\frac1nU\\Lambda^{1/2}(\\Lambda^{1/2})^\\top U^\\top$ (ii.) $\\sigma^2I_{n\\times n}$`],
      ["C", `(i.) $\\frac1nV(\\Lambda^{1/2})^\\top\\Lambda^{1/2}V^\\top$ (ii.) $U$`],
      ["D", `(i.) $\\frac1nU\\Lambda^{1/2}(\\Lambda^{1/2})^\\top U^\\top$ (ii.) $U$`],
    ),
    correct: ["A"], topic: "Kernels & Regression", difficulty: "Advanced",
    explanation: `${DERIVED}$\\Sigma=\\frac1nX^\\top X=\\frac1nV(\\Lambda^{1/2})^\\top\\Lambda^{1/2}V^\\top$, and orthogonal rotation preserves the isotropic noise covariance: $\\operatorname{Cov}(U^\\top\\epsilon)=\\sigma^2I$.`,
  }),
  q({ number: 3, points: 1, title: "Uniqueness of OLS", setup: REGRESSION_SETUP,
    prompt: `When $n\\ge d$, the empirical risk $\\hat R_{\\mathcal D}$, has a unique minimizer.`,
    options: opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}With $n\\ge d$ and full rank, $X$ has full column rank, so $X^\\top X$ is positive definite and the least-squares minimizer is unique.` }),
  q({ number: 4, points: 1, title: "Local and global least-squares minima", setup: REGRESSION_SETUP,
    prompt: `A local minimizer for the empirical risk $\\hat R_{\\mathcal D}$ is also a global minimizer.`,
    options: opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}The squared least-squares objective is convex, hence every local minimizer is global.` }),
  q({ number: 5, points: 1, title: "Interpolation in the underdetermined case", setup: REGRESSION_SETUP,
    prompt: `When $n\\le d$, there always exists $w$ such that $Xw=y$.`,
    options: opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Full rank with $n\\le d$ means $\\operatorname{rank}(X)=n$, so the map $w\\mapsto Xw$ is onto $\\mathbb R^n$ and every $y$ can be interpolated.` }),
  q({ number: 6, points: 3, title: "Gradient descent for least squares", setup: REGRESSION_SETUP,
    prompt: `We would like to minimize the empirical risk $\\hat R_{\\mathcal D}$ using gradient descent. What is the update formula?`,
    options: opts(
      ["A", `$w_{t+1}=w_t+\\eta_t(X^\\top Xw_t-2X^\\top y)$`],
      ["B", `$w_{t+1}=w_t-\\eta_t(2X^\\top Xw_t-2X^\\top y)$`],
      ["C", `$w_{t+1}=w_t+\\eta_t(2Xw_t-2XX^\\top y)$`],
      ["D", `$w_{t+1}=w_t-\\eta_t(Xw_t-2XX^\\top y)$`],
      ["E", `$w_{t+1}=w_t+\\eta_t(2y_i-2w_t^\\top x_i)x_i$, for some randomly chosen $i\\in\\{1,2,\\ldots,n\\}$`],
      ["F", `$w_{t+1}=w_t-\\eta_t(2y_i-2w_t^\\top x_i)x_i$, for some randomly chosen $i\\in\\{1,2,\\ldots,n\\}$`],
      ["G", `$w_{t+1}=w_t+\\eta_t(y_i-2w_t^\\top x_i)x_i$, for some randomly chosen $i\\in\\{1,2,\\ldots,n\\}$`],
      ["H", `$w_{t+1}=w_t-\\eta_t(2y_i-w_t^\\top x_i)x_i$, for some randomly chosen $i\\in\\{1,2,\\ldots,n\\}$`],
    ), correct:["B"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}$\\nabla\\hat R_{\\mathcal D}(w)=2X^\\top Xw-2X^\\top y$, and gradient descent subtracts the gradient.` }),
  q({ number: 7, points: 2, title: "Closed-form Ridge estimator", setup: RIDGE_SETUP,
    prompt: `Assume $n>d$. The minimizer $\\hat w_\\lambda$ of Equation (2) in closed form is given by`,
    options: opts(
      ["A", `$\\hat w_\\lambda=(X^\\top X+\\lambda I)^{-1}Xy$`],
      ["B", `$\\hat w_\\lambda=(X^\\top X+\\lambda I)^{-1}X^\\top y$`],
      ["C", `$\\hat w_\\lambda=(XX^\\top+\\lambda I)^{-1}Xy$`],
      ["D", `$\\hat w_\\lambda=(XX^\\top+\\lambda I)^{-1}X^\\top y$`],
      ["E", `there is no closed form solution.`],
    ), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Setting the Ridge gradient to zero yields $(X^\\top X+\\lambda I)\\hat w_\\lambda=X^\\top y$.` }),
  q({ number: 8, points: 1, title: "Ridge regularization and bias", setup: RIDGE_BIAS_SETUP,
    prompt: `A bigger $\\lambda$ (Equation 2) reduces the bias term in the bias variance trade-off.`,
    options: opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Increasing Ridge regularization increases shrinkage and typically increases bias rather than reducing it.` }),
  q({ number: 9, points: 1, title: "Ridge regularization and variance", setup: RIDGE_BIAS_SETUP,
    prompt: `A smaller $\\lambda$ (Equation 2) increases the variance in the bias-variance trade-off.`,
    options: opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Reducing regularization makes the estimator more sensitive to the sampled data, increasing variance.` }),
  q({ number: 10, points: 1, title: "Ridge and overfitting", setup: RIDGE_SETUP,
    prompt: `Smaller $\\lambda$ (Equation 2) prevents overfitting to the training data.`,
    options: opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Larger, not smaller, $\\lambda$ imposes stronger regularization and helps prevent overfitting.` }),
  q({ number: 11, points: 1, title: "Population risk and Ridge parameter", setup: RIDGE_BIAS_SETUP,
    prompt: `The population risk $\\mathbb E_{\\mathcal D,\\epsilon}[(y-\\hat w_\\lambda^\\top x)^2]$ is constant with respect to $\\lambda$ (Equation 2):`,
    options: opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Changing $\\lambda$ changes the bias and variance terms, so the population risk is generally not constant in $\\lambda$.` }),
  q({ number: 12, points: 3, title: "Maximum-margin linear classifier",
    prompt: `Consider linear classification with weights $w=\\begin{pmatrix}w_1\\\\w_2\\end{pmatrix}$. Predictions take the form $y_{pred}=\\operatorname{sign}(w^\\top x)$. Consider the dataset $\\{(((-1,0)^\\top),-1),(((-2,1)^\\top),-1),(((1,0)^\\top),+1),(((2,1)^\\top),+1)\\}$, where the first element in each data-point $x=\\begin{pmatrix}x_1\\\\x_2\\end{pmatrix}$ is the feature vector and the second element is its class label $y=\\pm1$. The points are represented in the Figure below.

The solution (normalized such that $\\|w\\|_2=1$) that classifies all points correctly and achieves the maximum margin is given by (Recall that the margin is defined as the minimum distance between all of the data-points and the decision boundary of the classifier):`,
    options: opts(
      ["A", `$w=\\frac1{\\sqrt2}\\begin{pmatrix}-1\\\\1\\end{pmatrix}$ with margin 2`],
      ["B", `$w=\\frac1{\\sqrt2}\\begin{pmatrix}1\\\\-1\\end{pmatrix}$ with margin 2`],
      ["C", `$w=\\begin{pmatrix}0\\\\1\\end{pmatrix}$ with margin 2`],
      ["D", `$w=\\begin{pmatrix}0\\\\1\\end{pmatrix}$ with margin 1`],
      ["E", `$w=\\begin{pmatrix}1\\\\0\\end{pmatrix}$ with margin 1`],
      ["F", `$w=\\frac1{\\sqrt2}\\begin{pmatrix}1\\\\1\\end{pmatrix}$ with margin 1`],
      ["G", `$w=\\frac1{\\sqrt5}\\begin{pmatrix}2\\\\1\\end{pmatrix}$ with margin 5`],
      ["H", `$w=\\frac1{\\sqrt5}\\begin{pmatrix}1\\\\2\\end{pmatrix}$ with margin 5`],
    ), correct:["E"], topic:"Kernels & Regression", difficulty:"Intermediate",
    figureNumber:12, figureAlt:"Scatter plot of the four labeled points used in Question 12.", figureCaption:"Classification dataset plot · Question 12.",
    explanation:`${DERIVED}The separating boundary $x_1=0$ has unit normal $w=(1,0)^\\top$ and the closest points lie at distance 1.` }),
  q({ number: 13, points: 2, title: "Surrogate classification losses",
    prompt: `Remember that the zero-one loss is given by

$$\\ell_{0-1}(z)=\\begin{cases}0&z\\ge0\\\\1&z<0.\\end{cases}$$

Which property is shared between the following “surrogate” loss functions?

hinge: $\\ell_{hinge}(z)=\\max\\{0,1-z\\}$

squared: $\\ell_{2seq}(z)=(1-z)^2$

logistic: $\\ell_{logistic}(z)/\\ln(2)=\\ln(1+e^{-z})/\\ln(2)$

exponential: $\\ell_{exp}(z)=e^{-z}$`,
    options: opts(
      ["A","Each one is an upper bound for the 0-1 loss."],
      ["B","Each one is a lower bound for the 0-1 loss."],
      ["C","Each one is differentiable on its whole domain."],
      ["D","They are equally robust to outliers."],
    ), correct:["A"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}Each listed surrogate is at least the zero-one loss for every margin value $z$.` }),
  q({ number: 14, points: 2, title: "Kernel induced by a feature map",
    prompt: `Consider the feature map $\\Phi:\\mathbb R\\to\\mathbb R^3$ defined as $\\Phi(x)=(x,x^2,e^x)^\\top$. Find the kernel $k(x,y)$ associated with $\\Phi$.`,
    options: opts(
      ["A", `$x+x^2+e^x$`], ["B", `$xy+e^{x+y}$`], ["C", `$x+y+x^2+y^2+e^{x+y}$`], ["D", `$x^2+y^2+xy+e^{x+y}$`],
      ["E", `$xy+(xy)^2+e^{x+y}$`], ["F", `$x+y+(xy)^2+e^{xy}$`], ["G", `$(xy+1)^2+e^{xy}$`], ["H", `$xy+(xy)^2$`],
    ), correct:["E"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}$k(x,y)=\\Phi(x)^\\top\\Phi(y)=xy+x^2y^2+e^{x+y}$.` }),
  q({ number: 15, points: 4, title: "Minimal polynomial-kernel feature dimension",
    prompt: `Let $x,x'\\in\\mathbb R^3$ and $k(x,x')=(x^\\top x'+1)^2$. What is the minimal dimensionality of a feature map $\\phi(x)$, such that $k(x,x')=\\phi(x)^\\top\\phi(x')$?`,
    options: opts(["A","6"],["B","9"],["C","10"],["D","12"],["E","13"],["F","15"],["G","16"],["H","27"]), correct:["C"], topic:"Kernels & Regression", difficulty:"Advanced",
    explanation:`${DERIVED}The inhomogeneous degree-2 polynomial kernel in three variables spans all monomials of degree at most 2, giving $\\binom{3+2}{2}=10$ features.` }),
  q({ number: 16, points: 1, title: "Sign of valid kernels",
    prompt: `Is the following statement True or False?

For every valid kernel $k(x,x')$, $k(x,x')\\ge0$ for all $x$ and $x'$.`,
    options: opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Positive semidefiniteness constrains Gram matrices but individual off-diagonal kernel values may be negative.` }),
  q({ number: 17, points: 1, title: "Ratio kernel validity",
    prompt: `For $x,x'\\in\\mathbb R^+$, define $k(x,x')=\\frac{\\max(x,x')}{\\min(x,x')}$.`,
    options: opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}For unequal points the off-diagonal value exceeds the diagonal values $k(x,x)=1$, which violates the PSD Cauchy-Schwarz constraint.` }),
  q({ number: 18, points: 1, title: "Sum of valid kernels",
    prompt: `For $x,x'\\in\\mathbb R^d$, define $k(x,x')=(x^\\top x'+1)^3+e^{(x^\\top x')}$.`,
    options: opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}Both the degree-3 polynomial kernel and the exponential dot-product kernel are valid, and sums of valid kernels are valid.` }),
];