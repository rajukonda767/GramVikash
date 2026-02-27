"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { Mic, X, Volume2 } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  text: string
}

function VoiceWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8 justify-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-primary-foreground transition-all ${
            active ? "animate-pulse" : ""
          }`}
          style={{
            height: active ? `${12 + Math.random() * 20}px` : "4px",
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  )
}

export function VoiceAssistant() {
  const { lang, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const speakText = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === "te" ? "te-IN" : "en-IN"
      utterance.rate = 0.9
      utterance.pitch = 1

      const voices = window.speechSynthesis.getVoices()
      const langVoice = voices.find(
        (v) =>
          v.lang === (lang === "te" ? "te-IN" : "en-IN") &&
          v.name.toLowerCase().includes("female")
      ) || voices.find((v) => v.lang === (lang === "te" ? "te-IN" : "en-IN"))

      if (langVoice) utterance.voice = langVoice

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [lang]
  )

  const getResponse = useCallback(
    (transcript: string): string => {
      const lower = transcript.toLowerCase()
      if (
        lower.includes("పీఎం కిసాన్") ||
        lower.includes("pm kisan") ||
        lower.includes("కిసాన్") ||
        lower.includes("kisan") ||
        lower.includes("పి ఎం") ||
        lower.includes("pm")
      ) {
        return lang === "te"
          ? "పీఎం కిసాన్ పథకం ద్వారా రైతులకు సంవత్సరానికి ఆరు వేల రూపాయలు మూడు విడతలుగా ప్రభుత్వం అందిస్తుంది."
          : "Under PM Kisan scheme, the government provides six thousand rupees per year to farmers in three installments."
      }
      if (
        lower.includes("రైతు భరోసా") ||
        lower.includes("rythu bharosa") ||
        lower.includes("భరోసా") ||
        lower.includes("bharosa") ||
        lower.includes("rythu")
      ) {
        return lang === "te"
          ? "వైఎస్ఆర్ రైతు భరోసా పథకం ద్వారా అర్హులైన రైతులకు ప్రతి సంవత్సరం పదమూడు వేల ఐదు వందల రూపాయల ఆర్థిక సహాయం అందుతుంది."
          : "Under YSR Rythu Bharosa scheme, eligible farmers receive thirteen thousand five hundred rupees per year as financial assistance."
      }
      return t.notUnderstood
    },
    [lang, t]
  )

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang === "te" ? "te-IN" : "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setMessages((prev) => [...prev, { role: "user", text: transcript }])

      const response = getResponse(transcript)
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", text: response }])
        speakText(response)
      }, 500)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang, getResponse, speakText])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
          !isOpen ? "animate-bounce" : "opacity-0 pointer-events-none"
        }`}
        style={{
          boxShadow: "0 0 30px oklch(0.45 0.15 150 / 0.4)",
        }}
        aria-label={t.tapToSpeak}
      >
        <Mic className="h-7 w-7" />
      </button>

      {/* Voice panel */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 animate-in slide-in-from-bottom-8 duration-300">
          <div className="rounded-t-2xl sm:rounded-2xl bg-card/90 backdrop-blur-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Volume2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{t.voiceAssistant}</h3>
                  <p className="text-xs text-muted-foreground">
                    {isListening ? t.listening : isSpeaking ? (lang === "te" ? "మాట్లాడుతున్నాను..." : "Speaking...") : t.tapToSpeak}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  stopListening()
                  window.speechSynthesis.cancel()
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Hint */}
            {messages.length === 0 && (
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {t.voiceHint}
                </p>
              </div>
            )}

            {/* Chat messages */}
            {messages.length > 0 && (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-[10px] font-medium opacity-70 mb-1">
                        {msg.role === "user" ? t.you : t.assistant}
                      </p>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Mic button */}
            <div className="px-5 py-5 border-t border-border/50 flex flex-col items-center gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-destructive text-primary-foreground scale-110"
                    : "bg-primary text-primary-foreground hover:scale-105"
                }`}
                style={{
                  boxShadow: isListening
                    ? "0 0 40px oklch(0.577 0.245 27.325 / 0.5)"
                    : "0 0 20px oklch(0.45 0.15 150 / 0.3)",
                }}
                aria-label={isListening ? "Stop listening" : t.tapToSpeak}
              >
                {isListening ? (
                  <VoiceWave active={true} />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                {isListening ? t.listening : t.tapToSpeak}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
