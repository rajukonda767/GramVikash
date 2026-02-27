"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { FarmerForm } from "@/components/farmer-form"
import { SchemeCards } from "@/components/scheme-cards"
import { Shield } from "lucide-react"

export default function SchemesPage() {
  const { t } = useLanguage()
  const [showSchemes, setShowSchemes] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t.featureSchemeTitle}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
          {t.appTitle}
        </h1>
        <p className="text-muted-foreground text-balance">{t.appSubtitle}</p>
      </div>

      {!showSchemes ? (
        <FarmerForm onSubmit={() => setShowSchemes(true)} />
      ) : (
        <SchemeCards onBack={() => setShowSchemes(false)} />
      )}
    </div>
  )
}
