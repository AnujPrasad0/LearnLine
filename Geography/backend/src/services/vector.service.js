const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const history = pc.index("geography");

async function createMemory({ id, vectors, metadata }) {
  try {
    await history.upsert([
      {
        id,
        values: vectors,
        metadata,
      },
    ]);
  } catch (error) {
    console.log(error);
  }
}

async function queryMemory({ limit = 5, queryVector, metadata }) {
  try {
    const filter = Object.fromEntries(
      Object.entries(metadata || {}).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const data = await history.query({
      topK: limit,
      vector: queryVector,
      filter: Object.keys(filter).length ? filter : undefined,
      includeMetadata: true,
    });

    return data.matches;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createMemory,
  queryMemory,
};
