const fs = require("fs");
const chunker = require("../utils/chunker.js");
const { PDFParse } = require("pdf-parse");
const aiService = require("../services/ai.service");
const vectorService = require("../services/vector.service");

async function historyAns(req, res) {
  try {
    const { content, subject, className } = req.body;
    //   console.log(content);
    const vectors = await aiService.generateVectors(content);
    //   console.log(vectors);
    const memory = await vectorService.queryMemory({
      limit: 5,
      queryVector: vectors,
      metadata: {
        subject,
        className,
      },
    });

    console.log(memory);

    // console.log(memory);

    const prompt = `Answer the question below USING ONLY the information in the "Topics" list. 
Do NOT add outside facts, assumptions, or make things up.
If the topics do not contain enough information to fully answer, respond with what is available and clearly list what is missing.
Cite the page number for every statement or claim.

Question:
${content}

Topics:
${memory
  .map((item) => `Page ${item.metadata.page}: ${item.metadata.chunk_text}`)
  .join("\n\n")}
`;

    // 6) prepare the payload your aiService expects (you used an array earlier)
    const ans = [{ text: prompt }];

    const response = await aiService.generateResponse(ans);
    // console.log(ans);
    // console.log(response);
    res.status(200).json({
      answer: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function historyText(req, res) {
  const { url, subject, className } = req.body;
  try {
    // console.log(req.body.url);
    const parser = new PDFParse({
      url: url,
    });

    const result = await parser.getText();

    // Split PDF into pages (pdf-parse uses \f as form-feed)
    // const pages = result.text.split("\f");
    const pages = chunker.splitIntoPages(result.text);

    let allChunks = [];

    pages.forEach(({ pageNumber, text }) => {
      const chunks = chunker.parsePageTextToChunks(text, {
        idPrefix: "page",
        subject,
        className,
        pageIndex: pageNumber - 1, // optional, not needed now
      });

      allChunks.push(...chunks);
    });

    // const vectors = await aiService.generateVectors(
    //   allChunks[2].metadata.chunk_text
    // );
    // allChunks[2].vectors = vectors;

    // await vectorService.createMemory({
    //   paraId: allChunks[2]._id,
    //   vectors: allChunks[2].vectors,
    //   metadata: allChunks[2].metadata,
    // });

    // for (let i = 12; i <= 15; i++) {
    //   const chunk = allChunks[i];
    //   const vectors = await aiService.generateVectors(
    //     chunk.metadata.chunk_text
    //   );
    //   chunk.vectors = vectors;
    // }

    // for (let i = 12; i <= 15; i++) {
    //   const chunk = allChunks[i];
    //   await vectorService.createMemory({
    //     paraId: chunk._id,
    //     vectors: chunk.vectors,
    //     metadata: chunk.metadata,
    //   });
    // }

    for (const chunk of allChunks) {
      const vectors = await aiService.generateVectors(
        chunk.metadata.chunk_text
      );
      chunk.vectors = vectors;
    }

    for (const chunk of allChunks) {
      await vectorService.createMemory({
        paraId: chunk._id,
        vectors: chunk.vectors,
        metadata: chunk.metadata,
      });
    }

    res.status(200).json({
      message: "Memory created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = { historyAns, historyText };
