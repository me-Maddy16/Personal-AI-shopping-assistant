"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_EN = "Good to have you here. I'm **Sahi** — your personal shopping assistant. I'll ask you a few questions before recommending anything, so what I suggest actually fits you.\n\nWhat are you looking to buy today?";
const WELCOME_HI = "Aagaye! Main hoon **Sahi** — aapka personal shopping assistant. Seedha recommend karne ki jagah, pehle thoda samjhunga aapki zaroorat.\n\nAaj kya dhundh rahe ho?";

const CHIPS_EN = ["Best phone under ₹20,000", "Gift for sister's wedding", "Skincare for oily skin", "Earbuds under ₹3,000"];
const CHIPS_HI = ["₹20,000 mein best phone", "Behen ki shaadi ke liye gift", "Oily skin ke liye skincare", "₹3,000 mein earbuds"];

export default function ShoppingAssistant() {
  const [stage, setStage] = useState<"key" | "language" | "chat">("key");
  const [apiKey, setApiKey] = useState("");
  const [language, setLanguage] = useState<"English" | "Hinglish" | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectLanguage = (lang: "English" | "Hinglish") => {
    setLanguage(lang);
    setStage("chat");
    setMessages([{ role: "assistant", content: lang === "English" ? WELCOME_EN : WELCOME_HI }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (text?: string) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    setError("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language, apiKey }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setStage("key");
    setApiKey("");
    setLanguage(null);
    setMessages([]);
    setInput("");
    setError("");
  };

  // API Key Screen
  if (stage === "key") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-3xl mb-4 shadow-lg">
                🛍️
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Sahi</h1>
              <p className="text-[#666] text-sm mt-1">Your personal shopping assistant</p>
            </div>

            <div className="mb-4">
              <label className="text-[#444] text-xs font-medium uppercase tracking-widest mb-2 block">
                XAI API KEY
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="xai-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && apiKey.length > 10 && setStage("language")}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#444] transition-colors placeholder:text-[#333]"
                />
              </div>
            </div>

            <button
              onClick={() => setStage("language")}
              disabled={apiKey.length < 10}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm disabled:opacity-20 hover:bg-gray-100 transition-all mt-2"
            >
              Continue →
            </button>

            <p className="text-[#333] text-xs text-center mt-4">
              Get your key at{" "}
              <a href="https://console.x.ai" target="_blank" rel="noreferrer" className="text-[#555] underline underline-offset-2 hover:text-[#888] transition-colors">
                console.x.ai
              </a>
            </p>
            <p className="text-[#222] text-xs text-center mt-1">SESSION ONLY · KEY NEVER STORED</p>
          </div>
        </div>
      </div>
    );
  }

  // Language Screen
  if (stage === "language") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-2xl mb-3">
                🛍️
              </div>
              <h1 className="text-xl font-bold text-white">How should I talk to you?</h1>
              <p className="text-[#444] text-xs mt-1">Choose your preferred style</p>
            </div>

            <div className="space-y-3">
              {(["English", "Hinglish"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => selectLanguage(lang)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[#0a0a0a] border border-[#222] rounded-2xl hover:border-[#444] hover:bg-[#111] transition-all group"
                >
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">{lang}</p>
                    <p className="text-[#444] text-xs mt-0.5">
                      {lang === "English" ? "Professional, precise" : "Like a friend who shops well"}
                    </p>
                  </div>
                  <span className="text-[#333] group-hover:text-[#666] transition-colors">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Screen
  const chips = language === "Hinglish" ? CHIPS_HI : CHIPS_EN;
  const showChips = messages.length === 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="bg-[#0f0f0f] border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-base">
            🛍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">Sahi</p>
              <span className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {language}
              </span>
            </div>
            <p className="text-[#333] text-xs">Grok-3-mini · live search</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-[#333] hover:text-[#666] text-xs border border-[#1a1a1a] hover:border-[#333] px-3 py-1.5 rounded-lg transition-all"
        >
          ↺ New session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                🛍️
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-br-sm"
                : "bg-[#111] border border-[#1a1a1a] text-[#ccc] rounded-bl-sm"
            }`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mt-1">{children}</ol>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mt-1">{children}</ul>,
                  li: ({ children }) => <li className="text-[#ccc]">{children}</li>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">{children}</a>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Prompt chips */}
        {showChips && (
          <div className="flex flex-wrap gap-2 mt-2">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="text-xs bg-[#111] border border-[#222] text-[#555] hover:text-[#999] hover:border-[#444] px-3 py-1.5 rounded-full transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-sm flex-shrink-0">
              🛍️
            </div>
            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((j) => (
                <span key={j} className="w-1.5 h-1.5 rounded-full bg-[#444] animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-3">
            ⚠ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#0f0f0f] border-t border-[#1a1a1a] px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "Hinglish" ? "Kya dhundh rahe ho aaj..." : "Ask Sahi anything you want to buy..."}
            rows={1}
            className="flex-1 resize-none bg-[#111] border border-[#222] focus:border-[#333] rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder:text-[#333] min-h-[44px] max-h-[120px] overflow-auto transition-colors"
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-white text-black rounded-2xl p-3 disabled:opacity-20 hover:bg-gray-100 transition-all flex-shrink-0"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}