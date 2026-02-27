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

  const browserFallback = (text: string, andThen: () => void) => {
    const fullLang = langCode === "te" ? "te-IN" : "en-IN"
    speakWithBrowserTTS(text, fullLang, () => {}, andThen)
  }

  const playChunkWithFallbacks = () => {
    if (currentIdx >= chunks.length) {
      onEnd()
      return
    }

    const chunkText = chunks[currentIdx]
    if (currentIdx === 0) onStart()

    const advanceNext = () => {
      currentIdx++
      playChunkWithFallbacks()
    }

    // Strategy 1: Our own API route (server-side proxy, no CORS)
    const apiUrl = `/api/tts?text=${encodeURIComponent(chunkText)}&lang=${langCode}`
    const audio = new Audio(apiUrl)
    audio.preload = "auto"
    currentAudio = audio

    audio.onended = advanceNext

    audio.onerror = () => {
      browserFallback(chunkText, advanceNext)
    }

    // Set a timeout: if audio doesn't load in 3s, fall back to browser TTS
    const loadTimeout = setTimeout(() => {
      if (audio && audio.readyState < 3) {
        audio.oncanplaythrough = null
        audio.onerror = null
        audio.onended = null
        browserFallback(chunkText, advanceNext)
      }
    }, 3000)

    // Wait for audio data to fully load before playing
    audio.oncanplaythrough = () => {
      clearTimeout(loadTimeout)
      audio.play().catch(() => {
        browserFallback(chunkText, advanceNext)
      })
    }

    // Start loading
    audio.load()
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
  utterance.rate = 0.92
  utterance.pitch = 1.05
  utterance.volume = 1

  // Find best voice: prefer Google Chirp3-HD-Aoede for Telugu fluency
  const voices = window.speechSynthesis.getVoices()
  const prefix = langCode.split("-")[0]
  const voice =
    voices.find((v) => v.name.includes("Chirp3-HD-Aoede") && v.lang.startsWith(prefix)) ||
    voices.find((v) => v.name.includes("Chirp3") && v.lang.startsWith(prefix)) ||
    voices.find((v) => v.name.toLowerCase().includes("google") && v.lang.startsWith(prefix)) ||
    voices.find((v) => v.lang === langCode) ||
    voices.find((v) => v.lang.startsWith(prefix))
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
      const has = (kw: string) => lower.includes(kw) || original.includes(kw)

      // Detect intent
      const isEligQ = ["అర్హత", "eligib", "eligible", "criteria", "who can", "ఎవరు", "ప్రమాణ", "qualify"].some(has)
      const isApplyQ = ["దరఖాస్తు", "apply", "how to", "ఎలా", "register", "నమోదు", "process", "ప్రక్రియ", "website", "online"].some(has)

      // --- Central Schemes ---
      const isPmKisan = ["పీఎం కిసాన్", "కిసాన్", "పి ఎం", "కిసాన", "పీఎం", "pm kisan", "kisan", "6000", "ఆరు వేల"].some(has)
      const isFasal = ["ఫసల్ బీమా", "fasal bima", "crop insurance", "పంట బీమా", "pmfby", "బీమా"].some(has)
      const isKCC = ["క్రెడిట్ కార్డ్", "credit card", "kcc", "కేసీసీ", "రుణం", "loan"].some(has)
      const isPMKSY = ["సించాయ్", "sinchai", "irrigation", "నీటిపారుదల", "డ్రిప్", "drip", "sprinkler", "pmksy"].some(has)

      // --- AP State Schemes ---
      const isRythu = ["రైతు భరోసా", "భరోసా", "వైఎస్ఆర్", "rythu bharosa", "bharosa", "ysr", "13500", "పదమూడు"].some(has)
      const isAnnadatha = ["అన్నదాత", "annadatha", "సుఖీభవ", "sukhibhava", "ఉచిత బీమా", "free insurance"].some(has)
      const isMicroIrr = ["మైక్రో ఇరిగేషన్", "micro irrigation", "90%", "80%", "ap subsidy", "ap drip"].some(has)
      const isVasathi = ["వసతి దీవెన", "vasathi", "deevena", "జగనన్న", "jagananna", "విద్య", "education", "hostel", "హాస్టల్"].some(has)

      // PM Kisan
      if (isPmKisan && isEligQ) return t.pmKisanEligReply
      if (isPmKisan && isApplyQ) return t.pmKisanApplyReply
      if (isPmKisan) return t.pmKisanReply

      // PM Fasal Bima
      if (isFasal) {
        if (isEligQ) return lang === "te"
          ? "పీఎం ఫసల్ బీమా అర్హత: నోటిఫైడ్ ప్రాంతాల్లో నోటిఫైడ్ పంటలు పండించే అన్ని రైతులు అర్హులు. రుణ మరియు రుణేతర రైతులు ఇద్దరూ, కౌలు రైతులు కూడా దరఖాస్తు చేయవచ్చు."
          : "PM Fasal Bima eligibility: All farmers growing notified crops in notified areas are eligible. Both loanee and non-loanee farmers, as well as tenant farmers can apply."
        if (isApplyQ) return lang === "te"
          ? "పీఎం ఫసల్ బీమా కోసం pmfby.gov.in వెబ్‌సైట్‌లో లేదా సమీపంలోని బ్యాంక్ లేదా CSC కేంద్రంలో దరఖాస్తు చేయండి. ఖరీఫ్‌కు 2% మరియు రబీ పంటలకు 1.5% ప్రీమియం మాత్రమే."
          : "Apply for PM Fasal Bima at pmfby.gov.in or your nearest bank or CSC center. Premium is just 2% for Kharif and 1.5% for Rabi crops."
        return lang === "te"
          ? "పీఎం ఫసల్ బీమా యోజన ద్వారా ఖరీఫ్‌కు 2% మరియు రబీకి 1.5% ప్రీమియంతో పంట బీమా అందుబాటులో ఉంది. ప్రకృతి వైపరీత్యాల నుండి రైతులను రక్షిస్తుంది."
          : "PM Fasal Bima Yojana provides crop insurance at just 2% premium for Kharif and 1.5% for Rabi. Protects farmers against natural calamities."
      }

      // Kisan Credit Card
      if (isKCC) {
        if (isEligQ) return lang === "te"
          ? "కిసాన్ క్రెడిట్ కార్డ్ అర్హత: అన్ని రైతులు, కౌలు రైతులు, భాగస్వామ్య రైతులు అర్హులు. పంట ఉత్పత్తి లేదా అనుబంధ కార్యకలాపాల్లో ఉండాలి."
          : "KCC eligibility: All farmers including tenant and sharecroppers are eligible. Must be in crop production or allied activities."
        if (isApplyQ) return lang === "te"
          ? "KCC కోసం సమీపంలోని జాతీయ బ్యాంక్ శాఖకు వెళ్ళి KCC ఫారమ్ నింపండి. భూమి రికార్డులు, ఆధార్ సమర్పించండి. 14 రోజుల్లో KCC జారీ అవుతుంది."
          : "Visit your nearest nationalized bank, fill the KCC form, submit land records and Aadhaar. KCC is issued within 14 days."
        return lang === "te"
          ? "కిసాన్ క్రెడిట్ కార్డ్ ద్వారా రూ. 3 లక్షల వరకు 4% వడ్డీతో రుణం అందుబాటులో ఉంది. సకాలంలో చెల్లిస్తే మరో 3% సబ్వెన్షన్."
          : "Kisan Credit Card gives loans up to Rs. 3 lakhs at 4% interest. Additional 3% subvention for timely repayment."
      }

      // PM Krishi Sinchai
      if (isPMKSY) {
        return lang === "te"
          ? "పీఎం కృషి సించాయ్ యోజన ద్వారా చిన్న రైతులకు డ్రిప్ మరియు స్ప్రింక్లర్ వ్యవస్థలపై 55% సబ్సిడీ. రాష్ట్ర వ్యవసాయ శాఖ ద్వారా దరఖాస్తు చేయండి."
          : "PM Krishi Sinchai Yojana offers 55% subsidy on drip and sprinkler systems for small farmers. Apply through State Agriculture Department."
      }

      // Rythu Bharosa
      if (isRythu && isEligQ) return t.rythuEligReply
      if (isRythu && isApplyQ) return t.rythuApplyReply
      if (isRythu) return t.rythuBharosaReply

      // Annadatha Sukhibhava
      if (isAnnadatha) {
        return lang === "te"
          ? "వైఎస్ఆర్ అన్నదాత సుఖీభవ పథకం రైతు భరోసా లబ్ధిదారులకు ఉచిత పంట బీమా అందిస్తుంది. ప్రకృతి వైపరీత్యాల్లో నష్టపరిహారం అందుతుంది. గ్రామ సచివాలయంలో ధృవీకరించండి."
          : "YSR Annadatha Sukhibhava provides free crop insurance for Rythu Bharosa beneficiaries. Automatic enrollment. Verify at your Village Secretariat."
      }

      // AP Micro Irrigation
      if (isMicroIrr) {
        return lang === "te"
          ? "AP మైక్రో ఇరిగేషన్ సబ్సిడీలో SC/ST రైతులకు 90%, ఇతరులకు 80% సబ్సిడీ. జిల్లా వ్యవసాయ కార్యాలయంలో దరఖాస్తు చేయండి."
          : "AP Micro Irrigation gives 90% subsidy for SC/ST farmers, 80% for others. Apply at District Agriculture Office."
      }

      // Vasathi Deevena
      if (isVasathi) {
        return lang === "te"
          ? "జగనన్న వసతి దీవెన ద్వారా రైతు పిల్లల విద్యా ఖర్చులకు సంవత్సరానికి రూ. 20,000 అందుతుంది. కళాశాల ద్వారా దరఖాస్తు చేయండి. కుటుంబ ఆదాయం రూ. 2.5 లక్షల కంటే తక్కువ ఉండాలి."
          : "Jagananna Vasathi Deevena provides Rs. 20,000 per year for farmer children education. Apply through college. Family income must be below Rs. 2.5 lakhs."
      }

      // General eligibility
      if (isEligQ) {
        return lang === "te"
          ? "ఏ పథకం అర్హత గురించి తెలుసుకోవాలో చెప్పండి. పీఎం కిసాన్, ఫసల్ బీమా, KCC, రైతు భరోసా, వసతి దీవెన వంటి పథకాల గురించి అడగవచ్చు."
          : "Please specify which scheme. You can ask about PM Kisan, Fasal Bima, KCC, Rythu Bharosa, Vasathi Deevena and more."
      }
      if (isApplyQ) {
        return lang === "te"
          ? "ఏ పథకానికి దరఖాస్తు చేయాలో చెప్పండి. పీఎం కిసాన్, ఫసల్ బీమా, KCC, రైతు భరోసా వంటి పథకాలకు దరఖాస్తు ప్రక్రియ చెప్పగలను."
          : "Please specify which scheme to apply for. I can guide you for PM Kisan, Fasal Bima, KCC, Rythu Bharosa, and more."
      }

      // Generic farmer/scheme
      if (has("రైతు") || has("farmer") || has("పథకం") || has("scheme")) {
        return lang === "te"
          ? "నేను 8 ప్రభుత్వ పథకాల గురించి చెప్పగలను: పీఎం కిసాన్, ఫసల్ బీమా, KCC, కృషి సించాయ్ (కేంద్రం), రైతు భరోసా, అన్నదాత సుఖీభవ, మైక్రో ఇరిగేషన్, వసతి దీవెన (AP). ఏ పథకం గురించి తెలుసుకోవాలో చెప్పండి."
          : "I can help with 8 schemes: PM Kisan, Fasal Bima, KCC, Krishi Sinchai (Central), Rythu Bharosa, Annadatha Sukhibhava, Micro Irrigation, Vasathi Deevena (AP). Which one do you want to know about?"
      }

      // Help / greeting
      if (["హలో", "నమస్కారం", "సహాయం", "hello", "help", "hi", "చెప్పు", "tell"].some(has)) {
        return lang === "te"
          ? "నమస్కారం! నేను 4 కేంద్ర పథకాలు (పీఎం కిసాన్, ఫసల్ బీమా, KCC, కృషి సించాయ్) మరియు 4 AP పథకాల (రైతు భరోసా, అన్నదాత సుఖీభవ, మైక్రో ఇరిగేషన్, వసతి దీవెన) గురించి చెప్పగలను. ఏది అడగండి!"
          : "Hello! I can tell you about 4 Central schemes (PM Kisan, Fasal Bima, KCC, Krishi Sinchai) and 4 AP schemes (Rythu Bharosa, Annadatha Sukhibhava, Micro Irrigation, Vasathi Deevena). Ask me anything!"
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
          ? "నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్ని. పీఎం కిసాన్, ఫసల్ బీమా, KCC, రైతు భరోసా వంటి 8 పథకాల గురించి నన్ను అడగండి."
          : "Hello! I am your voice assistant. Ask me about 8 schemes including PM Kisan, Fasal Bima, KCC, Rythu Bharosa, and more."
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
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
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
