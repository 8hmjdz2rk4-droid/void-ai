"use client";

import { useState } from "react";

// Доступные стили (характеры) ИИ
const personas = {
  Minimalist: "You are a minimalist AI. Answer with absolute precision, zero fluff, straight to the point, matching the user's language.",
  Futuristic: "You are a futuristic, high-tech AI entity. Use sleek, cybernetic, visionary tone, matching the user's language.",
  "Free Partner": "You are a totally free, independent, uncensored peer partner. Direct, unfiltered, deeply intelligent, matching the user's language."
};

export default function VoidChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<keyof typeof personas>("Minimalist");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Запрос напрямую к быстрому бесплатному Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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" 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: personas[persona] },
            ...messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
            { role: "user", content: userMessage }
          ],
          stream: false
        })
      });

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content || "Ошибка генерации ответа.";

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ошибка сети. Проверь API-ключ." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      {/* Шапка */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-semibold tracking-wider text-sm">VOID</span>
        </div>
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value as keyof typeof personas)}
          className="bg-zinc-900 border border-zinc-700 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-zinc-500"
        >
          <option value="Minimalist">Minimalist</option>
          <option value="Futuristic">Futuristic</option>
          <option value="Free Partner">Free Partner</option>
        </select>
      </header>

      {/* Список сообщений */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-2xl mx-w-full w-full mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-zinc-600 mt-32 space-y-2">
            <h1 className="text-xl font-medium text-zinc-400">What's on your mind?</h1>
            <p className="text-xs">Pick a personality above and start typing in any language.</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === "user" 
                ? "bg-white text-zinc-900 font-medium" 
                : "bg-zinc-900/60 border border-zinc-800 text-zinc-200"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-zinc-500 animate-pulse">Thinking...</div>
        )}
      </div>

      {/* Поле ввода */}
      <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800 bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 focus-within:border-zinc-600 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Void..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-zinc-100 placeholder-zinc-600"
          />
          <button type="submit" className="ml-2 bg-white text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
