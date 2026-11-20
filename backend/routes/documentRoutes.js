const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getMyDocuments,
} = require("../controllers/documentController");

// All document APIs require authentication.
router.use(authenticateUser);

// Upload a document.
router.post("/upload", upload.single("document"), uploadDocument);

// Get all documents belonging to the logged-in user.
router.get("/", getMyDocuments);

module.exports = router;
