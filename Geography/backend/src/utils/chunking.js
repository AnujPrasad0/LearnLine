const fs = require("fs");
const path = require("path");

// ================= CONFIG =================

const SUBJECT = "geography";
const CLASS_NAME = 6;

const INPUT_PATH = path.resolve(`../db/geography${CLASS_NAME}/pages.json`);
const OUTPUT_PATH = path.resolve(`../db/geography${CLASS_NAME}/chunks.json`);

// ================= TEXT CLEANING =================

function cleanPageText(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;

      // remove pure page number
      if (/^\d+$/.test(line)) return false;

      // remove footer year
      if (line === "2018-19") return false;

      return true;
    })
    .join("\n");
}

// ================= CHUNKING =================

function buildChunks(pages) {
  const chunks = [];

  for (const page of pages) {
    const { pdfPage, bookPage, lines, hasFigure } = page;

    const text = cleanPageText(lines);

    // skip non-content pages
    if (!text) continue;

    // base metadata (always valid)
    const metadata = {
      chunk_text: text,
      pdfPage,
      hasFigure,
      subject: SUBJECT,
      className: CLASS_NAME,
    };

    if (bookPage !== null && bookPage !== undefined) {
      metadata.bookPage = bookPage;
    }

    // add imagePath ONLY if page has figure
    if (hasFigure) {
      metadata.imagePath = `db/geography${CLASS_NAME}/figures/page_${pdfPage}.png`;
    }

    const chunk = {
      id: `geo${CLASS_NAME}_p${pdfPage}`,
      metadata,
    };

    chunks.push(chunk);
  }

  return chunks;
}

// ================= RUN =================

const raw = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));

const chunks = buildChunks(raw.pages);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(chunks, null, 2), "utf-8");

console.log(`✅ ${chunks.length} chunks saved to ${OUTPUT_PATH}`);
