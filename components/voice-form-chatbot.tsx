"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { speak, stopSpeaking } from "@/lib/tts"
import { Mic, Volume2, Send, User, Bot, CheckCircle2, RotateCcw } from "lucide-react"

export type FormData = {
  name: string
  crop: string
  farmSize: string
}

type Message = {
  role: "bot" | "user"
  text: string
}

type Step = "name" | "crop" | "size" | "confirm" | "done"

const CROPS_EN = ["Paddy", "Cotton", "Chilli", "Groundnut", "Sugarcane", "Maize", "Tomato", "Turmeric", "Mango"]
const CROPS_TE = ["వరి", "పత్తి", "మిరప", "వేరుశెనగ", "చెరకు", "మొక్కజొన్న", "టమాట", "పసుపు", "మామిడి"]
const CROP_KEYS = ["paddy", "cotton", "chilli", "groundnut", "sugarcane", "maize", "tomato", "turmeric", "mango"]

const SIZES_EN = ["Small (below 2 acres)", "Medium (2 to 5 acres)", "Large (above 5 acres)"]
const SIZES_TE = ["చిన్నది (2 ఎకరాల కంటే తక్కువ)", "మధ్యస్థం (2 నుండి 5 ఎకరాలు)", "పెద్దది (5 ఎకరాల కంటే ఎక్కువ)"]
const SIZE_KEYS = ["small", "medium", "large"]

