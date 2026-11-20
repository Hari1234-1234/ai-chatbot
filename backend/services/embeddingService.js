const prisma = require("../config/db");

// Generate an embedding using Ollama locally.
const generateEmbedding = async (text) => {
  const response = await fetch("http://localhost:11434/api/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "all-minilm",
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama embedding failed: ${error}`);
  }

  const data = await response.json();

  const embedding = data.embeddings[0];

  if (!embedding || embedding.length !== 384) {
    throw new Error("Invalid embedding dimensions from Ollama");
  }

  return embedding;
};

// Generate embeddings for all chunks of a document.
const generateDocumentEmbeddings = async (documentId, userId) => {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: userId,
    },
    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
      },
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.chunks.length === 0) {
    throw new Error("No chunks found for this document");
  }

  let processedChunks = 0;

  for (const chunk of document.chunks) {
    // Generate a 384-dimensional embedding.
    const embedding = await generateEmbedding(chunk.content);

    // Convert the array into pgvector format.
    const vectorString = `[${embedding.join(",")}]`;

    // Save the embedding in PostgreSQL.
    await prisma.$executeRaw`
      UPDATE "DocumentChunk"
      SET embedding = ${vectorString}::vector
      WHERE id = ${chunk.id}
    `;

    processedChunks++;
  }

  return {
    documentId: document.id,
    totalChunks: document.chunks.length,
    processedChunks,
  };
};

module.exports = {
  generateEmbedding,
  generateDocumentEmbeddings,
};
