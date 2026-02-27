"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { translations, type Language } from "./translations"

type LanguageContextType = {
  lang: Language
  setLang: (lang: Language) => void
  t: (typeof translations)["en"]
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("te")

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
