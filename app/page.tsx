"use client"

import { useState } from "react"
import { LanguageProvider } from "@/lib/language-context"
import { HeroHeader } from "@/components/hero-header"
import { FarmerForm } from "@/components/farmer-form"
import { SchemeCards } from "@/components/scheme-cards"
import { VoiceAssistant } from "@/components/voice-assistant"

function AppContent() {
  const [showSchemes, setShowSchemes] = useState(false)

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <HeroHeader />

        {!showSchemes ? (
          <FarmerForm onSubmit={() => setShowSchemes(true)} />
        ) : (
          <SchemeCards onBack={() => setShowSchemes(false)} />
        )}
      </div>

      <VoiceAssistant />
    </main>
  )
}

export default function Page() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
