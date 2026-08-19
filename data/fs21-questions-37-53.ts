import type { Question } from "../types/question";
import { DERIVED, GAN_SETUP, GMM_SETUP, NN_TRAIN_SETUP, SOFT_EM_SETUP, opts, q } from "./fs21-common";

export const fs21Questions: Question[] = [
  q({ number:37, points:2, title:"Activation functions from learned curves", setup:NN_TRAIN_SETUP,
    prompt:"Figure 3 displays a training dataset and the learned function of 3 different neural networks that are trained on the dataset. The dataset consists of 100 scalar input-output pairs. All neural networks have one hidden layer with 20 units but differ in the choice of the activation function that are either the sigmoid, ReLu or identity function. Match the learned output function with the activation function that is used in the corresponding neural network.",
    options:opts(
      ["A","(A, B, C) = (sigmoid, ReLu, identity)"], ["B","(A, B, C) = (sigmoid, identity, ReLu)"],
      ["C","(A, B, C) = (ReLu, sigmoid, identity)"], ["D","(A, B, C) = (ReLu, identity, sigmoid)"],
      ["E","(A, B, C) = (identity, ReLu, sigmoid)"], ["F","(A, B, C) = (identity, sigmoid, ReLu)"],
    ), correct:["E"], topic:"Neural Networks", difficulty:"Intermediate",
    figureNumber:3, figureAlt:"Training dataset and three learned functions labeled A, B and C.", figureCaption:"Figure 3: Effect of different activation functions.",
    explanation:`${DERIVED}A is linear (identity), B is piecewise linear (ReLU), and C is smooth nonlinear (sigmoid).` }),
  q({ number:38, points:3, title:"Convolution output dimension", setup:NN_TRAIN_SETUP,
    prompt:String.raw`Assume the input to a convolutional layer is a $16\times19$ matrix and you perform a convolution with kernel size $4\times3$ with padding equal to 0 and horizontal and vertical strides equal to 2. After performing the convolution, you flatten the resulting matrix to a vector. What is the dimension of the resulting vector?`,
    options:opts(["A","56"],["B","58"],["C","63"],["D","64"]), correct:["C"], topic:"Neural Networks", difficulty:"Intermediate",
    explanation:`${DERIVED}The output dimensions are $\lfloor(16-4)/2\rfloor+1=7$ and $\lfloor(19-3)/2\rfloor+1=9$, so flattening gives $7\cdot9=63$.` }),

  q({ number:39, points:2, title:"Learning-rate behavior on a quadratic",
    prompt:String.raw`You are using gradient descent to find the minimum of the function $f(x)=x^2$. You experiment by fixing the number of iterations $T$ and trying different learning rates to find the one which leads to a better (smaller) solution. There are different possible settings, e.g., you choose a learning rate of zero (1), the optimal learning rate (2), a learning rate that is too large (3) or too small (4).

When initializing at point A on the plot below, which point of the plot are you most likely to reach with each learning rate setting? Match the settings 1, 2, 3, and 4 to the points on the plot indicated by letters A, B, C, and D.

1: learning rate of zero

2: optimal learning rate

3: too large learning rate

4: too small learning rate`,
    options:opts(
      ["A","1: A, 2: B, 3: C, 4: D"], ["B","1: A, 2: B, 3: D, 4: C"],
      ["C","1: A, 2: C, 3: B, 4: D"], ["D","1: A, 2: D, 3: B, 4: C"],
      ["E","1: D, 2: A, 3: C, 4: B"], ["F","1: D, 2: A, 3: B, 4: C"],
      ["G","1: C, 2: D, 3: B, 4: A"], ["H","1: C, 2: B, 3: D, 4: A"],
    ), correct:["D"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    figureNumber:39, figureAlt:"Plot of f(x)=x squared with points A, B, C and D marking possible gradient-descent outcomes.", figureCaption:"Gradient-descent learning-rate plot · Question 39.",
    explanation:`${DERIVED}Zero learning rate stays at A, the optimal rate reaches D, an overly large rate overshoots to B, and an overly small rate makes partial progress to C.` }),
  q({ number:40, points:2, title:"Momentum after reaching the optimum",
    prompt:String.raw`Now we use gradient descent with momentum to find the minimum of the function $f(x)=x^2$. We set both the momentum parameter $m$ and learning rate parameter $\eta$ to some strictly positive (nonzero) value. At the 2020'th time step we move from $x_{2019}\ne0$ to $x_{2020}=0$. We perform one more update to obtain $x_{2021}$. Which of the following is true?`,
    options:opts(["A",String.raw`$f(x_{2020})<f(x_{2021})$`],["B",String.raw`$f(x_{2020})>f(x_{2021})$`],["C",String.raw`$f(x_{2020})=f(x_{2021})$`]),
    correct:["A"], topic:"Optimization & Model Selection", difficulty:"Intermediate",
    explanation:`${DERIVED}At $x_{2020}=0$ the gradient is zero, but the nonzero momentum inherited from the previous step moves the iterate away from zero.` }),

  q({ number:41, points:2, title:"Bootstrap parameter estimates",
    prompt:"What is the advantage of using bootstrap parameter estimates in comparison with distribution-dependent parameter estimates? Choose the correct statement among the following.",
    options:opts(
      ["A","It is possible to compute the closed-form solution for bootstrap parameter estimates."],
      ["B","Bootstrap parameter estimates require less computational resources than distribution-dependent parameter estimates."],
      ["C","Bootstrap parameter estimates can be computed for any black-box predictor."],
      ["D","Distribution-based parameter estimates have asymptotic guarantees while bootstrap estimates do not."],
    ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Bootstrap procedures only require repeated resampling and refitting/evaluation, so they can be applied to black-box estimators.` }),
  q({ number:42, points:2, title:"Frequentist and Bayesian inference",
    prompt:String.raw`Consider a dataset $\mathcal D=\{x_i\}_{i=1}^n$ and assume that the likelihood function $P(\mathcal D\mid\theta)$ depends on some parameters $\theta$ to be estimated. Furthermore, we assume that we have access to the true prior $P(\theta)$ over the parameters. Choose the correct statement among the following.`,
    options:opts(
      ["A",String.raw`The maximum a posteriori (MAP) estimate and the maximum likelihood estimate (MLE) coincide, since they both involve a maximization of the likelihood $P(\mathcal D\mid\theta)$.`],
      ["B",String.raw`The posterior distribution over the parameters is given by $P(\theta\mid\mathcal D)=P(\mathcal D\mid\theta)P(\theta)$.`],
      ["C",String.raw`Both the MLE and the MAP estimates maximize $P(\mathcal D\mid\theta)$.`],
      ["D","The maximum likelihood estimate is a point estimate, whereas the maximum a posteriori estimate outputs a distribution."],
      ["E",String.raw`Frequentist inference results in a point estimate for $\theta$, whereas Bayesian inference naturally results in a distribution over $\theta$.`],
    ), correct:["E"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Bayesian inference naturally represents uncertainty through the posterior distribution over parameters, whereas standard frequentist estimation produces point estimates.` }),

  q({ number:43, points:3, title:"Likelihood in the movie mixture model", setup:SOFT_EM_SETUP,
    prompt:String.raw`Which of the following describes the likelihood $p(X)$ of a single data point?`,
    options:opts(
      ["A",String.raw`$q\sum_{i=1}^4p(X_i\mid C=1)+(1-q)\sum_{i=1}^4p(X_i\mid C=0)$`],
      ["B",String.raw`$(1-q)\sum_{i=1}^4p(X_i\mid C=1)+q\sum_{i=1}^4p(X_i\mid C=0)$`],
      ["C",String.raw`$q\prod_{i=1}^4p(X_i\mid C=1)+(1-q)\prod_{i=1}^4p(X_i\mid C=0)$`],
      ["D",String.raw`$(1-q)\prod_{i=1}^4p(X_i\mid C=1)+q\prod_{i=1}^4p(X_i\mid C=0)$`],
    ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Conditional independence gives a product of feature likelihoods within each cluster, and the marginal likelihood mixes the two cluster terms with weights $q$ and $1-q$.` }),
  q({ number:44, points:3, title:"Soft EM E-step", setup:SOFT_EM_SETUP,
    prompt:String.raw`The 5 movies above have the following feature vectors, respectively, where the bracket notation is used to represent a vector:

$(1,1,1,0)$: G, $\;(0,1,0,0)$: S, $\;(1,0,1,0)$: T, $\;(0,1,1,0)$: I, $\;(1,0,1,0)$: M.

E-Step

You initialize $\hat p(X\mid C=1)=\left(\frac18,\frac14,\frac34,\frac12\right)$ and $\hat p(X\mid C=0)=\left(\frac12,\frac12,\frac12,\frac12\right)$ and $\hat q=\frac12$. You use the soft expectation maximization (EM) algorithm to cluster the movies. After performing one E-step with this initialization, what is the assignment probability of G to cluster 1?`,
    options:opts(["A","0"],["B",String.raw`$\frac3{19}$`],["C",String.raw`$\frac3{16}$`],["D",String.raw`$\frac38$`],["E",String.raw`$\frac58$`],["F",String.raw`$\frac{13}{16}$`],["G",String.raw`$\frac{16}{19}$`],["H","1"]),
    correct:["B"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}For G, the unnormalized cluster-1 likelihood is $3/512$ and cluster-0 likelihood is $16/512$, giving posterior responsibility $3/19$.` }),
  q({ number:45, points:4, title:"Soft EM M-step", setup:SOFT_EM_SETUP,
    prompt:String.raw`M-Step

Assume that after one E-step, you get the following estimated assignment probability to cluster 1 for each movie, respectively: $\frac14,\frac13,\frac13,\frac23,\frac34$. Now you would like to update the estimate of the parameters. You have $\hat q=3/5$. The next step is an M-step. What will $\hat q$ be after this M-step?`,
    options:opts(["A","0"],["B",String.raw`$\frac1{15}$`],["C",String.raw`$\frac25$`],["D",String.raw`$\frac7{15}$`],["E",String.raw`$\frac8{15}$`],["F",String.raw`$\frac35$`],["G",String.raw`$\frac{14}{15}$`],["H","1"]),
    correct:["D"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}$\hat q$ is the mean responsibility: $(1/4+1/3+1/3+2/3+3/4)/5=7/15$.` }),
  q({ number:46, points:2, title:"Hard EM under swapped initialization", setup:SOFT_EM_SETUP,
    prompt:String.raw`You decide to try hard EM instead of soft EM. You use the same initialization of $\hat p$ and $\hat q$ as in Question 44. At convergence, you obtain the following clusters: cluster 0: $\{I\}$, cluster 1: $\{G,S,T,M\}$. Suppose you instead initialized with $\hat p(X\mid C=1)=\left(\frac12,\frac12,\frac12,\frac12\right)$ and $\hat p(X\mid C=0)=\left(\frac18,\frac14,\frac34,\frac12\right)$. Assume that each E-step results in a unique hard clustering. Which of the following describes the clusterings you would expect to see after convergence?`,
    options:opts(
      ["A","cluster 0: {T, M}, cluster 1: {G, S, I}"], ["B","cluster 0: {G, S, I}, cluster 1: {T, M}"],
      ["C","cluster 0: {I}, cluster 1: {G, S, T, M}"], ["D","cluster 0: {G, S, T, M}, cluster 1: {I}"],
      ["E","cluster 0: {G, I}, cluster 1: {S, T, M}"], ["F","cluster 0: {S, T, M}, cluster 1: {G, I}"],
      ["G","cluster 0: {}, cluster 1: {G, S, T, I, M}"], ["H","cluster 0: {G, S, T, I, M}, cluster 1: {}"],
    ), correct:["D"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Swapping the cluster-specific initial parameters swaps the cluster labels while preserving the same partition.` }),

  q({ number:47, points:1, title:"GMM initialization dependence", setup:GMM_SETUP,
    prompt:"The estimated cluster centers at convergence are independent of the initialization we use for the cluster centers.", options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}EM can converge to different local optima depending on initialization.` }),
  q({ number:48, points:1, title:"Parameters updated in the E-step", setup:GMM_SETUP,
    prompt:String.raw`In the E-step, you update your estimates of $\mu_i$ and $\Sigma_i$.`, options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}The E-step updates latent assignments/responsibilities; parameter estimates are updated in the M-step.` }),
  q({ number:49, points:1, title:"Hard EM versus k-means", setup:GMM_SETUP,
    prompt:String.raw`We want to fix $\Sigma_i$, $i=1,2$, to be some diagonal matrix. In this case, the only unknown parameters to estimate would be the cluster means $\mu_i$. Is it True or False that for any choice of diagonal $\Sigma_i$, the hard EM algorithm is equivalent to (outputs the same means as) Lloyd's heuristic for k-means?

Note: A diagonal matrix is by definition a matrix that has nonzero elements only on its diagonal.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}Hard EM reduces to ordinary k-means only under special covariance/prior choices, not for arbitrary diagonal covariances.` }),
  q({ number:50, points:3, title:"Hard-EM covariance update", setup:GMM_SETUP,
    prompt:String.raw`Hard EM

Let $z_t\in\{1,2\}$ be the cluster that point $x_t$ is currently assigned to, and $n_i$ be the number of points assigned to cluster $i$, and $n=n_1+n_2$. You estimate $\Sigma_1$ and $\Sigma_2$ separately and do not assume any particular structure for them. To estimate $\Sigma_1$ and $\Sigma_2$, you maximize the data log-likelihood fixing the current cluster assignments. The notation "$t:A_t$" means "the set of all $t$ for which statement $A_t$ is true". Let $\hat\mu_i=\frac1{n_i}\sum_{t:z_t=i}x_t$. When updating the estimate of $\Sigma_1$ in hard EM, the update can be written as $\hat\Sigma_1=\ldots$`,
    options:opts(
      ["A",String.raw`$\frac1{n_1+1}\sum_{t:z_t=1}(x_t-\hat\mu_1)(x_t-\hat\mu_1)^\top$`],
      ["B",String.raw`$\frac1{nw_1}\sum_{t:z_t=1}(x_t-\hat\mu_1)(x_t-\hat\mu_1)^\top$`],
      ["C",String.raw`$\frac1{n_1}\sum_{t:z_t=1}(x_t-\hat\mu_1)(x_t-\hat\mu_1)^\top$`],
      ["D",String.raw`$\frac1{n_1+1}\sum_{t:z_t=1}(x_t-\hat\mu_1)(x_t-\hat\mu_1)^\top+\frac1{n_2+1}\sum_{t:z_t=2}(x_t-\hat\mu_2)(x_t-\hat\mu_2)^\top$`],
      ["E",String.raw`$\frac1{n_1}\sum_{t:z_t=1}(x_t-\hat\mu_1)(x_t-\hat\mu_1)^\top+\frac1{n_2}\sum_{t:z_t=2}(x_t-\hat\mu_2)(x_t-\hat\mu_2)^\top$`],
      ["F",String.raw`$\frac1{nw_1}\sum_{t:z_t=1}(x_t-\hat\mu_1)(x_t-\hat\mu_1)^\top+\frac1{nw_2}\sum_{t:z_t=2}(x_t-\hat\mu_2)(x_t-\hat\mu_2)^\top$`],
      ["G",String.raw`$\frac1{nw_1}\sum_{t:z_t=1}x_tx_t^\top$`],
      ["H",String.raw`$\frac1{n_1}\sum_{t:z_t=1}x_tx_t^\top$`],
    ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}The Gaussian MLE covariance for cluster 1 is the average centered outer product over the $n_1$ points assigned to that cluster.` }),

  q({ number:51, points:1, title:"Optimal GAN generator", setup:GAN_SETUP,
    prompt:String.raw`If $D$ and $G$ both have enough capacity, i.e., if they can model arbitrary functions, the optimal $G$ will be such that $G(z)\sim p_{\rm data}$.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}At the ideal GAN equilibrium the generator distribution matches the data distribution.` }),
  q({ number:52, points:1, title:"GAN as a two-player game", setup:GAN_SETUP,
    prompt:"The objective above can be interpreted as a two-player game between $G$ and $D$.", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}GAN training is a minimax game between generator and discriminator.` }),
  q({ number:53, points:2, title:"Optimal discriminator probability", setup:GAN_SETUP,
    prompt:String.raw`Suppose that the probability of a training sample $x$ is $p_{\rm data}(x)=\frac1{100}$ and the probability of $x$ under $G$ is $p_G(x)=\frac1{50}$. Suppose that the discriminator $D$ is the globally optimal discriminator for $G$ with the above loss.

What is the probability of $D$ classifying $x$ as being from the generator?`,
    options:opts(["A",String.raw`$\frac12$`],["B",String.raw`$\frac13$`],["C",String.raw`$\frac23$`],["D",String.raw`$\frac14$`],["E",String.raw`$\frac34$`],["F",String.raw`$\frac16$`],["G","0"],["H","1"]),
    correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}The optimal discriminator assigns data probability $p_{\rm data}/(p_{\rm data}+p_G)=1/3$, hence generator probability $2/3$.` }),
];
