"use client"

import { LanguageProvider } from "@/lib/language-context"
import { NavBar } from "./nav-bar"
import { VoiceAssistant } from "./voice-assistant"
import { SosFloatingButton } from "./sos-floating-button"
import type { ReactNode } from "react"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col relative">
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

        <NavBar />
        <main className="flex-1">{children}</main>
        <SosFloatingButton />
        <VoiceAssistant />
      </div>
    </LanguageProvider>
  )
}
