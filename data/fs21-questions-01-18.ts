import type { Question } from "../types/question";
import { DERIVED, HUBER_SETUP, MODEL_EVAL_SETUP, REGRESSION_SETUP, opts, q } from "./fs21-common";

export const fs21Questions: Question[] = [
  q({ number:1, points:1, title:"Convexity of squared empirical risk", setup:REGRESSION_SETUP,
    prompt:String.raw`$\hat R_{\mathcal D}(w)$ is a convex function in $w$.`, options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}The squared least-squares objective is convex in the linear-model parameters.` }),
  q({ number:2, points:1, title:"Interpolation when n ≤ d", setup:REGRESSION_SETUP,
    prompt:String.raw`When $n\le d$ there always exists $w$ such that $\|y-Xw\|_2=0$.`, options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Full rank with $n\le d$ gives rank $n$, so $X:\mathbb R^d\to\mathbb R^n$ is onto.` }),
  q({ number:3, points:3, title:"Stochastic gradient descent update", setup:REGRESSION_SETUP,
    prompt:"We would like to minimize the empirical risk using stochastic gradient descent (with replacement). At time step $t$, what is the update formula?",
    options:opts(
      ["A",String.raw`$w_{t+1}=w_t+\eta_t(X^\top Xw_t-2X^\top y)$.`],
      ["B",String.raw`$w_{t+1}=w_t-\eta_t(2X^\top Xw_t-2X^\top y)$.`],
      ["C",String.raw`$w_{t+1}=w_t+\eta_t(2Xw_t-2XX^\top y)$.`],
      ["D",String.raw`$w_{t+1}=w_t-\eta_t(Xw_t-2XX^\top y)$.`],
      ["E",String.raw`$w_{t+1}=w_t+\eta_t(2y_i-2w_t^\top x_i)x_i$, for some randomly chosen $i\in\{1,2,\ldots,n\}$.`],
      ["F",String.raw`$w_{t+1}=w_t-\eta_t(2y_i-2w_t^\top x_i)x_i$, for some randomly chosen $i\in\{1,2,\ldots,n\}$.`],
      ["G",String.raw`$w_{t+1}=w_t+\eta_t(y_i-2w_t^\top x_i)x_i$, for some randomly chosen $i\in\{1,2,\ldots,n\}$.`],
      ["H",String.raw`$w_{t+1}=w_t-\eta_t(2y_i-w_t^\top x_i)x_i$, for some randomly chosen $i\in\{1,2,\ldots,n\}$.`],
    ), correct:["E"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}For one sampled point, gradient descent subtracts $2(w_t^\top x_i-y_i)x_i$, which is equivalent to option E.` }),
  q({ number:4, points:1, title:"Gradient descent decrease", setup:REGRESSION_SETUP,
    prompt:String.raw`At each iteration $t$ of the gradient descent algorithm, there exists a learning rate $\eta_t>0$ such that the objective decreases (either strictly decreases or stays the same).`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Optimization & Model Selection", difficulty:"Foundation",
    explanation:`${DERIVED}For the smooth quadratic objective, a sufficiently small positive gradient step is non-increasing.` }),
  q({ number:5, points:1, title:"SGD decrease", setup:REGRESSION_SETUP,
    prompt:String.raw`At each iteration $t$ of the stochastic gradient descent algorithm, there exists a learning rate $\eta_t>0$ such that the objective decreases (either strictly decreases or stays the same).`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Optimization & Model Selection", difficulty:"Foundation",
    explanation:`${DERIVED}A stochastic gradient need not be a descent direction for the full empirical objective.` }),

  q({ number:6, points:1, title:"Validation-set size", setup:MODEL_EVAL_SETUP,
    prompt:String.raw`$\hat R_{\mathcal D_{\rm val}}(\hat f_{\mathcal D_{\rm train}})$ is more likely to provide better a estimate of the true (population) risk $R(\hat f_{\mathcal D_{\rm train}})$, when using a validation set of size 500 as opposed to a validation set of size 1000.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Optimization & Model Selection", difficulty:"Foundation",
    explanation:`${DERIVED}A larger independent validation sample generally gives a lower-variance risk estimate.` }),
  q({ number:7, points:1, title:"Training-set size", setup:MODEL_EVAL_SETUP,
    prompt:String.raw`Choosing a training set of size 1000 is more likely to provide a model $\hat f_{\mathcal D_{\rm train}}$ that has a lower true (population) risk $R(\hat f_{\mathcal D_{\rm train}})$ compared to training set of size 2000.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Optimization & Model Selection", difficulty:"Foundation",
    explanation:`${DERIVED}All else equal, more training data is generally preferable for population performance.` }),
  q({ number:8, points:1, title:"Training versus validation risk", setup:MODEL_EVAL_SETUP,
    prompt:String.raw`The training risk (error) is always less than or equal to the validation risk (error), i.e., $\hat R_{\mathcal D_{\rm train}}(\hat f_{\mathcal D_{\rm train}})\le\hat R_{\mathcal D_{\rm val}}(\hat f_{\mathcal D_{\rm train}})$.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Optimization & Model Selection", difficulty:"Foundation",
    explanation:`${DERIVED}The inequality is not guaranteed for every random train/validation split.` }),
  q({ number:9, points:1, title:"Unbiased validation risk", setup:MODEL_EVAL_SETUP,
    prompt:String.raw`The validation risk in Equation (3) is an unbiased estimator of the true (population) risk i.e.,
$$\mathbb E_{\mathcal D}\!\left[\hat R_{\mathcal D_{\rm val}}(\hat f_{\mathcal D_{\rm train}})\right]=\mathbb E_{\mathcal D}\!\left[R(\hat f_{\mathcal D_{\rm train}})\right].$$`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Optimization & Model Selection", difficulty:"Foundation",
    explanation:`${DERIVED}The held-out observations are independent of the fitted model, so their average loss is unbiased for its population risk.` }),

  q({ number:10, points:3, title:"False discovery rate from a confusion matrix",
    prompt:String.raw`The table below shows the confusion matrix for a classifier $f$ on the Iris dataset, a dataset consisting of three different types of flowers as labels.

Predicted Class / Actual Class: Setosa, Versicolour, Virginica

Setosa: 20, 10, 20

Versicolour: 0, 50, 0

Virginica: 5, 5, 40

From the table, we derive a new binary classifier $f_{\rm binary}$ that predicts "Virginica" (label $y=+1$) when $f$ does and "not Virginica" (label $y=-1$) when $f$ predicts "Versicolour" or "Setosa". What is the false discovery rate (FDR) of $f_{\rm binary}$?

Reminder: $\mathrm{FDR}=\frac{\#FP}{\#FP+\#TP}$ where $\#FP$ is the number of false positives and $\#TP$ is the number of true positives.`,
    options:opts(["A",String.raw`$\frac13$`],["B",String.raw`$\frac15$`],["C",String.raw`$\frac14$`],["D",String.raw`$\frac12$`],["E",String.raw`$\frac19$`],["F",String.raw`$\frac35$`],["G","0"],["H",String.raw`$\frac25$`]),
    correct:["B"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}Predicted Virginica contains 10 false positives and 40 true positives, giving $10/(10+40)=1/5$.` }),
  q({ number:11, points:3, title:"Random classifier FNR",
    prompt:String.raw`A classifier $f:\mathcal X\to\{-1,+1\}$ is called a random classifier, if it assigns any $x\in\mathcal X$ independently to class $f(x)=\hat y=+1$ with probability $\rho$ and to class $f(x)=\hat y=-1$ with probability $1-\rho$ for some $0\le\rho\le1$. Taking the perspective of hypothesis testing, we call samples with predicted class $\hat y=+1$ positives and class $\hat y=-1$ negatives. Assume that the distribution of the data satisfies $P(x,y)$. We can compute the false positive rate $\mathrm{FPR}=P(\hat y=1\mid y=-1)$ and false negative rate $\mathrm{FNR}=P(\hat y=-1\mid y=+1)$ of random classifiers for different $\rho$. What is the smallest FNR that you can obtain with a random classifier with $\mathrm{FPR}\le0.25$ by tuning $\rho$?`,
    options:opts(["A","0"],["B",String.raw`$\frac18$`],["C",String.raw`$\frac14$`],["D",String.raw`$\frac38$`],["E",String.raw`$\frac12$`],["F",String.raw`$\frac58$`],["G",String.raw`$\frac34$`],["H","1"]),
    correct:["G"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}For a random classifier FPR=$\rho$ and FNR=$1-\rho$; the largest allowed $\rho$ is $1/4$, giving FNR $3/4$.` }),
  q({ number:12, points:4, title:"Conditional loss with abstention",
    prompt:String.raw`Assume that we are training a binary classifier $y=f(x)$ that is allowed to abstain, i.e., refrain from making a prediction. Therefore, we include an abstention label $r$ as part of its action (label) space, that is $f:\mathcal X\to\{+1,-1,r\}$. In order to ensure that the classifier does not always abstain, we introduce a cost $c>0$ for every abstention that the classifier makes. Given a labeled data sample $(x,y)$, the 0-1 loss with abstention is then given by
$$\ell(f(x),y)=\mathbf 1_{f(x)\ne y}\mathbf 1_{f(x)\ne r}+c\mathbf 1_{f(x)=r}.$$
For a given data distribution $P(x,y)$ and a fixed classifier $f$, the conditional expectation of the 0-1 loss given $x$, i.e., $\mathbb E[\ell(f(x),y)\mid x]$, can then be written as:`,
    options:opts(
      ["A",String.raw`$P(y=+1\mid x)(\mathbf1_{f(x)=-1}+\mathbf1_{f(x)=+1})+c\mathbf1_{f(x)=r}$.`],
      ["B",String.raw`$P(y=+1\mid x)\mathbf1_{f(x)=+1}+(1-P(y=+1\mid x))\mathbf1_{f(x)=-1}+c\mathbf1_{f(x)=r}$.`],
      ["C",String.raw`$P(y=+1\mid x)\mathbf1_{f(x)=-1}+(1-P(y=+1\mid x))\mathbf1_{f(x)=+1}+c\mathbf1_{f(x)=r}$.`],
      ["D",String.raw`$P(y=+1\mid x)\mathbf1_{f(x)=-1}+(1-P(y=+1\mid x))\mathbf1_{f(x)=+1}+(1-c)\mathbf1_{f(x)=r}$.`],
      ["E",String.raw`$P(y=+1\mid x)\mathbf1_{f(x)=+1}+(1-P(y=+1\mid x))\mathbf1_{f(x)=-1}+(1-c)\mathbf1_{f(x)=r}$.`],
      ["F",String.raw`$P(y=+1\mid x)(\mathbf1_{f(x)=-1}+\mathbf1_{f(x)=+1})+(1-c)\mathbf1_{f(x)=r}$.`],
    ), correct:["C"], topic:"Kernels & Regression", difficulty:"Advanced",
    explanation:`${DERIVED}Predicting $-1$ errs with probability $P(y=+1\mid x)$, predicting $+1$ errs with probability $1-P(y=+1\mid x)$, and abstention costs $c$.` }),

  q({ number:13, points:1, title:"Huber loss for large residuals", setup:HUBER_SETUP,
    prompt:String.raw`For large values of $|a|$, the Huber loss roughly behaves like the $\ell_{\rm abs}$ loss, in the sense that $\lim_{|a|\to+\infty}\frac{\ell_{H,\delta}(a)}{\ell_{\rm abs}(a)}$ evaluates to a finite constant.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    figureNumber:1, figureAlt:"Plots of the absolute, squared and Huber losses with delta equal to 1.", figureCaption:"Figure 1: Plots of the absolute, squared and Huber loss functions.",
    explanation:`${DERIVED}For large $|a|$, Huber grows linearly as $\delta|a|$ up to an additive constant.` }),
  q({ number:14, points:1, title:"Huber loss and feature selection", setup:HUBER_SETUP,
    prompt:String.raw`Consider running regression on a dataset $\{(x_i,y_i)\}_{i=1}^n$ with the Huber loss for a linear model to obtain
$$\hat w:=\arg\min_{w\in\mathbb R^d}\sum_{i=1}^n\ell_{H,\delta}(y_i-w^\top x_i).$$
We expect the solution vector $\hat w$ to be sparse, thus we can use the Huber loss for feature selection.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Huber changes the residual loss but does not impose a sparsity-inducing penalty on $w$.` }),
  q({ number:15, points:1, title:"Convexity of Huber loss", setup:HUBER_SETUP,
    prompt:String.raw`For any fixed value of $\delta>0$, the Huber loss is convex on $\mathbb R$.`, options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}The quadratic and linear pieces join with nondecreasing derivative, yielding a convex function.` }),

  q({ number:16, points:2, title:"Kernel regression feature space",
    prompt:"This question is regarding the task of regression. We want to compare using a fully connected neural network vs. using kernel regression. Which of the following statements is correct?",
    options:opts(
      ["A","For any choice of kernel, kernel regression methods implicitly operate on finite-dimensional feature spaces defined by the corresponding feature map."],
      ["B","When using a fully connected neural network, we can arrive at a closed-form solution."],
      ["C","Kernel regression can be considered as a linear model on an implicit feature space characterized by the kernel’s feature map."],
      ["D","Regardless of the kernel we use, kernel regression can only learn a polynomial function."],
    ), correct:["C"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}Kernel regression is linear in the (possibly infinite-dimensional) feature space induced by the kernel.` }),
  q({ number:17, points:4, title:"Feature map for linear separability",
    prompt:String.raw`Consider the dataset in Figure 2. Which of the following feature maps $\Phi:\mathbb R^2\to\mathbb R$ makes the classes linearly separable?

Reminder: The classes are linearly separable if there exists a threshold $\theta_0\in\mathbb R$ such $\Phi(x)\ge\theta_0$ for points $x$ from the first class, and $\Phi(x)<\theta_0$ for points $x$ from the second class.`,
    options:opts(
      ["A",String.raw`$\Phi(x)=(x_1+x_2)^2$`],
      ["B",String.raw`$\Phi(x)=(x_1x_2+1)^2$`],
      ["C",String.raw`$\Phi(x)=\left|\frac{x_1x_2}{\sqrt{x_1^2+x_2^2}}\right|$`],
      ["D",String.raw`$\Phi(x)=\left|\frac{x_1}{\sqrt{x_1^2+x_2^2}}\right|$`],
      ["E",String.raw`$\Phi(x)=\sqrt{x_1^2+x_2^2}$`],
      ["F",String.raw`$\Phi(x)=|x_1x_2|$`],
      ["G",String.raw`$\Phi(x)=x_1-x_2$`],
      ["H",String.raw`$\Phi(x)=\frac{x_1}{\sqrt{x_1^2+x_2^2}}$`],
    ), correct:["D"], topic:"Kernels & Regression", difficulty:"Advanced",
    figureNumber:2, figureAlt:"Dataset with two classes arranged in horizontal and vertical sectors.", figureCaption:"Figure 2: Dataset with two classes.",
    explanation:`${DERIVED}The classes are separated by direction rather than radius; $|x_1|/\sqrt{x_1^2+x_2^2}$ is large for the horizontal class and small for the vertical class.` }),
  q({ number:18, points:3, title:"Number of polynomial monomials",
    prompt:String.raw`Let $d\in\mathbb N$ be a fixed constant number. Let $h(m):\mathbb N\to\mathbb N$ denote the number of possible monomials (terms) of degree less or equal to $m$ over $d$ different variables $x=(x_1,\ldots,x_d)$. As an example for $d=2,m=2$, the number of all the possible monomials is 6: $1,x_1,x_2,x_1^2,x_2^2,x_1x_2$. What is the growth rate of $h(m)$?`,
    options:opts(["A",String.raw`$h(m)\in\Theta(m)$.`],["B",String.raw`$h(m)\in\Theta(m^2)$.`],["C",String.raw`$h(m)\in\Theta(d^m)$.`],["D",String.raw`$h(m)\in\Theta(m^d)$.`]),
    correct:["D"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}For fixed $d$, the number is $\binom{m+d}{d}=\Theta(m^d)$.` }),
];
