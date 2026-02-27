"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { Mic, X, Volume2, Square } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  text: string
}

function VoiceWave({ active }: { active: boolean }) {
  const bars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1 h-8 justify-center">
      {bars.map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-primary-foreground"
          style={{
            height: active ? "20px" : "4px",
            transition: "height 0.2s ease",
            animation: active
              ? `voiceBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`
              : "none",
          }}
        />
      ))}
      {active && (
        <style>{`
          @keyframes voiceBar {
            0% { height: 6px; }
            100% { height: 28px; }
          }
        `}</style>
      )}
    </div>
  )
}

/**
 * Speaks text using our server-side TTS API (proxies Google Translate TTS).
 * This avoids CORS issues since we proxy through our own API route.
 * Falls back to direct Google TTS, then browser SpeechSynthesis.
 */
function speakWithTTS(
  text: string,
  langCode: string,
  onStart: () => void,
  onEnd: () => void
): HTMLAudioElement | null {
  // TTS has a ~200 char limit per request, so chunk if needed
  const maxLen = 180
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }
    let breakIdx = remaining.lastIndexOf(".", maxLen)
    if (breakIdx < 20) breakIdx = remaining.lastIndexOf(" ", maxLen)
    if (breakIdx < 20) breakIdx = maxLen
    chunks.push(remaining.substring(0, breakIdx + 1))
    remaining = remaining.substring(breakIdx + 1).trim()
  }

  let currentIdx = 0
  let currentAudio: HTMLAudioElement | null = null

  const playChunkWithFallbacks = () => {
    if (currentIdx >= chunks.length) {
      onEnd()
      return
    }

    const chunkText = chunks[currentIdx]
    if (currentIdx === 0) onStart()

    // Strategy 1: Our own API route (server-side proxy, no CORS)
    const apiUrl = `/api/tts?text=${encodeURIComponent(chunkText)}&lang=${langCode}`
    const audio = new Audio(apiUrl)
    currentAudio = audio

    audio.onended = () => {
      currentIdx++
      playChunkWithFallbacks()
    }

    audio.onerror = () => {
      // Strategy 2: Direct Google TTS
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${langCode}&client=tw-ob`
      const audio2 = new Audio(googleUrl)
      currentAudio = audio2

      audio2.onended = () => {
        currentIdx++
        playChunkWithFallbacks()
      }

      audio2.onerror = () => {
        // Strategy 3: Browser SpeechSynthesis
        const fullLang = langCode === "te" ? "te-IN" : "en-IN"
        speakWithBrowserTTS(chunkText, fullLang, () => {}, () => {
          currentIdx++
          playChunkWithFallbacks()
        })
      }

      audio2.play().catch(() => {
        const fullLang = langCode === "te" ? "te-IN" : "en-IN"
        speakWithBrowserTTS(chunkText, fullLang, () => {}, () => {
          currentIdx++
          playChunkWithFallbacks()
        })
      })
    }

    audio.play().catch(() => {
      // If play() is rejected (autoplay policy), try Google direct
      audio.onerror?.(new Event("error") as ErrorEvent)
    })
  }

  playChunkWithFallbacks()
  return currentAudio
}

/**
 * Browser SpeechSynthesis fallback
 */
function speakWithBrowserTTS(
  text: string,
  langCode: string,
  onStart: () => void,
  onEnd: () => void
) {
  if (!("speechSynthesis" in window)) {
    onEnd()
    return
  }
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langCode
  utterance.rate = 0.85
  utterance.pitch = 1
  utterance.volume = 1

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices()
  const prefix = langCode.split("-")[0]
  const voice =
    voices.find((v) => v.lang === langCode) ||
    voices.find((v) => v.lang.startsWith(prefix)) ||
    voices.find((v) => v.name.toLowerCase().includes(prefix))
  if (voice) utterance.voice = voice

  utterance.onstart = onStart
  utterance.onend = onEnd
  utterance.onerror = onEnd
  window.speechSynthesis.speak(utterance)
}

export function VoiceAssistant() {
  const { lang, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Pre-load voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const speakText = useCallback(
    (text: string) => {
      // Stop any ongoing speech
      window.speechSynthesis?.cancel()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const langCode = lang === "te" ? "te" : "en"
      const fullLangCode = lang === "te" ? "te-IN" : "en-IN"

      // For Telugu, always use our TTS API (Google Translate proxy - best Telugu quality)
      // For English, try browser TTS first, then TTS API as fallback
      if (lang === "te") {
        audioRef.current = speakWithTTS(
          text,
          langCode,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        )
      } else {
        const voices = window.speechSynthesis?.getVoices() || []
        const hasEnglish = voices.some((v) => v.lang.startsWith("en"))
        if (hasEnglish) {
          speakWithBrowserTTS(
            text,
            fullLangCode,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
          )
        } else {
          audioRef.current = speakWithTTS(
            text,
            langCode,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false)
          )
        }
      }
    },
    [lang]
  )

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  const getResponse = useCallback(
    (transcript: string): string => {
      const lower = transcript.toLowerCase()
      const original = transcript

      const pmKisanKeywords = [
        "పీఎం కిసాన్", "కిసాన్", "పి ఎం", "కిసాన", "పీఎం",
        "pm kisan", "kisan", "pm kisan scheme",
        "6000", "ఆరు వేల", "six thousand",
        "పథకం", "scheme"
      ]
      if (pmKisanKeywords.some((kw) => lower.includes(kw) || original.includes(kw))) {
        return t.pmKisanReply
      }

      const rythuKeywords = [
        "రైతు భరోసా", "భరోసా", "రైతు", "వైఎస్ఆర్",
        "rythu bharosa", "bharosa", "rythu", "ysr",
        "13500", "పదమూడు", "thirteen"
      ]
      if (rythuKeywords.some((kw) => lower.includes(kw) || original.includes(kw))) {
        return t.rythuBharosaReply
      }

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
      alert(
        lang === "te"
          ? "ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ అందుబాటులో లేదు. Chrome బ్రౌజర్ వాడండి."
          : "Speech Recognition is not supported. Please use Chrome browser."
      )
      return
    }

    stopSpeaking()

    const recognition = new SpeechRecognition()
    recognition.lang = lang === "te" ? "te-IN" : "en-IN"
    recognition.interimResults = false
    recognition.continuous = false
    recognition.maxAlternatives = 5

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results[0]
      const transcript = results[0].transcript
      setMessages((prev) => [...prev, { role: "user", text: transcript }])

      let response = ""
      for (let i = 0; i < results.length; i++) {
        response = getResponse(results[i].transcript)
        if (response !== t.notUnderstood) break
      }
      if (!response) response = getResponse(transcript)

      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", text: response }])
        speakText(response)
      }, 400)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang, getResponse, speakText, stopSpeaking, t])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    if (messages.length === 0) {
      const welcome =
        lang === "te"
          ? "నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్ని. పీఎం కిసాన్ లేదా రైతు భరోసా గురించి నన్ను అడగండి."
          : "Hello! I am your voice assistant. Ask me about PM Kisan or Rythu Bharosa."
      setTimeout(() => {
        setMessages([{ role: "assistant", text: welcome }])
        speakText(welcome)
      }, 500)
    }
  }, [lang, messages.length, speakText])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    stopListening()
    stopSpeaking()
  }, [stopListening, stopSpeaking])

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={handleOpen}
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
                  <h3 className="font-semibold text-foreground text-sm">
                    {t.voiceAssistant}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isListening
                      ? t.listening
                      : isSpeaking
                        ? lang === "te"
                          ? "మాట్లాడుతున్నాను..."
                          : "Speaking..."
                        : t.tapToSpeak}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
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
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    } animate-in fade-in slide-in-from-bottom-2 duration-300`}
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

            {/* Mic controls */}
            <div className="px-5 py-5 border-t border-border/50 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                {/* Stop speaking button */}
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="h-10 w-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive hover:text-primary-foreground transition-colors"
                    aria-label="Stop speaking"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                )}

                {/* Mic button */}
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
              </div>

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
