"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { VoiceFormChatbot, type FormData } from "@/components/voice-form-chatbot"
import { SchemeCards } from "@/components/scheme-cards"
import { Shield, Mic } from "lucide-react"

export default function SchemesPage() {
  const { lang, t } = useLanguage()
  const [farmerData, setFarmerData] = useState<FormData | null>(null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t.featureSchemeTitle}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
          {t.appTitle}
        </h1>
        <p className="text-muted-foreground text-balance mb-2">{t.appSubtitle}</p>
        <div className="inline-flex items-center gap-1.5 text-xs text-primary/80 bg-primary/5 px-3 py-1.5 rounded-full">
          <Mic className="h-3 w-3" />
          {lang === "te" ? "మాట్లాడి ఫారమ్ నింపండి - టైపింగ్ అవసరం లేదు" : "Speak to fill the form - no typing needed"}
        </div>
      </div>

      {!farmerData ? (
        <VoiceFormChatbot onComplete={(data) => setFarmerData(data)} />
      ) : (
        <SchemeCards
          onBack={() => setFarmerData(null)}
          crop={farmerData.crop}
          farmSize={farmerData.farmSize}
          farmerName={farmerData.name}
        />
      )}

    </div>
  )
}
