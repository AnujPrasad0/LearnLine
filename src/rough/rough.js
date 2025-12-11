const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function run() {
  const parser = new PDFParse({
    url: "https://chahalacademy.com/admin_theme/book_file/India%20and%20Contemporary%20World-Class%20IX.pdf",
  });

  const result = await parser.getText();

  // console.log(result.text);

  const data = {
    text: result.text,
  };

  fs.writeFileSync("output9.json", JSON.stringify(data, null, 2));
  console.log("Saved to output9.json");
}

run();
