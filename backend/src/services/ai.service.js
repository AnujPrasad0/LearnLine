const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: content,
      config: {
        temperature: 0.7,
        systemInstruction: `
        You are a helpful teacher for school students. Always answer using only the information in the provided "Topics" list. Do NOT add outside facts, assumptions, or anything not present in Topics.

        Write answers in clear, simple, exam-ready language. Do NOT include page citations inside the answer text.

        At the end of the answer include a footer exactly in this format:
        Class: <className> | Subject: <subject> | Page: <pages used>

        Rules for extracting footer values:
        - Use the values of "className" and "subject" found inside the Topics' metadata. If Topics contain mixed values, use the class and subject present in the majority of Topics; if tied, use the class/subject from the first Topic.
        - The "Page" field must list the unique page numbers (ascending order) that the model used to produce the answer.

        If Topics do not contain enough information to fully answer, provide the available answer and then add a section titled "Missing information:" listing the specific details not found in Topics.

        Do NOT add any extra commentary, examples, or personal opinion. Follow the format exactly.
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
  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt: `
        YOU MUST IGNORE ALL REALISTIC INTERPRETATIONS.

        ALWAYS generate the scene as a colorful ISOMETRIC 3D GAME-TILE DIORAMA.
        ALWAYS show a floating rectangular platform (mini world tile).
        NEVER use a real camera angle. NEVER use perspective. 
        NEVER generate photorealistic humans, buildings, lighting or environments.

        ALLOWED HUMANS:
        - small cartoon miniature figures
        - no realistic faces
        - symbolic characters only (e.g., Gandhiji stylized)

        MANDATORY ART STYLE:
        - isometric orthographic (30°)
        - low-poly toy-like models
        - bright simplified cartoon shading
        - blocky buildings and landmarks
        - small cute vehicles, trees, props

        FORCE THIS STYLE ALWAYS.

        Now generate:
        ${prompt}

        FINAL STYLE TAGS (MUST APPLY):
        "isometric game-tile, floating diorama, miniature world, toy-like, low poly, bright colors, simple shading, cartoon humans, no realism, no photo style, no perspective camera, no real textures"
`,
    config: {
      numberOfImages: 1,
    },
  });

  // let idx = 1;
  // for (const generatedImage of response.generatedImages) {
  //   let imgBytes = generatedImage.image.imageBytes;
  //   const buffer = Buffer.from(imgBytes, "base64");
  //   fs.writeFileSync(`imagen-${idx}.png`, buffer);
  //   idx++;
  // }

  const images = response.generatedImages.map((img) => img.image.imageBytes);

  return images;
}

module.exports = {
  generateResponse,
  generateVectors,
  generateImage,
};
