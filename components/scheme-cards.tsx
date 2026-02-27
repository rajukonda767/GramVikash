"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { speak, stopSpeaking } from "@/lib/tts"
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
} from "lucide-react"

type Props = { onBack: () => void }
type ExpandedState = { [id: string]: { eligibility: boolean; apply: boolean } }

export function SchemeCards({ onBack }: Props) {
  const { lang, t } = useLanguage()
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  const toggle = (id: string, section: "eligibility" | "apply") => {
    setExpanded(prev => ({
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

  const centralSchemes = [
    {
      id: "pmkisan",
      title: t.pmKisan,
      description: t.pmKisanDesc,
      amount: t.rs6000,
      icon: Shield,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      border: "border-emerald-500/25",
      accent: "bg-emerald-600",
      iconBg: "bg-emerald-500/15",
      iconClr: "text-emerald-600",
      eligibility: [t.pmKisanElig1, t.pmKisanElig2, t.pmKisanElig3, t.pmKisanElig4, t.pmKisanElig5],
      applySteps: [t.pmKisanApply1, t.pmKisanApply2, t.pmKisanApply3, t.pmKisanApply4, t.pmKisanApply5, t.pmKisanApply6],
      applyLink: t.pmKisanApplyLink,
      docs: [t.aadhaarCard, t.bankPassbook, t.landDocs],
    },
    {
      id: "pmfby",
      title: lang === "te" ? "పీఎం ఫసల్ బీమా యోజన" : "PM Fasal Bima Yojana",
      description: lang === "te" ? "ఖరీఫ్‌కు 2% మరియు రబీ పంటలకు 1.5% ప్రీమియంతో పంట బీమా. ప్రకృతి వైపరీత్యాల నుండి రైతులను రక్షిస్తుంది." : "Crop insurance at just 2% premium for Kharif and 1.5% for Rabi crops. Protects farmers from natural calamities.",
      amount: lang === "te" ? "2% ప్రీమియం" : "2% Premium",
      icon: Umbrella,
      gradient: "from-blue-500/15 to-blue-500/5",
      border: "border-blue-500/25",
      accent: "bg-blue-600",
      iconBg: "bg-blue-500/15",
      iconClr: "text-blue-600",
      eligibility: [
        lang === "te" ? "నోటిఫైడ్ ప్రాంతాల్లో నోటిఫైడ్ పంటలు పండించే రైతులు" : "All farmers growing notified crops in notified areas",
        lang === "te" ? "రుణ మరియు రుణేతర రైతులు ఇద్దరూ అర్హులు" : "Both loanee and non-loanee farmers eligible",
        lang === "te" ? "కౌలు రైతులు దరఖాస్తు చేయవచ్చు" : "Sharecroppers and tenant farmers can apply",
        lang === "te" ? "సీజన్‌లో బీమా చేసిన పంట విత్తాలి" : "Must sow the insured crop during the season",
      ],
      applySteps: [
        lang === "te" ? "pmfby.gov.in సందర్శించి నమోదు చేసుకోండి" : "Visit pmfby.gov.in and register",
        lang === "te" ? "సమీపంలోని బ్యాంక్ లేదా CSC కేంద్రంలో దరఖాస్తు" : "Apply through nearest bank or CSC center",
        lang === "te" ? "పంట విత్తన వివరాలు సమర్పించండి" : "Submit crop sowing details and land records",
        lang === "te" ? "ప్రీమియం రైతు వాటా చెల్లించండి" : "Pay farmer share of premium",
      ],
      applyLink: "https://pmfby.gov.in",
      docs: [t.aadhaarCard, t.bankPassbook, t.landDocs, lang === "te" ? "విత్తన ధృవీకరణ" : "Sowing Certificate"],
    },
    {
      id: "kcc",
      title: lang === "te" ? "కిసాన్ క్రెడిట్ కార్డ్ (KCC)" : "Kisan Credit Card (KCC)",
      description: lang === "te" ? "పంట ఉత్పత్తికి 4% వడ్డీతో రూ. 3 లక్షల వరకు రుణం. సకాలంలో చెల్లిస్తే 3% సబ్వెన్షన్." : "Short-term credit up to Rs. 3 lakhs at 4% interest for crop production. 3% subvention for prompt repayment.",
      amount: lang === "te" ? "రూ. 3 లక్షలు" : "Rs. 3 Lakhs",
      icon: CreditCard,
      gradient: "from-amber-500/15 to-amber-500/5",
      border: "border-amber-500/25",
      accent: "bg-amber-600",
      iconBg: "bg-amber-500/15",
      iconClr: "text-amber-600",
      eligibility: [
        lang === "te" ? "అన్ని రైతులు - వ్యక్తిగత లేదా సంయుక్త" : "All farmers - individual or joint borrowers",
        lang === "te" ? "కౌలు రైతులు, భాగస్వామ్య రైతులు అర్హులు" : "Tenant farmers and sharecroppers eligible",
        lang === "te" ? "పంట ఉత్పత్తి లేదా అనుబంధ కార్యకలాపాల్లో ఉండాలి" : "Must be in crop production or allied activities",
      ],
      applySteps: [
        lang === "te" ? "సమీపంలోని జాతీయ బ్యాంక్ శాఖకు వెళ్ళండి" : "Visit nearest nationalized bank branch",
        lang === "te" ? "KCC దరఖాస్తు ఫారమ్ నింపండి" : "Fill KCC application form",
        lang === "te" ? "భూమి రికార్డులు, ఆధార్ సమర్పించండి" : "Submit land records and Aadhaar",
        lang === "te" ? "14 రోజుల్లో KCC జారీ అవుతుంది" : "KCC issued within 14 days",
      ],
      applyLink: "https://pmkisan.gov.in/KCCForm.aspx",
      docs: [t.aadhaarCard, t.landDocs, lang === "te" ? "పాస్‌పోర్ట్ ఫోటో" : "Passport Photo", t.bankPassbook],
    },
    {
      id: "pmksy",
      title: lang === "te" ? "పీఎం కృషి సించాయ్ యోజన" : "PM Krishi Sinchai Yojana",
      description: lang === "te" ? "చిన్న రైతులకు 55% వరకు డ్రిప్ మరియు స్ప్రింక్లర్ వ్యవస్థలపై సబ్సిడీ. ప్రతి చుక్క నీటిని పంటకు." : "Subsidy up to 55% on drip and sprinkler systems for small farmers. Per drop more crop.",
      amount: lang === "te" ? "55% సబ్సిడీ" : "55% Subsidy",
      icon: Droplets,
      gradient: "from-cyan-500/15 to-cyan-500/5",
      border: "border-cyan-500/25",
      accent: "bg-cyan-600",
      iconBg: "bg-cyan-500/15",
      iconClr: "text-cyan-600",
      eligibility: [
        lang === "te" ? "స్వంత లేదా లీజు భూమితో అన్ని రైతులు" : "All farmers with own or leased land",
        lang === "te" ? "చిన్న మరియు సన్నకారు రైతులకు ప్రాధాన్యత" : "Priority to small and marginal farmers",
        lang === "te" ? "భూమికి నీటి వనరు ఉండాలి" : "Land must have a water source",
      ],
      applySteps: [
        lang === "te" ? "రాష్ట్ర వ్యవసాయ శాఖ ద్వారా దరఖాస్తు" : "Apply through State Agriculture Department",
        lang === "te" ? "జిల్లా వ్యవసాయ కార్యాలయంలో సమర్పించండి" : "Submit at district agriculture office",
        lang === "te" ? "సాంకేతిక బృందం ధృవీకరించిన తర్వాత సబ్సిడీ" : "Subsidy after technical team verification",
      ],
      applyLink: "https://pmksy.gov.in",
      docs: [t.aadhaarCard, t.landDocs, t.bankPassbook, lang === "te" ? "నీటి వనరు రుజువు" : "Water Source Proof"],
    },
  ]

  const apSchemes = [
    {
      id: "rythu",
      title: t.rythuBharosa,
      description: t.rythuBharosaDesc,
      amount: t.rs13500,
      icon: Building2,
      gradient: "from-orange-500/15 to-orange-500/5",
      border: "border-orange-500/25",
      accent: "bg-orange-600",
      iconBg: "bg-orange-500/15",
      iconClr: "text-orange-600",
      eligibility: [t.rythuElig1, t.rythuElig2, t.rythuElig3, t.rythuElig4, t.rythuElig5],
      applySteps: [t.rythuApply1, t.rythuApply2, t.rythuApply3, t.rythuApply4, t.rythuApply5, t.rythuApply6],
      applyLink: t.rythuApplyLink,
      docs: [t.aadhaarCard, t.bankPassbook, t.landDocs, t.rationCard],
    },
    {
      id: "annadatha",
      title: lang === "te" ? "వైఎస్ఆర్ అన్నదాత సుఖీభవ" : "YSR Annadatha Sukhibhava",
      description: lang === "te" ? "రైతు భరోసా లబ్ధిదారులకు ఉచిత పంట బీమా. ప్రకృతి వైపరీత్యాలలో నష్టపరిహారం." : "Free crop insurance for Rythu Bharosa beneficiaries. Compensation during natural calamities.",
      amount: lang === "te" ? "ఉచిత బీమా" : "Free Insurance",
      icon: Sprout,
      gradient: "from-teal-500/15 to-teal-500/5",
      border: "border-teal-500/25",
      accent: "bg-teal-600",
      iconBg: "bg-teal-500/15",
      iconClr: "text-teal-600",
      eligibility: [
        lang === "te" ? "రైతు భరోసాలో నమోదైన అన్ని రైతులు" : "All farmers enrolled under Rythu Bharosa",
        lang === "te" ? "వ్యవసాయ శాఖలో పంట నమోదు ఉండాలి" : "Must have crop registered with agriculture department",
        lang === "te" ? "భూ యజమానులు మరియు కౌలు రైతులు ఇద్దరూ అర్హులు" : "Both landowners and tenant farmers eligible",
      ],
      applySteps: [
        lang === "te" ? "రైతు భరోసా లబ్ధిదారులకు స్వయంచాలక నమోదు" : "Automatic enrollment for Rythu Bharosa beneficiaries",
        lang === "te" ? "గ్రామ సచివాలయంలో ధృవీకరించండి" : "Verify at Village Secretariat",
        lang === "te" ? "VRO/VAO ద్వారా పంట వివరాలు నవీకరణ" : "Crop details updated by VRO/VAO",
      ],
      applyLink: "https://ysrrythubharosa.ap.gov.in",
      docs: [lang === "te" ? "రైతు భరోసా ID" : "Rythu Bharosa ID", t.aadhaarCard, lang === "te" ? "పంట నమోదు" : "Crop Registration"],
    },
    {
      id: "apdrip",
      title: lang === "te" ? "AP మైక్రో ఇరిగేషన్ సబ్సిడీ" : "AP Micro Irrigation Subsidy",
      description: lang === "te" ? "SC/ST రైతులకు 90% సబ్సిడీ, ఇతరులకు 80%. డ్రిప్ మరియు స్ప్రింక్లర్ వ్యవస్థలు." : "90% subsidy for SC/ST farmers, 80% for others. Drip and sprinkler systems.",
      amount: lang === "te" ? "90% సబ్సిడీ" : "90% Subsidy",
      icon: Tractor,
      gradient: "from-indigo-500/15 to-indigo-500/5",
      border: "border-indigo-500/25",
      accent: "bg-indigo-600",
      iconBg: "bg-indigo-500/15",
      iconClr: "text-indigo-600",
      eligibility: [
        lang === "te" ? "స్వంత భూమి ఉన్న AP రైతులు" : "All AP farmers with own land",
        lang === "te" ? "బోరు బావి లేదా నీటి వనరు ఉండాలి" : "Must have bore well or water source",
        lang === "te" ? "SC/ST రైతులకు 90%, ఇతరులకు 80% సబ్సిడీ" : "SC/ST farmers get 90%, others get 80% subsidy",
        lang === "te" ? "కనీసం 0.5 ఎకరాలు భూమి ఉండాలి" : "Minimum 0.5 acres land required",
      ],
      applySteps: [
        lang === "te" ? "జిల్లా వ్యవసాయ కార్యాలయంలో దరఖాస్తు" : "Apply at District Agriculture Office",
        lang === "te" ? "మైక్రో-ఇరిగేషన్ కంపెనీ ఎంచుకోండి" : "Select micro-irrigation company",
        lang === "te" ? "రైతు వాటా (10-20%) చెల్లించండి" : "Pay farmer share (10-20%)",
        lang === "te" ? "ఫీల్డ్ ధృవీకరణ తర్వాత సబ్సిడీ" : "Subsidy released after verification",
      ],
      applyLink: "https://www.apagrisnet.gov.in",
      docs: [t.aadhaarCard, t.landDocs, lang === "te" ? "కుల ధృవీకరణ" : "Caste Certificate", t.bankPassbook],
    },
    {
      id: "vasathi",
      title: lang === "te" ? "జగనన్న వసతి దీవెన" : "Jagananna Vasathi Deevena",
      description: lang === "te" ? "రైతు పిల్లల విద్యా ఖర్చులకు సంవత్సరానికి రూ. 20,000. హాస్టల్ మరియు మెస్ ఛార్జీలు." : "Rs. 20,000/year for farmer children education expenses. Hostel and mess charges covered.",
      amount: lang === "te" ? "రూ. 20,000" : "Rs. 20,000",
      icon: GraduationCap,
      gradient: "from-rose-500/15 to-rose-500/5",
      border: "border-rose-500/25",
      accent: "bg-rose-600",
      iconBg: "bg-rose-500/15",
      iconClr: "text-rose-600",
      eligibility: [
        lang === "te" ? "AP రైతు కుటుంబాల పిల్లలు" : "Children of AP farmer families",
        lang === "te" ? "గుర్తింపు పొందిన సంస్థలో చదువుతూ ఉండాలి" : "Must study in recognized institution",
        lang === "te" ? "కుటుంబ ఆదాయం రూ. 2.5 లక్షల కంటే తక్కువ" : "Family income below Rs. 2.5 lakhs/year",
        lang === "te" ? "75% హాజరు తప్పనిసరి" : "75% attendance mandatory",
      ],
      applySteps: [
        lang === "te" ? "కళాశాల ద్వారా దరఖాస్తు" : "Apply through college",
        lang === "te" ? "ఆధార్-లింక్డ్ దరఖాస్తు సమర్పించండి" : "Submit Aadhaar-linked application",
        lang === "te" ? "MeeSeva నుండి ఆదాయ ధృవీకరణ" : "Income certificate from MeeSeva",
        lang === "te" ? "సంస్థ ద్వారా ధృవీకరణ" : "Verification by institution",
      ],
      applyLink: "https://jnanabhumi.ap.gov.in",
      docs: [
        lang === "te" ? "విద్యార్థి ఆధార్" : "Student Aadhaar",
        lang === "te" ? "తల్లిదండ్రుల ఆధార్" : "Parent Aadhaar",
        lang === "te" ? "ఆదాయ ధృవీకరణ" : "Income Certificate",
        lang === "te" ? "కళాశాల ID" : "College ID",
      ],
    },
  ]

  const renderSchemeCard = (scheme: typeof centralSchemes[0]) => {
    const isEligOpen = expanded[scheme.id]?.eligibility
    const isApplyOpen = expanded[scheme.id]?.apply
    const isSpeakingThis = speakingId === scheme.id

    return (
      <div key={scheme.id} className={`rounded-2xl bg-gradient-to-br ${scheme.gradient} backdrop-blur-xl border ${scheme.border} shadow-lg transition-all`}>
        <div className="p-5 pb-3">
          <div className="flex items-start gap-3 mb-3">
            <div className={`h-11 w-11 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0`}>
              <scheme.icon className={`h-5 w-5 ${scheme.iconClr}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground leading-tight">{scheme.title}</h3>
            </div>
            <button
              onClick={() => speakScheme(scheme.id, `${scheme.title}. ${scheme.description}`)}
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isSpeakingThis ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-primary"
              }`}
              aria-label="Listen"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{scheme.description}</p>
          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
              <IndianRupee className="h-3.5 w-3.5" />
              <span>{scheme.amount}</span>
            </div>
            <span className="text-muted-foreground text-xs">{t.perYear}</span>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{t.annual}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-1">
          {/* Eligibility */}
          <button onClick={() => toggle(scheme.id, "eligibility")} className="w-full flex items-center justify-between py-2.5 border-t border-border/30 group">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">{t.eligibility}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isEligOpen ? "rotate-180" : ""}`} />
          </button>
          {isEligOpen && (
            <ul className="pb-2 pl-6 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {scheme.eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className={`h-1.5 w-1.5 rounded-full ${scheme.accent} mt-1.5 shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* How to Apply */}
          <button onClick={() => toggle(scheme.id, "apply")} className="w-full flex items-center justify-between py-2.5 border-t border-border/30 group">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">{t.howToApply}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isApplyOpen ? "rotate-180" : ""}`} />
          </button>
          {isApplyOpen && (
            <div className="pb-2 pl-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <ol className="space-y-1.5">
                {scheme.applySteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0 mt-0.5">{i+1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-3 p-2.5 rounded-xl bg-muted/50 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold text-foreground">{t.docsRequired}</span>
                </div>
                <ul className="space-y-1">
                  {scheme.docs.map((doc, i) => (
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
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl ${scheme.accent} text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-md`}>
            <ExternalLink className="h-4 w-4" />
            {t.applyOnline}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t.eligibleSchemes}</h2>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.backToForm}
        </button>
      </div>

      {/* Central Schemes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {lang === "te" ? "కేంద్ర ప్రభుత్వ పథకాలు" : "Central Government Schemes"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">{centralSchemes.map(renderSchemeCard)}</div>
      </div>

      {/* AP State Schemes */}
      <div>
        <h3 className="text-sm font-semibold text-accent uppercase tracking-wide mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {lang === "te" ? "ఆంధ్రప్రదేశ్ రాష్ట్ర పథకాలు" : "Andhra Pradesh State Schemes"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">{apSchemes.map(renderSchemeCard)}</div>
      </div>
    </div>
  )
}
