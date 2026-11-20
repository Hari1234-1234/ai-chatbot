const { searchDocumentChunks } = require("../services/searchService");

const searchDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;
    const userId = req.user.userId;

    if (
      typeof question !== "string" ||
      !question.trim() ||
      !Number.isInteger(documentId) ||
      documentId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid question and document ID are required",
      });
    }

    const results = await searchDocumentChunks(
      question.trim(),
      documentId,
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Relevant document chunks retrieved successfully",
      results,
    });
  } catch (error) {
    console.error("Document search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search document",
    });
  }
};

module.exports = {
  searchDocument,
};
