function parsePageTextToChunks(
  text,
  { idPrefix = "rec", pageIndex = 0, subject = "", className = "" } = {}
) {
  if (typeof text !== "string") text = String(text || "");
  text = text.replace(/\t+/g, " ").trim();

  // ----------------------------------------------------
  // 1) EXTRACT PAGE NUMBER (correct & final)
  // ----------------------------------------------------
  let pageNumber = null;

  // get last 5 non-empty lines
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const lastLines = lines.slice(-5);

  const footerLine = lastLines.find((l) =>
    /^--\s*\d+\s+of\s+\d+\s*--$/i.test(l)
  );

  if (footerLine) {
    const m = footerLine.match(/^--\s*(\d+)\s+of\s+\d+\s*--$/i);
    if (m) pageNumber = parseInt(m[1], 10);
  }

  // fallback if footer missing
  if (!pageNumber || Number.isNaN(pageNumber)) {
    pageNumber = pageIndex + 1;
  }

  // remove footer so it doesn't appear in text chunks
  text = text.replace(/^--\s*\d+\s+of\s+\d+\s*--$/gim, "");

  // ----------------------------------------------------
  // 2) SPLIT INTO PARAGRAPHS
  // ----------------------------------------------------
  text = text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n");

  let blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  // ----------------------------------------------------
  // 3) FIGURE SPLITTING USING YOUR RULE
  // ----------------------------------------------------
  function splitFigures(block) {
    // REAL FIGURE CAPTION when:
    // newline + Fig   OR   starts with Fig
    const figPattern = /(?:\n|^)Fig\.?\s*\d+/i;

    if (!figPattern.test(block)) {
      return [block]; // no real figure
    }

    // But if block is ACTIVITY, treat entire block as activity
    if (/^Activity\b/i.test(block)) {
      return [block];
    }

    // SPLIT only at TRUE figure boundaries
    return block
      .split(/(?=(?:\n|^)Fig\.?\s*\d+)/i)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  // ----------------------------------------------------
  // 4) EXPAND BLOCKS
  // ----------------------------------------------------
  let expanded = [];

  blocks.forEach((b) => {
    // split activity first
    const actIndex = b.search(/\bActivity\b/i);

    if (actIndex > 0) {
      const before = b.slice(0, actIndex).trim();
      const after = b.slice(actIndex).trim();
      if (before) expanded.push(...splitFigures(before));
      if (after) expanded.push(after); // keep whole as activity
    } else {
      expanded.push(...splitFigures(b));
    }
  });

  // ----------------------------------------------------
  // 5) CLASSIFY TYPE
  // ----------------------------------------------------
  function classify(t) {
    if (/^Activity\b/i.test(t)) return "activity";
    if (/^(?:Fig\.?|Figure)\s*\d+/i.test(t)) return "figure";
    return "normal";
  }

  // ----------------------------------------------------
  // 6) CREATE CHUNKS
  // ----------------------------------------------------
  return expanded.map((chunk, index) => ({
    _id: `${idPrefix}_${pageNumber}_${String(index + 1).padStart(3, "0")}`,
    metadata: {
      chunk_text: chunk.trim(),
      page: pageNumber,
      type: classify(chunk),
      subject,
      className,
    },
  }));
}

function splitIntoPages(fullText) {
  const parts = fullText.split(/--\s*\d+\s+of\s+\d+\s*--/g);

  // The footer lines themselves also contain page numbers,
  // so extract them separately:
  const pageNumbers = [...fullText.matchAll(/--\s*(\d+)\s+of\s+\d+\s*--/g)].map(
    (m) => parseInt(m[1], 10)
  );

  const pages = [];
  for (let i = 0; i < parts.length; i++) {
    const text = parts[i].trim();
    if (!text) continue;

    // pageNumbers array aligns with parts (minus intro)
    const pageNum = pageNumbers[i] ?? i + 1;

    pages.push({ pageNumber: pageNum, text });
  }

  return pages;
}

module.exports = {
  parsePageTextToChunks,
  splitIntoPages,
};
