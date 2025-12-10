/**
 * Extracts chunks from a page of text and auto-detects page number.
 * Expected footer format:  -- 12 of 152 --
 */
function parsePageTextToChunks(text, options = {}) {
  const { idPrefix = "rec", minChunkChars = 20 } = options;

  // -------------------------------
  // 1) Detect page number automatically
  // -------------------------------
  let pageNumber = 0;
  const pageMatch = text.match(/--\s*(\d+)\s+of\s+\d+\s*--/i);
  if (pageMatch) {
    pageNumber = parseInt(pageMatch[1], 10);
  }

  // Remove footer like "-- 12 of 152 --"
  let cleaned = text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "");

  // Remove year-stamp like "2019-200" etc.
  cleaned = cleaned.replace(/\b20\d{2}-\d{2}\b/g, "");
  cleaned = cleaned.replace(/\r/g, "\n");

  // Normalize blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  // -------------------------------
  // 2) Split into paragraph blocks
  // -------------------------------
  let blocks = cleaned
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  // -------------------------------
  // 3) Merge tiny fragments into previous block
  // -------------------------------
  const merged = [];
  for (let block of blocks) {
    if (!merged.length) {
      merged.push(block);
      continue;
    }

    const prev = merged[merged.length - 1];
    const prevEndsSentence = /[.!?]"?$/.test(prev);

    if (block.length < minChunkChars && !prevEndsSentence) {
      merged[merged.length - 1] = prev + " " + block;
    } else {
      merged.push(block);
    }
  }

  // -------------------------------
  // 4) Classification rules
  // -------------------------------
  function classify(b) {
    if (/^Activity\b/i.test(b)) return "activity";
    if (/^Fig\.?\s*\d+/i.test(b) || /\bFig\.\s*\d+\b/i.test(b)) return "figure";

    // heading heuristic (short line, few words, capitalized)
    if (b.length < 140 && b.split(/\s+/).length <= 6 && /^[A-Z]/.test(b)) {
      return "heading";
    }
    return "normal";
  }

  // -------------------------------
  // 5) Create chunk objects
  // -------------------------------
  return merged.map((chunk, i) => ({
    _id: `${idPrefix}_${pageNumber}_${(i + 1).toString().padStart(3, "0")}`,
    page: pageNumber,
    type: classify(chunk),
    chunk_text: chunk,
  }));
}

module.exports = parsePageTextToChunks;
