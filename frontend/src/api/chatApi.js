import axiosInstance from "./axiosInstance";

// Send a question to the chatbot.
export const sendChatMessage = async (
  documentId,
  question,
  conversationId = null,
) => {
  const response = await axiosInstance.post("/chat", {
    documentId,
    question,
    conversationId,
  });

  return response.data;
};

// Get all conversations of the logged-in user.
export const getConversations = async () => {
  const response = await axiosInstance.get("/chat/conversations");

  return response.data;
};

// Get messages from a particular conversation.
export const getConversationMessages = async (conversationId) => {
  const response = await axiosInstance.get(
    `/chat/conversations/${conversationId}`,
  );

  return response.data;
};

// Delete a conversation.
export const deleteConversation = async (conversationId) => {
  const response = await axiosInstance.delete(
    `/chat/conversations/${conversationId}`,
  );

  return response.data;
};
