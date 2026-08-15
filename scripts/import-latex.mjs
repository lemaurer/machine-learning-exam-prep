import fs from "node:fs";
import path from "node:path";

const [sourceArg, examIdArg] = process.argv.slice(2);
if (!sourceArg || !examIdArg) {
  console.error("Usage: npm run import:latex -- path/to/exam.tex EXAM_ID");
  process.exit(1);
}

const sourcePath = path.resolve(sourceArg);
const examId = examIdArg.trim();
const latex = fs.readFileSync(sourcePath, "utf8");
const outputDirectory = path.resolve("data/import-drafts");
const outputPath = path.join(outputDirectory, `${examId}.json`);

function tidy(value) {
  return value
    .replace(/%.*$/gm, "")
    .replace(/\\textbf\{([^{}]*)\}/g, "$1")
    .replace(/\\textit\{([^{}]*)\}/g, "$1")
    .replace(/\\begin\{equation\*?\}/g, "$$")
    .replace(/\\end\{equation\*?\}/g, "$$")
    .replace(/\\begin\{(?:enumerate|itemize)\}|\\end\{(?:enumerate|itemize)\}/g, "")
    .replace(/\\item(?:\[[A-D]\)\])?/g, "")
    .replace(/\\(?:newpage|vspace\*?\{[^}]*\})/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionAt(index) {
  const prefix = latex.slice(0, index);
  const matches = [...prefix.matchAll(/\\section\{(?:\\color\{[^}]+\})?([^{}]+)\}/g)];
  return tidy(matches.at(-1)?.[1] ?? "Uncategorized");
}

const records = [];
const questionPattern = /\\paragraph\{Question\s+(\d+)\s+\((\d+)\s+points?\)\}([\s\S]*?)(?=\\paragraph\{Question\s+\d+|\\end\{document\})/g;

for (const match of latex.matchAll(questionPattern)) {
  const [, number, points, block] = match;
  const itemStart = block.indexOf("\\begin{itemize}");
  const itemEnd = block.indexOf("\\end{itemize}");
  if (itemStart < 0 || itemEnd < 0) continue;

  const prompt = tidy(block.slice(0, itemStart));
  const itemBlock = block.slice(itemStart, itemEnd);
  const options = [...itemBlock.matchAll(/\\item\[([A-D])\)\]\s*([\s\S]*?)(?=\\item\[[A-D]\)\]|$)/g)]
    .map((item) => ({ id: item[1], text: tidy(item[2].replace("[Correct]", "")) }));
  const correctMatch = itemBlock.match(/\\item\[([A-D])\)\][\s\S]*?\[Correct\]/);
  const solutionMatch = block.slice(itemEnd).match(/\\paragraph\{Solution\s*\\?&\s*Explanation:\}([\s\S]*)/);
  const figures = [...block.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)].map((figure) => path.basename(figure[1]));

  records.push({
    id: `${examId.toLowerCase()}-q${String(number).padStart(2, "0")}`,
    examId,
    number: Number(number),
    points: Number(points),
    topicDraft: sectionAt(match.index ?? 0),
    difficultyDraft: Number(points) <= 1 ? "Foundation" : Number(points) >= 3 ? "Advanced" : "Intermediate",
    prompt,
    options,
    correctOptionId: correctMatch?.[1] ?? null,
    explanation: tidy(solutionMatch?.[1] ?? ""),
    figures,
    needsReview: !correctMatch || !solutionMatch,
  });
}

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Extracted ${records.length} questions to ${outputPath}`);

