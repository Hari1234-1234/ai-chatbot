const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
  createDocumentEmbeddings,
} = require("../controllers/embeddingController");

// Generate embeddings for one document.
router.post("/:documentId", authenticateUser, createDocumentEmbeddings);

module.exports = router;
