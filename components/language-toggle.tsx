"use client"

import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-md px-3 py-2 border border-border shadow-sm">
      <Globe className="h-4 w-4 text-primary" />
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          lang === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLang("te")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          lang === "te"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        తెలుగు
      </button>
    </div>
  )
}
