import {
  speakText,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
} from "../utils/speechUtils";

const ChatWindow = ({ messages, loading }) => {
  return (
    <div className="chat-window">
      {/* Display all conversation messages */}
      {messages.map((message, index) => (
        <div key={index} className={`chat-message ${message.role}`}>
          {/* User question */}
          {message.role === "user" && (
            <div className="user-message">{message.content}</div>
          )}

          {/* AI answer */}
          {message.role === "assistant" && (
            <div className="assistant-message">
              <p>{message.content}</p>

              {/* Text-to-Speech */}
              <div className="voice-controls">
                <button
                  type="button"
                  onClick={() => speakText(message.content)}
                >
                  🔊 Listen
                </button>

                <button type="button" onClick={pauseSpeech}>
                  ⏸ Pause
                </button>

                <button type="button" onClick={resumeSpeech}>
                  ▶ Resume
                </button>

                <button type="button" onClick={stopSpeech}>
                  ⏹ Stop
                </button>
              </div>

              {/* Display document sources */}
              {message.sources?.length > 0 && (
                <div className="chat-sources">
                  <strong>Sources:</strong>

                  {message.sources.map((source) => (
                    <span key={source.chunkId}>
                      Chunk {source.chunkIndex + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Show loading while AI generates an answer */}
      {loading && (
        <div className="assistant-message loading-message">
          AI is thinking...
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
