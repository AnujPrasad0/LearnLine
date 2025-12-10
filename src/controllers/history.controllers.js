const aiService = require("../services/ai.service");
const vectorService = require("../services/vector.service");

async function historyAns(req, res) {
  try {
    const { content } = req.body;
    //   console.log(content);
    const vectors = await aiService.generateVectors(content);
    //   console.log(vectors);
    const memory = await vectorService.queryMemory({
      limit: 5,
      queryVector: vectors,
      metadata: {
        content: content,
        class: "class-8",
        subject: "history",
      },
    });

    const ans = [
      {
        text: `these are some topics, use them to generate a response
              ${memory.map((item) => item.metadata.content).join("\n")}
              `,
      },
    ];
    console.log(ans);
    res.status(200).json({
      answer: ans,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function historyText(content) {
  console.log(content);

  //   try {
  //     const { content } = req.body;
  //     console.log(content);
  //     const vectors = await aiService.generateVectors(content);
  //     const query = await vectorService.createMemory({
  //       paraId: "1",
  //       vectors,
  //       metadata: {
  //         content: content,
  //         class: "class-8",
  //         subject: "history",
  //       },
  //     });
  //     console.log(query);
  //     res.status(200).json({
  //       message: "Memory created successfully",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({
  //       message: "Internal Server Error",
  //     });
  //   }
}

module.exports = { historyAns, historyText };
