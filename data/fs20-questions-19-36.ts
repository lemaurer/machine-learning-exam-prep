import type { Question } from "../types/question";
import { BAYESIAN_REGRESSION_SETUP, DERIVED, SVM_SETUP, opts, q } from "./fs20-common";

export const fs20Questions: Question[] = [
  q({ number:19, points:3, title:"SVM support vectors", setup:SVM_SETUP, multipleSelect:true,
    prompt:"For the optimal SVM classifier $(w^*,b^*)$ that minimises the objective in Equation (4), which of the following labelled samples in the dataset (see again Figure 2) are support vectors? Hint: There may be other samples (not among the choices below) that are support vectors.",
    options:opts(["A","A."],["B","B."],["C","C."],["D","D."]), correct:["A"], topic:"Kernels & Regression", difficulty:"Advanced",
    figureNumber:2, figureAlt:"Binary classification dataset in R2 with negative samples shown as filled circles and positive samples as diamonds, including labelled points A through F.", figureCaption:"Figure 2: Binary classification dataset D in R2 with y=-1 shown as a filled circle and y=+1 shown as a diamond.",
    explanation:`${DERIVED}A. At the optimum, labelled point A lies on the negative margin and is a support vector; B, C and D lie farther inside the positive side.` }),

  q({ number:20, points:3, title:"Polynomial-kernel feature dimension",
    prompt:String.raw`You learn that the data points B, C and D in Figure 2 were incorrectly labelled and that they actually belong to the class $y=-1$ (filled circle symbol). You observe that the data is not anymore linearly separable in the input space. Therefore, you consider fitting a linear decision boundary in a higher dimensional space with feature map $\phi(x)\in\mathbb R^d$ for some $d\in\mathbb N$, $d>2$ instead. For this purpose, you set the bias $b=0$ and recall that the optimal weight vector $\hat w\in\mathbb R^d$ for the SVM classifier will be given by
$$\hat w=\sum_{i\in\mathcal D}\alpha_i y_i\phi(x_i).\tag{7}$$
where $\alpha_i\in\mathbb R$ for $i\in\mathcal D$ are some trained parameters. You decide to use the following kernel,
$$k(x_i,x_j)=\frac1{100}(x_i^\top x_j+1)^2.\tag{8}$$
What is the dimension of the feature vector $\phi(x)\in\mathbb R^d$ corresponding to the kernel given in Equation (8)?`,
    options:opts(["A",String.raw`$d=2$`],["B",String.raw`$d=3$`],["C",String.raw`$d=4$`],["D",String.raw`$d=5$`],["E",String.raw`$d=6$`],["F",String.raw`$d=7$`],["G",String.raw`$d=8$`],["H",String.raw`$d=9$`]),
    correct:["E"], topic:"Kernels & Regression", difficulty:"Advanced",
    figureNumber:2, figureAlt:"Binary classification dataset in R2 with negative samples shown as filled circles and positive samples as diamonds, including labelled points A through F.", figureCaption:"Figure 2: Binary classification dataset D in R2 with y=-1 shown as a filled circle and y=+1 shown as a diamond.",
    explanation:`${DERIVED}E. An inhomogeneous degree-2 polynomial kernel in two variables has the six monomials $1,x_1,x_2,x_1^2,x_1x_2,x_2^2$.` }),

  q({ number:21, points:3, title:"Kernel SVM signed margin",
    prompt:String.raw`Continuing from the previous question (with data points B, C and D belonging to class $y=-1$), assume the set of support vectors corresponding to the optimal SVM classifier $w^*$ with the kernel in Equation 8 is $S=\{A,B,E,F\}$ with $\alpha_A=2$, $\alpha_B=2$, $\alpha_E=3$, $\alpha_F=1$. Define the signed margin at a point $x$ as
$$\pi(x)=\hat w^\top\phi(x).\tag{9}$$
For the test point $x_T=(5,5)^\top$, using $k(x_A,x_T)=12.96$, $k(x_B,x_T)=50.41$, $k(x_E,x_T)=21.16$ and $k(x_F,x_T)=57.76$, compute its signed margin $\pi(x_T)$.`,
    options:opts(["A",String.raw`$\pi(x_T)=-25.92$`],["B",String.raw`$\pi(x_T)=-12.96$`],["C",String.raw`$\pi(x_T)=-5.50$`],["D",String.raw`$\pi(x_T)=-2.50$`],["E",String.raw`$\pi(x_T)=-1.00$`],["F",String.raw`$\pi(x_T)=0.00$`],["G",String.raw`$\pi(x_T)=20.42$`],["H",String.raw`$\pi(x_T)=31.10$`]),
    correct:["C"], topic:"Kernels & Regression", difficulty:"Advanced",
    figureNumber:2, figureAlt:"Binary classification dataset in R2 with negative samples shown as filled circles and positive samples as diamonds, including labelled points A through F.", figureCaption:"Figure 2: Binary classification dataset D in R2 with y=-1 shown as a filled circle and y=+1 shown as a diamond.",
    explanation:`${DERIVED}C. Using $\pi(x_T)=\sum_i\alpha_i y_i k(x_i,x_T)$ gives $-2(12.96)-2(50.41)+3(21.16)+57.76=-5.50$.` }),

  q({ number:22, points:3, title:"ROC curve properties", multipleSelect:true,
    prompt:String.raw`For a binary classification problem, let $f(x):\mathcal X\to\mathbb R$ be a predictor for which a classifier can be defined as
$$\hat y_\tau(x)=\begin{cases}1&\text{if }f(x)>\tau,\\0&\text{otherwise,}\end{cases}\tag{10}$$
for any decision threshold $\tau\in\mathbb R$. Which of the following statements about the ROC curve of $f$ is true?`,
    options:opts(
      ["A","The ROC curve is increasing and concave for any $f$."],
      ["B",String.raw`The ROC curve plots the true positive rate (y-axis) against the false positive rate (x-axis) for classifiers obtained from $f$ at different thresholds $\tau$.`],
      ["C",String.raw`The area under the ROC curve associated with a random predictor $f(x)\overset d=\operatorname{Uniform}(0,1)$, is one half (in expectation), even if the dataset is imbalanced. Hint: The notation $f(x)\overset d=\operatorname{Uniform}(0,1)$ means for any $x$ a number is sampled uniformly at random from the interval $[0,1]$.`],
      ["D","The area under the ROC curve associated with a perfect predictor $f$ is 1."],
    ), correct:["B","C","D"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: B, C and D. An ROC curve need not be concave for an arbitrary scoring function.` }),

  q({ number:23, points:3, title:"F1 score from confusion matrix",
    prompt:"The table above shows the confusion matrix for a binary classifier. What is the F1 score of this binary classifier given the results in the table?\n\nPositive Prediction: 10 Positive Condition, 30 Negative Condition\n\nNegative Prediction: 10 Positive Condition, 50 Negative Condition",
    options:opts(["A",String.raw`$\frac14$`],["B",String.raw`$\frac13$`],["C",String.raw`$\frac12$`],["D",String.raw`$\frac35$`]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}B. Precision is $10/(10+30)=1/4$ and recall is $10/(10+10)=1/2$, giving F1 $=1/3$.` }),

  q({ number:24, points:3, title:"Logistic-regression decision threshold",
    prompt:String.raw`Consider a (binary) logistic regression model $P(Y=y\mid x,w)=\frac1{1+\exp(-yw^\top x)}$ parameterized by $w$ and define a classifier with the rule $P(Y=1\mid x,w)>0.9$ as follows
$$\hat y_w(x)=\begin{cases}+1&\text{if }P(Y=1\mid x,w)>0.9,\\-1&\text{otherwise.}\end{cases}\tag{11}$$
Which of the following expressions does the rule $P(Y=1\mid x,w)>0.9$ simplify to?`,
    options:opts(["A",String.raw`$w^\top x>0.9$`],["B",String.raw`$w^\top x>\ln(0.9)$`],["C",String.raw`$w^\top x>-1/9$`],["D",String.raw`$w^\top x>-\ln(1/9)$`]),
    correct:["D"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}D. Solving $\sigma(w^\top x)>0.9$ gives $w^\top x>\log(9)=-\log(1/9)$.` }),

  q({ number:25, points:3, title:"Temperature scaling in softmax", multipleSelect:true,
    prompt:String.raw`Consider a multi-class logistic regression model with $K$ classes. Recall the model maintains parameters $w_k$ for each class $k\in\{1,\ldots,K\}$. You can temper the output probabilities introducing a temperature parameter $\tau>0$. For test point $x$, the model then predicts probability for class $k$ as
$$P_\tau(Y=k\mid x)=\frac{\exp(w_k^\top x/\tau)}{\sum_{i=1}^K\exp(w_i^\top x/\tau)}.$$
Let $\hat y_\tau=\arg\max_kP_\tau(Y=k\mid x)$ be the predicted class label at temperature $\tau$. Which of the following statements about tempered multi-class logistic regression are true?`,
    options:opts(
      ["A",String.raw`For all $\tau>0$, the predicted class label $\hat y_\tau$ is the same.`],
      ["B",String.raw`If $\tau\ne1$, the predicted class probabilities no longer outputs valid class probabilities, i.e., $\sum_{k=1}^KP_\tau(Y=k\mid x)\ne1$.`],
      ["C",String.raw`In general, as the temperature increases without bound ($\tau\to\infty$), the predicted class probability converges to one, such that $P_\tau(Y=\hat y_\tau\mid x)\to1$.`],
      ["D",String.raw`In general, as the temperature decreases to zero ($\tau\to0^+$), the class distribution converges to a uniform distribution and $P_\tau(Y=\hat y_\tau\mid x)\to\frac1K$.`],
    ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}A. Positive temperature scaling preserves the ordering of logits; large temperature approaches uniform probabilities and small temperature approaches a one-hot distribution.` }),

  q({ number:26, points:3, title:"MAP objective", setup:BAYESIAN_REGRESSION_SETUP, multipleSelect:true,
    prompt:"Which of the following optimisation problems solves correctly for the MAP (maximum-a-posteriori) estimate?",
    options:opts(
      ["A",String.raw`$\arg\max_\theta p(\theta)\prod_{i=1}^np_\theta(y_i\mid x_i)$`],
      ["B",String.raw`$\arg\max_\theta\prod_{i=1}^np(\theta)p_\theta(y_i\mid x_i)$`],
      ["C",String.raw`$\arg\min_\theta\log p(\theta)+\sum_{i=1}^np_\theta(y_i\mid x_i)$`],
      ["D",String.raw`$\arg\min_\theta-\log p(\theta)-\sum_{i=1}^n\log p_\theta(y_i\mid x_i)$`],
    ), correct:["A","D"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: A and D. MAP maximizes prior times likelihood, equivalently minimizes the negative log posterior.` }),

  q({ number:27, points:3, title:"Laplace prior as L1 regularization", setup:BAYESIAN_REGRESSION_SETUP,
    prompt:String.raw`For the given model, MAP estimation may be written as a regularized least squares optimization problem in the following form
$$\arg\min_\theta\sum_{i=1}^n(y_i-h_\theta(x_i))^2+\lambda C(\theta),\tag{12}$$
where $h_\theta(x)=\theta_0+\theta_1x+\theta_2x^2$. Recall that the density of the $\operatorname{Laplace}(0,s)$ distribution is given by
$$p(\theta)=\frac1{2s}\exp\left(-\frac{|\theta|}{s}\right).$$
What are the correct expressions for $\lambda$ and $C$ in Equation (12)?`,
    options:opts(
      ["A",String.raw`$\lambda=\frac{2}{s\sigma^2}$ and $C(\theta)=-\sum_{i=0}^2|\theta_i|$`],
      ["B",String.raw`$\lambda=\frac{1}{s\sigma^2}$ and $C(\theta)=\sum_{i=0}^2|\theta_i|$`],
      ["C",String.raw`$\lambda=\frac{2\sigma^2}{s}$ and $C(\theta)=\sum_{i=0}^2|\theta_i|$`],
      ["D",String.raw`$\lambda=\frac{\sigma^2}{s}$ and $C(\theta)=-\sum_{i=0}^2|\theta_i|$`],
    ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}C. Multiplying the negative log posterior by $2\sigma^2$ yields squared error plus $(2\sigma^2/s)\|\theta\|_1$.` }),

  q({ number:28, points:3, title:"k-means properties", multipleSelect:true,
    prompt:"Which of the following statements are true about k-means clustering?",
    options:opts(
      ["A","It seeks cluster centres and assignments to minimise the within-cluster sum of squares."],
      ["B","It is appropriate if the underlying clusters are separable, spherical and approximately of same size."],
      ["C","For fixed assignments of sample points to cluster centres, computing the optimal cluster centres is a non-convex optimisation problem."],
      ["D","k-means clustering can be kernelised."],
    ), correct:["A","B","D"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation",
    explanation:`${DERIVED}Correct answers: A, B and D. With assignments fixed, each optimal centre is simply the mean of its assigned points.` }),

  q({ number:29, points:3, title:"Lloyd algorithm properties", multipleSelect:true,
    prompt:"Which of the following statements are true about Lloyd’s algorithm for k-means clustering?",
    options:opts(
      ["A","It cannot cycle; i.e. it does never return to a particular solution after having previously changed to a different solution."],
      ["B","It always terminates with the globally optimal solution."],
      ["C","The number of iterations until convergence is guaranteed to be polynomial in the number of cluster centres and data points."],
      ["D","Using specialised initialisation schemes (e.g. k-means++) can improve the quality of solutions found by the algorithm and reduce its runtime."],
    ), correct:["A","D"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: A and D. Lloyd iterations monotonically improve the finite assignment objective but need not find the global optimum and have no general polynomial iteration bound.` }),

  q({ number:30, points:3, title:"Selecting number of clusters", multipleSelect:true,
    prompt:String.raw`In k-means, how can the number of cluster centers $k$ be selected?`,
    options:opts(
      ["A",String.raw`By using a heuristic like the elbow method that identifies the diminishing returns from increasing $k$.`],
      ["B",String.raw`By using an information criterion that regularises solutions to favour simpler models with lower $k$.`],
      ["C",String.raw`By using a validation set to select the best $k$ on the held-out data.`],
      ["D",String.raw`By using an algorithm like Lloyd’s algorithm that automatically selects $k$ during runtime.`],
    ), correct:["A","B","C"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: A, B and C. Lloyd’s algorithm requires $k$ to be specified rather than selecting it automatically.` }),

  q({ number:31, points:3, title:"PCA properties", multipleSelect:true,
    prompt:"Which of the following is true about principal component analysis (PCA)?",
    options:opts(
      ["A","PCA is a supervised learning algorithm."],
      ["B","PCA is a method for non-linear dimension reduction."],
      ["C","If the underlying data distribution is a Gaussian distribution with diagonal covariance matrix, then PCA is equivalent to k-means clustering."],
      ["D","PCA can be kernelised."],
    ), correct:["D"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation",
    explanation:`${DERIVED}D. Standard PCA is unsupervised and linear, while kernel PCA provides a kernelized extension.` }),

  q({ number:32, points:3, title:"First principal component", multipleSelect:true,
    prompt:"Which of the following is true about the first principal component found by PCA?",
    options:opts(
      ["A","It is orthogonal to all other principal components found by PCA."],
      ["B","It is the direction that minimises the variance of the projected data."],
      ["C",String.raw`Scaling some of the features with a factor $c>1$ does not change the first principal component if the data is centred.`],
      ["D","It corresponds to a line that minimises the sum of squares of the distances of the sample points from that line."],
    ), correct:["A","D"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: A and D. The first PC maximizes projected variance, is orthogonal to the remaining PCs, and equivalently minimizes orthogonal reconstruction error.` }),

  q({ number:33, points:3, title:"PCA of correlated Gaussian data", multipleSelect:true,
    prompt:String.raw`Assume you are given data $\mathcal D=\{x_i\}_{i=1}^n$ with each $x_i\sim\mathcal N(0,C)$ and $C=\begin{pmatrix}1&0.8\\0.8&1\end{pmatrix}$. Which of the following statements is true for performing PCA on $\mathcal D$?`,
    options:opts(
      ["A",String.raw`The expected value of the first principal component is $\mathbb E[w_1]=(\frac1{\sqrt2},-\frac1{\sqrt2})^\top$.`],
      ["B","The variance associated with the first and second principal component is the same in expectation."],
      ["C",String.raw`Assuming instead $x_i\sim\mathcal N(0,C')$ with $C'=\begin{pmatrix}1&0.5\\0.5&1\end{pmatrix}$ does not change the principal components in expectation.`],
      ["D","The first two principal components are sufficient to perfectly reconstruct the data."],
    ), correct:["C","D"], topic:"Clustering & Dimensionality Reduction", difficulty:"Advanced",
    explanation:`${DERIVED}Correct answers: C and D. Both covariance matrices have eigenvectors along $(1,1)$ and $(1,-1)$, and two PCs span the full two-dimensional data space.` }),

  q({ number:34, points:3, title:"Backpropagation properties", multipleSelect:true,
    prompt:"Which of the following statements about backpropagation used for computing gradients when training neural networks are true?",
    options:opts(
      ["A","It can be applied to compute gradients for neural networks for unsupervised learning."],
      ["B","On GPU, its computation can be easily parallelised over the different layers."],
      ["C","It is based on the chain rule for differentiation."],
      ["D","Its running time grows quadratically in the number of parameters in a feedforward network."],
    ), correct:["A","C"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}Correct answers: A and C. Backprop is reverse-mode chain-rule differentiation and applies to differentiable unsupervised objectives as well; dependencies across layers prevent simple layer-wise parallelization.` }),

  q({ number:35, points:3, title:"Vanishing gradients", multipleSelect:true,
    prompt:"Which of the following statements about the vanishing gradient problem in neural networks are true?",
    options:opts(
      ["A","A neural network that suffers from vanishing gradients for one training example will suffer from vanishing gradients for all training examples."],
      ["B","Neural networks with ReLU activations are typically less susceptible to suffer from vanishing gradients than those with sigmoid activations."],
      ["C","Shallow networks do not suffer from vanishing gradients regardless of their weight initialisation."],
      ["D","Batch Normalization can sometimes alleviate the vanishing gradient problem."],
    ), correct:["B","D"], topic:"Neural Networks", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: B and D. ReLU and normalization can improve gradient propagation; vanishing behavior can depend on the input and initialization.` }),

  q({ number:36, points:3, title:"Nonlinear activation functions", multipleSelect:true,
    prompt:"Which of the following statements about nonlinear activation functions in neural networks are true?",
    options:opts(
      ["A","On GPUs, they can speed up the gradient calculation in backpropagation as compared to linear units."],
      ["B","They help to learn nonlinear decision boundaries."],
      ["C","They are often only applied to the output units."],
      ["D","They are everywhere differentiable."],
    ), correct:["B"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}B. Nonlinear activations give networks nonlinear expressive power; common activations such as ReLU are not everywhere differentiable.` }),
];
