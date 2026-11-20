const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
  chatWithDocument,
  getConversations,
  getConversationMessages,
  deleteConversation,
} = require("../controllers/chatController");

// Protect all chat routes.
router.use(authenticateUser);

// Send a question.
router.post("/", chatWithDocument);

// Get all conversations.
router.get("/conversations", getConversations);

// Get messages from one conversation.
router.get("/conversations/:id", getConversationMessages);

// Delete a conversation.
router.delete("/conversations/:id", deleteConversation);

module.exports = router;
