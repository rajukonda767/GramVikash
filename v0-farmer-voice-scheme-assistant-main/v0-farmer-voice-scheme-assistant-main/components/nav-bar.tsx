"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageToggle } from "./language-toggle"
import { Home, Leaf, Shield, MessageCircle, Sprout, Menu, X, CloudSun } from "lucide-react"
import { useState } from "react"

export function NavBar() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: "/", label: t.navHome, icon: Home },
    { href: "/crop-disease", label: t.navCropDisease, icon: Leaf },
    { href: "/schemes", label: t.navSchemes, icon: Shield },
    { href: "/weather", label: t.navWeather, icon: CloudSun },
    { href: "/chat", label: t.navChat, icon: MessageCircle },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-card/80 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground text-lg hidden sm:block" suppressHydrationWarning>
              {t.appName}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  suppressHydrationWarning
                >
                  <link.icon className="h-4 w-4" />
                  <span suppressHydrationWarning>{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    suppressHydrationWarning
                  >
                    <link.icon className="h-5 w-5" />
                    <span suppressHydrationWarning>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
