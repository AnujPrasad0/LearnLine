const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function run() {
  const parser = new PDFParse({
    url: "https://afeias.com/wp-content/uploads/2019/04/class8_history_english.pdf",
  });

  const result = await parser.getText();

  // console.log(result.text);

  const data = {
    text: result.text,
  };

  fs.writeFileSync("output.json", JSON.stringify(data, null, 2));
  console.log("Saved to output.json");
}

run();
