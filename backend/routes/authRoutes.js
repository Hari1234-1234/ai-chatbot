const express = require("express");

const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

const validateRequest = require("../middleware/validateMiddleware");

const { registerSchema, loginSchema } = require("../validators/authValidators");

// Registration API
router.post("/register", validateRequest(registerSchema), registerUser);

// Login API
router.post("/login", validateRequest(loginSchema), loginUser);

module.exports = router;
