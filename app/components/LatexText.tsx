"use client";

import katex from "katex";
import { Fragment } from "react";

const LATEX_PATTERN = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([^\n]+?\\\))/g;

function parseToken(token: string) {
  if (token.startsWith("$$")) return { math: token.slice(2, -2), displayMode: true };
  if (token.startsWith("\\[")) return { math: token.slice(2, -2), displayMode: true };
  if (token.startsWith("\\(")) return { math: token.slice(2, -2), displayMode: false };
  return { math: token.slice(1, -1), displayMode: false };
}

export function LatexText({ text }: { text: string }) {
  return text.split(LATEX_PATTERN).map((part, index) => {
    if (!part) return null;
    const isMath = part.startsWith("$") || part.startsWith("\\(") || part.startsWith("\\[");
    if (!isMath) return <Fragment key={index}>{part}</Fragment>;
    const { math, displayMode } = parseToken(part);
    const html = katex.renderToString(math, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "htmlAndMathml",
    });
    return (
      <span
        key={index}
        className={displayMode ? "latex-display" : "latex-inline"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

