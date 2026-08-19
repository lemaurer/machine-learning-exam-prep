import type { Question } from "../types/question";
import { CONV3D_SETUP, DERIVED, DIAGNOSTIC_EM_SETUP, EM_GMM_SETUP, opts, q } from "./fs20-common";

export const fs20Questions: Question[] = [
  q({ number:37, points:3, title:"Neural-network training error", multipleSelect:true,
    prompt:"When using neural networks, which of the following methods will typically result in a lower training error?",
    options:opts(
      ["A","Adding an additional hidden layer with a non-linear activation function to the network."],
      ["B","Reducing the learning rate when training for a fixed number of iterations with stochastic gradient descent."],
      ["C","Training with weight decay to regularize the L2 norm of the weights of the network."],
      ["D","Increasing the batch size when training for a fixed number of epochs with stochastic gradient descent."],
    ), correct:["A"], topic:"Neural Networks", difficulty:"Intermediate",
    explanation:`${DERIVED}A. Increasing model capacity with an additional nonlinear hidden layer typically allows a lower training error; the other choices either regularize or reduce optimization progress for a fixed training budget.` }),

  q({ number:38, points:3, title:"Mitigating overfitting", multipleSelect:true,
    prompt:"Which of the following methods for training neural networks are generally believed to mitigate overfitting?",
    options:opts(["A","Early Stopping."],["B","Dropout."],["C","Weight decay."],["D","Batch Normalization."]),
    correct:["A","B","C"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}Correct answers: A, B and C. Early stopping, dropout and weight decay are standard regularization techniques; batch normalization is primarily an optimization/normalization method rather than a direct overfitting-control method.` }),

  q({ number:39, points:3, title:"CNN properties", multipleSelect:true,
    prompt:"Which of the following statements about convolutional neural networks (CNNs) for image analysis are true?",
    options:opts(
      ["A","They do not require non-linear activations to learn non-linear decision boundaries."],
      ["B","They can only be used in shallow neural networks."],
      ["C","Pooling layers reduce the spatial resolution of the image."],
      ["D","They cannot be used for unsupervised learning."],
    ), correct:["C"], topic:"Neural Networks", difficulty:"Foundation",
    explanation:`${DERIVED}C. Pooling reduces spatial resolution; stacked linear convolutions remain linear, CNNs can be deep, and convolutional architectures can also be used in unsupervised learning.` }),

  q({ number:40, points:3, title:"GAN properties", multipleSelect:true,
    prompt:"Which of the following statements about Generative Adversarial Networks (GANs) are true?",
    options:opts(
      ["A","GANs are a modular neural network architecture comprised of a generator and a discriminator."],
      ["B","Training a GAN requires finding a saddle point of the objective function rather than a local optimum."],
      ["C","In practice, training a GAN is easy if the generator and discriminator have enough capacity."],
      ["D","GANs can be evaluated by computing their log-likelihood for held-out samples."],
    ), correct:["A","B"], topic:"Neural Networks", difficulty:"Intermediate",
    explanation:`${DERIVED}Correct answers: A and B. Standard GAN training is a minimax game between generator and discriminator; it is notoriously difficult and does not provide a tractable likelihood for held-out data.` }),

  q({ number:41, points:3, title:"3D convolution parameter count", setup:CONV3D_SETUP,
    prompt:"How many parameters does the 3D convolutional layer have when using a kernel size of 5 in all dimensions and 100 filters?",
    options:opts(["A","375"],["B","7,500"],["C","12,500"],["D","25,000"],["E","37,500"],["F","81,000"],["G","2,700,000"],["H","8,100,000"]),
    correct:["E"], topic:"Neural Networks", difficulty:"Intermediate",
    figureNumber:3, figureAlt:"Illustration of a 3D image with width, height and depth dimensions and three channels.", figureCaption:"Figure 3: Example of a 3D image I with W=H=D=8 and C=3 for illustration only; the questions use W=H=D=30 and C=3.",
    explanation:`${DERIVED}E. The weights contain $5^3\cdot3\cdot100=37{,}500$ parameters.` }),

  q({ number:42, points:3, title:"3D convolution output size", setup:CONV3D_SETUP,
    prompt:"For the same convolutional layer as above, what is the number of elements in the output when using stride 3 and padding 1 in all dimensions?",
    options:opts(["A","40,000"],["B","50,000"],["C","60,000"],["D","70,000"],["E","80,000"],["F","90,000"],["G","100,000"],["H","110,000"]),
    correct:["G"], topic:"Neural Networks", difficulty:"Intermediate",
    figureNumber:3, figureAlt:"Illustration of a 3D image with width, height and depth dimensions and three channels.", figureCaption:"Figure 3: Example of a 3D image I with W=H=D=8 and C=3 for illustration only; the questions use W=H=D=30 and C=3.",
    explanation:`${DERIVED}G. Each spatial output dimension is $\lfloor(30+2-5)/3\rfloor+1=10$, so there are $10^3\cdot100=100{,}000$ output elements.` }),

  q({ number:43, points:3, title:"2D convolution parameter count", setup:CONV3D_SETUP,
    prompt:"Assume the image was preprocessed and projected to 2D such that D = 1. How many parameters does the 2D convolutional layer have when using a kernel size of 5 and 100 filters?",
    options:opts(["A","375"],["B","7,500"],["C","12,500"],["D","25,000"],["E","37,500"],["F","81,000"],["G","2,700,000"],["H","8,100,000"]),
    correct:["B"], topic:"Neural Networks", difficulty:"Intermediate",
    figureNumber:3, figureAlt:"Illustration of a 3D image with width, height and depth dimensions and three channels.", figureCaption:"Figure 3: Example of a 3D image I with W=H=D=8 and C=3 for illustration only; the questions use W=H=D=30 and C=3.",
    explanation:`${DERIVED}B. A 2D filter has $5\cdot5\cdot3$ weights per output filter, giving $5\cdot5\cdot3\cdot100=7{,}500$.` }),

  q({ number:44, points:3, title:"Fully connected parameter count", setup:CONV3D_SETUP,
    prompt:"In comparison, how many parameters does a fully connected layer have that produces 100 elements in the output from processing I (again with W = H = D = 30 and C = 3)?",
    options:opts(["A","375"],["B","7,500"],["C","12,500"],["D","25,000"],["E","37,500"],["F","81,000"],["G","2,700,000"],["H","8,100,000"]),
    correct:["H"], topic:"Neural Networks", difficulty:"Intermediate",
    figureNumber:3, figureAlt:"Illustration of a 3D image with width, height and depth dimensions and three channels.", figureCaption:"Figure 3: Example of a 3D image I with W=H=D=8 and C=3 for illustration only; the questions use W=H=D=30 and C=3.",
    explanation:`${DERIVED}H. The input contains $30^3\cdot3=81{,}000$ values, and connecting each to 100 outputs requires $8{,}100{,}000$ weights.` }),

  q({ number:45, points:1, title:"EM initialization and convergence", setup:EM_GMM_SETUP,
    prompt:"The EM algorithm only converges to a local maximum or a saddle point of the objective function when using careful initialization.",
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}B. Careful initialization can affect which stationary point is reached, but convergence behavior is not conditional on having a careful initialization.` }),

  q({ number:46, points:1, title:"EM likelihood monotonicity", setup:EM_GMM_SETUP,
    prompt:"Every iteration of the EM algorithm increases the marginal likelihood (of the data).",
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}A. EM is monotonic in the observed-data likelihood (more precisely, it does not decrease it at each iteration).` }),

  q({ number:47, points:1, title:"Gradient descent for mixture models", setup:EM_GMM_SETUP,
    prompt:"Instead of the EM algorithm, it is possible to adapt gradient descent for learning the parameters of the GMM and its latent assignments.",
    options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate",
    explanation:`${DERIVED}A. The differentiable observed-data likelihood can also be optimized with gradient-based methods, with latent responsibilities obtained from the resulting model.` }),

  q({ number:48, points:1, title:"EM step size", setup:EM_GMM_SETUP,
    prompt:"The step size of the EM algorithm may be tuned via random search or cross-validation.",
    options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Probabilistic Modeling", difficulty:"Foundation",
    explanation:`${DERIVED}B. Standard EM alternates exact E- and M-steps and has no gradient-descent step-size hyperparameter.` }),

  q({ number:49, points:3, title:"Soft-EM E-step", setup:DIAGNOSTIC_EM_SETUP,
    prompt:String.raw`E-step. Assuming you obtained estimates $\hat\mu_0=0.2$ and $\hat\mu_1=0.8$ from the previous iteration, carry out a single expectation step of the soft EM algorithm, to compute $\hat\pi_A$. What is $\hat\pi_A$? Hint: The answer may be rounded to three decimal places to the closest choice below.`,
    options:opts(["A","0.020"],["B","0.200"],["C","0.250"],["D","0.256"],["E","0.500"],["F","0.512"],["G","0.750"],["H","0.800"]),
    correct:["E"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}E. Anton has three positives and two negatives; Bayes' rule gives equal weighted likelihood under the two latent states, hence $\hat\pi_A=0.5$.` }),

  q({ number:50, points:3, title:"Soft-EM M-step", setup:DIAGNOSTIC_EM_SETUP,
    prompt:String.raw`M-step. Assuming you obtained estimates $\hat\pi_A=0.5$, $\hat\pi_B=0.2$, $\hat\pi_C=0.5$, $\hat\pi_D=0.8$ from the previous iteration, carry out a single maximization step of the soft EM algorithm to compute $\hat\mu_1$. What is $\hat\mu_1$?`,
    options:opts(["A","0.20"],["B","0.28"],["C","0.40"],["D","0.48"],["E","0.52"],["F","0.60"],["G","0.72"],["H","0.80"]),
    correct:["G"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}G. The responsibility-weighted number of positive tests is $7.2$ and the responsibility-weighted number of trials is $10$, giving $\hat\mu_1=0.72$.` }),

  q({ number:51, points:3, title:"Symmetric soft-EM initialization responsibilities", setup:DIAGNOSTIC_EM_SETUP,
    prompt:String.raw`Using the soft EM algorithm and initializing $\hat\mu_0=0.5$ and $\hat\mu_1=0.5$, what solution do you converge to for $\hat\pi_i$ for $i\in\{A,B,C,D\}$?`,
    options:opts(
      ["A",String.raw`$\hat\pi_A=0.20,\ \hat\pi_B=0.20,\ \hat\pi_C=0.20,\ \hat\pi_D=0.20$`],
      ["B",String.raw`$\hat\pi_A=0.48,\ \hat\pi_B=0.16,\ \hat\pi_C=0.48,\ \hat\pi_D=0.80$`],
      ["C",String.raw`$\hat\pi_A=0.60,\ \hat\pi_B=0.16,\ \hat\pi_C=0.60,\ \hat\pi_D=0.80$`],
      ["D",String.raw`$\hat\pi_A=0.48,\ \hat\pi_B=0.20,\ \hat\pi_C=0.48,\ \hat\pi_D=0.80$`],
      ["E",String.raw`$\hat\pi_A=0.48,\ \hat\pi_B=0.16,\ \hat\pi_C=0.48,\ \hat\pi_D=1.00$`],
      ["F",String.raw`$\hat\pi_A=0.48,\ \hat\pi_B=0.20,\ \hat\pi_C=0.48,\ \hat\pi_D=1.00$`],
      ["G",String.raw`$\hat\pi_A=0.60,\ \hat\pi_B=0.16,\ \hat\pi_C=0.60,\ \hat\pi_D=1.00$`],
      ["H",String.raw`$\hat\pi_A=0.60,\ \hat\pi_B=0.20,\ \hat\pi_C=0.60,\ \hat\pi_D=0.80$`],
    ), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}A. Starting with identical class-conditional rates makes the data equally informative for both latent states, so every posterior responsibility remains equal to the prior $0.2$.` }),

  q({ number:52, points:3, title:"Symmetric soft-EM initialization rates", setup:DIAGNOSTIC_EM_SETUP,
    prompt:String.raw`Using the soft EM algorithm and initializing $\hat\mu_0=0.5$ and $\hat\mu_1=0.5$, what solution do you converge to for $\hat\mu_0$ and $\hat\mu_1$?`,
    options:opts(
      ["A",String.raw`$\hat\mu_0=0.1,\ \hat\mu_1=0.1$`],["B",String.raw`$\hat\mu_0=0.2,\ \hat\mu_1=0.2$`],["C",String.raw`$\hat\mu_0=0.3,\ \hat\mu_1=0.3$`],["D",String.raw`$\hat\mu_0=0.4,\ \hat\mu_1=0.4$`],
      ["E",String.raw`$\hat\mu_0=0.5,\ \hat\mu_1=0.5$`],["F",String.raw`$\hat\mu_0=0.6,\ \hat\mu_1=0.6$`],["G",String.raw`$\hat\mu_0=0.7,\ \hat\mu_1=0.7$`],["H",String.raw`$\hat\mu_0=0.8,\ \hat\mu_1=0.8$`],
    ), correct:["F"], topic:"Probabilistic Modeling", difficulty:"Advanced",
    explanation:`${DERIVED}F. The symmetric initialization remains symmetric; the common Bernoulli rate becomes the overall positive-test fraction $12/20=0.6$.` }),
];
