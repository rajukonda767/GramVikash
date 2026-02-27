"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useLanguage } from "@/lib/language-context"
import { speak, stopSpeaking, initVoices } from "@/lib/tts"
import {
  MessageCircle,
  Mic,
  Send,
  Volume2,
  Square,
  User,
  Bot,
  Loader2,
  Sparkles,
} from "lucide-react"

function getMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export default function ChatPage() {
  const { lang, t } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastSpokenRef = useRef<string>("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
        body: {
          messages: msgs,
          id,
          lang,
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => { initVoices() }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-speak new assistant messages when streaming completes
  useEffect(() => {
    if (status !== "ready" || messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== "assistant") return
    const text = getMessageText(lastMsg)
    if (!text || text === lastSpokenRef.current) return
    lastSpokenRef.current = text
    speak(text, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
  }, [status, messages, lang])

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking()
    setIsSpeaking(false)
  }, [])

  const handleSpeakMessage = useCallback((text: string) => {
    speak(text, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
  }, [lang])

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert(lang === "te" ? "Chrome బ్రౌజర్ వాడండి" : "Please use Chrome browser")
      return
    }
    stopSpeaking()
    setIsSpeaking(false)

    const recognition = new SR()
    recognition.lang = lang === "te" ? "te-IN" : "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      if (transcript.trim()) {
        sendMessage({ text: transcript.trim() })
      }
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang, sendMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  const suggestedQuestions = lang === "te" ? [
    "వాతావరణం ఎలా ఉంటుంది?",
    "వరి సాగు ఎలా చేయాలి?",
    "పీఎం కిసాన్ గురించి చెప్పు",
    "నేల పరీక్ష ఎలా చేయాలి?",
    "పంట వ్యాధులు ఎలా నివారించాలి?",
  ] : [
    "How is the weather today?",
    "How to grow paddy rice?",
    "Tell me about PM Kisan",
    "How to do soil testing?",
    "How to prevent crop diseases?",
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "te" ? "AI ద్వారా శక్తి" : "Powered by AI"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
          {t.chatTitle}
        </h1>
        <p className="text-muted-foreground text-balance">{t.chatSubtitle}</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 rounded-2xl bg-card/50 backdrop-blur-xl border border-border shadow-lg overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 min-h-[300px]">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                {t.chatWelcome}
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage({ text: q })}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const text = getMessageText(msg)
            if (!text) return null
            return (
              <div
                key={msg.id || i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary/15" : "bg-accent/15"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-accent" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-muted text-foreground rounded-tl-md"
                    }`}>
                      {text}
                    </div>
                    {msg.role === "assistant" && status === "ready" && (
                      <button
                        onClick={() => handleSpeakMessage(text)}
                        className="self-start flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors px-1"
                      >
                        <Volume2 className="h-3 w-3" />
                        {lang === "te" ? "వినండి" : "Listen"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.thinking}
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="px-4 sm:px-6 py-2 border-t border-border/50 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Volume2 className="h-4 w-4 animate-pulse" />
              {t.speaking}
            </div>
            <button
              onClick={handleStopSpeaking}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 border-t border-border/50 flex items-center gap-3">
          <button
            type="button"
            onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false) } : startListening}
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? "bg-destructive text-primary-foreground animate-pulse"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
            aria-label={isListening ? "Stop" : "Speak"}
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-input/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t.sendMessage}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
