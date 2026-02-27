"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Leaf, Shield, MessageCircle, Mic, ArrowRight, Sprout, HeartPulse, Siren } from "lucide-react"

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
  accentClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  cta: string
  accentClass: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-card/70 backdrop-blur-xl border border-border p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className={`h-12 w-12 rounded-xl ${accentClass} flex items-center justify-center mb-4`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2 text-balance">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

export default function HomePage() {
  const { lang, t } = useLanguage()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sprout className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t.appName}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground font-medium mb-4 text-balance">
          {t.heroSubtitle}
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance mb-8">
          {t.heroDesc}
        </p>

        {/* Hero icons */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mic className="h-7 w-7 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.featureVoiceTitle}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <HeartPulse className="h-7 w-7 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.featureCropTitle}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t.featureSchemeTitle}</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/crop-disease"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Leaf className="h-4 w-4" />
            {t.getStarted}
          </Link>
          <Link
            href="/schemes"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Shield className="h-4 w-4" />
            {t.exploreSchemes}
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            {t.askAI}
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid sm:grid-cols-2 gap-6">
        <FeatureCard
          icon={Leaf}
          title={t.featureCropTitle}
          description={t.featureCropDesc}
          href="/crop-disease"
          cta={t.getStarted}
          accentClass="bg-primary/15 text-primary"
        />
        <FeatureCard
          icon={Shield}
          title={t.featureSchemeTitle}
          description={t.featureSchemeDesc}
          href="/schemes"
          cta={t.exploreSchemes}
          accentClass="bg-accent/15 text-accent"
        />
        <FeatureCard
          icon={MessageCircle}
          title={t.featureChatTitle}
          description={t.featureChatDesc}
          href="/chat"
          cta={t.askAI}
          accentClass="bg-primary/15 text-primary"
        />
        <FeatureCard
          icon={Siren}
          title={t.navEmergency}
          description={t.sosSubtitle}
          href="/emergency"
          cta={t.navEmergency}
          accentClass="bg-red-100 text-red-600"
        />
      </section>
    </div>
  )
}
