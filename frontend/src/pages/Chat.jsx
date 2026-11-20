import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { getMyDocuments } from "../api/documentApi";

import {
  sendChatMessage,
  getConversations,
  getConversationMessages,
  deleteConversation,
} from "../api/chatApi";

import ChatWindow from "../components/ChatWindow";
import ChatSidebar from "../components/ChatSidebar";

import "./Chat.css";

const SUGGESTIONS = [
  "Summarize this document",
  "What are the key points?",
  "List any dates or deadlines mentioned",
];

const Chat = () => {
  // ===================================
  // STATE MANAGEMENT
  // ===================================

  // Stores uploaded documents.
  const [documents, setDocuments] = useState([]);

  // Stores selected document ID.
  const [documentId, setDocumentId] = useState("");

  // Stores current question.
  const [question, setQuestion] = useState("");

  // Stores current conversation messages.
  const [messages, setMessages] = useState([]);

  // Stores all previous conversations.
  const [conversations, setConversations] = useState([]);

  // Stores active conversation ID.
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Loading states.
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loading, setLoading] = useState(false);

  // Stores error messages.
  const [error, setError] = useState("");

  const textareaRef = useRef(null);

  // Tracks whether the microphone is currently listening.
  const [isListening, setIsListening] = useState(false);

  // Stores the speech recognition instance.
  const recognitionRef = useRef(null);
  // ===================================
  // LOAD DOCUMENTS AND CONVERSATIONS
  // ===================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [documentResponse, conversationResponse] = await Promise.all([
          getMyDocuments(),
          getConversations(),
        ]);

        const documentList = Array.isArray(documentResponse)
          ? documentResponse
          : documentResponse.documents || [];

        setDocuments(documentList);

        setConversations(conversationResponse.conversations || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load chat data");
      } finally {
        setLoadingDocuments(false);
        setLoadingConversations(false);
      }
    };

    loadInitialData();
  }, []);

  // ===================================
  // REFRESH CONVERSATION LIST
  // ===================================

  const refreshConversations = async () => {
    try {
      const response = await getConversations();

      setConversations(response.conversations || []);
    } catch (error) {
      console.error("Failed to refresh conversations:", error);
    }
  };

  // ===================================
  // START NEW CHAT
  // ===================================

  const handleNewChat = () => {
    if (loading) return;

    setActiveConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
  };

  // ===================================
  // SELECT EXISTING CONVERSATION
  // ===================================

  const handleSelectConversation = async (conversationId) => {
    if (loading) return;

    try {
      setError("");
      setMessages([]);
      setActiveConversationId(conversationId);

      const response = await getConversationMessages(conversationId);

      const conversation = response.conversation;

      setDocumentId(String(conversation.documentId));

      setMessages(conversation.messages || []);
    } catch (error) {
      setActiveConversationId(null);

      setError(error.response?.data?.message || "Failed to load conversation");
    }
  };

  // ===================================
  // DELETE CONVERSATION
  // ===================================

  const handleDeleteConversation = async (conversationId) => {
    if (loading) return;

    try {
      await deleteConversation(conversationId);

      setConversations((previousConversations) =>
        previousConversations.filter(
          (conversation) => conversation.id !== conversationId,
        ),
      );

      // Clear the chat if the deleted conversation is active.
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
        setQuestion("");
      }

      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete conversation",
      );
    }
  };

  // ===================================
  // VOICE INPUT - SPEECH TO TEXT
  // ===================================

  // Start microphone listening.
  const startListening = () => {
    // Check browser support.
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    // Create a speech recognition instance.
    const recognition = new SpeechRecognition();

    // Recognize English speech.
    recognition.lang = "en-IN";

    // Show partial results while the user speaks.
    recognition.interimResults = true;

    // Stop after the user finishes speaking.
    recognition.continuous = false;

    recognitionRef.current = recognition;

    // When speech is recognized.
    recognition.onresult = (event) => {
      let recognizedText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        recognizedText += event.results[i][0].transcript;
      }

      // Add recognized speech to the existing message.
      setQuestion((previousQuestion) =>
        previousQuestion
          ? `${previousQuestion} ${recognizedText}`
          : recognizedText,
      );
    };

    // When listening starts.
    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    // When listening stops.
    recognition.onend = () => {
      setIsListening(false);
    };

    // Handle microphone errors.
    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setError("Please allow microphone access in your browser.");
      } else if (event.error !== "no-speech") {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    // Start listening.
    recognition.start();
  };

  // Stop microphone listening.
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // ===================================
  // SEND QUESTION TO BACKEND
  // ===================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!documentId) {
      setError("Please select a document");
      return;
    }

    if (!trimmedQuestion || loading) {
      return;
    }

    setError("");

    // Display user's question immediately.
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      // Send question with existing conversation ID.
      const response = await sendChatMessage(
        Number(documentId),
        trimmedQuestion,
        activeConversationId,
      );

      // Save the conversation ID returned by backend.
      setActiveConversationId(response.conversationId);

      // Display AI answer and sources.
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources || [],
        },
      ]);

      // Refresh sidebar with updated conversation.
      await refreshConversations();
    } catch (error) {
      // The backend can create a conversation before
      // discovering that no relevant document content exists.
      const returnedConversationId = error.response?.data?.conversationId;

      if (returnedConversationId) {
        setActiveConversationId(returnedConversationId);
        await refreshConversations();
      }

      setError(error.response?.data?.message || "Failed to generate an answer");
    } finally {
      setLoading(false);
    }
  };

  // Enter sends the question, Shift+Enter adds a new line.
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      handleSubmit(event);
    }
  };

  const handleSuggestion = (text) => {
    setQuestion(text);
    textareaRef.current?.focus();
  };

  // ===================================
  // EMPTY STATE (before the first message)
  // ===================================

  const renderEmptyState = () => {
    if (!loadingDocuments && documents.length === 0) {
      return (
        <div className="chat-empty">
          <span className="chat-empty-icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
            </svg>
          </span>
          <h2>No documents yet</h2>
          <p>
            Upload a PDF or DOCX first, then come back to ask questions about
            it.
          </p>
          <Link to="/dashboard" className="chat-empty-link">
            Go to my documents
          </Link>
        </div>
      );
    }

    return (
      <div className="chat-empty">
        <span className="chat-empty-icon" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>

        {documentId ? (
          <>
            <h2>What would you like to know?</h2>
            <p>Ask in plain language. Each answer shows where it came from.</p>

            <div className="suggestions">
              {SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  className="suggestion"
                  onClick={() => handleSuggestion(text)}
                >
                  {text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>Choose a document to begin</h2>
            <p>Pick one from the list above, then ask your question.</p>
          </>
        )}
      </div>
    );
  };

  // ===================================
  // JSX
  // ===================================

  return (
    <div className="chat-page">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        loading={loadingConversations}
      />

      <main className="chat-main">
        <header className="chat-header">
          <h1 className="chat-title">AI Document Chat</h1>

          {/* Document Selection */}
          <div className="document-selector">
            <label htmlFor="document">Document</label>

            <select
              id="document"
              value={documentId}
              onChange={(event) => {
                setDocumentId(event.target.value);

                setMessages([]);
                setActiveConversationId(null);
                setError("");
              }}
              disabled={loadingDocuments || loading}
            >
              <option value="">
                {loadingDocuments
                  ? "Loading documents..."
                  : "Select a document"}
              </option>

              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.originalName}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Chat Messages, or the empty state before the first message */}
        {messages.length === 0 && !loading ? (
          <div className="chat-window chat-window-empty">
            {renderEmptyState()}
          </div>
        ) : (
          <ChatWindow messages={messages} loading={loading} />
        )}

        {/* Error Message */}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {/* Question Input */}

        {/* Question Input */}
        <form onSubmit={handleSubmit} className="chat-form">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              documentId
                ? "Ask something about your document..."
                : "Select a document to start asking questions"
            }
            aria-label="Your question"
            rows={2}
            disabled={!documentId || loading}
          />

          {/* Microphone Button */}
          <button
            type="button"
            className={`mic-button ${isListening ? "listening" : ""}`}
            onClick={isListening ? stopListening : startListening}
            disabled={!documentId || loading}
            title={isListening ? "Stop recording" : "Start voice input"}
            aria-label={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? (
              // Stop icon
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              // Microphone icon
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <path d="M12 17v5" />
                <path d="M8 22h8" />
              </svg>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!documentId || !question.trim() || loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>

        <p className="chat-hint">Enter to send, Shift+Enter for a new line</p>
      </main>
    </div>
  );
};

export default Chat;
