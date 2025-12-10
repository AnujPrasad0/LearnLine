const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const parsePageTextToChunks = require("./chunker.js");

async function run() {
  const parser = new PDFParse({
    url: "https://afeias.com/wp-content/uploads/2019/04/class8_history_english.pdf",
  });

  const result = await parser.getText();

  // SPLIT PDF TEXT INTO PAGES
  const pages = result.text.split("\f"); // ← page separator

  let finalChunks = [];

  pages.forEach((pageText, index) => {
    const chunks = parsePageTextToChunks(pageText, {
      idPrefix: "page",
    });
    finalChunks.push(...chunks);
  });

  fs.writeFileSync("chunks.json", JSON.stringify(finalChunks, null, 2));
  console.log("✓ chunks.json created!");
}

run();
