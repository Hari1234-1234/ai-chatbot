require("dotenv").config();

const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 4200;

// Start the server only after connecting to PostgreSQL.
const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL database connected successfully");

    app.listen(PORT, () => {
      console.log(`AI Chatbot server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
