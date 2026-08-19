import assert from "node:assert/strict";
import test from "node:test";
import { prepareEditImagesForStorage } from "../lib/images";
import type { EditStore } from "../types/question";

test("figure edit serialization preserves ordinary asset paths and edit metadata", () => {
  const edits: EditStore = {
    "hs24-q31": {
      figureNumber: 31,
      figure: "/figures/dataset.png",
      secondFigureNumber: 32,
      secondFigure: "https://example.com/candidates.png",
      prompt: "Updated prompt",
    },
  };

  assert.deepEqual(prepareEditImagesForStorage(edits), edits);
});
