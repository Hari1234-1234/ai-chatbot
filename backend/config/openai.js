const OpenAI = require("openai");

// Create an OpenAI client using the API key
// stored in the backend .env file.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export the client so other files can use it.
module.exports = openai;
