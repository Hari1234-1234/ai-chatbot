const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const embeddingRoutes = require("./routes/embeddingRoutes");
const searchRoutes = require("./routes/searchRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Chatbot API is running",
  });
});

// Authentication routes.
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/embeddings", embeddingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoutes);
module.exports = app;
