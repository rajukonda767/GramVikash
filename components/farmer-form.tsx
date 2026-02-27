"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { User, Leaf, MapPin } from "lucide-react"

type Props = {
  onSubmit: () => void
}

export function FarmerForm({ onSubmit }: Props) {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [crop, setCrop] = useState("")
  const [size, setSize] = useState("")

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{t.appTitle}</h2>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {t.farmerName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.farmerNamePlaceholder}
              className="w-full rounded-xl bg-input/50 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              {t.cropType}
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full rounded-xl bg-input/50 border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none"
            >
              <option value="">{t.selectCrop}</option>
              <option value="paddy">{t.paddy}</option>
              <option value="cotton">{t.cotton}</option>
              <option value="chilli">{t.chilli}</option>
              <option value="groundnut">{t.groundnut}</option>
              <option value="sugarcane">{t.sugarcane}</option>
              <option value="maize">{t.maize}</option>
              <option value="tomato">{t.tomato}</option>
              <option value="turmeric">{t.turmeric}</option>
              <option value="mango">{t.mango}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t.farmSize}
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-xl bg-input/50 border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none"
            >
              <option value="">{t.selectFarm}</option>
              <option value="small">{t.small}</option>
              <option value="medium">{t.medium}</option>
              <option value="large">{t.large}</option>
            </select>
          </div>

          <button
            onClick={onSubmit}
            disabled={!name || !crop || !size}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 px-6 font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {t.showSchemes}
          </button>
        </div>
      </div>
    </div>
  )
}
