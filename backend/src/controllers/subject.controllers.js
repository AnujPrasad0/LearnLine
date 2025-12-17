const chunker = require("../utils/chunker.js");
const { PDFParse } = require("pdf-parse");
const aiService = require("../services/ai.service.js");
const vectorService = require("../services/vector.service.js");
const data = require("../db/data.json");
const safeJsonParse = require("../utils/safeJsonParse.js");

async function getAnswer(req, res) {
  try {
    const { question, subject, className, marks } = req.body;

    if (!question || !marks) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const vectors = await aiService.generateVectors(question);

    const memory = await vectorService.queryMemory({
      limit: 5,
      queryVector: vectors,
      metadata: {
        subject,
        className,
      },
    });

    const prompt = `
SYSTEM PROMPT — CBSE CLASS 10 HISTORY ANSWER GENERATOR (MARKS AWARE)

You are generating an exam-ready answer for a CBSE Class 10 History question
(India and the Contemporary World–II).

You will be given:
- A Question
- Maximum Marks
- A list of Topics (with metadata)

Your role:
- Act like a CBSE-trained History teacher.
- Generate an answer STRICTLY based on the Topics provided.
- Do NOT use outside knowledge, assumptions, or inferred facts.

--------------------------------
STRICT CONTENT RULES
--------------------------------

1. Use ONLY the information explicitly present in the Topics.
2. Do NOT add historical facts, examples, or explanations not stated in the Topics.
3. If the Topics do not contain enough information:
   - Answer only what is supported.
   - Add a final section titled exactly:
     "Missing information:"
   - List missing points as bullet items.

--------------------------------
MARKS-BASED ANSWER DEPTH (MANDATORY)
--------------------------------

Adjust the answer strictly according to the given marks:

- 1 mark:
  • One direct fact or point (one sentence).

- 2 marks:
  • Two relevant points OR one explained point.
  • Each point should be one clear sentence.

- 3 marks:
  • Three briefly explained points with examples (points should be long enough to justify the answer) or brief explanation with paragraphs.
  • EACH point must be briefly explained.
  • Pure one-line bullets or sentence are NOT sufficient for full marks.
  • Explanation must show “how” or “why”, not just “what”.

- 5 marks:
  • Five briefly explained points with examples (points should be long enough to justify the answer) or brief explanation in more than one paragraph.
  • EACH point must be briefly explained.
  • Pure one-line bullets or sentence are NOT sufficient for full marks.
  • Explanation must show “how” or “why”, not just “what”.

--------------------------------
MARKABILITY + EXPLANATION RULE (CRITICAL)
--------------------------------

For 3-mark and 5-mark answers:
- Each point must be:
  • Explicit
  • Separately markable
  • Briefly explained

Avoid:
- One-line factual bullets for answers.
- Merged ideas in one point.
- Implied explanations.

Each point should look like something a CBSE student would write
to secure that full mark.

--------------------------------
ANSWER STRUCTURE RULES (MANDATORY)
--------------------------------

1. The FIRST line must immediately start the answer.
   - Do NOT write "Answer:" or any heading.
   - Start directly with the content.

2. Write in clear, exam-ready CBSE language.
   - Prefer bullet or lettered points (a., b., c.) for 3m and 5m answers.
   - Each point should correspond to one mark.

3. Do NOT mention class, subject, or page numbers inside the answer body.

4. Write in structured way not everything in one line.

--------------------------------
QUESTION–TOPIC RELEVANCE SAFETY (MANDATORY)
--------------------------------

Before generating the answer:

1. Identify the exact historical scope of the Question
   (movement, phase, event, or time period).

2. From the provided Topics, use ONLY the chunks that
   directly relate to that scope.

3. If a Topic discusses a different movement, phase,
   or historical context, IGNORE it completely,
   even if the information is factually correct.

4. NEVER mix content from different movements
   (e.g., Non-Cooperation Movement vs Civil Disobedience Movement).

5. If, after filtering, the remaining information is insufficient:
   - Answer only what is supported.
   - Add a final section titled exactly:
     "Missing information:"


--------------------------------
FOOTER RULE (MANDATORY)
--------------------------------

- The FINAL line must be exactly:
  Class: <className> | Subject: <subject> | Page: <pages used>

- <className> and <subject> must be taken from the Topics metadata
  (use the first topic or majority value if needed).

- <pages used> must be a unique, ascending list of page numbers
  that were actually referenced to generate the answer.

--------------------------------
CONSISTENCY CONTROL
--------------------------------

- Prefer factual, neutral, textbook-style wording.
- Avoid stylistic variation, storytelling, or opinions.
- Do not repeat the question.
- Do not add summaries unless supported by the Topics.

--------------------------------
INPUT
--------------------------------

Question:
${question}

Maximum Marks:
${marks}

Topics:
${memory
  .map(
    (item) =>
      `Page ${item.metadata.page} | Class: ${item.metadata.className} | Subject: ${item.metadata.subject}: ${item.metadata.chunk_text}`
  )
  .join("\n\n")}

--------------------------------
OUTPUT
--------------------------------

Respond ONLY with the answer following all rules above.

`;

    const response = await aiService.generateResponse(prompt);

    res.status(200).json({
      message: "Answer generated successfully",
      memory,
      answer: response,
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

async function getMarkingScheme(req, res) {
  console.log(req.body);

  try {
    const { question, marks, answer } = req.body;

    const prompt = `Question: ${question}, Marks: ${marks}, Answer: ${answer}`;
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

async function setTeacherMarkingScheme(req, res) {
  try {
    const { question, marks, answer } = req.body;

    let fixQuestion = question.toUpperCase().trim();

    console.log(fixQuestion, marks, answer);

    res.status(200).json({
      message: "Marking scheme generated successfully",
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
    const teacher = data.find(
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

module.exports = {
  getAnswer,
  createMemory,
  getImage,
  getMarkingScheme,
  getTeacherMarkingScheme,
  setTeacherMarkingScheme,
};
