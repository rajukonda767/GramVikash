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

function findVoiceForLang(targetLang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  // Exact match first (e.g. "te-IN")
  let voice = voices.find((v) => v.lang === targetLang)
  if (voice) return voice
  // Partial match (e.g. starts with "te")
  const prefix = targetLang.split("-")[0]
  voice = voices.find((v) => v.lang.startsWith(prefix))
  if (voice) return voice
  // Try Google voices which often have good Telugu support
  voice = voices.find(
    (v) =>
      v.name.toLowerCase().includes("google") &&
      v.lang.startsWith(prefix)
  )
  if (voice) return voice
  return null
}

export function VoiceAssistant() {
  const { lang, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Pre-load voices on mount - this is critical for Telugu TTS
  useEffect(() => {
    if (!("speechSynthesis" in window)) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setVoicesLoaded(true)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const speakText = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return
      window.speechSynthesis.cancel()

      const targetLang = lang === "te" ? "te-IN" : "en-IN"

      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = targetLang
        utterance.rate = 0.85
        utterance.pitch = 1
        utterance.volume = 1

        const voice = findVoiceForLang(targetLang)
        if (voice) {
          utterance.voice = voice
        }

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }

      // If voices aren't loaded yet, wait a moment for them
      if (!voicesLoaded) {
        const waitForVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          if (voices.length > 0) {
            setVoicesLoaded(true)
            doSpeak()
          } else {
            // Fallback: speak without explicit voice selection (browser will use default)
            setTimeout(() => {
              doSpeak()
            }, 300)
          }
        }
        waitForVoices()
      } else {
        doSpeak()
      }
    },
    [lang, voicesLoaded]
  )

  const getResponse = useCallback(
    (transcript: string): string => {
      const lower = transcript.toLowerCase()
      // Telugu text matching is case-insensitive by default, but we also check the original
      const original = transcript

      // PM Kisan matching - both Telugu and English variants
      const pmKisanKeywords = [
        "పీఎం కిసాన్", "కిసాన్", "పి ఎం", "కిసాన", "పీఎం",
        "pm kisan", "kisan", "pm kisan scheme",
        "6000", "ఆరు వేల", "six thousand",
        "పథకం", "scheme"
      ]
      if (pmKisanKeywords.some((kw) => lower.includes(kw) || original.includes(kw))) {
        return t.pmKisanReply
      }

      // Rythu Bharosa matching - both Telugu and English variants
      const rythuKeywords = [
        "రైతు భరోసా", "భరోసా", "రైతు", "వైఎస్ఆర్",
        "rythu bharosa", "bharosa", "rythu", "ysr",
        "13500", "పదమూడు", "thirteen"
      ]
      if (rythuKeywords.some((kw) => lower.includes(kw) || original.includes(kw))) {
        return t.rythuBharosaReply
      }

      // General help / greeting
      const helpKeywords = [
        "హలో", "నమస్కారం", "సహాయం", "ఏమి", "ఏం", "చెప్పు",
        "hello", "help", "what", "tell", "hi"
      ]
      if (helpKeywords.some((kw) => lower.includes(kw) || original.includes(kw))) {
        return lang === "te"
          ? "నేను మీకు పీఎం కిసాన్ మరియు వైఎస్ఆర్ రైతు భరోసా పథకాల గురించి చెప్పగలను. ఏ పథకం గురించి తెలుసుకోవాలో చెప్పండి."
          : "I can tell you about PM Kisan and YSR Rythu Bharosa schemes. Please tell me which scheme you want to know about."
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
    recognition.continuous = false
    recognition.maxAlternatives = 5

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Check all alternatives for better matching (Telugu recognition can vary)
      const results = event.results[0]
      const transcript = results[0].transcript
      setMessages((prev) => [...prev, { role: "user", text: transcript }])

      // Try matching against all alternatives for better accuracy
      let response = ""
      for (let i = 0; i < results.length; i++) {
        response = getResponse(results[i].transcript)
        if (response !== t.notUnderstood) break
      }
      if (!response) response = getResponse(transcript)

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
        onClick={() => {
          setIsOpen(true)
          // Speak a welcome message when opening for the first time
          if (messages.length === 0) {
            const welcome =
              lang === "te"
                ? "నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్ని. పీఎం కిసాన్ లేదా రైతు భరోసా గురించి నన్ను అడగండి."
                : "Hello! I am your voice assistant. Ask me about PM Kisan or Rythu Bharosa."
            setTimeout(() => {
              setMessages([{ role: "assistant", text: welcome }])
              speakText(welcome)
            }, 600)
          }
        }}
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
