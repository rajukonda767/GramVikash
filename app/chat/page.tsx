"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
} from "lucide-react"

type Message = {
  role: "user" | "assistant"
  text: string
}

// Knowledge base for farming questions
const farmingKB = {
  en: {
    greeting: "Hello! I am your AI farming assistant. Ask me anything about crops, diseases, weather, soil, or government schemes. I can respond in English and Telugu!",
    schemes: {
      pmkisan: "PM Kisan Samman Nidhi provides Rs. 6,000 per year to farmer families in 3 installments. You need Aadhaar linked bank account. Visit pmkisan.gov.in to apply.",
      rythu: "YSR Rythu Bharosa provides Rs. 13,500 per year to AP farmers. Visit your nearest Meeseva center with Aadhaar, land passbook, and bank passbook to apply.",
    },
    crops: {
      paddy: "For paddy cultivation: Best season is Kharif (June-July). Use varieties like BPT 5204, MTU 1010. Maintain 2-5cm standing water. Apply nitrogen, phosphorus, and potash fertilizers.",
      cotton: "For cotton: Sow in June-July. Use Bt cotton varieties. Maintain 3-4 feet spacing. Watch for bollworm - use pheromone traps. Apply DAP and urea as per soil test.",
      chilli: "For chilli: Sow in nursery June-July, transplant after 40 days. Use varieties like Teja, 341. Apply Trichoderma for disease prevention. Drip irrigation recommended.",
      tomato: "For tomato: Transplant seedlings 25-30 days old. Maintain 60cm x 45cm spacing. Stake plants for support. Watch for leaf curl virus - use resistant varieties.",
      groundnut: "For groundnut: Best in Kharif season. Use TMV 2, K-6 varieties. Ensure well-drained soil. Apply gypsum at flowering stage. Harvest in 100-120 days.",
    },
    diseases: {
      blast: "Rice Blast: Caused by Magnaporthe grisea. Diamond-shaped spots on leaves. Spray Tricyclazole 75% WP at 0.6g/liter. Use resistant varieties. Avoid excess nitrogen.",
      blight: "Leaf Blight: Yellow to brown lesions on leaves. Apply Mancozeb 75% WP at 2.5g/liter. Remove infected leaves. Ensure proper spacing for air circulation.",
      wilt: "Fusarium Wilt: Plants wilt and die. Treat seeds with Trichoderma. Apply neem cake in soil. Use resistant varieties. Practice crop rotation.",
    },
    soil: "For soil health: Get soil tested every 2 years at your nearest KVK. Add organic matter like vermicompost. Practice green manuring with dhaincha or sunhemp. Maintain pH between 6.0-7.5.",
    water: "Water management: Use drip irrigation to save 40-60% water. Mulching reduces evaporation. Alternate wetting and drying in paddy saves 20-25% water. Rainwater harvesting is important.",
    weather: "For weather updates, check IMD website or use Meghdoot app. Plan sowing based on monsoon prediction. Harvest before heavy rains. Use weather-based crop insurance (PMFBY).",
    default: "I can help you with: crop cultivation, disease management, soil health, water management, weather advisory, and government schemes like PM Kisan and Rythu Bharosa. What would you like to know?",
  },
  te: {
    greeting: "నమస్కారం! నేను మీ AI వ్యవసాయ అసిస్టెంట్ని. పంటలు, వ్యాధులు, వాతావరణం, నేల లేదా ప్రభుత్వ పథకాల గురించి ఏదైనా అడగండి. నేను తెలుగు మరియు ఆంగ్లంలో సమాధానం ఇవ్వగలను!",
    schemes: {
      pmkisan: "పీఎం కిసాన్ సమ్మాన్ నిధి రైతు కుటుంబాలకు సంవత్సరానికి రూ. 6,000 మూడు విడతలుగా అందిస్తుంది. ఆధార్ లింక్ చేసిన బ్యాంకు ఖాతా అవసరం. దరఖాస్తు కోసం pmkisan.gov.in కి వెళ్ళండి.",
      rythu: "వైఎస్ఆర్ రైతు భరోసా AP రైతులకు సంవత్సరానికి రూ. 13,500 అందిస్తుంది. ఆధార్, భూమి పాస్‌బుక్, బ్యాంకు పాస్‌బుక్ తో సమీపంలోని మీసేవ కేంద్రానికి వెళ్ళండి.",
    },
    crops: {
      paddy: "వరి సాగు: ఖరీఫ్ సీజన్ (జూన్-జూలై) ఉత్తమం. BPT 5204, MTU 1010 రకాలు వాడండి. 2-5 సెం.మీ నిలిచే నీరు ఉంచండి. నత్రజని, భాస్వరం, పొటాష్ ఎరువులు వేయండి.",
      cotton: "పత్తి: జూన్-జూలైలో విత్తండి. Bt పత్తి రకాలు వాడండి. 3-4 అడుగుల దూరం ఉంచండి. పురుగుల కోసం ఫెరోమోన్ ట్రాప్‌లు వాడండి. నేల పరీక్ష ప్రకారం DAP, యూరియా వేయండి.",
      chilli: "మిరప: జూన్-జూలైలో నారుమడిలో విత్తి, 40 రోజుల తర్వాత నాటండి. తేజ, 341 రకాలు వాడండి. వ్యాధి నివారణకు ట్రైకోడెర్మా వేయండి. బిందు సేద్యం మంచిది.",
      tomato: "టమాట: 25-30 రోజుల నారు నాటండి. 60 సెం.మీ x 45 సెం.మీ దూరం ఉంచండి. మొక్కలకు ఆధారం ఇవ్వండి. ఆకు ముడత వైరస్ కోసం నిరోధక రకాలు వాడండి.",
      groundnut: "వేరుశెనగ: ఖరీఫ్ సీజన్ ఉత్తమం. TMV 2, K-6 రకాలు వాడండి. బాగా ఎండిన నేల ఉండాలి. పూత దశలో జిప్సం వేయండి. 100-120 రోజులలో పంట కోత.",
    },
    diseases: {
      blast: "వరి బ్లాస్ట్: మాగ్నాపోర్థే ఫంగస్ వల్ల వస్తుంది. ఆకులపై వజ్రాకార మచ్చలు. ట్రైసైక్లజోల్ 75% WP 0.6 గ్రా./లీటరు స్ప్రే చేయండి. నిరోధక రకాలు వాడండి.",
      blight: "ఆకు ఎండు: ఆకులపై పసుపు నుండి గోధుమ రంగు మచ్చలు. మాంకోజెబ్ 75% WP 2.5 గ్రా./లీటరు వేయండి. సోకిన ఆకులు తీసేయండి. మొక్కల మధ్య దూరం ఉంచండి.",
      wilt: "ఫ్యూసేరియం విల్ట్: మొక్కలు వాడి చనిపోతాయి. విత్తనాలను ట్రైకోడెర్మాతో శుద్ధి చేయండి. నేలలో వేప పిండి వేయండి. పంట మార్పిడి పాటించండి.",
    },
    soil: "నేల ఆరోగ్యం: ప్రతి 2 సంవత్సరాలకు సమీపంలోని KVK లో నేల పరీక్ష చేయించండి. వర్మీకంపోస్ట్ వంటి సేంద్రియ పదార్థం వేయండి. పచ్చి ఎరువుగా జీలుగ లేదా జనుము వేయండి. pH 6.0-7.5 మధ్య ఉంచండి.",
    water: "నీటి నిర్వహణ: 40-60% నీరు ఆదా చేయడానికి బిందు సేద్యం వాడండి. మల్చింగ్ ఆవిరిని తగ్గిస్తుంది. వరిలో ఆర్నేట్ వెట్టింగ్ & డ్రైయింగ్ 20-25% నీరు ఆదా చేస్తుంది.",
    weather: "వాతావరణ నవీకరణల కోసం IMD వెబ్‌సైట్ చూడండి. రుతుపవనాల అంచనా ఆధారంగా విత్తనం ప్లాన్ చేయండి. భారీ వర్షాల ముందు పంట కోయండి. PMFBY బీమా వాడండి.",
    default: "నేను మీకు ఈ విషయాలలో సహాయం చేయగలను: పంట సాగు, వ్యాధి నిర్వహణ, నేల ఆరోగ్యం, నీటి నిర్వహణ, వాతావరణ సలహా, మరియు పీఎం కిసాన్, రైతు భరోసా వంటి ప్రభుత్వ పథకాలు. ఏమి తెలుసుకోవాలనుకుంటున్నారు?",
  },
}

