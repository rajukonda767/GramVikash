"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language } from "./translations"

type LanguageContextType = {
  lang: Language
  setLang: (lang: Language) => void
  t: (typeof translations)["en"]
}

const LanguageContext = createContext<LanguageContextType | null>(null)

function getSavedLang(): Language {
  if (typeof window === "undefined") return "en"
  const saved = localStorage.getItem("gramvikash-lang")
  if (saved === "te" || saved === "en") return saved
  return "en"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getSavedLang)

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem("gramvikash-lang", newLang)
  }

  // Sync on mount in case SSR default differs
  useEffect(() => {
    const saved = getSavedLang()
    if (saved !== lang) setLangState(saved)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
