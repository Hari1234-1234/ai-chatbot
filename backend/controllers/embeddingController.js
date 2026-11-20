const { generateDocumentEmbeddings } = require("../services/embeddingService");

// Generate embeddings for a document belonging to the logged-in user.
const createDocumentEmbeddings = async (req, res) => {
  try {
    // Get document ID from the URL.
    const documentId = Number(req.params.documentId);

    // Get authenticated user ID from JWT middleware.
    const userId = req.user.userId;

    if (!Number.isInteger(documentId) || documentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    // Generate and store embeddings for all document chunks.
    const result = await generateDocumentEmbeddings(documentId, userId);

    return res.status(200).json({
      success: true,
      message: "Document embeddings generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Embedding generation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate embeddings",
    });
  }
};

module.exports = {
  createDocumentEmbeddings,
};
