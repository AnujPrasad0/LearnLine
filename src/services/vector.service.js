const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const history = pc.index("history-class-8");

async function createMemory({ paraId, vectors, metadata }) {
  await history.upsert([
    {
      id: paraId,
      values: vectors,
      metadata,
    },
  ]);
}

async function queryMemory({ limit = 5, queryVector, metadata }) {
  const data = await history.query({
    topK: limit,
    vector: queryVector,
    filter: metadata ? metadata : undefined,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory,
};
