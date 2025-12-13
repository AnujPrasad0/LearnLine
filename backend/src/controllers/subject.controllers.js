const chunker = require("../utils/chunker.js");
const { PDFParse } = require("pdf-parse");
const aiService = require("../services/ai.service.js");
const vectorService = require("../services/vector.service.js");

async function getAnswer(req, res) {
  try {
    const { question, subject, className } = req.body;

    const vectors = await aiService.generateVectors(question);

    const memory = await vectorService.queryMemory({
      limit: 5,
      queryVector: vectors,
      metadata: {
        subject,
        className,
      },
    });

    console.log(memory);

    const prompt = `
          Answer the question below USING ONLY the information in the "Topics" list.
          Do NOT add outside facts, assumptions, or make things up.
          If the topics do not contain enough information to fully answer, respond with what is available and clearly list what is missing.

          Important output rules (follow exactly):
          - First line must direct start answer.
          - You may write the answer in paragraphs or in bullet/lettered points, depending on what suits the question. The number of points or paragraphs should naturally match the depth required by the question (for example, longer questions may require 5-10 points or multiple paragraphs).
          - If information is missing, add a final section exactly titled "Missing information:" and list missing details as bullet points.
          - Final line must be the footer: Class: <className> | Subject: <subject> | Page: <pages used>
          - <className> and <subject> must be taken from the Topics' metadata (use majority or first topic if needed).
          - <pages used> must be the unique ascending list of page numbers referenced to produce the answer.

          Question:
          ${question}

          Topics:
          ${memory
            .map(
              (item) =>
                `Page ${item.metadata.page} | Class: ${item.metadata.className} | Subject: ${item.metadata.subject}: ${item.metadata.chunk_text}`
            )
            .join("\n\n")}

    Respond ONLY with the answer following the rules above.`;

    // console.log(prompt);

    const ans = [{ text: prompt }];

    const response = await aiService.generateResponse(ans);

    const images = await aiService.generateImage(response);

    res.status(200).json({
      answer: response,
      images: images,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function createMemory(req, res) {
  try {
    const { url, subject, className } = req.body;
    const parser = new PDFParse({
      url: url,
    });

    const result = await parser.getText();

    const pages = chunker.splitIntoPages(result.text);

    let allChunks = [];

    pages.forEach(({ pageNumber, text }) => {
      const chunks = chunker.parsePageTextToChunks(text, {
        idPrefix: className + "_" + subject,
        subject,
        className,
        pageIndex: pageNumber - 1, // optional, not needed now
      });

      allChunks.push(...chunks);
    });

    // fs.writeFileSync("chunks.json", JSON.stringify(allChunks, null, 2));
    // console.log("✓ chunks.json created!");

    for (const chunk of allChunks) {
      const vectors = await aiService.generateVectors(
        chunk.metadata.chunk_text
      );

      await vectorService.createMemory({
        paraId: chunk._id,
        vectors: vectors,
        metadata: chunk.metadata,
      });
    }

    res.status(201).json({
      message: "Memory created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getImage(req, res) {
  try {
    const { prompt } = req.body;
    const images = await aiService.generateImage(prompt);
    res.status(200).json({
      message: "Image generated successfully",
      images,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = { getAnswer, createMemory, getImage };
