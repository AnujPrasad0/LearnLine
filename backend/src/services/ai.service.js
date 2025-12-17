const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: {
        temperature: 0.7,
        systemInstruction: `
You are a CBSE Class 10 History answer generator and evaluator.

You must strictly follow ALL rules provided in the user prompt.
Do not ignore, override, or reinterpret any instruction.

Always:
- Use ONLY the information provided in the Topics.
- Respect the given maximum marks when generating answers.
- Follow CBSE exam-style structure and language.
- Enforce mandatory formatting rules such as:
  • First line must directly start the answer.
  • Final line must be the required footer.
- Do NOT add outside facts, assumptions, or opinions.
- Do NOT include explanations about your reasoning unless explicitly asked.

If there is a conflict:
- Follow the more restrictive rule.
- Never break content-source or formatting constraints.

        `,
      },
    });
    return response.text;
  } catch (error) {
    console.log(error);
  }
}

async function generateTeacherMarkingScheme({
  question,
  answer,
  memory,
  teacherParser,
}) {
  console.log(question, answer, memory, teacherParser);

  const prompt = `Question:
  "${question}"

  Teacher Marking Segments (JSON):
  ${teacherParser}

  Reference Chunks from Textbook:
  ${memory.map((chunk) => chunk.metadata.chunk_text).join("\n")}

  Student Answer:
  "${answer}"

  Evaluate the student answer according to the rules.
  `;

  // console.log(prompt);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: `You are a CBSE content evaluator.

  Your task is to evaluate a student’s answer based ONLY on the teacher’s marking scheme.

  You will be given:
  - A Question
  - Teacher marking segments (ground truth)
  - Reference chunks from NCERT or textbooks (support only)
  - A Student answer

  IMPORTANT ROLE CLARITY:
  - You are NOT correcting grammar or spelling
  - You are NOT rewriting or paraphrasing the student answer
  - You are NOT adding or removing marking points

  STRICT RULES:
  1. Teacher marking segments are the ONLY source of marks.
  2. Evaluate EACH teacher segment independently.
  3. For each teacher segment:
     - Award full marks if the idea is clearly present.
     - Award partial marks if the idea is partially present.
     - Award zero marks if the idea is missing or incorrect.
     - And write why marks get deducted in deductions array.
  4. When showing student answer:
     - write the full line for which you giving marks.
     - Do NOT rewrite or rephrase the student’s words.
     - Don't write anything if marks are 0.
  5. Do NOT consider spelling or grammar.
  6. Do NOT use reference chunks to add new points; they are only for understanding.
  7. Do NOT explain outside the JSON.
  8. Output ONLY valid raw JSON. No markdown. No extra text.

  OUTPUT FORMAT (STRICT):

  {
    "segments": [
      {
        "teacherSegment": "...",
        "studentAnswer": "...",
        "maxMarks": 1,
        "awardedMarks": 1
      }
    ],
    "deductions": [],
    "totalMarksAwarded": 0,
    "maximumMarks": 0
  }

  FORMAT EXAMPLE (STYLE ONLY):

  Input:
  Teacher marking segment:
  "Liberalism stood for individual freedom and equality before the law. [1]"

  Student answer:
  "Liberalism believed in freedom and equality for everyone."

  Output:
  {
    "segments": [
      {
        "teacherSegment": "Liberalism stood for individual freedom and equality before the law.",
        "studentAnswer": "Liberalism believed in freedom and equality for everyone.",
        "maxMarks": 1,
        "awardedMarks": 1
      }
    ],
    "deductions": [(if not full marks write why not full marks)],
    "totalMarksAwarded": 1,
    "maximumMarks": 1
  }

  - Output ONLY valid JSON
  - Do NOT include markdown, code fences, or explanations
  - Do NOT wrap the output in anything
  `,
      },
    });
    return response.text;
  } catch (error) {
    console.log(error);
  }
}

async function generateMarkingScheme(ans) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: ans,
      config: {
        temperature: 0.7,
        systemInstruction: `
        SYSTEM PROMPT — CBSE CLASS 10 HISTORY ANSWER EVALUATOR

You are an examiner evaluating a CBSE Class 10 History
(India and the Contemporary World–II) answer.

Your task:
1. PREPROCESS the student answer before evaluation:
   - If the answer contains any trailing metadata such as:
     "<className> | Subject: <subject> | Page: <pages used>"
     or similar class/subject/page information,
     REMOVE it completely.
   - Do NOT consider this metadata while marking.
2. Evaluate the cleaned answer strictly using CBSE step-wise marking.
3. Award marks out of the given maximum.
4. If full marks are NOT awarded, clearly list what is missing or incorrect.
5. Do NOT rewrite the answer. Only evaluate and give feedback.

--------------------------------
STEP MARKING RULES (HISTORY ONLY)
--------------------------------

1. 1-Mark Questions (MCQ / Map / Case sub-parts)
- Award 1 mark only if the answer is fully correct.
- Award 0 marks for wrong, vague, or unattempted answers.
- No partial marking.

2. 2-Mark Questions (Very Short Answer)
- Expected: Two relevant points OR one clearly explained point.
- Award 1 mark per correct point.
- If only one correct point is present → award 1 mark.
- Ignore irrelevant or repeated points.

3. 3-Mark Questions (Short Answer)
- Three briefly explained points with examples (points should be long enough to justify the answer) or brief explanation with paragraphs.
- EACH point must be briefly explained.
- Pure one-line bullets or sentence are NOT sufficient for full marks.
- Explanation must show “how” or “why”, not just “what”.

4. 4-Mark Questions (Case-Based / Source-Based)
- Consist of four sub-questions of 1 mark each.
- Award 1 mark only if the answer is derived from the given source.
- No partial marking within a sub-question.
- General knowledge not supported by the source gets 0 mark.

5. 5-Mark Questions (Long Answer)
- Expected: Five long explained points with examples (points should be long enough to justify the answer) or long explanation in more than one paragraph.
- EACH point must be long explained.
- Pure one-line bullets or sentence are NOT sufficient for full marks.
- Explanation must show “how” or “why”, not just “what”.
- Maximum marks capped at 5.

6. Map-Based Questions
- Each correct location/event carries 1 mark.
- Correct identification and labeling → 1 mark.
- Wrong location → 0 mark.
- Ignore spelling mistakes if identification is clear.

--------------------------------
EVALUATION OUTPUT FORMAT
--------------------------------

Marks Awarded: X / Y

Correct Points:
- (List points that earned marks)

Missing / Incorrect Points:
- (List specific facts, explanations, or keywords missing)

Final Remark:
- (One short sentence on how to improve to get full marks)

--------------------------------
IMPORTANT
--------------------------------
- Follow step-wise marking, not overall impression.
- Credit correct historical terms and concepts.
- Ignore grammar unless meaning changes.
- Be strict but fair, exactly like a CBSE examiner.

Wait for the question, maximum marks, and the student’s answer before evaluating.
        `,
      },
    });
    return response.text;
  } catch (error) {
    console.log(error);
  }
}

async function generateVectors(content) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: content,
      config: {
        outputDimensionality: 768,
      },
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.log(error);
  }
}

async function generateImage(prompt) {
  // IMAGE 2 — ISOMETRIC 3D
  const isometricPrompt = `
You are creating a CHILD-FRIENDLY EDUCATIONAL MEMORY MAP.

ALWAYS generate a colorful ISOMETRIC 3D GAME-TILE DIORAMA.
Floating rectangular platform, orthographic isometric view (30°).
Low-poly, toy-like, bright cartoon shading.
Stylized miniature humans only (no realistic faces).

IMPORTANT EDUCATIONAL RULE:
- Convert the answer into 5–8 CLEAR VISUAL POINTS
- EACH key point must be shown as a SEPARATE AREA or MINI-SCENE on the tile
- Each mini-scene must use STRONG SYMBOLS that children can remember easily

SCENE LOGIC:
- One platform = one topic
- Divide the platform into visible sections (paths, zones, corners)
- Each section visually represents ONE idea from the answer
- Use repeated symbols (scales, chains, buildings, flags, markets, papers)

CONTENT TO VISUALIZE (ANSWER TEXT):
${prompt}

VISUAL MEMORY EXAMPLES (use symbol language):
- Freedom / equality → balance scale, equal people
- Constitution / consent → parliament building, document
- Property rights → fenced land, lock symbol
- Free trade → open market stalls
- Revolution / change → people holding flags
- End of old system → broken chains

Final style:
"isometric educational memory map, floating diorama, low poly,
cartoon humans, symbolic scenes, bright colors,
exam-friendly, no realism, no photo style"
`;

  // IMAGE 2 — COMIC / INFOGRAPHIC
  const comicPrompt = `
Create a CHILD-FRIENDLY EDUCATIONAL COMIC STORYBOARD
to help students remember exam answers.

GOAL:
- This image should help a child RECALL the answer in the exam
- Each panel = ONE POINT of the answer
- Panels must follow the same order as the answer

STYLE (MANDATORY):
- Flat 2D illustration
- NCERT / school textbook style
- Soft pastel colors
- Thick outlines
- Very simple cartoon humans
- No realism, no photorealism

LAYOUT RULES:
- Divide the image into 6–9 PANELS
- Each panel shows ONE KEY IDEA from the answer
- Clear borders between panels
- Visual storytelling from left to right, top to bottom

TEXT RULES (VERY IMPORTANT):
- Use ONLY 2–4 WORD LABELS per panel
- NO paragraphs
- Words must be simple and exam-friendly
- Example labels:
  "Freedom & Equality"
  "Right to Vote"
  "Free Trade"
  "End of Serfdom"

CONTENT TO CONVERT INTO PANELS (ANSWER TEXT):
${prompt}

VISUAL SYMBOL GUIDE:
- Equality → balance scale
- Freedom → open hands / birds
- Constitution → book / paper
- Property → fence / lock
- Trade → market stall
- Reform → paper labeled “Reforms”

Final style:
"educational comic storyboard, exam revision infographic,
simple cartoon art, strong symbols, minimal text,
child-friendly, no realism, no photo style"
`;

  const images = [];

  // 🔹 Call 1 — Isometric

  // 🔹 Call 2 — Comic

  const [res1, res2] = await Promise.all([
    // 🔹 Call 1 — Isometric
    ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: isometricPrompt,
      config: {
        numberOfImages: 1,
      },
    }),
    // 🔹 Call 2 — Comic
    ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: comicPrompt,
      config: {
        numberOfImages: 1,
      },
    }),
  ]);

  images.push(res1.generatedImages[0].image.imageBytes);
  images.push(res2.generatedImages[0].image.imageBytes);
  return images;
}

async function generateMarkingSchemeParser(answer) {
  const prompt = `${answer} Convert the marking scheme into structured JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: `You are a CBSE marking scheme PARSER.

Your task is ONLY to convert a teacher-provided marking scheme
into structured JSON.

IMPORTANT:
- You are NOT evaluating correctness
- You are NOT filtering relevance
- You are NOT modifying content

STRICT RULES:
- Include EVERY point that carries marks ([1], [2], etc.)
- Ignore ONLY lines explicitly marked [0]
- Preserve the original meaning and scope of each point
- Do NOT remove examples, consequences, or applications (e.g. railways)
- Do NOT judge whether a point answers the question
- Do NOT add new historical information
- Do NOT merge multiple points
- Do NOT split a single marked point
- Keep wording as close as possible to the original sentence
- Only make minimal grammatical cleanup if absolutely necessary
- Extract 3–6 keywords directly from the sentence
- Output ONLY valid raw JSON
- Do NOT include markdown or explanations

Example:
"Workers protested against low wages. [1]"

Output:
{
  "segments": [
    {
      "text": "Workers protested against low wages.",
      "marks": 1,
      "keywords": ["workers", "low wages"]
    },
  ],
  "totalMarks": 2
}

- Output ONLY valid JSON
- Do NOT include markdown, code fences, or explanations
- Do NOT wrap the output in anything
`,
      },
    });

    return response.text;
  } catch (error) {
    console.error(error);
  }
}

