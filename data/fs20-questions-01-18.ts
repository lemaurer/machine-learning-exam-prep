import type { Question } from "../types/question";
import { DERIVED, KERNEL_SETUP, LINEAR_REGRESSION_SETUP, SVM_SETUP, opts, q } from "./fs20-common";

export const fs20Questions: Question[] = [
  q({ number:1, points:3, title:"OLS loss and feature changes", multipleSelect:true,
    prompt:"For OLS regression, which of the following will never increase the least squares loss? Hint: The bias term is the component of the weight vector associated with a constant feature for all samples.",
    options:opts(
      ["A","Setting the bias term to zero or not fitting a bias term."],
      ["B","Augmenting the set of features used for the regression."],
      ["C","Projecting all samples onto a lower dimensional feature space with PCA before performing regression on the projected samples."],
      ["D","Subtracting the empirical mean from the data before performing regression on the centered samples."],
    ), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}B. Adding features preserves every model available before augmentation, so the minimum training least-squares loss cannot increase.` }),

  q({ number:2, points:3, title:"Ridge bias and variance",
    prompt:"In general, how do the bias and variance properties of the ridge regression estimator compare to those of the ordinary least squares (OLS) estimator?",
    options:opts(
      ["A","The ridge regression estimator has larger bias and smaller variance than the OLS estimator."],
      ["B","The ridge regression estimator has larger bias and larger variance than the OLS estimator."],
      ["C","The ridge regression estimator has smaller bias and smaller variance than the OLS estimator."],
      ["D","The ridge regression estimator has smaller bias and larger variance than the OLS estimator."],
    ), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}A. Ridge shrinkage introduces bias while typically reducing estimator variance.` }),

  q({ number:3, points:3, title:"Ridge regression properties", multipleSelect:true,
    prompt:String.raw`Which of the following statements about ridge regression (with regularisation term $\lambda\|w\|_2^2$ and $\lambda>0$) are true?`,
    options:opts(
      ["A",String.raw`The norm of the optimal weight vector is a monotonically decreasing function of $\lambda$.`],
      ["B",String.raw`As $\lambda$ increases, model complexity decreases resulting in smaller bias and larger variance of the model.`],
      ["C","The regularisation term can be interpreted as a Laplacian prior on the weight vector."],
      ["D","The objective function has a unique optimiser."],
    ), correct:["A","D"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: A and D. Stronger L2 regularisation shrinks the optimum and makes the objective strongly convex for $\lambda>0$; the corresponding prior is Gaussian, not Laplacian.` }),

  q({ number:4, points:3, title:"Ridge training and test loss",
    prompt:String.raw`For a ridge regression task, which of the sketches in Figure 1 below is the most likely to describe the training and test loss as a function of $\lambda$ best (at least qualitatively)?`,
    options:opts(["A","A."],["B","B."],["C","C."],["D","D."]), correct:["A"], topic:"Kernels & Regression", difficulty:"Intermediate",
    figureNumber:1, figureAlt:"Four sketches A through D of training and test loss as a function of log lambda for ridge regression.", figureCaption:"Figure 1: Figures A.-D. qualitatively describe the training loss (solid line) and test loss (loosely dotted line) as a function of lambda.",
    explanation:`${DERIVED}A. Training loss increases with regularisation strength while test loss typically follows a U-shaped bias-variance curve.` }),

  q({ number:5, points:3, title:"Lasso regression properties", multipleSelect:true,
    prompt:"Which of the following statements about L1-regularised (Lasso) regression are true?",
    options:opts(
      ["A","The optimiser of the objective function can be computed in closed form."],
      ["B","Lasso regression selects a subset of the input features."],
      ["C","Standardising the data (centering and scaling variance of each feature to a value of one) will not change the optimal value of the objective function."],
      ["D","Greedy forward selection always selects a model with fewer features than Lasso regression."],
    ), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}B. The L1 penalty can set coefficients exactly to zero and therefore performs feature selection.` }),

  q({ number:6, points:3, title:"Greedy forward selection", multipleSelect:true,
    prompt:String.raw`Which of the following statements are true about greedy forward selection with $d$ features for regression?`,
    options:opts(
      ["A",String.raw`$O(2^d)$ models must be trained for greedy forward selection.`],
      ["B","It greedily adds features to reduce the training loss."],
      ["C","Greedy forward selection is faster than backward selection if only few features are relevant."],
      ["D","It always finds the subset of features with the lowest validation loss."],
    ), correct:["B","C"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: B and C. Forward selection greedily adds useful variables and can stop after few steps when only few features matter; it is not exhaustive and has no global-subset guarantee.` }),

  q({ number:7, points:3, title:"OLS closed-form minimiser", setup:LINEAR_REGRESSION_SETUP,
    prompt:"Which of the following expressions gives the minimiser of equation 1 in closed form?",
    options:opts(
      ["A",String.raw`$\hat w=(X^\top X)^{-1}Xy$`],
      ["B",String.raw`$\hat w=(X^\top X)^{-1}X^\top y$`],
      ["C",String.raw`$\hat w=(XX^\top)^{-1}Xy$`],
      ["D",String.raw`$\hat w=(XX^\top)^{-1}X^\top y$`],
    ), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}B. With $n>d$ and full column rank, the normal equations give $\hat w=(X^\top X)^{-1}X^\top y$.` }),

  q({ number:8, points:3, title:"OLS closed-form complexity", setup:LINEAR_REGRESSION_SETUP,
    prompt:"What is the computational complexity of computing the closed form solution?",
    options:opts(["A",String.raw`$\Theta(n^3)$`],["B",String.raw`$\Theta(n^2d)$`],["C",String.raw`$\Theta(nd^2)$`],["D",String.raw`$\Theta(d^3)$`]),
    correct:["C"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}C. Forming $X^\top X$ costs $\Theta(nd^2)$ and dominates inversion when $n>d$.` }),

  q({ number:9, points:3, title:"Squared-loss gradient", setup:LINEAR_REGRESSION_SETUP,
    prompt:String.raw`For large $n$ and $d$, instead of computing the closed form solution, you may consider minimising equation 1 using methods based on gradient descent. Such methods typically perform iterative updates
$$w_{t+1}=w_t-\eta_t\nabla L(w)|_{\{w=w_t\}},\tag{2}$$
where $w_t$ and $w_{t+1}$ are the solutions at iteration $t$ and $t+1$ respectively and $\eta_t$ is the step size at iteration $t$. What is the correct expression for $\nabla L(w)$?`,
    options:opts(
      ["A",String.raw`$X^\top Xw-2X^\top y$`],
      ["B",String.raw`$2Xw-2XX^\top y$`],
      ["C",String.raw`$2Xw-XX^\top y$`],
      ["D",String.raw`$2X^\top Xw-X^\top y$`],
      ["E",String.raw`$X^\top Xw-X^\top y$`],
      ["F",String.raw`$Xw-2XX^\top y$`],
      ["G",String.raw`$Xw-XX^\top y$`],
      ["H",String.raw`$2X^\top Xw-2X^\top y$`],
    ), correct:["H"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}H. Differentiating $\|y-Xw\|^2$ gives $2X^\top(Xw-y)$.` }),

  q({ number:10, points:3, title:"Gradient computation complexity", setup:LINEAR_REGRESSION_SETUP,
    prompt:String.raw`What is the computational complexity of computing $\nabla L(w)$ at a specific $w_t$?`,
    options:opts(
      ["A",String.raw`$\Theta(dn)$`],["B",String.raw`$\Theta(dn^2)$`],["C",String.raw`$\Theta(d^2n)$`],["D",String.raw`$\Theta(nd^2+n^2d)$`],
      ["E",String.raw`$\Theta(dn\log(d))$`],["F",String.raw`$\Theta(dn\log(n))$`],["G",String.raw`$\Theta(d^2n\log(d))$`],["H",String.raw`$\Theta(dn^2\log(n))$`],
    ), correct:["A"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}A. Compute $Xw$ and then $X^\top(Xw-y)$ without explicitly forming $X^\top X$, both in $\Theta(nd)$.` }),

  q({ number:11, points:3, title:"Optimal line-search step", setup:LINEAR_REGRESSION_SETUP,
    prompt:String.raw`It is possible to improve the gradient descent schedule by choosing an optimal step size. For example, we can use a line search and choose $\eta_t$ to optimise
$$\eta_t^*=\arg\min_{\eta\in\mathbb R}L(w_t-\eta J),\tag{3}$$
where $J=\nabla_wL|_{\{w=w_t\}}$. What is the optimal value $\eta_t^*$?`,
    options:opts(
      ["A",String.raw`$\frac{(y-Xw)^\top XJ}{\|XJ\|_2^2}$`],
      ["B",String.raw`$\frac{(y-Xw)^\top XJ}{\|y-Xw\|_2^2}$`],
      ["C",String.raw`$\frac{(Xw-y)^\top XJ}{\|XJ\|_2^2}$`],
      ["D",String.raw`$\frac{(Xw-y)^\top XJ}{\|y-Xw\|_2^2}$`],
      ["E",String.raw`$\frac{X^\top(y-Xw)J}{\|XJ\|_2^2}$`],
      ["F",String.raw`$\frac{X^\top(y-Xw)J}{\|y-Xw\|_2^2}$`],
      ["G",String.raw`$\frac{X^\top(Xw-y)J}{\|XJ\|_2^2}$`],
      ["H",String.raw`$\frac{X^\top(Xw-y)J}{\|y-Xw\|_2^2}$`],
    ), correct:["C"], topic:"Optimization & Model Selection", difficulty:"Advanced",
    explanation:`${DERIVED}C. Expanding $\|y-X(w-\eta J)\|^2$ and setting the scalar derivative to zero gives $\eta^*=(Xw-y)^\top XJ/\|XJ\|^2$.` }),

  q({ number:12, points:3, title:"Line-search step complexity", setup:LINEAR_REGRESSION_SETUP,
    prompt:"What is the computational complexity of performing one step of line search (including the computation of J)?",
    options:opts(
      ["A",String.raw`$\Theta(dn)$`],["B",String.raw`$\Theta(dn^2)$`],["C",String.raw`$\Theta(d^2n)$`],["D",String.raw`$\Theta(nd^2+n^2d)$`],
      ["E",String.raw`$\Theta(dn\log(d))$`],["F",String.raw`$\Theta(dn\log(n))$`],["G",String.raw`$\Theta(d^2n\log(d))$`],["H",String.raw`$\Theta(dn^2\log(n))$`],
    ), correct:["A"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}A. Computing $J$, $XJ$, and the required inner products is linear in the number of entries of $X$.` }),

  q({ number:13, points:1, title:"Kernel symmetry", setup:KERNEL_SETUP,
    prompt:String.raw`Let $x,x'\in\mathbb R$ and $k(x,x')=x^2+(x')^3+1$.`, options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}B. A valid kernel must be symmetric, while this expression is not symmetric in $x$ and $x'$.` }),

  q({ number:14, points:1, title:"Shifted squared dot-product kernel", setup:KERNEL_SETUP,
    prompt:String.raw`Let $x,x'\in\mathbb R^n$ and $k(x,x')=(x^\top x'-1)^2$.`, options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}B. The negative linear term can make the Gram matrix indefinite; for example points $1$ and $-1$ in one dimension give a negative eigenvalue.` }),

  q({ number:15, points:1, title:"Intersection-squared set kernel", setup:KERNEL_SETUP,
    prompt:String.raw`Let $A,B\subseteq\Omega$ for some finite set $\Omega$ and $k(A,B)=|A\cap B|^2$.`, options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}A. With binary indicator vectors, $|A\cap B|$ is an inner product and its square is a valid degree-2 polynomial kernel.` }),

  q({ number:16, points:1, title:"Negative symmetric-difference kernel", setup:KERNEL_SETUP,
    prompt:String.raw`Let $A,B\subseteq\Omega$ for some finite set $\Omega$ and $k(A,B)=2|A\cap B|-|A|-|B|$.`, options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}B. This equals $-|A\triangle B|$ and can produce an indefinite Gram matrix.` }),

  q({ number:17, points:1, title:"Exponential intersection kernel", setup:KERNEL_SETUP,
    prompt:String.raw`Let $A,B\subseteq\Omega$ for some finite set $\Omega$ and $k(A,B)=\exp\left(\frac12\cdot|A\cap B|\right).`, options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}A. This is $\exp(\frac12\langle a,b\rangle)$ on binary indicator vectors, whose power-series expansion is a nonnegative sum of valid polynomial kernels.` }),

  q({ number:18, points:3, title:"SVM stochastic gradient", setup:SVM_SETUP,
    prompt:String.raw`Let $B_t=\{A,B\}$, $w_t=(1,0)^\top$ and $b_t=-8$. What is $\nabla_wL(w,b,B_t)|_{w=w_t,b=b_t}$?`,
    options:opts(
      ["A",String.raw`$(-10,-9)^\top$`],["B",String.raw`$(-5,-8)^\top$`],["C",String.raw`$(-5,-1)^\top`],["D",String.raw`$(1,-7)^\top`],
      ["E",String.raw`$(1,0)^\top`],["F",String.raw`$(1,7)^\top`],["G",String.raw`$(6,1)^\top`],["H",String.raw`$(6,8)^\top`],
    ), correct:["B"], topic:"Kernels & Regression", difficulty:"Advanced",
    figureNumber:2, figureAlt:"Binary classification dataset in R2 with negative samples shown as filled circles and positive samples as diamonds, including labelled points A through F.", figureCaption:"Figure 2: Binary classification dataset D in R2 with y=-1 shown as a filled circle and y=+1 shown as a diamond.",
    explanation:`${DERIVED}B. Point A has zero hinge contribution at the stated parameters, while point B contributes $-(6,8)^\top$; adding the regularizer gradient $(1,0)^\top$ gives $(-5,-8)^\top$.` }),
];