export function VoiceFormChatbot({ onComplete }: { onComplete: (data: FormData) => void }) {
  const { lang, t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>("name")
  const [formData, setFormData] = useState<FormData>({ name: "", crop: "", farmSize: "" })
  const formDataRef = useRef<FormData>({ name: "", crop: "", farmSize: "" })
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [textInput, setTextInput] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const crops = lang === "te" ? CROPS_TE : CROPS_EN
  const sizes = lang === "te" ? SIZES_TE : SIZES_EN

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addBotMessage = useCallback((text: string, speakIt = true) => {
    setMessages(prev => [...prev, { role: "bot", text }])
    if (speakIt) {
      speak(text, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
    }
  }, [lang])

  // Start conversation
  useEffect(() => {
    const greeting = lang === "te"
      ? "నమస్కారం! నేను మీకు ప్రభుత్వ పథకాలు కనుగొనడంలో సహాయం చేస్తాను. దయచేసి మీ పేరు చెప్పండి."
      : "Hello! I will help you find government schemes. Please tell me your name."
    setTimeout(() => addBotMessage(greeting), 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const matchCrop = (input: string): string | null => {
    const lower = input.toLowerCase()
    const allCrops = [...CROPS_EN.map(c => c.toLowerCase()), ...CROPS_TE, ...CROP_KEYS]
    for (let i = 0; i < allCrops.length; i++) {
      if (lower.includes(allCrops[i].toLowerCase())) {
        return CROP_KEYS[i % CROP_KEYS.length]
      }
    }
    return null
  }

  const matchSize = (input: string): string | null => {
    const lower = input.toLowerCase()
    if (lower.includes("small") || lower.includes("చిన్న") || lower.includes("1") || lower.includes("తక్కువ")) return "small"
    if (lower.includes("medium") || lower.includes("మధ్య") || lower.includes("2") || lower.includes("3")) return "medium"
    if (lower.includes("large") || lower.includes("పెద్ద") || lower.includes("5") || lower.includes("ఎక్కువ") || lower.includes("big")) return "large"
    return null
  }

  const processInput = useCallback((input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    setMessages(prev => [...prev, { role: "user", text: trimmed }])
    stopSpeaking()
    setIsSpeaking(false)

    if (step === "name") {
      const updated = { ...formDataRef.current, name: trimmed }
      formDataRef.current = updated
      setFormData(updated)
      setStep("crop")
      const askCrop = lang === "te"
        ? `ధన్యవాదాలు ${trimmed}! మీరు ఏ పంట పండిస్తున్నారు? వరి, పత్తి, మిరప, వేరుశెనగ, చెరకు, మొక్కజొన్న, టమాట, పసుపు, లేదా మామిడి?`
        : `Thank you ${trimmed}! What crop do you grow? Paddy, Cotton, Chilli, Groundnut, Sugarcane, Maize, Tomato, Turmeric, or Mango?`
      setTimeout(() => addBotMessage(askCrop), 400)

    } else if (step === "crop") {
      const crop = matchCrop(trimmed)
      if (crop) {
        const updated = { ...formDataRef.current, crop }
        formDataRef.current = updated
        setFormData(updated)
        setStep("size")
        const cropName = lang === "te" ? CROPS_TE[CROP_KEYS.indexOf(crop)] : CROPS_EN[CROP_KEYS.indexOf(crop)]
        const askSize = lang === "te"
          ? `${cropName} - మంచి ఎంపిక! మీ పొలం పరిమాణం ఎంత? చిన్నది (2 ఎకరాల కంటే తక్కువ), మధ్యస్థం (2 నుండి 5 ఎకరాలు), లేదా పెద్దది (5 ఎకరాల కంటే ఎక్కువ)?`
          : `${cropName} - great choice! What is your farm size? Small (below 2 acres), Medium (2 to 5 acres), or Large (above 5 acres)?`
        setTimeout(() => addBotMessage(askSize), 400)
      } else {
        const retry = lang === "te"
          ? "క్షమించండి, ఆ పంట గుర్తించలేదు. దయచేసి వరి, పత్తి, మిరప, వేరుశెనగ, చెరకు, మొక్కజొన్న, టమాట, పసుపు, లేదా మామిడి అని చెప్పండి."
          : "Sorry, I didn't recognize that crop. Please say one of: Paddy, Cotton, Chilli, Groundnut, Sugarcane, Maize, Tomato, Turmeric, or Mango."
        setTimeout(() => addBotMessage(retry), 400)
      }

    } else if (step === "size") {
      const size = matchSize(trimmed)
      if (size) {
        const updated = { ...formDataRef.current, farmSize: size }
        formDataRef.current = updated
        setFormData(updated)
        setStep("confirm")
        const cropName = lang === "te" ? CROPS_TE[CROP_KEYS.indexOf(updated.crop)] : CROPS_EN[CROP_KEYS.indexOf(updated.crop)]
        const sizeName = lang === "te" ? SIZES_TE[SIZE_KEYS.indexOf(size)] : SIZES_EN[SIZE_KEYS.indexOf(size)]
        const confirm = lang === "te"
          ? `మీ వివరాలు: పేరు - ${updated.name}, పంట - ${cropName}, పొలం - ${sizeName}. సరిగ్గా ఉందా? అవును అని చెప్పండి, లేదా మార్చాలంటే కాదు అని చెప్పండి.`
          : `Your details: Name - ${updated.name}, Crop - ${cropName}, Farm Size - ${sizeName}. Is this correct? Say Yes to confirm, or No to start over.`
        setTimeout(() => addBotMessage(confirm), 400)
      } else {
        const retry = lang === "te"
          ? "క్షమించండి, గుర్తించలేదు. చిన్నది, మధ్యస్థం, లేదా పెద్దది అని చెప్పండి."
          : "Sorry, I didn't catch that. Please say Small, Medium, or Large."
        setTimeout(() => addBotMessage(retry), 400)
      }

    } else if (step === "confirm") {
      const lower = trimmed.toLowerCase()
      if (lower.includes("yes") || lower.includes("అవును") || lower.includes("సరి") || lower.includes("correct") || lower.includes("ok") || lower.includes("ఓకే")) {
        setStep("done")
        const done = lang === "te"
          ? "అద్భుతం! మీకు అర్హమైన పథకాలు చూపిస్తున్నాను..."
          : "Wonderful! Showing your eligible schemes now..."
        setTimeout(() => {
          addBotMessage(done)
          setTimeout(() => onComplete(formDataRef.current), 1500)
        }, 400)
      } else {
        setStep("name")
        formDataRef.current = { name: "", crop: "", farmSize: "" }
        setFormData({ name: "", crop: "", farmSize: "" })
        const restart = lang === "te"
          ? "సరే, మళ్ళీ మొదలు పెడదాం. దయచేసి మీ పేరు చెప్పండి."
          : "Okay, let's start over. Please tell me your name."
        setTimeout(() => addBotMessage(restart), 400)
      }
    }
  }, [step, formData, lang, addBotMessage, onComplete])

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
    recognition.maxAlternatives = 5

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      processInput(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang, processInput])

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processInput(textInput)
    setTextInput("")
  }

  // Quick select buttons for crops and sizes
  const quickButtons = step === "crop" ? crops.map((c, i) => ({ label: c, value: CROP_KEYS[i] }))
    : step === "size" ? sizes.map((s, i) => ({ label: s, value: SIZE_KEYS[i] }))
    : step === "confirm" ? [
        { label: lang === "te" ? "అవును" : "Yes", value: "yes" },
        { label: lang === "te" ? "కాదు, మార్చు" : "No, start over", value: "no" }
      ]
    : []

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {lang === "te" ? "వాయిస్ ఫారమ్ అసిస్టెంట్" : "Voice Form Assistant"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === "te" ? "మాట్లాడి ఫారమ్ నింపండి - టైపింగ్ అవసరం లేదు" : "Speak to fill the form - no typing needed"}
              </p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-2 mt-3">
            {(["name", "crop", "size", "confirm"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${
                  (["name", "crop", "size", "confirm", "done"].indexOf(step) > i) || step === "done"
                    ? "bg-primary" : "bg-border"
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <div className="h-[340px] overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
              <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-primary/15" : "bg-accent/15"
                }`}>
                  {msg.role === "user" ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-accent" />}
                </div>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-muted text-foreground rounded-tl-md"
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-xs text-primary px-2">
              <Volume2 className="h-3.5 w-3.5 animate-pulse" />
              {lang === "te" ? "మాట్లాడుతోంది..." : "Speaking..."}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick select buttons */}
        {quickButtons.length > 0 && step !== "done" && (
          <div className="px-4 py-2 border-t border-border/30 bg-muted/30">
            <div className="flex flex-wrap gap-1.5">
              {quickButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => processInput(btn.label)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Completed state */}
        {step === "done" && (
          <div className="px-4 py-3 border-t border-border/30 bg-primary/5 flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {lang === "te" ? "ఫారమ్ పూర్తయింది!" : "Form completed!"}
          </div>
        )}

        {/* Input bar */}
        {step !== "done" && (
          <form onSubmit={handleTextSubmit} className="px-4 py-3 border-t border-border/50 flex items-center gap-2">
            <button
              type="button"
              onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false) } : startListening}
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? "bg-destructive text-primary-foreground animate-pulse"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
              aria-label={isListening ? "Stop" : "Speak"}
            >
              <Mic className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={lang === "te" ? "టైప్ చేయండి లేదా మైక్ నొక్కండి..." : "Type or tap mic to speak..."}
              className="flex-1 h-10 rounded-xl bg-input/50 border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary/20 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {/* Reset button */}
      {step === "done" && (
        <button
          onClick={() => {
            setStep("name")
            formDataRef.current = { name: "", crop: "", farmSize: "" }
            setFormData({ name: "", crop: "", farmSize: "" })
            setMessages([])
            const greeting = lang === "te"
              ? "నమస్కారం! దయచేసి మీ పేరు చెప్పండి."
              : "Hello! Please tell me your name."
            setTimeout(() => addBotMessage(greeting), 300)
          }}
          className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          {lang === "te" ? "మళ్ళీ మొదలు పెట్టు" : "Start Over"}
        </button>
      )}
    </div>
  )
}
