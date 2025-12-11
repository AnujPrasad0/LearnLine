const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const chunker = require("../utils/chunker.js");

async function run() {
  const parser = new PDFParse({
    // url: "https://afeias.com/wp-content/uploads/2019/04/class8_history_english.pdf",
    url: "https://www.drishtiias.com/images/pdf/History6.pdf",
  });

  const result = await parser.getText();

  const data = {
    text: result.text,
  };

  fs.writeFileSync("output6.json", JSON.stringify(data, null, 2));
  console.log("Saved to output6.json");

  // Split PDF into pages (pdf-parse uses \f as form-feed)
  const pages = chunker.splitIntoPages(result.text);

  let allChunks = [];

  pages.forEach(({ pageNumber, text }) => {
    const chunks = chunker.parsePageTextToChunks(text, {
      subject: "History",
      className: "Class 6",
      idPrefix: "page",
      pageIndex: pageNumber - 1, // optional, not needed now
    });

    allChunks.push(...chunks);
  });

  fs.writeFileSync("history6.json", JSON.stringify(allChunks, null, 2));
  console.log("✓ history6.json created!");
}

run();
