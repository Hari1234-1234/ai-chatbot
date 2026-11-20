const prisma = require("../config/db");
const { generateEmbedding } = require("./embeddingService");

// Search document chunks using vector similarity.
const searchDocumentChunks = async (question, documentId, userId) => {
  // Step 1: Generate an embedding for the user's question.
  const questionEmbedding = await generateEmbedding(question);

  // Step 2: Convert the embedding array into pgvector format.
  const vectorString = `[${questionEmbedding.join(",")}]`;

  // Step 3: Find the most similar chunks.
  const results = await prisma.$queryRaw`
    SELECT
      dc.id,
      dc.content,
      dc."chunkIndex",
      dc."documentId",
      (dc.embedding <=> ${vectorString}::vector) AS distance
    FROM "DocumentChunk" dc
    INNER JOIN "Document" d
      ON d.id = dc."documentId"
    WHERE
      dc."documentId" = ${documentId}
      AND d."userId" = ${userId}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> ${vectorString}::vector
    LIMIT 5
  `;

  return results;
};

module.exports = {
  searchDocumentChunks,
};
