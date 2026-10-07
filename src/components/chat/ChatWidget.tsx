import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendChatMessage, type ChatMessage, type ChatProduct } from '../../lib/api';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  products?: ChatProduct[];
};

const STORAGE_KEY = 'roboexpert_chat_history';
const OPEN_KEY = 'roboexpert_chat_open';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'model',
  text: "Hi! I'm RoboBot 👋 Ask me anything about RoboExpert — find products, track orders, or get help. What can I do for you?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
      const wasOpen = localStorage.getItem(OPEN_KEY);
      if (wasOpen === 'true') setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, open ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [open]);

  // Auto-scroll to latest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history from previous messages (skip welcome and current user msg)
    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, parts: m.text }));

    const result = await sendChatMessage(trimmed, history);

    if (!result.ok) {
      const errMsg: Message = {
        id: `e_${Date.now()}`,
        role: 'model',
        text: "Sorry, I'm having trouble right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } else {
      const botMsg: Message = {
        id: `b_${Date.now()}`,
        role: 'model',
        text: result.reply ?? '',
        products: result.products,
      };
      setMessages((prev) => [...prev, botMsg]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-2.5rem)] bg-white rounded-2xl shadow-2xl border border-surface-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">RoboBot</p>
                <p className="text-[11px] text-white/80 leading-tight">
                  Always here to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="text-xs text-white/80 hover:text-white px-2 py-1 rounded transition-colors"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-surface-50"
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex items-start gap-2 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-primary-600 border border-surface-200'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <UserIcon className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white text-surface-800 border border-surface-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 ml-9 space-y-2">
                    {msg.products.slice(0, 3).map((p) => (
                      <Link
                        key={p._id}
                        to={`/product/${p._id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-surface-200 hover:border-primary-400 hover:shadow-sm transition-all"
                      >
                        <img
                          src={p.image ?? 'https://picsum.photos/40'}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover bg-surface-100 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/40';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-surface-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-xs font-bold text-primary-600">
                            ₹{p.basePrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-white text-primary-600 border border-surface-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-surface-200 bg-white flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 resize-none px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:border-primary-500 max-h-24"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-surface-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}