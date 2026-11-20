require("dotenv").config();

const openai = require("./config/openai");

const testOpenAI = async () => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "React is a JavaScript library.",
    });

    console.log("OpenAI connection successful!");
    console.log("Embedding dimensions:", response.data[0].embedding.length);
  } catch (error) {
    console.error("OpenAI API error:", error.message);
  }
};

testOpenAI();
