import { q, opts, BAYES_SETUP, NN_SETUP, CNN_SETUP, PCA_FIGURE_SETUP, PCA_RECON_SETUP } from "./fs22-common";
import type { Question } from "../types/question";

export const fs22Questions: Question[] = [
  q({ number:17, points:1, title:"Conditional Bayes risk", prompt:"Which of the following is an equivalent formulation of $R(f\\mid x)$?", options:opts(
    ["A","$\\sum_{c=1}^K \\ell(f(x),c)\\,P(Y=c)$"],
    ["B","$\\sum_{c=1}^K \\ell(f(x),c)\\,P(Y=c\\mid X=x)$"],
    ["C","$\\sum_{c=1}^K \\ell(f(x),c)\\,P(X=x\\mid Y=c)$"]
  ), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation", setup:BAYES_SETUP }),
  q({ number:18, points:1, title:"Risk of predicting a class", prompt:"If $f(x)=c$ and $c\\ne K+1$, what is $R(f\\mid x)$ equal to?", options:opts(
    ["A","$l_{\\rm mis}$"],
    ["B","$l_{\\rm mis}P(Y=c\\mid X=x)$"],
    ["C","$l_{\\rm mis}(1-P(Y=c\\mid X=x))$"],
    ["D","$l_{\\rm mis}P(Y=c)$"],
    ["E","$l_{\\rm mis}(1-P(Y=c))$"]
  ), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Foundation", setup:BAYES_SETUP }),
  q({ number:19, points:1, title:"Risk of unsure prediction", prompt:"If $f(x)=K+1$ (that is, if $f(x)$ is “unsure”), what is the value of $R(f\\mid x)$?", options:opts(["A","$l_{\\rm uns}P(Y=K+1)$"],["B","$l_{\\rm uns}P(Y=K+1\\mid X=x)$"],["C","$l_{\\rm uns}$"]), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Foundation", setup:BAYES_SETUP }),
  q({ number:20, points:1, title:"Zero unsure loss", prompt:"If $l_{\\rm uns}=0$, a Bayes optimal decision rule is to classify $x$ as class $c$ only if $P(Y=c\\mid X=x)=1$ and otherwise classify as “unsure”.", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:BAYES_SETUP }),
  q({ number:21, points:3, title:"Bayes optimal unsure threshold", prompt:"Consider the following classifier:\n\nInput: $x\\in\\mathbb{R}^d$\n\n1: Find class $c^*\\in\\{1,\\ldots,K\\}$ such that $P(Y=c^*\\mid X=x)$ is the largest. That is,\n$$c^*=\\arg\\max_{c\\in\\{1,\\ldots,K\\}}P(Y=c\\mid X=x).$$\n2: if $P(Y=c^*\\mid X=x)\\ge1-\\alpha$ then\n\n3: output class $c^*$\n\n4: else\n\n5: output class “unsure”.\n\n6: end if\n\nIn line 2 of the algorithm above, what value should we choose for $\\alpha$ so that the resulting classifier is a Bayes optimal classifier?", options:opts(
    ["A","$\\frac{l_{\\rm uns}}{l_{\\rm mis}}$"],
    ["B","$\\frac{l_{\\rm mis}}{l_{\\rm uns}}$"],
    ["C","$1-\\frac{l_{\\rm uns}}{l_{\\rm mis}}$"],
    ["D","$1-\\frac{l_{\\rm mis}}{l_{\\rm uns}}$"],
    ["E","$0$"]
  ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:BAYES_SETUP }),
  q({ number:22, points:1, title:"Neural-network activations", prompt:"From the forward pass, we can conclude that the activation functions for hidden and output layers are respectively:", options:opts(
    ["A","hidden layer: sigmoid activation function – output layer: sigmoid activation function"],
    ["B","hidden layer: linear activation function – output layer: linear activation function"],
    ["C","hidden layer: sigmoid activation function – output layer: linear activation function"],
    ["D","hidden layer: linear activation function – output layer: sigmoid activation function"]
  ), correct:["C"], topic:"Neural Networks", difficulty:"Foundation", setup:NN_SETUP }),
  q({ number:23, points:2, title:"Output-layer backpropagation", prompt:"The partial derivative of the loss $L$ with respect to $w^{(2)}_{kj}$ (which is the weight between node $j$ in the hidden layer and node $k$ in the output layer) is equal to\n$$\\frac{\\partial L}{\\partial w^{(2)}_{kj}}=\\beta_k z_j.$$\nWhat is the correct expression for $\\beta_k$?", options:opts(
    ["A","$y_k-t_k$"],
    ["B","$t_k-y_k$"],
    ["C","$\\sum_{l=1}^r(t_l-y_k)$"],
    ["D","$\\sum_{l=1}^r(y_l-t_k)$"]
  ), correct:["A"], topic:"Neural Networks", difficulty:"Intermediate", setup:NN_SETUP }),
  q({ number:24, points:3, title:"Hidden-layer backpropagation", prompt:"The partial derivative of the loss with respect to the weight $w^{(1)}_{ji}$ (which is the weight between node $i$ in the input layer and node $j$ in the hidden layer) is equal to\n$$\\frac{\\partial L}{\\partial w^{(1)}_{ji}}=\\theta_jx_i.$$\nWhat is the correct expression for $\\theta_j$ in terms of $\\beta_k$? Hint: It holds that $\\frac{d}{da}\\sigma(a)=\\sigma(a)(1-\\sigma(a))$.", options:opts(
    ["A","$z_j(1-z_j)\\sum_{k=1}^r\\beta_k$"],
    ["B","$z_j(1-z_j)\\sum_{k=1}^r w^{(2)}_{kj}\\beta_k$"],
    ["C","$z_j(1-z_j)\\sum_{k=1}^r\\sigma(\\beta_k)$"],
    ["D","$\\sum_{k=1}^r\\beta_k$"],
    ["E","$\\sum_{k=1}^r w^{(2)}_{kj}\\beta_k$"]
  ), correct:["B"], topic:"Neural Networks", difficulty:"Intermediate", setup:NN_SETUP }),
  q({ number:25, points:2, title:"Convolution output dimensions", prompt:"What dimensions do the output of this layer have, if we choose a stride of 2 and apply 1-pixel padding to the input?", options:opts(["A","$15\\times15\\times3$"],["B","$16\\times16\\times3$"],["C","$7\\times7\\times3$"],["D","$8\\times8\\times3$"]), correct:["B"], topic:"Neural Networks", difficulty:"Intermediate", setup:CNN_SETUP }),
  q({ number:26, points:2, title:"Convolution parameter count", prompt:"How many trainable parameters does this layer have, if the filters do not have a bias term?", options:opts(["A","48"],["B","432"],["C","160"],["D","144"]), correct:["D"], topic:"Neural Networks", difficulty:"Intermediate", setup:CNN_SETUP }),
  q({ number:27, points:2, title:"Convolution parameters after resizing", prompt:"Let $n$ denote the number of trainable parameters of the layer from Question 26. We double the width and height of the input images, and change nothing else. How many trainable parameters would the adjusted layer have in terms of $n$?", options:opts(["A","$2n$"],["B","$n$"],["C","$\\sqrt2\\,n$"],["D","$n^2$"]), correct:["B"], topic:"Neural Networks", difficulty:"Foundation", setup:CNN_SETUP }),
  q({ number:28, points:1, title:"Convolution parameters for grayscale", prompt:"Let $n$ denote the number of trainable parameters of the layer from Question 26. This time, we make the images grayscale (a single channel per pixel) and change nothing else. How many trainable parameters would the adjusted layer have in terms of $n$?", options:opts(["A","$n/3$"],["B","$n$"],["C","$n/\\sqrt3$"],["D","$n^{1/3}$"]), correct:["A"], topic:"Neural Networks", difficulty:"Foundation", setup:CNN_SETUP }),
  q({ number:29, points:1, title:"First principal component", prompt:"In Figure 2, which vector corresponds to the first principal component?", options:opts(["A","$v_1$"],["B","$v_2$"],["C","$v_3$"],["D","$v_4$"],["E","$v_5$"]), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation", setup:PCA_FIGURE_SETUP, figureNumber:2, figureAlt:"Two-dimensional PCA dataset with candidate directions v1 through v5.", figureCaption:"Figure 2 · Related to Questions 29 and 30." }),
  q({ number:30, points:1, title:"Second principal component", prompt:"In Figure 2, which vector corresponds to the second principal component?", options:opts(["A","$v_1$"],["B","$v_2$"],["C","$v_3$"],["D","$v_4$"],["E","$v_5$"]), correct:["C"], topic:"Clustering & Dimensionality Reduction", difficulty:"Foundation", setup:PCA_FIGURE_SETUP, figureNumber:2, figureAlt:"Two-dimensional PCA dataset with candidate directions v1 through v5.", figureCaption:"Figure 2 · Related to Questions 29 and 30." }),
  q({ number:31, points:2, title:"One-dimensional PCA coordinate", prompt:"We reduce the dimensionality of this dataset to only one dimension using PCA. Therefore, we map each point in the dataset to a scalar value. Consider the point $(0,1)$ in the dataset. To which value is this point mapped?", options:opts(["A","$\\frac1{\\sqrt{10}}$"],["B","$-\\frac1{\\sqrt{10}}$"],["C","$-\\frac3{\\sqrt{10}}$"],["D","$\\frac1{\\sqrt2}$"],["E","$-\\frac1{\\sqrt2}$"]), correct:["D"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate", setup:PCA_FIGURE_SETUP, figureNumber:2, figureAlt:"Two-dimensional PCA dataset with candidate directions v1 through v5.", figureCaption:"Figure 2 · Related to Questions 29 and 30." }),
  q({ number:32, points:3, title:"PCA reconstruction properties", prompt:"Mark all correct statements.", options:opts(
    ["A","If all the datapoints are nonzero, we always have $L^{(k)}>0$ for all $k<d$."],
    ["B","If $W$ satisfies the constraints of Equation (1), then $WW^\\top$ is a projection matrix."],
    ["C","For all $1\\le k<d$, the optimization problem of Equation (1) always has a unique minimizer."],
    ["D","It is always the case that $L^{(d)}=0$."]
  ), correct:["B","D"], multipleSelect:true, topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate", setup:PCA_RECON_SETUP }),
  q({ number:33, points:4, title:"PCA marginal reconstruction gain", prompt:"What is the value of $L^{(k-1)}-L^{(k)}$ for $1\\le k\\le d$?", options:opts(["A","$\\lambda_k$"],["B","$\\lambda_{k-1}$"],["C","$\\sum_{i=1}^k\\lambda_i$"],["D","$\\sum_{i=k+1}^d\\lambda_i$"],["E","None of these."]), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate", setup:PCA_RECON_SETUP }),
  q({ number:34, points:3, title:"PCA explained variance plot", prompt:"For a dataset with dimension $d=100$, we solved Equation (1) for $k\\in\\{1,\\ldots,9\\}$. Figure 3 shows the values of $L^{(0)}-L^{(k)}$ we computed. The values for $k=7,8,9$ in the plot are all 40. Mark all correct statements below.", options:opts(
    ["A","It might be the case that $L^{(0)}-L^{(10)}>40$."],
    ["B","The empirical covariance matrix of the data has rank 7."],
    ["C","With 4 principal components, we explain 75% of the variance."],
    ["D","$L^{(0)}=40$."]
  ), correct:["B","C","D"], multipleSelect:true, topic:"Clustering & Dimensionality Reduction", difficulty:"Advanced", setup:PCA_RECON_SETUP, figureNumber:3, figureAlt:"Step plot of L(0)-L(k) for k from 0 through 9.", figureCaption:"Figure 3 · Related to Questions 34 and 35." }),
  q({ number:35, points:2, title:"Variance along third principal component", prompt:"For a unit vector $u$, we define the variance of the data along $u$ to be $\\frac1n\\sum_{i=1}^n(u^\\top x_i)^2$. Based on Figure 3, what is the variance of the data along the third principal component? Hint: Recall from the lectures that $\\frac1n\\sum_{i=1}^n(u^\\top x_i)^2=u^\\top\\Sigma u$, where $\\Sigma$ is the empirical covariance matrix.", options:opts(["A","5"],["B","25"],["C","15"],["D","0.05"],["E","0.15"],["F","0.25"]), correct:["A"], topic:"Clustering & Dimensionality Reduction", difficulty:"Intermediate", setup:PCA_RECON_SETUP, figureNumber:3, figureAlt:"Step plot of L(0)-L(k) for k from 0 through 9.", figureCaption:"Figure 3 · Related to Questions 34 and 35." }),
];
