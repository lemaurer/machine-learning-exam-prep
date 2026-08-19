import { q, opts, DERIVED, ONE_CLASS_SETUP, ONE_CLASS_REST_SETUP, EM_SETUP, EM_CENSORED_SETUP } from "./hs22-common";
import type { Question } from "../types/question";

export const hs22Questions: Question[] = [
  q({ number:36, points:1, title:"One-class SVM feasibility", prompt:"For all datasets $\\{x_1,\\ldots,x_n\\}$, the optimization problem (3) always has a solution.", options:opts(["A","True"],["B","False"]), correct:["B"], topic:"Optimization & Model Selection", difficulty:"Foundation", setup:ONE_CLASS_SETUP, explanation:DERIVED+"B. The constraints can be infeasible, for example if the dataset contains opposing points that cannot both satisfy $w^\\top x_i\\ge1$." }),
  q({ number:37, points:2, title:"One-class SVM margin", prompt:"Define the margin of a decision hyperplane to be the (smallest) distance between the hyperplane and the data points. Which of the following is the margin of the hyperplane defined by $\\hat w$?", options:opts(["A","$\\frac{1}{\\|\\hat w\\|^2}$"],["B","$\\|\\hat w\\|^2$"],["C","$\\|\\hat w\\|$"],["D","$\\frac{1}{\\|\\hat w\\|}$"]), correct:["D"], topic:"Optimization & Model Selection", difficulty:"Intermediate", setup:ONE_CLASS_REST_SETUP, explanation:DERIVED+"D. The support constraint is $\\hat w^\\top x=1$, whose distance from the origin hyperplane $\\hat w^\\top x=0$ is $1/\\|\\hat w\\|$." }),
  q({ number:38, points:1, title:"Augmented hard-margin SVM", prompt:"The optimization problem (3) has the same solution as the hard-margin two-class SVM for the augmented dataset: $\\{(x_1,+1),\\ldots,(x_n,+1),(-x_1,-1),\\ldots,(-x_n,-1)\\}$, where each pair is a datapoint (or its negative) along with a class ($+1$ or $-1$).", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Optimization & Model Selection", difficulty:"Intermediate", setup:ONE_CLASS_REST_SETUP, explanation:DERIVED+"A. Both the positive examples and their negated negative-class copies impose the same constraint $w^\\top x_i\\ge1$." }),
  q({ number:39, points:1, title:"Non-support-vector perturbation", prompt:"There exists an $\\varepsilon>0$ such that moving a datapoint that is not a support vector by an amount of $\\varepsilon$ does not change the optimal solution of (3).", options:opts(["A","True"],["B","False"]), correct:["A"], topic:"Optimization & Model Selection", difficulty:"Intermediate", setup:ONE_CLASS_REST_SETUP, explanation:DERIVED+"A. A non-support vector satisfies its constraint strictly, so a sufficiently small perturbation keeps that constraint inactive at the optimum." }),
  q({ number:40, points:2, title:"Soft one-class SVM", prompt:"Similar to soft-margin two-class SVM, we can write a soft version of (3):\n$$\\hat w_{\\mathrm{soft}}:=\\arg\\min_{w\\in\\mathbb{R}^d}\\frac12\\|w\\|^2+C\\sum_{i=1}^n\\ell(w^\\top x_i),\\tag{4}$$\nwhere $\\ell$ is a loss function that we choose later, and $C>0$ is a constant. Note that this optimization problem is unconstrained. Which of the following is a proper choice for $\\ell$, and what is the effect of increasing $C\\to\\infty$ on the minimizer $\\hat w_{\\mathrm{soft}}$?", options:opts(
    ["A","$\\ell(z)=\\max(0,1-z)$; $\\hat w_{\\mathrm{soft}}$ converges to $0$."],
    ["B","$\\ell(z)=\\min(0,1-z)$; $\\hat w_{\\mathrm{soft}}$ converges to $0$."],
    ["C","$\\ell(z)=\\max(0,1-z)$; $\\hat w_{\\mathrm{soft}}$ converges to the solution of (3)."],
    ["D","$\\ell(z)=\\min(0,1-z)$; $\\hat w_{\\mathrm{soft}}$ converges to the solution of (3)." ]), correct:["C"], topic:"Optimization & Model Selection", difficulty:"Intermediate", setup:ONE_CLASS_REST_SETUP, explanation:DERIVED+"C. The hinge penalty $\\max(0,1-z)$ penalizes violated constraints; as $C$ becomes large, feasible violations are forced away and the hard-constrained solution is recovered." }),
  q({ number:41, points:1, title:"Exponential MLE", prompt:"What is the maximum likelihood estimator of $\\lambda$ given the times $t_{1:n}$?", options:opts(
    ["A","$\\frac{n}{\\sum_i t_i}$"],
    ["B","$\\frac{\\sum_i t_i}{n}$"],
    ["C","$\\frac1n\\log\\left(\\prod_i t_i\\right)$"],
    ["D","$\\frac{n}{\\log\\left(\\prod_i t_i\\right)}$" ]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Foundation", setup:EM_SETUP, explanation:DERIVED+"A. Maximizing $n\\log\\lambda-\\lambda\\sum_i t_i$ gives $\\hat\\lambda=n/\\sum_i t_i$." }),
  q({ number:42, points:4, title:"EM E-step for censored exponential data", prompt:"Knowing that the complete data log-likelihood is\n$$\\log p(t_{1:n},z_{1:m};\\lambda)=(n+m)\\log(\\lambda)-\\lambda\\sum_{i=1}^n t_i-\\lambda\\sum_{i=1}^m z_i,$$\nWhat is the value of $Q(\\lambda;\\lambda^{(j)})$? Hint: $\\int_\\tau^\\infty t\\lambda e^{-\\lambda t}dt=(\\tau\\lambda+1)e^{-\\tau\\lambda}/\\lambda$.", options:opts(
    ["A","$(m+n)\\log(\\lambda)-\\lambda\\sum_i t_i-\\lambda m\\tau$"],
    ["B","$(m+n)\\log(\\lambda)-\\lambda\\sum_i t_i-\\lambda m(\\lambda^{(j)}+\\tau)$"],
    ["C","$(m+n)\\log(\\lambda)-\\lambda\\sum_i t_i-\\lambda m\\left(\\frac1{\\lambda^{(j)}}+\\tau\\right)$" ]), correct:["C"], topic:"Probabilistic Modeling", difficulty:"Advanced", setup:EM_CENSORED_SETUP, explanation:DERIVED+"C. Conditional on $Z_i\\ge\\tau$, the memoryless exponential distribution gives $\\mathbb{E}[Z_i]=\\tau+1/\\lambda^{(j)}$." }),
  q({ number:43, points:2, title:"EM M-step", prompt:"Then, we take the M-step and obtain $\\lambda^{(j+1)}$ via\n$$\\lambda^{(j+1)}=\\arg\\max_{\\lambda>0}Q(\\lambda;\\lambda^{(j)}).$$\nWhat is the output of the M-step, $\\lambda^{(j+1)}$?", options:opts(
    ["A","$\\frac{m+n}{\\sum_i t_i+m\\left(\\frac1{\\lambda^{(j)}}+\\tau\\right)}$"],
    ["B","$\\frac{m+n}{\\sum_i t_i+m\\tau}$"],
    ["C","$\\frac{m+n}{\\sum_i t_i+m(\\lambda^{(j)}+\\tau)}$"],
    ["D","$\\frac{m+n}{\\sum_i t_i}$" ]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_CENSORED_SETUP, explanation:DERIVED+"A. Differentiate the E-step objective with respect to $\\lambda$ and solve the first-order condition." }),
  q({ number:44, points:1, title:"EM fixed point", prompt:"Starting from $\\lambda^{(0)}=1$, to what value of $\\lambda$ does the EM algorithm converge?", options:opts(
    ["A","$\\frac{n}{\\sum_i t_i+m\\tau}$"],
    ["B","$\\frac{n}{\\sum_i t_i+\\frac{\\tau}{m}}$"],
    ["C","$\\frac{\\sum_i t_i+m\\tau}{n}$"],
    ["D","$\\frac{\\sum_i t_i+\\frac{\\tau}{m}}{n}$"],
    ["E","$\\frac{n}{\\sum_i t_i}$"],
    ["F","$\\frac{\\sum_i t_i}{n}$"],
    ["G","It does not converge." ]), correct:["A"], topic:"Probabilistic Modeling", difficulty:"Intermediate", setup:EM_CENSORED_SETUP, explanation:DERIVED+"A. At a fixed point of the M-step update, $\\lambda(\\sum_i t_i+m\\tau)=n$." }),
];
