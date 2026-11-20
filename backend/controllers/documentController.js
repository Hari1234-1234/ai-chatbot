const fs = require("fs/promises");
const prisma = require("../config/db");
const chunkText = require("../utils/chunkText");

const { extractDocumentText } = require("../services/documentService");

const { generateDocumentEmbeddings } = require("../services/embeddingService");

// ===================================
// UPLOAD DOCUMENT
// ===================================
const uploadDocument = async (req, res) => {
  let savedSuccessfully = false;

  try {
    // Check whether a file was selected.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document",
      });
    }

    // Extract text from the uploaded document.
    const extractedText = await extractDocumentText(req.file);

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in this document",
      });
    }

    // Split the extracted document text into chunks.
    const chunks = chunkText(extractedText, 1000, 150);

    // Do not save an empty document.
    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in the document",
      });
    }

    // Save the document and all its chunks together.
    const document = await prisma.$transaction(async (tx) => {
      // First, save the original document information.
      const newDocument = await tx.document.create({
        data: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          extractedText,
          userId: req.user.userId,
        },
      });

      // Then, save all the generated chunks.
      await tx.documentChunk.createMany({
        data: chunks.map((content, index) => ({
          content,
          chunkIndex: index,
          documentId: newDocument.id,
        })),
      });

      return newDocument;
    });

    // Document and chunks are now safely saved.
    savedSuccessfully = true;

    // ===================================
    // GENERATE DOCUMENT EMBEDDINGS
    // ===================================

    let embeddingResult;

    try {
      // Generate embeddings for all chunks using Ollama.
      const result = await generateDocumentEmbeddings(
        document.id,
        req.user.userId,
      );

      embeddingResult = {
        success: true,
        totalEmbeddings: result.processedChunks,
      };
    } catch (embeddingError) {
      console.error("Document embedding error:", embeddingError);

      // Keep the uploaded document even if embedding
      // generation fails. It can be processed again later.
      embeddingResult = {
        success: false,
        totalEmbeddings: 0,
      };
    }

    // ===================================
    // SEND RESPONSE
    // ===================================

    return res.status(201).json({
      success: true,
      message: embeddingResult.success
        ? "Document uploaded and processed successfully"
        : "Document uploaded, but embedding generation failed",
      document: {
        id: document.id,
        originalName: document.originalName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        createdAt: document.createdAt,
        totalChunks: chunks.length,
      },
      embeddingsGenerated: embeddingResult.success,
      totalEmbeddings: embeddingResult.totalEmbeddings,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  } finally {
    // If extraction or database saving failed,
    // remove the uploaded file from disk.
    if (req.file && !savedSuccessfully) {
      await fs.unlink(req.file.path).catch((error) => {
        console.error("File cleanup error:", error);
      });
    }
  }
};

// ===================================
// GET LOGGED-IN USER DOCUMENTS
// ===================================
const getMyDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: req.user.userId,
      },

      select: {
        id: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch documents",
    });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
};
