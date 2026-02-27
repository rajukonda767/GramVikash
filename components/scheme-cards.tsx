"use client"

import { useLanguage } from "@/lib/language-context"
import { ArrowLeft, IndianRupee, Calendar, Shield, Building2 } from "lucide-react"

type Props = {
  onBack: () => void
}

export function SchemeCards({ onBack }: Props) {
  const { t } = useLanguage()

  const schemes = [
    {
      title: t.pmKisan,
      description: t.pmKisanDesc,
      amount: t.rs6000,
      icon: Shield,
      color: "from-primary/20 to-primary/5",
      borderColor: "border-primary/30",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      title: t.rythuBharosa,
      description: t.rythuBharosaDesc,
      amount: t.rs13500,
      icon: Building2,
      color: "from-accent/20 to-accent/5",
      borderColor: "border-accent/30",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t.eligibleSchemes}</h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToForm}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {schemes.map((scheme) => (
          <div
            key={scheme.title}
            className={`group rounded-2xl bg-gradient-to-br ${scheme.color} backdrop-blur-xl border ${scheme.borderColor} p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`h-12 w-12 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0`}>
                <scheme.icon className={`h-6 w-6 ${scheme.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{scheme.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {scheme.description}
            </p>
            <div className="flex items-center gap-2 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <IndianRupee className="h-4 w-4" />
                <span>{scheme.amount}</span>
              </div>
              <span className="text-muted-foreground text-sm">{t.perYear}</span>
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{t.annual}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
