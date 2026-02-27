"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Siren } from "lucide-react"

export function SosFloatingButton() {
  const pathname = usePathname()

  // Hide on the emergency page itself
  if (pathname === "/emergency") return null

  return (
    <Link
      href="/emergency"
      className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-pulse"
      style={{
        boxShadow: "0 0 25px rgba(220, 38, 38, 0.5), 0 0 50px rgba(220, 38, 38, 0.2)",
      }}
      aria-label="Emergency SOS"
    >
      <Siren className="h-6 w-6" />
    </Link>
  )
}
