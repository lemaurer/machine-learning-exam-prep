import type { Question } from "../types/question";
import { DERIVED, NN_REG_SETUP, NN_TRAIN_SETUP, PCA_SETUP, opts, q } from "./fs21-common";

export const fs21Questions: Question[] = [
  q({ number:19, points:3, title:"Polynomial kernel matrix cost",
    prompt:String.raw`Let $d\in\mathbb N$ be a fixed constant number. Assume that multiplication of two numbers, addition of two numbers, and exponentiation of a number by another number ($x^y$) all have a constant ($\Theta(1)$) computational cost. What is the computational cost of constructing the kernel matrix for a dataset $\mathcal D=\{x_i\}_{i=1}^n$ with $n$ points $x_i\in\mathbb R^d$ using the polynomial kernel for degree-$m$ polynomials (we use the kernel $k(x,x')=(1+x^\top x')^m$)?`,
    options:opts(["A",String.raw`$\Theta(m)$`],["B",String.raw`$\Theta(nd^m)$`],["C",String.raw`$\Theta(nm)$`],["D",String.raw`$\Theta(m^d)$`],["E",String.raw`$\Theta(n^2)$`],["F",String.raw`$\Theta(mn^2)$`]),
    correct:["E"], topic:"Kernels & Regression", difficulty:"Intermediate",
    explanation:`${DERIVED}There are $n^2$ kernel entries, and with fixed $d$ plus constant-cost exponentiation each entry costs constant time.` }),
  q({ number:20, points:1, title:"Finite-dimensional feature maps",
    prompt:String.raw`For every valid kernel $k(x,x'):\mathcal X\times\mathcal X\to\mathbb R$ there exists a finite dimensional feature map $\Phi:\mathcal X\to\mathbb R^d$, such that $k(x,x')=\phi(x)^\top\phi(x')$.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}Valid kernels may correspond to infinite-dimensional feature spaces.` }),
  q({ number:21, points:1, title:"Asymmetric kernel candidate",
    prompt:String.raw`For $x,x'\in\mathbb R\setminus\{0\}$ we define $k(x,x')=\frac{\sin(x)}{(x')^2}+1$. $k$ is a valid kernel.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}A real-valued kernel must be symmetric; this expression is not symmetric in $x,x'$.` }),
  q({ number:22, points:1, title:"Bilinear kernel with indefinite matrix",
    prompt:String.raw`For $x,x'\in\mathbb R^2$ we define $k(x,x')=x^\top Mx'$ with $M=\begin{pmatrix}1&2\\2&1\end{pmatrix}$. $k$ is a valid kernel.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}$M$ has eigenvalues $3$ and $-1$, so it is not positive semidefinite.` }),
  q({ number:23, points:1, title:"Polynomial transformation of a kernel",
    prompt:String.raw`Let $k_1$ be a valid kernel. Then, for any polynomial function $f$, $k(x,x')=f(k_1(x,x'))$ is a valid kernel.`,
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Kernels & Regression", difficulty:"Foundation",
    explanation:`${DERIVED}An arbitrary polynomial may have coefficients that do not preserve positive semidefiniteness.` }),

  q({ number:24, points:3, title:"Trace of the PCA projection", setup:PCA_SETUP,
    prompt:String.raw`What is the value of $\operatorname{Tr}(W_*W_*^\top)$?

Reminder: For a square matrix $A\in\mathbb R^{k\times k}$ we denote its trace by $\operatorname{Tr}(A)$ and it is defined as the sum of its diagonal elements: $\operatorname{Tr}(A)=\sum_{i=1}^kA_{ii}$.`,
    options:opts(["A",String.raw`$n$`],["B",String.raw`$k$`],["C",String.raw`$d$`],["D",String.raw`$\max(n,d)$`]),
    correct:["B"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate",
    explanation:`${DERIVED}$W_*W_*^\top$ is an orthogonal projector of rank $k$, so its trace is $k$.` }),
  q({ number:25, points:3, title:"Optimal PCA latent coordinates", setup:PCA_SETUP,
    prompt:String.raw`What holds for $z_i^*$?`,
    options:opts(
      ["A",String.raw`$z_i^*=W_*^\top(W_*W_*^\top)^{-1}x_i$`],
      ["B",String.raw`$z_i^*=(W_*W_*^\top)^{-1}W_*^\top x_i$`],
      ["C",String.raw`$z_i^*=(W_*^\top W_*)^{-1}W_*^\top x_i$`],
      ["D",String.raw`$z_i^*=W_*^\top(W_*W_*^\top)^{-1}W_*x_i$`],
    ), correct:["C"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate",
    explanation:`${DERIVED}Least squares in $z_i$ gives $(W_*^\top W_*)^{-1}W_*^\top x_i$, and $W_*^\top W_*=I$.` }),
  q({ number:26, points:4, title:"PCA reconstruction error", setup:PCA_SETUP,
    prompt:String.raw`Let $\lambda_1\ge\lambda_2\ge\cdots\ge\lambda_d\ge0$ be the eigenvalues of the empirical covariance matrix $\Sigma=\frac1n\sum_{i=1}^nx_ix_i^\top\in\mathbb R^{d\times d}$. Let $v_1,\ldots,v_d\in\mathbb R^d$ be the corresponding eigenvectors. Remember that:
$$Wz_i^*=\left(\sum_{j=1}^kv_jv_j^\top\right)x_i.$$
What is the value of $C_*$?

Hint: (i.) $\|x\|_2^2=x^\top x=\operatorname{Tr}(x^\top x)$, $\forall x\in\mathbb R^d$, (ii.) $\operatorname{Tr}(ABC)=\operatorname{Tr}(CAB)=\operatorname{Tr}(BCA)$ for matrices $A,B,C$ of appropriate dimensions. For a definition of trace, see the reminder in Question 24.`,
    options:opts(
      ["A",String.raw`$\frac1n\sum_{i=k+1}^d\lambda_i$`],
      ["B",String.raw`$\frac1n\sum_{i=1}^k\lambda_i$`],
      ["C",String.raw`$\frac1n\sum_{i=k+1}^d\lambda_i^2$`],
      ["D",String.raw`$\frac1n\sum_{i=1}^k\lambda_i^2$`],
    ), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Advanced",
    explanation:`${DERIVED}Among the supplied choices, the intended PCA reconstruction error is the sum of the discarded covariance eigenvalues, corresponding to option A as printed in this exam.` }),
  q({ number:27, points:1, title:"PCA as a linear mapping", setup:PCA_SETUP,
    prompt:"PCA helps us find a linear mapping to a lower dimensional space.", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation",
    explanation:`${DERIVED}Standard PCA projects onto a lower-dimensional linear subspace.` }),
  q({ number:28, points:1, title:"Matrix size in kernel PCA", setup:PCA_SETUP,
    prompt:String.raw`Let $n$ be the number of the points and $d$ the dimension of the points in the dataset. In standard PCA, we compute the spectral decomposition (eigenvalues and eigenvectors) of the empirical covariance matrix with size $d\times d$. In kernelized PCA we instead compute the spectral decomposition of a matrix of size $n\times n$.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation",
    explanation:`${DERIVED}Kernel PCA diagonalizes the centered $n\times n$ Gram matrix.` }),
  q({ number:29, points:1, title:"Redundant features and PCA", setup:PCA_SETUP,
    prompt:String.raw`Imagine two features are identical in the whole dataset, i.e., they are identical among all data samples $x_1,\ldots,x_n$. Then, utilizing PCA, we can strictly reduce the dimension of the dataset by at least one with zero reconstruction error.`,
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation",
    explanation:`${DERIVED}Identical feature columns create a linear dependence, so the data lie in a subspace of dimension at most $d-1$.` }),

  q({ number:30, points:1, title:"Convexity in the final neural-network layer", setup:NN_REG_SETUP,
    prompt:"The objective from Equation (5) is convex with respect to $W_3,b_3$.", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}With earlier layers fixed, the network is affine in $W_3,b_3$ and the squared loss is convex in them.` }),
  q({ number:31, points:1, title:"Loss used in neural-network regression", setup:NN_REG_SETUP,
    prompt:"We are using the cross-entropy loss function in the objective in Equation (5).", options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}Equation (5) explicitly uses squared Euclidean loss.` }),
  q({ number:32, points:3, title:"Batch normalization mean and variance", setup:NN_REG_SETUP,
    prompt:String.raw`Assume that $d=1$. We pass a batch of input samples $\{x_i\}_{i\in S}$ defined by an index set $S\subseteq\{1,\ldots,n\}$ through a batch normalization layer with scale and shift parameters $\gamma=2$, $\beta=0$ respectively. For every input $x_i$, the layer outputs $\bar x_i=\gamma\frac{x_i-\mu_S}{\sigma_S}+\beta$, where $\mu_S$ and $\sigma_S$ are the empirical mean and standard deviation of the input batch. What are the empirical mean and standard deviation of $\{\bar x_i\}_{i\in S}$?`,
    options:opts(
      ["A",String.raw`$(\mu_S,\sigma_S)$`], ["B",String.raw`$(\mu_S,2\sigma_S)$`],
      ["C",String.raw`$\left(\frac{\mu_S}{|S|},\frac{\sigma_S}{|S|}\right)$`], ["D",String.raw`$\left(\frac{\mu_S}{|S|},2\frac{\sigma_S}{|S|}\right)$`],
      ["E",String.raw`$(0,1)$`], ["F",String.raw`$(4,1)$`], ["G",String.raw`$(0,2)$`], ["H",String.raw`$(4,2)$`],
    ), correct:["G"], topic:"Neural Networks", difficulty:"Intermediate",
    explanation:`${DERIVED}Normalization produces mean 0 and standard deviation 1; multiplying by $\gamma=2$ gives standard deviation 2 and $\beta=0$ leaves the mean at 0.` }),

  q({ number:33, points:1, title:"When network weights are updated", setup:NN_TRAIN_SETUP,
    prompt:"The network weights are updated during forward propagation.", options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}Forward propagation computes activations; parameter updates occur after gradients are computed.` }),
  q({ number:34, points:1, title:"Binary classification output activation", setup:NN_TRAIN_SETUP,
    prompt:"For performing a binary classification task, the final output of the neural network is typically passed through a ReLu activation before being compared to the label.",
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}Binary classification commonly uses a sigmoid/logit output rather than ReLU.` }),
  q({ number:35, points:2, title:"Training curves and batch size", setup:NN_TRAIN_SETUP,
    prompt:String.raw`Below are the (smoothed) training loss curves for 3 small identical networks trained with the following optimization algorithms:

A Gradient descent.

B Batch stochastic gradient descent with large batch size.

C Batch stochastic gradient descent with small batch size.

We use the same constant learning rate in all 3 cases. The $x$-axis corresponds to the batch size multiplied by number of (stochastic) gradient descent iterations. Match the images (left to right) with the optimization method used.`,
    options:opts(["A","(A, B, C)"],["B","(A, C, B)"],["C","(B, A, C)"],["D","(B, C, A)"],["E","(C, A, B)"],["F","(C, B, A)"]),
    correct:["A"], topic:"Neural Networks", difficulty:"Intermediate",
    figureNumber:35, figureAlt:"Three training-loss curves for gradient descent and stochastic gradient descent with different batch sizes.", figureCaption:"Training loss curves · Question 35.",
    explanation:`${DERIVED}Full gradient descent is smoothest and slowest per datapoint seen, large-batch SGD is intermediate, and small-batch SGD is noisiest and updates most frequently.` }),
  q({ number:36, points:3, title:"Dropout-aware weight initialization", setup:NN_TRAIN_SETUP,
    prompt:String.raw`We have a one-layer fully connected neural network with input nodes $v_i$, $i=1,\ldots,d$, and a single output node $v_{\rm out}$. The activation function of the output node $v_{\rm out}$ is the identity. We initialize every weight independently with a standard Gaussian distribution $w_i\sim\mathcal N(0,\sigma^2)$, $i\in\{1,\ldots,d\}$. To avoid overfitting, we use dropout and thus independently set each node $v_j$ to zero with probability $1-p$.

Assume we give as input to the network $d$ independent random variables $X_i$, $i=1,\ldots,d$, with $\mathbb E[X_i]=0$, $\mathbb E[X_i^2]=1$. How should we choose the variance $\sigma^2$ so that we have $\mathbb E[v_{\rm out}]=0$ and $\mathbb E[v_{\rm out}^2]=1$? Here the randomness is over the random variables $X_i$, weights $w_i$, and node dropout events.`,
    options:opts(["A",String.raw`$\sigma^2=\frac{2}{dp(1-p)}$`],["B",String.raw`$\sigma^2=\frac{2}{dp}$`],["C",String.raw`$\sigma^2=\frac1{dp}$`],["D",String.raw`$\sigma^2=\frac1{dp(1-p)}$`]),
    correct:["C"], topic:"Neural Networks", difficulty:"Intermediate",
    explanation:`${DERIVED}$\mathbb E[v_{\rm out}^2]=d\,p\,\sigma^2$, so setting it to one gives $\sigma^2=1/(dp)$.` }),
];
