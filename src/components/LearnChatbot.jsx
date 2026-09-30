import { db } from '@/api/base44Client';

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Download, Bot, User, Trash2, Mic, Languages } from "lucide-react";

const SUGGESTIONS = {
  en: [
    "What is sea ice and why does it matter?",
    "Tell me about India's Antarctic stations",
    "How does climate change affect the poles?",
    "What does NCPOR do?",
  ],
  hi: [
    "समुद्री बर्फ क्या है और इसका महत्व क्यों है?",
    "भारत के अंटार्कटिक स्टेशन के बारे में बताइए",
    "जलवायु परिवर्तन ध्रुवों को कैसे प्रभावित करता है?",
    "एनसीपीओआर क्या करता है?",
  ],
};

const STRINGS = {
  en: {
    greeting: "Namaste! I'm PolarBot, your polar science learning assistant. Ask me about Antarctica, the Arctic, sea ice, climate change, or India's polar research expeditions.",
    placeholder: "Ask about polar science...",
    online: "Online · Polar Science Assistant",
    cleared: "Chat cleared. What would you like to learn about?",
    error: "Sorry, I couldn't process your request right now. Please try again in a moment.",
    listening: "Listening…",
    noMic: "Voice input isn't supported in this browser.",
  },
  hi: {
    greeting: "नमस्ते! मैं पोलरबॉट हूँ, आपका ध्रुवीय विज्ञान सहायक। अंटार्कटिका, आर्कटिक, समुद्री बर्फ, जलवायु परिवर्तन या भारत के ध्रुवीय अभियानों के बारे में पूछिए।",
    placeholder: "ध्रुवीय विज्ञान के बारे में पूछिए...",
    online: "ऑनलाइन · ध्रुवीय विज्ञान सहायक",
    cleared: "चैट साफ़ हो गई। आप किस बारे में जानना चाहेंगे?",
    error: "क्षमा करें, अभी प्रसंस्करण नहीं हो सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
    listening: "सुन रहा हूँ…",
    noMic: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।",
  },
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function LearnChatbot() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: STRINGS.en.greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const t = STRINGS[language];

  // Reset greeting when language changes (only if conversation is just the greeting)
  useEffect(() => {
    setMessages((prev) => {
      const onlyGreeting = prev.length === 1 && (prev[0].content === STRINGS.en.greeting || prev[0].content === STRINGS.hi.greeting);
      return onlyGreeting ? [{ role: "assistant", content: t.greeting }] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    setListening(false);
  };

  const startListening = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert(t.noMic);
      return;
    }
    stopListening();
    const recognition = new SR();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join(" ");
      if (transcript.trim()) {
        setOpen(true);
        sendMessage(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    try { recognition.start(); } catch (e) { setListening(false); }
  };

  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const conversation = newMessages
        .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
        .join("\n");

      const langInstruction =
        language === "hi"
          ? "आप पोलरबॉट हैं। कृपया हिंदी (देवनागरी) में उत्तर दें।"
          : "You are PolarBot. Please respond in English.";

      const res = await db.integrations.Core.InvokeLLM({
        prompt: `You are PolarBot, a friendly educational assistant on the PolarSetu platform by NCPOR (National Centre for Polar and Ocean Research, India). Help students, teachers and curious citizens understand polar science: Antarctica, the Arctic, sea ice, glaciers, climate change, polar ecosystems, and India's polar expeditions and research stations (Bharati, Maitri, Himadri). Keep answers clear, accurate and educational. Use simple language suitable for students. If you don't know something, say so honestly.\n\n${langInstruction}\n\nConversation so far:\n${conversation}\n\nAssistant:`,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadMessage = (content, index) => {
    const blob = new Blob([`PolarBot Response\n${"=".repeat(40)}\n\n${content}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `polarbot-response-${index + 1}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const transcript = messages
      .map((m) => `[${m.role === "user" ? "You" : "PolarBot"}]\n${m.content}`)
      .join("\n\n" + "-".repeat(40) + "\n\n");
    const blob = new Blob([`PolarSetu — PolarBot Chat Transcript\n${"=".repeat(40)}\n\n${transcript}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `polarbot-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: t.cleared }]);
  };

  const toggleLanguage = () => {
    stopListening();
    setLanguage((l) => (l === "en" ? "hi" : "en"));
  };

  return (
    <>
      {/* Floating buttons: mic adjacent (left) + chat (right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
        <button
          onClick={listening ? stopListening : startListening}
          className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 ${
            listening
              ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/40"
              : "bg-gradient-to-br from-[#F4A340] to-[#E08A2B] shadow-[#F4A340]/30"
          }`}
          aria-label={listening ? t.listening : "Voice input"}
          title={listening ? t.listening : "Voice input"}
        >
          <Mic className="h-5 w-5" />
          {listening && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            </span>
          )}
        </button>

        <button
          onClick={() => { setOpen(!open); stopListening(); }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4DA8D8] to-[#0B2942] text-white shadow-lg shadow-[#0B2942]/30 transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Open PolarBot chat"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!open && (
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4DA8D8] opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-[#4DA8D8]" />
            </span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#071A2B] to-[#0B2942] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4DA8D8]/20">
                <Bot className="h-5 w-5 text-[#4DA8D8]" />
              </div>
              <div>
                <div className="text-sm font-semibold">PolarBot</div>
                <div className="flex items-center gap-1 text-[11px] text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> {t.online}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                title="Switch language (English / हिंदी)"
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                  language === "hi" ? "bg-[#F4A340]/20 text-[#F4A340]" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Languages className="h-4 w-4" />
                {language === "hi" ? "हिं" : "EN"}
              </button>
              <button onClick={downloadAll} title="Download full transcript" className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
                <Download className="h-4 w-4" />
              </button>
              <button onClick={clearChat} title="Clear chat" className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} title="Close" className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-[#0B2942]" : "bg-[#4DA8D8]"}`}>
                  {m.role === "user" ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                </div>
                <div className={`group max-w-[78%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-[#0B2942] text-white" : "border border-border bg-white text-foreground"}`}>
                    {m.content}
                  </div>
                  {m.role === "assistant" && i > 0 && (
                    <button
                      onClick={() => downloadMessage(m.content, i)}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity hover:text-[#4DA8D8] group-hover:opacity-100"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4DA8D8]">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-2xl border border-border bg-white px-3 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            {listening && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#F4A340]">
                <span className="flex h-2 w-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[#F4A340]" /></span>
                {t.listening}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-white px-3 py-2">
              {SUGGESTIONS[language].map((s) => (
                <button key={s} onClick={() => sendMessage(s)} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground transition-colors hover:border-[#4DA8D8]/40 hover:text-[#4DA8D8]">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border bg-white p-3">
            <button
              onClick={listening ? stopListening : startListening}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                listening ? "bg-red-500 text-white" : "bg-secondary text-[#0B2942] hover:bg-[#4DA8D8]/15"
              }`}
              title={listening ? t.listening : "Voice input"}
            >
              <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={t.placeholder}
              dir={language === "hi" ? "ltr" : "ltr"}
              className="flex-1 rounded-full border border-border bg-[#F8FAFC] px-4 py-2 text-sm outline-none focus:border-[#4DA8D8] focus:ring-1 focus:ring-[#4DA8D8]/30"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B2942] text-white transition-colors hover:bg-[#071A2B] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}