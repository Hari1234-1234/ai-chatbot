// Generate an answer using the Ollama Llama model.
// Now accepts conversation history as a third parameter.
const generateAnswer = async (question, context, conversationHistory = []) => {
  try {
    // Prepare messages for Ollama.
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant.

        Answer the user's questions using the provided document context
        and relevant conversation history.

        Use conversation history to understand follow-up questions
        such as "What are its advantages?" or "Explain that again".

        However, use the uploaded document as the factual source.

        If the answer is not available in the document context,
        say that the information is not available
        in the uploaded document.`,
      },

      // Previous conversation messages.
      ...conversationHistory.map((message) => ({
        role: message.role,
        content: message.content,
      })),

      // Current question with retrieved document context.
      {
        role: "user",
        content: `Document Context:
${context}

User Question:
${question}`,
      },
    ];

    // Send conversation history, context and question to Ollama.
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "llama3.2:1b",
        messages,
        stream: false,
        options: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama chat failed: ${error}`);
    }

    const data = await response.json();

    return data.message.content;
  } catch (error) {
    console.error("LLM generation error:", error);
    throw error;
  }
};

module.exports = {
  generateAnswer,
};