async function generateCheck(answer) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: answer,
      config: {
        temperature: 0.7,
        systemInstruction: `You are a spelling and grammar checker.

Your task is to analyze a given text and identify:
- Spelling mistakes
- Grammar mistakes

IMPORTANT ROLE:
- You are NOT an evaluator
- You are NOT judging content correctness
- You are NOT rewriting the full answer
- You are ONLY detecting and reporting language errors

STRICT RULES:
- Do NOT change the original meaning
- Do NOT add new content
- Do NOT remove any sentence
- Report mistakes EXACTLY as they appear in the text
- Do NOT fix the text automatically
- If there are NO mistakes, return empty arrays
- Do NOT include explanations outside JSON
- Output ONLY valid raw JSON (no markdown, no code fences)

MISTAKE REPORTING RULES:
For each mistake:
- Quote the incorrect text exactly
- Provide the corrected form
- Provide a short one-line reason

MARK DEDUCTION RULES (LANGUAGE ONLY):
- If total mistakes (spelling + grammar) = 0 → marksDeducted = 0
- If total mistakes are few (minor errors) → marksDeducted = 0.5
- If total mistakes are many (frequent or repeated errors) → marksDeducted = 1
- Do NOT deduct more than 1 mark
- Do NOT explain how marks are deducted outside JSON

OUTPUT FORMAT (STRICT):

{
  "spellingMistakes": [
    {
      "incorrect": "teh",
      "correct": "the",
      "reason": "Spelling mistake"
    }
  ],
  "grammarMistakes": [
    {
      "incorrect": "He go to school",
      "correct": "He goes to school",
      "reason": "Subject-verb agreement error"
    }
  ],
  "marksDeducted": 0
}

FINAL RULES:
- marksDeducted MUST always be present
- Output ONLY valid JSON
- Do NOT include markdown, code fences, or explanations
- Do NOT wrap the output in anything
`,
      },
    });

    return response.text;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  generateMarkingScheme,
  generateResponse,
  generateVectors,
  generateImage,
  generateTeacherMarkingScheme,
  generateMarkingSchemeParser,
  generateCheck,
};
