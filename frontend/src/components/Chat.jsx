import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async () => {
    const data = await api.posts.list();
    const newMessages = Array.isArray(data) ? data : [];
    
    const prevLength = messages.length;
    setMessages(newMessages);
    setLoading(false);
    
    if (newMessages.length > prevLength) {
      shouldScrollRef.current = true;
    } else {
      shouldScrollRef.current = false;
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await api.posts.create(newMessage.trim());
    setNewMessage('');
    shouldScrollRef.current = true;
    setTimeout(() => loadMessages(), 100);
  };

  const handleReact = async (id, emoji) => {
    const result = await api.posts.react(id, emoji);
    if (result.reactions) {
      setMessages(prev => prev.map(msg => 
        msg._id === id ? { ...msg, reactions: result.reactions } : msg
      ));
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const groupedMessages = [];
  let currentDate = null;
  
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ type: 'date', date: msg.createdAt });
    }
    groupedMessages.push({ type: 'message', ...msg });
  });

  const reactions = ['❤️', '😂', '🔥', '👏', '🎉', '👍'];

  return (
    <>
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-group-icon">👥</div>
            <div>
              <h2>The Crew</h2>
              <span className="chat-subtitle">{messages.length} messages</span>
            </div>
          </div>
        </div>

        <div className="chat-messages" ref={containerRef} onScroll={handleScroll}>
          {loading ? (
            <div className="chat-loading">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <span className="empty-icon">💬</span>
              <p>No messages yet</p>
              <p className="empty-sub">Say hello to the crew!</p>
            </div>
          ) : (
            groupedMessages.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className="date-divider">
                    <span>{formatDate(item.date)}</span>
                  </div>
                );
              }
              
              const msg = item;
              const isOwn = msg.author?._id === user?._id;
              
              return (
                <div 
                  key={msg._id} 
                  className={`message-row ${isOwn ? 'own' : 'other'}`}
                >
                  {!isOwn && (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author?.displayName || 'U')}&background=2A9D8F&size=100&bold=true`}
                      alt={msg.author?.displayName}
                      className="msg-avatar"
                    />
                  )}
                  
                  <div className={`message-bubble-wrap ${isOwn ? 'own' : ''}`}>
                    {!isOwn && (
                      <span className="msg-author">{msg.author?.displayName}</span>
                    )}
                    <div className={`msg-bubble ${isOwn ? 'own' : ''}`}>
                      <p className="msg-text">{msg.content}</p>
                    </div>
                    <div className={`msg-footer ${isOwn ? 'own' : ''}`}>
                      <span className="msg-time">{formatTime(msg.createdAt)}</span>
                      <div className="msg-reactions">
                        {reactions.slice(0, 3).map(emoji => (
                          <button
                            key={emoji}
                            className="reaction-micro"
                            onClick={() => handleReact(msg._id, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} style={{ height: '10px' }} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <button type="button" className="emoji-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>

      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 100%;
          background: var(--surface);
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--secondary);
          color: white;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-group-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .chat-header h2 {
          font-family: 'Quicksand', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }

        .chat-subtitle {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: #ECE5DD;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cdc4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .chat-loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .chat-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--surface);
          border-radius: var(--radius-md);
          margin: auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-sub {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .date-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 16px 0 12px;
        }

        .date-divider span {
          background: var(--surface);
          padding: 6px 16px;
          border-radius: 18px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message-row {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
          max-width: 85%;
        }

        .message-row.own {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-row.other {
          align-self: flex-start;
        }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          align-self: flex-end;
        }

        .message-bubble-wrap {
          display: flex;
          flex-direction: column;
          max-width: 100%;
        }

        .message-bubble-wrap.own {
          align-items: flex-end;
        }

        .msg-author {
          font-size: 0.7rem;
          font-weight: 600;
          color: #075E54;
          margin-bottom: 2px;
          margin-left: 12px;
        }

        .msg-bubble {
          background: var(--surface);
          padding: 8px 12px;
          border-radius: 7px;
          border-top-left-radius: 0;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.1);
          max-width: 100%;
        }

        .msg-bubble.own {
          background: #DCF8C6;
          border-radius: 7px;
          border-top-right-radius: 0;
        }

        .msg-text {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #111;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .msg-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
          padding: 0 4px;
        }

        .msg-footer.own {
          justify-content: flex-end;
        }

        .msg-time {
          font-size: 0.65rem;
          color: #999;
        }

        .msg-reactions {
          display: flex;
          gap: 1px;
        }

        .reaction-micro {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          font-size: 0.75rem;
          border-radius: 10px;
          transition: all 0.15s ease;
        }

        .reaction-micro:hover {
          background: rgba(0,0,0,0.1);
          transform: scale(1.2);
        }

        .chat-input-area {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #F0F0F0;
        }

        .emoji-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #555;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover {
          background: rgba(0,0,0,0.1);
        }

        .chat-input {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 20px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          background: white;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .chat-input:focus {
          outline: none;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 2px var(--primary);
        }

        .send-btn {
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(42, 157, 143, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #ccc;
        }

        @media (max-width: 768px) {
          .message-row {
            max-width: 90%;
          }
        }
      `}</style>
    </>
  );
}
