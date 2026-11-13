import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { readApiResponse } from "../utils/apiResponse";

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

const conversationParticipantRole = (conversation) => {
  if (conversation?.userId?.role === "admin") return "admin";
  if (conversation?.messages?.some((message) => message.senderRole === "admin")) return "admin";
  return "user";
};

function AdminMessages({ token, role = "superadmin" }) {
  const isSuperAdmin = role === "superadmin";
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const endpoint = isSuperAdmin
        ? `${API_BASE_URL}/api/messages/admin/conversations`
        : `${API_BASE_URL}/api/messages/me`;
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(response, "Unable to load conversations.");
      const nextConversations = isSuperAdmin ? data : data?._id ? [data] : [];
      setConversations(nextConversations);
      setSelectedUserId((current) => {
        if (nextConversations.some((conversation) => conversation.userId?._id === current)) {
          return current;
        }
        return nextConversations[0]?.userId?._id || "";
      });
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, token]);

  useEffect(() => {
    loadConversations();
    const intervalId = window.setInterval(loadConversations, 2500);
    return () => window.clearInterval(intervalId);
  }, [loadConversations]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.userId?._id === selectedUserId
  );
  const participant = selectedConversation?.userId;
  const participantRole = conversationParticipantRole(selectedConversation);
  const participantLabel = roleLabel(participantRole);

  const sendReply = async (event) => {
    event.preventDefault();
    const message = reply.trim();
    if (!message || isSending || (isSuperAdmin && !selectedUserId)) return;

    try {
      setIsSending(true);
      setError("");
      const endpoint = isSuperAdmin
        ? `${API_BASE_URL}/api/messages/admin/conversations/${selectedUserId}`
        : `${API_BASE_URL}/api/messages/me`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message }),
      });
      const data = await readApiResponse(response, "Unable to send your message.");
      if (isSuperAdmin) {
        setConversations((current) => [
          data,
          ...current.filter((conversation) => conversation.userId?._id !== selectedUserId),
        ]);
      } else {
        setConversations(data?._id ? [data] : []);
        setSelectedUserId(data?.userId?._id || "");
      }
      setReply("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="admin-messages">
      <div className="admin-messages-heading">
        <div>
          <p>{isSuperAdmin ? "Super Admin Support Inbox" : "Private support channel"}</p>
          <h2>{isSuperAdmin ? "Messages" : "Message Super Admin"}</h2>
        </div>
        <span>
          {isSuperAdmin
            ? `${conversations.length} ${conversations.length === 1 ? "conversation" : "conversations"}`
            : "Only you and the Super Admin can see this conversation"}
          <i className="message-live-indicator"><span /> Live</i>
        </span>
      </div>

      {error && <p className="admin-message-error" role="alert">{error}</p>}

      <div className={`admin-message-layout ${isSuperAdmin ? "" : "admin-message-direct"}`}>
        {isSuperAdmin && (
          <aside className="admin-conversation-list" aria-label="Conversations">
            {isLoading ? (
              <p className="admin-message-empty">Loading conversations…</p>
            ) : conversations.length === 0 ? (
              <p className="admin-message-empty">No support conversations yet.</p>
            ) : (
              conversations.map((conversation) => {
                const customerId = conversation.userId?._id;
                const lastMessage = conversation.messages?.at(-1);
                const customerRole = conversationParticipantRole(conversation);
                return (
                  <button
                    type="button"
                    key={customerId}
                    className={`admin-conversation ${selectedUserId === customerId ? "selected" : ""}`}
                    onClick={() => setSelectedUserId(customerId)}
                  >
                    <span className={`admin-conversation-avatar role-${customerRole}`}>
                      {(conversation.userId?.name || "C").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="admin-conversation-copy">
                      <strong>{conversation.userId?.name || "Customer"}</strong>
                      <small>{conversation.userId?.email}</small>
                      <span className={`message-role-tag role-${customerRole}`}>
                        {roleLabel(customerRole)}
                      </span>
                      <span>{lastMessage?.text || "No messages"}</span>
                    </span>
                  </button>
                );
              })
            )}
          </aside>
        )}

        <div className="admin-conversation-detail">
          {selectedConversation ? (
            <>
              <header className="admin-conversation-header">
                <strong>{participant?.name || (isSuperAdmin ? "Customer" : "Super Admin")}</strong>
                <span>{participant?.email}</span>
                <span className={`message-role-tag role-${participantRole}`}>
                  {participantLabel}
                </span>
              </header>
              <div className="admin-conversation-thread" aria-live="polite">
                {selectedConversation.messages?.map((message, index) => {
                  const senderRole = messageRole(message, participantRole);
                  const isOwnMessage = senderRole === role;
                  return (
                    <div
                      className={`message-bubble ${isOwnMessage ? "from-user" : "from-admin"}`}
                      key={message._id || `message-${index}`}
                    >
                      <strong className={`message-sender-label role-${senderRole}`}>
                        {roleLabel(senderRole)}
                      </strong>
                      <p>{message.text}</p>
                      <time dateTime={message.createdAt}>
                        {new Date(message.createdAt).toLocaleString()}
                      </time>
                    </div>
                  );
                })}
                {!selectedConversation.messages?.length && !isLoading && (
                  <p className="admin-message-empty">
                    {isSuperAdmin
                      ? "No messages in this conversation yet."
                      : "Send a message here. Only you and the Super Admin can see it."}
                  </p>
                )}
              </div>
              <form className="admin-message-compose" onSubmit={sendReply}>
                <label className="visually-hidden" htmlFor="admin-reply">
                  {isSuperAdmin ? "Reply to conversation" : "Message the super admin"}
                </label>
                <textarea
                  id="admin-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={2000}
                  placeholder={isSuperAdmin ? "Write a reply…" : "Write a private message to the super admin…"}
                  rows={2}
                />
                <button type="submit" disabled={!reply.trim() || isSending || (isSuperAdmin && !selectedUserId)}>
                  {isSending ? "Sending…" : "Send message"}
                </button>
              </form>
            </>
          ) : isLoading ? (
            <p className="admin-message-empty">Loading your conversation…</p>
          ) : isSuperAdmin ? (
            <p className="admin-message-empty">Select a conversation to view and reply.</p>
          ) : (
            <div className="admin-message-empty admin-message-welcome">
              <span className="message-role-tag role-superadmin">Super Admin</span>
              <p>Start a private conversation with the Super Admin. Other users and car owners cannot see these messages.</p>
              <form className="admin-message-compose" onSubmit={sendReply}>
                <label className="visually-hidden" htmlFor="admin-first-message">Message the super admin</label>
                <textarea
                  id="admin-first-message"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  maxLength={2000}
                  placeholder="Write a private message to the super admin…"
                  rows={2}
                />
                <button type="submit" disabled={!reply.trim() || isSending}>
                  {isSending ? "Sending…" : "Send message"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminMessages;
