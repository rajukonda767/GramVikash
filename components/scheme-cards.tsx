"use client"

import { useLanguage } from "@/lib/language-context"
import { speak, stopSpeaking } from "@/lib/tts"
import { getRelevantSchemes, type SchemeData } from "@/lib/schemes-data"
import { useState } from "react"
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  Shield,
  Building2,
  ChevronDown,
  CheckCircle2,
  FileText,
  ExternalLink,
  ClipboardList,
  Volume2,
  Droplets,
  CreditCard,
  GraduationCap,
  Sprout,
  Umbrella,
  Tractor,
  Leaf,
  Store,
  Flower2,
} from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  shield: Shield,
  umbrella: Umbrella,
  creditCard: CreditCard,
  droplets: Droplets,
  building2: Building2,
  building: Building2,
  sprout: Sprout,
  tractor: Tractor,
  graduationCap: GraduationCap,
  leaf: Leaf,
  flower: Flower2,
  store: Store,
}

const COLOR_MAP: Record<string, { gradient: string; border: string; accent: string; iconBg: string; iconClr: string }> = {
  emerald: { gradient: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/25", accent: "bg-emerald-600", iconBg: "bg-emerald-500/15", iconClr: "text-emerald-600" },
  blue: { gradient: "from-blue-500/15 to-blue-500/5", border: "border-blue-500/25", accent: "bg-blue-600", iconBg: "bg-blue-500/15", iconClr: "text-blue-600" },
  amber: { gradient: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/25", accent: "bg-amber-600", iconBg: "bg-amber-500/15", iconClr: "text-amber-600" },
  cyan: { gradient: "from-cyan-500/15 to-cyan-500/5", border: "border-cyan-500/25", accent: "bg-cyan-600", iconBg: "bg-cyan-500/15", iconClr: "text-cyan-600" },
  orange: { gradient: "from-orange-500/15 to-orange-500/5", border: "border-orange-500/25", accent: "bg-orange-600", iconBg: "bg-orange-500/15", iconClr: "text-orange-600" },
  teal: { gradient: "from-teal-500/15 to-teal-500/5", border: "border-teal-500/25", accent: "bg-teal-600", iconBg: "bg-teal-500/15", iconClr: "text-teal-600" },
  indigo: { gradient: "from-indigo-500/15 to-indigo-500/5", border: "border-indigo-500/25", accent: "bg-indigo-600", iconBg: "bg-indigo-500/15", iconClr: "text-indigo-600" },
  rose: { gradient: "from-rose-500/15 to-rose-500/5", border: "border-rose-500/25", accent: "bg-rose-600", iconBg: "bg-rose-500/15", iconClr: "text-rose-600" },
  lime: { gradient: "from-lime-500/15 to-lime-500/5", border: "border-lime-500/25", accent: "bg-lime-600", iconBg: "bg-lime-500/15", iconClr: "text-lime-600" },
  green: { gradient: "from-green-500/15 to-green-500/5", border: "border-green-500/25", accent: "bg-green-600", iconBg: "bg-green-500/15", iconClr: "text-green-600" },
  pink: { gradient: "from-pink-500/15 to-pink-500/5", border: "border-pink-500/25", accent: "bg-pink-600", iconBg: "bg-pink-500/15", iconClr: "text-pink-600" },
}

type Props = {
  onBack: () => void
  crop: string
  farmSize: string
  farmerName: string
}
type ExpandedState = { [id: string]: { eligibility: boolean; apply: boolean } }

export function SchemeCards({ onBack, crop, farmSize, farmerName }: Props) {
  const { lang } = useLanguage()
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  const schemes = getRelevantSchemes(crop, farmSize)
  const centralSchemes = schemes.filter((s) => s.category === "central")
  const apSchemes = schemes.filter((s) => s.category === "ap")

  const l = (obj: { en: string; te: string }) => obj[lang]
  const la = (obj: { en: string[]; te: string[] }) => obj[lang]

  const toggle = (id: string, section: "eligibility" | "apply") => {
    setExpanded((prev) => ({
      ...prev,
      [id]: { ...prev[id], [section]: !prev[id]?.[section] },
    }))
  }

  const speakScheme = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking()
      setSpeakingId(null)
      return
    }
    speak(text, lang, () => setSpeakingId(id), () => setSpeakingId(null))
  }

  const CROP_NAMES: Record<string, { en: string; te: string }> = {
    paddy: { en: "Paddy", te: "వరి" },
    cotton: { en: "Cotton", te: "పత్తి" },
    chilli: { en: "Chilli", te: "మిరప" },
    groundnut: { en: "Groundnut", te: "వేరుశెనగ" },
    sugarcane: { en: "Sugarcane", te: "చెరకు" },
    maize: { en: "Maize", te: "మొక్కజొన్న" },
    tomato: { en: "Tomato", te: "టమాట" },
    turmeric: { en: "Turmeric", te: "పసుపు" },
    mango: { en: "Mango", te: "మామిడి" },
  }

  const cropName = CROP_NAMES[crop] ? l(CROP_NAMES[crop]) : crop

  const renderSchemeCard = (scheme: SchemeData) => {
    const isEligOpen = expanded[scheme.id]?.eligibility
    const isApplyOpen = expanded[scheme.id]?.apply
    const isSpeakingThis = speakingId === scheme.id
    const colors = COLOR_MAP[scheme.color] || COLOR_MAP.emerald
    const Icon = ICON_MAP[scheme.icon] || Shield

    return (
      <div key={scheme.id} className={`rounded-2xl bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} shadow-lg transition-all`}>
        <div className="p-5 pb-3">
          <div className="flex items-start gap-3 mb-3">
            <div className={`h-11 w-11 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${colors.iconClr}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground leading-tight">{l(scheme.title)}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                scheme.category === "central"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent-foreground"
              }`}>
                {scheme.category === "central"
                  ? (lang === "te" ? "కేంద్రం" : "Central")
                  : (lang === "te" ? "AP రాష్ట్రం" : "AP State")}
              </span>
            </div>
            <button
              onClick={() => speakScheme(scheme.id, `${l(scheme.title)}. ${l(scheme.description)}`)}
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isSpeakingThis ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-primary"
              }`}
              aria-label="Listen"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{l(scheme.description)}</p>
          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
              <IndianRupee className="h-3.5 w-3.5" />
              <span>{l(scheme.amount)}</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{lang === "te" ? "వార్షికం" : "Annual"}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-1">
          {/* Eligibility */}
          <button onClick={() => toggle(scheme.id, "eligibility")} className="w-full flex items-center justify-between py-2.5 border-t border-border/30 group">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">{lang === "te" ? "అర్హత ప్రమాణాలు" : "Eligibility Criteria"}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isEligOpen ? "rotate-180" : ""}`} />
          </button>
          {isEligOpen && (
            <ul className="pb-2 pl-6 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {la(scheme.eligibility).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className={`h-1.5 w-1.5 rounded-full ${colors.accent} mt-1.5 shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* How to Apply */}
          <button onClick={() => toggle(scheme.id, "apply")} className="w-full flex items-center justify-between py-2.5 border-t border-border/30 group">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">{lang === "te" ? "దరఖాస్తు ఎలా" : "How to Apply"}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isApplyOpen ? "rotate-180" : ""}`} />
          </button>
          {isApplyOpen && (
            <div className="pb-2 pl-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <ol className="space-y-1.5">
                {la(scheme.applySteps).map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-3 p-2.5 rounded-xl bg-muted/50 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold text-foreground">{lang === "te" ? "అవసరమైన పత్రాలు" : "Documents Required"}</span>
                </div>
                <ul className="space-y-1">
                  {la(scheme.docs).map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-1">
          <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl ${colors.accent} text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-md`}>
            <ExternalLink className="h-4 w-4" />
            {lang === "te" ? "ఆన్‌లైన్‌లో దరఖాస్తు" : "Apply Online"}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-foreground">
          {lang === "te" ? `${farmerName}, మీ కోసం పథకాలు` : `Schemes for ${farmerName}`}
        </h2>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {lang === "te" ? "తిరిగి" : "Back"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {lang === "te"
          ? `${cropName} పంట & మీ భూమి పరిమాణం ఆధారంగా ${schemes.length} అత్యంత సంబంధిత పథకాలు:`
          : `${schemes.length} most relevant schemes based on ${cropName} crop & your farm size:`}
      </p>

      {/* Central Schemes */}
      {centralSchemes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {lang === "te" ? "కేంద్ర ప్రభుత్వ పథకాలు" : "Central Government Schemes"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">{centralSchemes.map(renderSchemeCard)}</div>
        </div>
      )}

      {/* AP State Schemes */}
      {apSchemes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-accent-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {lang === "te" ? "ఆంధ్రప్రదేశ్ రాష్ట్ర పథకాలు" : "Andhra Pradesh State Schemes"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">{apSchemes.map(renderSchemeCard)}</div>
        </div>
      )}
    </div>
  )
}
