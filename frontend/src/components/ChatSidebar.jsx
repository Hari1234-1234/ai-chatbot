import { Link } from "react-router-dom";
import "./ChatSidebar.css";

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  loading,
}) => {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-top">
        <div className="chat-sidebar-brand">
          <span className="auth-logo">AI</span>
          <span>AI Chatbot</span>
        </div>

        <Link to="/dashboard" className="chat-back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to document
        </Link>

        <button type="button" className="new-chat-button" onClick={onNewChat}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          New chat
        </button>
      </div>

      <h3 className="conversation-heading">Recent chats</h3>

      <div className="conversation-list">
        {loading ? (
          <p className="sidebar-message">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p className="sidebar-message">
            No conversations yet. Start a new chat to ask about a document.
          </p>
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id;

              return (
                <li
                  key={conversation.id}
                  className={`conversation-item ${isActive ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="conversation-select"
                    onClick={() => onSelectConversation(conversation.id)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="conversation-title">
                      {conversation.title}
                    </span>

                    {conversation.document?.originalName && (
                      <span className="conversation-document">
                        {conversation.document.originalName}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="delete-conversation"
                    onClick={() => onDeleteConversation(conversation.id)}
                    aria-label={`Delete conversation: ${conversation.title}`}
                    title="Delete conversation"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
