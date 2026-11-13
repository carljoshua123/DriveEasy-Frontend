import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { API_BASE_URL } from "../config";
import { readApiResponse } from "../utils/apiResponse";
import "./Messaging.css";

const roleLabel = (role) => ({
  user: "User",
  admin: "Car Owner",
  superadmin: "Super Admin",
}[role] || "User");

const messageRole = (message, participantRole) => {
  const isSuperAdminMessage =
    message.senderRole === "superadmin" ||
    message.sender === "superadmin" ||
    (message.sender === "admin" && !message.senderRole);

  if (isSuperAdminMessage) return "superadmin";
  return ["user", "admin"].includes(participantRole)
    ? participantRole
    : message.senderRole || "user";
};

function MessageWidget({ token, role = "user" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener("driveeasy:open-chat", openChat);
    return () => window.removeEventListener("driveeasy:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    let active = true;
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/messages/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse(response, "Unable to load messages.");
        if (active) {
          setMessages(data.messages || []);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchMessages();
    const intervalId = window.setInterval(fetchMessages, 2500);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isOpen, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = text.trim();
    if (!message || isSending) return;

    try {
      setIsSending(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/messages/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message }),
      });
      const data = await readApiResponse(response, "Unable to send your message.");
      setMessages(data.messages || []);
      setText("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="message-widget">
      {isOpen && (
        <section className="message-panel" aria-label="Message DriveEasy support">
          <header className="message-panel-header">
            <div>
              <p className="message-panel-kicker">Private Support</p>
              <h2>Message Super Admin</h2>
              <span className="message-online"><span /> Only you and the Super Admin can see this chat</span>
            </div>
            <button
              type="button"
              className="message-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close messages"
            >
              <X size={20} />
            </button>
          </header>

          <div className="message-thread" aria-live="polite">
            {messages.length === 0 && !isLoading && (
              <p className="message-empty">
                Send a private message to the Super Admin. Other users and car owners cannot see this conversation.
              </p>
            )}
            {messages.map((message) => {
              const senderRole = messageRole(message, role);
              return (
                <div
                  className={`message-bubble ${senderRole === role ? "from-user" : "from-admin"}`}
                  key={message._id || `message-${message.createdAt}-${message.text}`}
                >
                  <strong className={`message-sender-label role-${senderRole}`}>
                    {roleLabel(senderRole)}
                  </strong>
                  <p>{message.text}</p>
                  <time dateTime={message.createdAt}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              );
            })}
            {isLoading && messages.length === 0 && (
              <p className="message-status">Loading conversation…</p>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p className="message-error" role="alert">{error}</p>}

          <form className="message-compose" onSubmit={sendMessage}>
            <label className="visually-hidden" htmlFor="support-message">
              Write a message
            </label>
            <input
              id="support-message"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={2000}
              placeholder="Write a private message to the super admin…"
              autoComplete="off"
            />
            <button type="submit" disabled={!text.trim() || isSending} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="message-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={23} /> : <MessageCircle size={23} />}
        {!isOpen && <span>Message us</span>}
      </button>
    </div>
  );
}

export default MessageWidget;
