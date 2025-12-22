const aiService = require("../services/ai.service");
const vectorService = require("../services/vector.service");
const geography10 = require("../db/geography10/chunks.json");
const geography9 = require("../db/geography9/chunks.json");
const geography8 = require("../db/geography8/chunks.json");
const geography7 = require("../db/geography7/chunks.json");
const geography6 = require("../db/geography6/chunks.json");
const teacherData = require("../db/teacherData.json");
const safeJsonParse = require("../utils/safeJsonParse.js");
const fs = require("fs");

async function createMemory(req, res) {
  const arr = [geography10, geography9, geography8, geography7, geography6];
  try {
    for (const chunks of arr) {
      for (const chunk of chunks) {
        const vectors = await aiService.generateVectors(
          chunk.metadata.chunk_text
        );

        await vectorService.createMemory({
          id: chunk.id,
          vectors: vectors,
          metadata: chunk.metadata,
        });
      }
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

async function getAnswer(req, res) {
  try {
    const { question, className, marks } = req.body;
    if (!question || !className) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const vectors = await aiService.generateVectors(question);

    const memory = await vectorService.queryMemory({
      limit: 5,
      queryVector: vectors,
      metadata: {
        className: className,
      },
    });

    console.log(memory.map((item) => item.metadata?.imagePath));

    let imageInfo = [];
    for (const image of memory) {
      if (!image.metadata.imagePath) {
        continue;
      }
      const info = await aiService.generateImageInformation(
        image.metadata?.imagePath
      );
      imageInfo.push(info);
    }

    const prompt = `
Question:
${question}

Maximum Marks:
${marks}

Topics:
${memory
  .map(
    (item) =>
      `Page ${item.metadata.pdfPage} | Class: ${item.metadata.className} | Subject: ${item.metadata.subject}: ${item.metadata.chunk_text}`
  )
  .join("\n\n")}

Image Information (use ONLY if directly relevant to the question and supported by the Topics):
${imageInfo?.filter(Boolean)?.join("\n")}
`;

    const answer = await aiService.generateAnswer(prompt);

    res.status(200).json({
      answer,
      imageInfo,
      memory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getMarkingScheme(req, res) {
  // console.log(req.body);

  try {
    const { question, marks, answer, className } = req.body;

    const vectors = await aiService.generateVectors(question);

    const memory = await vectorService.queryMemory({
      limit: 5,
      queryVector: vectors,
      metadata: {
        className: className,
      },
    });

    const prompt = `Question: ${question}, Marks: ${marks}, Answer: ${answer}, Topics: ${memory
      .map((item) => `${item.metadata.chunk_text}`)
      .join("\n\n")}`;

    // console.log(prompt);

    const markingScheme = await aiService.generateMarkingScheme(prompt);
    res.status(200).json({
      message: "Marking scheme generated successfully",
      markingScheme,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getTeacherMarkingScheme(req, res) {
  try {
    const { question, marks, answer, subject, className } = req.body;

    if (!question || !answer || !subject || !className) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    // Extracting Teacher Answer
    const teacher = teacherData.find(
      (item) => item.question.trim() === question.trim()
    );

    if (!teacher) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const vectors = await aiService.generateVectors(question);

    let [memory, teacherParser, check] = await Promise.all([
      // Extracting Chunks
      vectorService.queryMemory({
        limit: 5,
        queryVector: vectors,
        metadata: {
          subject,
          className,
        },
      }),
      aiService.generateMarkingSchemeParser(teacher.answer),
      aiService.generateCheck(answer),
    ]);

    console.log(memory, teacherParser, check);

    let markingScheme = await aiService.generateTeacherMarkingScheme({
      question,
      answer,
      memory,
      teacherParser,
    });

    teacherParser = safeJsonParse(teacherParser);

    check = safeJsonParse(check);

    markingScheme = safeJsonParse(markingScheme);

    markingScheme.deductions = {
      content: markingScheme.deductions, // existing content deductions
      spellingMistakes: check.spellingMistakes,
      grammarMistakes: check.grammarMistakes,
      marksDeducted: check.marksDeducted,
    };

    markingScheme.totalMarksAwarded =
      markingScheme.totalMarksAwarded - check.marksDeducted;

    // console.log(markingScheme);

    res.status(200).json({
      message: "Marking scheme generated successfully",
      answer,
      markingScheme,
      teacherParser,
      memory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function setTeacherMarkingScheme(req, res) {
  try {
    const { question, marks, answer } = req.body;

    if (!question || !answer || !marks) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const teacher = teacherData.find(
      (item) => item.question.trim() === question.trim()
    );

    if (teacher) {
      return res.status(400).json({
        message: "Question already exists",
      });
    }

    teacherData.push({
      question,
      marks,
      answer,
    });

    fs.writeFileSync(
      "./src/db/teacherData.json",
      JSON.stringify(teacherData, null, 2)
    );

    res.status(200).json({
      message: "Marking scheme generated successfully",
      teacherData,
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
    const { answer } = req.body;
    const images = await aiService.generateImage(answer);
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

module.exports = {
  createMemory,
  getAnswer,
  getTeacherMarkingScheme,
  setTeacherMarkingScheme,
  getMarkingScheme,
  getImage,
};
