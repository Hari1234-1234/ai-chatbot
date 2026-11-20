const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const { searchDocument } = require("../controllers/searchController");

router.post("/", authenticateUser, searchDocument);

module.exports = router;
