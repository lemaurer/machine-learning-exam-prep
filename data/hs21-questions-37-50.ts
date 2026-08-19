import type { Question } from "../types/question";
import { DECISION_SETUP, DERIVED, EM_SETUP, GAN_SETUP, opts, q } from "./hs21-common";

export const hs21Questions: Question[] = [
  q({ number:37, points:3, title:"Bayes classifier with abstention", setup:DECISION_SETUP,
    prompt:`Assume that we want to train a classifier $y=f(x)$ where labels $y$ take values $y\\in\\{1,-1\\}$. We extend the action (label) space and allow the classifier to abstain i.e., refrain from making a prediction. This extends the label space to $\\hat y\\in\\{+1,-1,r\\}$. In order to make sure the classifier does not always abstain, we introduce a cost $c>0$ for an abstention. The resulting 0-1 loss with abstention is given by:

$$\\ell(f(x),y)=\\mathbf 1_{f(x)\\ne y}\\mathbf 1_{f(x)\\ne r}+c\\mathbf 1_{f(x)=r}.$$

An (Bayes) optimal classifier is one that minimizes the expected loss (risk) under the known conditional distribution. For a given input $x$, for which range of $c$ should the optimal classifier abstain from predicting $+1$ or $-1$?`,
    options:opts(
      ["A",`$c<\\max\\{p(x),1-p(x)\\}$`],
      ["B",`$c>\\min\\{p(x),1-p(x)\\}$`],
      ["C",`$c<\\min\\{p(x),1-p(x)\\}$`],
      ["D",`$c>1-\\min\\{p(x),1-p(x)\\}$`],
      ["E",`$c>1-p(x)$`],
      ["F",`$c<p(x)$`],
    ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Predicting $+1$ has risk $1-p(x)$, predicting $-1$ has risk $p(x)$, and abstaining has risk $c$. Abstention is optimal when $c<\\min\\{p(x),1-p(x)\\}$.` }),
  q({ number:38, points:2, title:"Asymmetric quantile loss", setup:DECISION_SETUP,
    prompt:`We want to use regression with the quantile loss to estimate the current price $y$ of our house given features $x$, defined as

$$\\ell(f(x),y)=\\tau\\max(y-f(x),0)+(1-\\tau)\\max(f(x)-y,0).$$

Here, $\\tau\\in(0,1)$ is a parameter that balances overestimation and underestimation errors.

As we have enough time to sell the house, overestimation errors of the predictor are less critical than underestimation errors. Which of the asymmetric loss functions in Figure 3 would you use for the estimation of the current price of your house?`,
    options:opts(["A","A"],["B","B"],["C","C"],["D","D"]), correct:["D"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    figureNumber:3, figureAlt:"Four candidate asymmetric quantile loss functions labeled A through D.", figureCaption:"Figure 3: Different quantile loss functions.",
    explanation:`${DERIVED}Underestimation corresponds to $f(x)<y$ and should have the steeper branch. Panel D penalizes underestimation more strongly while retaining a smaller positive overestimation penalty.` }),

  q({ number:39, points:2, title:"Complete-data likelihood for censored lifetimes", setup:EM_SETUP,
    prompt:`What is the log-likelihood $\\log p(X,Y,Z\\mid\\theta)$?`,
    options:opts(
      ["A",`$\\log p(X,Y,Z\\mid\\theta)=-(N+M)\\log\\theta-\\frac1\\theta\\sum_{i=1}^N Y_i-\\frac1\\theta\\sum_{j=1}^M Z_j$`],
      ["B",`$\\log p(X,Y,Z\\mid\\theta)=-(N+M)\\log\\theta-\\theta\\sum_{i=1}^N Y_i-\\theta\\sum_{j=1}^M Z_j$`],
      ["C",`$\\log p(X,Y,Z\\mid\\theta)=-N\\log\\theta-\\theta\\sum_{i=1}^N Y_i-\\theta\\sum_{j=1}^M Z_j$`],
      ["D",`$\\log p(X,Y,Z\\mid\\theta)=-M\\log\\theta-\\frac1\\theta\\sum_{i=1}^N Y_i-\\frac1\\theta\\sum_{j=1}^M Z_j$`],
    ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Each of the $N+M$ complete exponential lifetimes contributes $-\\log\\theta-z/\\theta$.` }),
  q({ number:40, points:3, title:"Conditional lifetime of a surviving bulb", setup:EM_SETUP,
    prompt:`What is $E_1(\\theta')\\triangleq\\mathbb E[Z_j\\mid X_j=1,\\theta']$?`,
    options:opts(["A",`$\\theta'+t$`],["B",`$\\frac1{\\theta'}+t$`],["C",`$t\\theta'+t$`],["D",`$\\frac{t}{\\theta'}+t$`]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}By the memoryless property of the exponential distribution, conditional on surviving to $t$ the expected additional lifetime is $\\theta'$, so the total is $t+\\theta'$.` }),
  q({ number:41, points:2, title:"Conditional lifetime of an expired bulb", setup:EM_SETUP,
    prompt:`What is $E_0(\\theta')\\triangleq\\mathbb E[Z_j\\mid X_j=0,\\theta']$?`,
    options:opts(
      ["A",`$\\theta'-\\frac{t e^{-t/\\theta'}}{1-e^{-t/\\theta'}}$`],
      ["B",`$\\theta'-\\frac{2t e^{-t/\\theta'}}{1-e^{-t/\\theta'}}$`],
      ["C",`$\\theta'-\\frac{1-e^{-t/\\theta'}}{t e^{-t/\\theta'}}$`],
      ["D",`$\\frac1{\\theta'}-\\frac{t e^{-t/\\theta'}}{1-e^{-t/\\theta'}}$`],
    ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}Conditioning an exponential lifetime on $Z_j<t$ gives the truncated mean $\\theta'-t e^{-t/\\theta'}/(1-e^{-t/\\theta'})$.` }),
  q({ number:42, points:2, title:"EM expected complete-data log-likelihood", setup:EM_SETUP,
    prompt:`We define the expected complete data log-likelihood $Q(\\theta,\\theta')$ to be

$$Q(\\theta,\\theta')\\triangleq\\mathbb E_Z[\\log p(X,Y,Z\\mid\\theta)\\mid X,Y,\\theta']$$

and

$$k\\triangleq\\sum_{j=1}^M\\mathbf 1_{\\{X_j=1\\}}$$

to be the number of light bulbs still working at time $t$ in the second experiment. What is $Q(\\theta,\\theta')$?`,
    options:opts(
      ["A",`$Q(\\theta,\\theta')=-(N+M)\\log\\theta-\\frac1\\theta\\sum_{i=1}^N y_i-\\frac{k}{\\theta}E_1(\\theta')-\\frac{M-k}{\\theta}E_0(\\theta')$`],
      ["B",`$Q(\\theta,\\theta')=-(N+M)\\log\\theta'-\\frac1{\\theta'}\\sum_{i=1}^N y_i-\\frac{k}{\\theta'}E_1(\\theta)-\\frac{M-k}{\\theta'}E_0(\\theta)$`],
      ["C",`$Q(\\theta,\\theta')=-(N+M)\\log\\theta-\\theta\\sum_{i=1}^N y_i-\\theta kE_1(\\theta')-\\theta(M-k)E_0(\\theta')$`],
      ["D",`$Q(\\theta,\\theta')=-(N+M)\\log\\theta'-\\theta'\\sum_{i=1}^N y_i-\\theta'kE_1(\\theta)-\\theta'(M-k)E_0(\\theta)$`],
    ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}Take the expectation of the complete-data log-likelihood under the conditional distributions of the censored $Z_j$, separating the $k$ surviving and $M-k$ expired bulbs.` }),
  q({ number:43, points:1, title:"Non-convexity of GMM likelihood",
    prompt:`The MLE objective for Gaussian mixture models (GMM) is non-convex with respect to the cluster’s means, covariances, and weights when we have strictly more than one Gaussian in the mixture.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}Mixture-model likelihoods are generally non-convex and can have multiple local optima.` }),
  q({ number:44, points:1, title:"Semi-supervised EM for GMMs",
    prompt:`An EM algorithm can also be used to fit GMMs in the semi-supervised setting, where some data points are labeled and some are unlabeled.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}Known labels can be treated as observed component assignments and unknown labels as latent assignments within EM.` }),
  q({ number:45, points:1, title:"Monotonicity of soft EM",
    prompt:`We fit a GMM to a dataset utilizing the (soft) EM algorithm. We compute the log-likelihood of the data after each iteration. During this process the log-likelihood of the data never decreases.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}Exact EM updates are guaranteed not to decrease the observed-data log-likelihood.` }),
  q({ number:46, points:2, title:"Choosing GMM covariance structures",
    prompt:`You get 2D scatter plots of 3 different sets of data points (A, B, C respectively, see Figure below). You decide to cluster them with GMMs. You could model the covariance matrices of the two clusters as spherical, unrestricted, and diagonal. For datasets A, B, and C, assign the most appropriate covariance matrix.`,
    options:opts(
      ["A","A: spherical, B: unrestricted, C: diagonal"],
      ["B","A: spherical, B: diagonal, C: unrestricted"],
      ["C","A: unrestricted, B: spherical, C: diagonal"],
      ["D","A: diagonal, B: spherical, C: unrestricted"],
      ["E","A: unrestricted, B: diagonal, C: spherical"],
      ["F","A: diagonal, B: unrestricted, C: spherical"],
    ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    figureNumber:4, figureAlt:"Three two-dimensional clustered datasets A, B and C with diagonal, spherical and axis-aligned shapes.", figureCaption:"Scatter plots A, B, and C · Question 46.",
    explanation:`${DERIVED}Dataset A is tilted and needs unrestricted covariance; B is roughly isotropic and suits spherical covariance; C is axis-aligned but anisotropic and suits diagonal covariance.` }),

  q({ number:47, points:2, title:"Optimal GAN discriminator", setup:GAN_SETUP,
    prompt:`Consider a fixed data point $x$ with probability density $p_{data}(x)$. Suppose the probability density of $x$ under the (not necessarily optimal) trained generator is $p_G(x)$. Moreover, assume that the trained discriminator $D^*$ is the optimal discriminator for $G$, based on the loss above. That is:

$$D^*=\\arg\\max_D\\;\\mathbb E_{x\\sim p_{data}}[\\log D(x)]+\\mathbb E_z[\\log(1-D(G(z)))],$$

For the data point $x$, what is $D^*(x)$?`,
    options:opts(
      ["A",`$D(x)=\\frac{p_G(x)}{p_G(x)+p_{data}(x)}$`],
      ["B",`$D(x)=\\frac{p_{data}(x)}{p_G(x)+p_{data}(x)}$`],
      ["C","0"], ["D","1"], ["E","Not enough information"],
    ), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}Maximizing the discriminator objective pointwise gives $D^*(x)=p_{data}(x)/(p_{data}(x)+p_G(x))$.` }),
  q({ number:48, points:1, title:"SVM: generative or discriminative?", setup:GAN_SETUP,
    prompt:`GANs can be used for the task of learning a generative model of data. However, GANs are not the only generative models we have seen in the course. Indicate whether each of the following models is generative or discriminative.

Support Vector Machines.`,
    options:opts(["A","Generative Model"],["B","Discriminative Model"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}Support Vector Machines directly learn a decision rule or boundary and are discriminative models.` }),
  q({ number:49, points:1, title:"GMM: generative or discriminative?", setup:GAN_SETUP,
    prompt:`GANs can be used for the task of learning a generative model of data. However, GANs are not the only generative models we have seen in the course. Indicate whether each of the following models is generative or discriminative.

Gaussian Mixture Models.`,
    options:opts(["A","Generative Model"],["B","Discriminative Model"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}A Gaussian mixture specifies a probability distribution over data and can generate samples.` }),
  q({ number:50, points:1, title:"Decision tree: generative or discriminative?", setup:GAN_SETUP,
    prompt:`GANs can be used for the task of learning a generative model of data. However, GANs are not the only generative models we have seen in the course. Indicate whether each of the following models is generative or discriminative.

Decision Trees.`,
    options:opts(["A","Generative Model"],["B","Discriminative Model"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}A standard decision tree directly models the prediction boundary or conditional decision rule, so it is discriminative.` }),
];