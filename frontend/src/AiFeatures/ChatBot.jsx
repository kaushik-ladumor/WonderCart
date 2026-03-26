import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
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
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userText = message.trim();
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
      let errorText = "Sorry, I am having trouble connecting. Please try again.";
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        errorText = `AI is busy right now. Please wait ${retryAfter}s and try again.`;
      }

      setChat((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: errorText },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white text-[#11182d]">
      <div className="flex items-center justify-between bg-[#0f49d7] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-base font-semibold">ChatBot</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/75">
              WonderCart Assistant
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f7f8fc] px-4 py-4">
        <div className="space-y-4">
          {chat.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[88%] items-start gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full ${
                    msg.sender === "user"
                      ? "bg-[#11182d] text-white"
                      : "bg-[#dfe7ff] text-[#0f49d7]"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <MessageSquare className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>

                <div
                  className={`rounded-[18px] border px-4 py-3 text-sm leading-6 ${
                    msg.sender === "user"
                      ? "border-[#0f49d7] bg-[#0f49d7] text-white"
                      : "border-[#dfe5f2] bg-white text-[#11182d]"
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.products?.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
                      {msg.products.map((product) => {
                        const image =
                          product.images?.[0] ||
                          product.image ||
                          product.variants?.find((variant) => variant?.images?.[0])
                            ?.images?.[0];

                        return (
                          <Link
                            key={product._id}
                            to={`/product-detail/${product._id}`}
                            className="flex items-center gap-3 rounded-2xl border border-[#e6eaf5] bg-[#f8faff] p-2"
                          >
                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white">
                              {image ? (
                                <img
                                  src={image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Bot className="h-4 w-4 text-[#0f49d7]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#11182d]">
                                {product.name}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-[#6a7690]">
                                {product.category || "WonderCart"}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {msg.categories?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.categories.map((category, index) => (
                        <Link
                          key={`${category}-${index}`}
                          to={`/shop?category=${encodeURIComponent(category)}`}
                          className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#0f49d7]"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[88%] items-start gap-2">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#dfe7ff] text-[#0f49d7]">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-[18px] border border-[#dfe5f2] bg-white px-4 py-3 text-sm text-[#6a7690]">
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#e5e9f3] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c88a2]" />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Write your message..."
              className="h-12 w-full rounded-[16px] border border-[#dfe5f2] bg-[#f7f8fc] pl-11 pr-4 text-sm text-[#11182d] outline-none placeholder:text-[#7c88a2] disabled:opacity-60"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!message.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#0f49d7] text-white disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#7c88a2]">
          <span>Powered by WonderCart</span>
          <span>{chat.length} message{chat.length > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatBotPanel;
