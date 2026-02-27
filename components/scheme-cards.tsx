"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  Shield,
  Building2,
  ChevronDown,
  CheckCircle2,
  FileText,
  ExternalLink,
  ClipboardList,
} from "lucide-react"

type Props = {
  onBack: () => void
}

type ExpandedState = {
  [schemeId: string]: {
    eligibility: boolean
    apply: boolean
  }
}

export function SchemeCards({ onBack }: Props) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const toggleSection = (schemeId: string, section: "eligibility" | "apply") => {
    setExpanded((prev) => ({
      ...prev,
      [schemeId]: {
        ...prev[schemeId],
        [section]: !prev[schemeId]?.[section],
      },
    }))
  }

  const schemes = [
    {
      id: "pmKisan",
      title: t.pmKisan,
      description: t.pmKisanDesc,
      amount: t.rs6000,
      icon: Shield,
      color: "from-primary/20 to-primary/5",
      borderColor: "border-primary/30",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      accentColor: "bg-primary",
      eligibility: [
        t.pmKisanElig1,
        t.pmKisanElig2,
        t.pmKisanElig3,
        t.pmKisanElig4,
        t.pmKisanElig5,
      ],
      applySteps: [
        t.pmKisanApply1,
        t.pmKisanApply2,
        t.pmKisanApply3,
        t.pmKisanApply4,
        t.pmKisanApply5,
        t.pmKisanApply6,
      ],
      applyLink: t.pmKisanApplyLink,
    },
    {
      id: "rythu",
      title: t.rythuBharosa,
      description: t.rythuBharosaDesc,
      amount: t.rs13500,
      icon: Building2,
      color: "from-accent/20 to-accent/5",
      borderColor: "border-accent/30",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
      accentColor: "bg-accent",
      eligibility: [
        t.rythuElig1,
        t.rythuElig2,
        t.rythuElig3,
        t.rythuElig4,
        t.rythuElig5,
      ],
      applySteps: [
        t.rythuApply1,
        t.rythuApply2,
        t.rythuApply3,
        t.rythuApply4,
        t.rythuApply5,
        t.rythuApply6,
      ],
      applyLink: t.rythuApplyLink,
    },
  ]

  const docs = [t.aadhaarCard, t.bankPassbook, t.landDocs, t.rationCard]

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

      <div className="grid gap-5">
        {schemes.map((scheme) => {
          const isEligOpen = expanded[scheme.id]?.eligibility
          const isApplyOpen = expanded[scheme.id]?.apply

          return (
            <div
              key={scheme.id}
              className={`rounded-2xl bg-gradient-to-br ${scheme.color} backdrop-blur-xl border ${scheme.borderColor} shadow-lg transition-all`}
            >
              {/* Scheme header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`h-12 w-12 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <scheme.icon className={`h-6 w-6 ${scheme.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg leading-tight">
                      {scheme.title}
                    </h3>
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

              {/* Expandable sections */}
              <div className="px-6 pb-2">
                {/* Eligibility Criteria */}
                <button
                  onClick={() => toggleSection(scheme.id, "eligibility")}
                  className="w-full flex items-center justify-between py-3 border-t border-border/40 group"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {t.eligibility}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isEligOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isEligOpen && (
                  <div className="pb-3 pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="space-y-2.5">
                      {scheme.eligibility.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${scheme.accentColor} mt-2 shrink-0`}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* How to Apply */}
                <button
                  onClick={() => toggleSection(scheme.id, "apply")}
                  className="w-full flex items-center justify-between py-3 border-t border-border/40 group"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {t.howToApply}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isApplyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isApplyOpen && (
                  <div className="pb-3 pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                    <ol className="space-y-2.5">
                      {scheme.applySteps.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                        >
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    {/* Documents required */}
                    <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">
                          {t.docsRequired}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {docs.map((doc, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Apply button */}
              <div className="px-6 pb-6 pt-2">
                <a
                  href={scheme.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${scheme.accentColor} text-card font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-md`}
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.applyOnline}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
