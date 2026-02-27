"use client"

import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "./language-toggle"
import { Sprout } from "lucide-react"

export function HeroHeader() {
  const { t } = useLanguage()

  return (
    <header className="text-center mb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground text-sm hidden sm:block">
            {t.appTitle}
          </span>
        </div>
        <LanguageToggle />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
          {t.appTitle}
        </h1>
        <p className="text-muted-foreground text-balance max-w-md mx-auto">
          {t.appSubtitle}
        </p>
      </div>
    </header>
  )
}
