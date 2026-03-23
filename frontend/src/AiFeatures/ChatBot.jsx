import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, Sparkles, X } from "lucide-react";
import axios from "axios";
import { API_URL } from "../utils/constants";

function ChatBotPanel({ onClose }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    const userText = message;
    setChat((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText },
    ]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat/chatbot`, {
        message: userText,
      });
      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: res.data.message,
          products: res.data.products || [],
          categories: res.data.categories || [],
        },
      ]);
    } catch (err) {
      let errorText = "Sorry, I'm having trouble connecting. Please try again.";
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        errorText = `AI is busy right now. Please wait ${retryAfter}s and try again.`;
      }
      setChat((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: errorText },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-body">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#004ac6] text-white flex-shrink-0 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Bot className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-display font-bold text-base block leading-none mb-0.5">ChatBot</span>
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-black flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-all active:scale-90 relative z-10"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f9f9ff] custom-scrollbar">
        {chat.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-end gap-2.5 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.sender === "bot" ? (
                <div className="w-8 h-8 bg-white border border-[#f0f4ff] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mb-1">
                   <Bot className="w-4 h-4 text-[#004ac6]" strokeWidth={2} />
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#141b2d] rounded-lg flex items-center justify-center flex-shrink-0 mb-1">
                   <div className="w-2.5 h-2.5 bg-white/20 rounded-full" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "user"
                    ? "bg-[#004ac6] text-white rounded-br-none"
                    : "bg-white text-[#141b2d] border border-[#f0f4ff] rounded-bl-none"
                  }`}
              >
                <p className="font-body text-[13px]">{msg.text}</p>

                {/* Products */}
                {msg.products?.length > 0 && (
                  <div className="mt-4 border-t border-black/5 pt-3 space-y-2">
                    {msg.products.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center gap-3 bg-white/50 border border-black/5 rounded-xl p-2 group cursor-pointer hover:bg-white transition-colors"
                      >
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg shadow-sm"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate text-[#141b2d]">{p.name}</p>
                          <p className="text-[9px] text-[#5c6880] uppercase tracking-widest">{p.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Categories */}
                {msg.categories?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.categories.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#f0f4ff] text-[#004ac6] text-[9px] font-bold uppercase rounded-lg border border-[#004ac6]/10">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 bg-white border border-[#f0f4ff] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mb-1">
                 <Bot className="w-4 h-4 text-[#004ac6]" strokeWidth={2} />
              </div>
              <div className="p-4 rounded-2xl rounded-bl-none bg-white border border-[#f0f4ff] shadow-sm">
                <div className="flex gap-1.5 items-center h-4">
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      className="w-1.5 h-1.5 bg-[#004ac6] rounded-full animate-bounce"
                      style={{ animationDelay: `${dot * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-5 bg-white border-t border-[#f0f4ff] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full h-12 pl-12 pr-4 bg-[#f9f9ff] border border-[#f0f4ff] rounded-xl focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all text-sm font-semibold text-[#141b2d] placeholder:text-gray-300 disabled:opacity-50"
              placeholder="Write your message…"
            />
            <MessageSquare
              className="w-4 h-4 text-[#004ac6]/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#004ac6] transition-colors"
              strokeWidth={2}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim() || loading}
            className="w-12 h-12 bg-[#004ac6] text-white rounded-xl flex items-center justify-center hover:bg-[#141b2d] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10"
          >
            <Send className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="text-[9px] font-bold text-gray-300 mt-2.5 text-right uppercase tracking-[0.2em]">
           Powered by WonderCart Intelligence
        </div>
      </div>
    </div>
  );
}

export default ChatBotPanel;
