const prisma = require("../config/db");

const { searchDocumentChunks } = require("../services/searchService");
const { generateAnswer } = require("../services/llmService");

// ===================================
// CHAT WITH DOCUMENT
// ===================================
const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId, conversationId } = req.body;
    const userId = req.user.userId;

    // Validate request data.
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

    // Verify document ownership.
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Get existing conversation or create a new one.
    let conversation;

    if (conversationId !== undefined && conversationId !== null) {
      if (!Number.isInteger(conversationId) || conversationId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
      }

      conversation = await prisma.chatConversation.findFirst({
        where: {
          id: conversationId,
          userId,
          documentId,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    } else {
      conversation = await prisma.chatConversation.create({
        data: {
          title: question.trim().slice(0, 80),
          userId,
          documentId,
        },
      });
    }

    // ===================================
    // SAVE USER QUESTION
    // ===================================

    // Save the current user's question.
    const savedUserMessage = await prisma.chatMessage.create({
      data: {
        role: "user",
        content: question.trim(),
        conversationId: conversation.id,
      },
    });

    // ===================================
    // GET PREVIOUS CONVERSATION HISTORY
    // ===================================

    // Retrieve the previous 10 messages.
    // Exclude the current question.
    const conversationHistory = await prisma.chatMessage.findMany({
      where: {
        conversationId: conversation.id,
        id: {
          not: savedUserMessage.id,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });

    // Search relevant document chunks.
    const relevantChunks = await searchDocumentChunks(
      question.trim(),
      documentId,
      userId,
    );

    if (relevantChunks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No relevant document content found",
        conversationId: conversation.id,
      });
    }

    // Prepare context for the LLM.
    const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

    // Generate answer using Ollama.
    const answer = await generateAnswer(
      question.trim(),
      context,
      conversationHistory,
    );

    // Prepare source information.
    const sources = relevantChunks.map((chunk) => ({
      chunkId: chunk.id,
      chunkIndex: chunk.chunkIndex,
      distance: chunk.distance,
    }));

    // Save assistant answer and sources.
    await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: answer,
        sources,
        conversationId: conversation.id,
      },
    });

    // Update conversation activity time.
    await prisma.chatConversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Answer generated successfully",
      conversationId: conversation.id,
      answer,
      sources,
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate answer",
    });
  }
};

// ===================================
// GET ALL USER CONVERSATIONS
// ===================================
const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        document: {
          select: {
            originalName: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

// ===================================
// GET MESSAGES BY CONVERSATION ID
// ===================================
const getConversationMessages = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user.userId,
      },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation messages",
    });
  }
};

// ===================================
// DELETE CONVERSATION
// ===================================
const deleteConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Related messages are deleted automatically
    // because of onDelete: Cascade in Prisma schema.
    await prisma.chatConversation.delete({
      where: {
        id: conversationId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
};

module.exports = {
  chatWithDocument,
  getConversations,
  getConversationMessages,
  deleteConversation,
};
