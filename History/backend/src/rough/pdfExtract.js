const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const chunker = require("../utils/chunker.js");

async function run() {
  const parser = new PDFParse({
    url: "https://chahalacademy.com/admin_theme/book_file/India%20and%20Contemporary%20World-Class%20X.pdf",
  });

  const className = "10";
  const output = "output10.json";
  const history = "history10.json";
  const subject = "History";

  const result = await parser.getText();

  const data = {
    text: result.text,
  };

  fs.writeFileSync(output, JSON.stringify(data, null, 2));
  console.log(`Saved to ${output}`);

  // Split PDF into pages (pdf-parse uses \f as form-feed)
  const pages = chunker.splitIntoPages(result.text);

  let allChunks = [];

  pages.forEach(({ pageNumber, text }) => {
    const chunks = chunker.parsePageTextToChunks(text, {
      subject,
      className,
      idPrefix: className + "_" + subject,
      pageIndex: pageNumber - 1, // optional, not needed now
    });

    allChunks.push(...chunks);
  });

  fs.writeFileSync(history, JSON.stringify(allChunks, null, 2));
  console.log(`✓ ${history} created!`);
}

run();