function getAIResponse(query: string, lang: "en" | "te"): string {
  const kb = farmingKB[lang]
  const lower = query.toLowerCase()
  const original = query
  const has = (kw: string) => lower.includes(kw) || original.includes(kw)

  // Schemes
  if (["పీఎం కిసాన్", "కిసాన్", "pm kisan", "kisan"].some(has)) return kb.schemes.pmkisan
  if (["రైతు భరోసా", "భరోసా", "rythu", "bharosa", "ysr"].some(has)) return kb.schemes.rythu
  if (["పథకం", "scheme", "schemes", "పథకాలు"].some(has)) return `${kb.schemes.pmkisan}\n\n${kb.schemes.rythu}`

  // Crops
  if (["వరి", "paddy", "rice", "ధాన్యం"].some(has)) return kb.crops.paddy
  if (["పత్తి", "cotton"].some(has)) return kb.crops.cotton
  if (["మిరప", "chilli", "chili", "pepper"].some(has)) return kb.crops.chilli
  if (["టమాట", "tomato"].some(has)) return kb.crops.tomato
  if (["వేరుశెనగ", "groundnut", "peanut"].some(has)) return kb.crops.groundnut

  // Diseases
  if (["బ్లాస్ట్", "blast"].some(has)) return kb.diseases.blast
  if (["ఎండు", "blight", "leaf blight"].some(has)) return kb.diseases.blight
  if (["విల్ట్", "wilt", "వాడు"].some(has)) return kb.diseases.wilt
  if (["వ్యాధి", "disease", "రోగం"].some(has)) return `${kb.diseases.blast}\n\n${kb.diseases.blight}`

  // Soil
  if (["నేల", "soil", "మట్టి", "fertilizer", "ఎరువు"].some(has)) return kb.soil

  // Water
  if (["నీరు", "water", "irrigation", "సేద్యం", "drip", "బిందు"].some(has)) return kb.water

  // Weather
  if (["వాతావరణం", "weather", "వర్షం", "rain", "monsoon", "రుతుపవనం"].some(has)) return kb.weather

  // Greeting
  if (["హలో", "hello", "hi", "నమస్కారం", "hey"].some(has)) return kb.greeting

  return kb.default
}

export default function ChatPage() {
  const { lang, t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { initVoices() }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send welcome on first load
  useEffect(() => {
    const welcome = farmingKB[lang].greeting
    setMessages([{ role: "assistant", text: welcome }])
    speak(welcome, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return
      const userMsg: Message = { role: "user", text: text.trim() }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsThinking(true)

      setTimeout(() => {
        const response = getAIResponse(text, lang)
        setMessages((prev) => [...prev, { role: "assistant", text: response }])
        setIsThinking(false)
        speak(response, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
      }, 800)
    },
    [lang]
  )

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
      sendMessage(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang, sendMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t.chatTitle}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
          {t.chatTitle}
        </h1>
        <p className="text-muted-foreground text-balance">{t.chatSubtitle}</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 rounded-2xl bg-card/50 backdrop-blur-xl border border-border shadow-lg overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 min-h-[300px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary/15" : "bg-accent/15"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Bot className="h-4 w-4 text-accent" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-muted text-foreground rounded-tl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
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
              <Volume2 className="h-4 w-4" />
              {t.speaking}
            </div>
            <button
              onClick={() => { stopSpeaking(); setIsSpeaking(false) }}
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
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-1 h-11 rounded-xl bg-input/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
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
