import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "../app/globals.css";
import { ExamPrepApp } from "../app/ExamPrepApp";

const root = document.getElementById("root");

if (!root) throw new Error("Missing application root.");

createRoot(root).render(
  <StrictMode>
    <ExamPrepApp />
  </StrictMode>,
);

