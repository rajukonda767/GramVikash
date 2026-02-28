"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { speak, stopSpeaking, initVoices } from "@/lib/tts"
import {
  Siren,
  Flame,
  Waves,
  Bug,
  Tractor,
  HeartPulse,
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Loader2,
  ExternalLink,
} from "lucide-react"

type EmergencyType = {
  id: string
  labelEn: string
  labelTe: string
  icon: React.ComponentType<{ className?: string }>
  priority: "CRITICAL" | "HIGH" | "NORMAL"
  weight: number
  color: string
  bgColor: string
}

const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: "fire",
    labelEn: "Fire Emergency",
    labelTe: "అగ్ని ప్రమాదం",
    icon: Flame,
    priority: "HIGH",
    weight: 4,
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    id: "flood",
    labelEn: "Flood Situation",
    labelTe: "వరద పరిస్థితి",
    icon: Waves,
    priority: "HIGH",
    weight: 4,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "snake_bite",
    labelEn: "Snake Bite",
    labelTe: "పాము కాటు",
    icon: Bug,
    priority: "CRITICAL",
    weight: 5,
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    id: "farm_accident",
    labelEn: "Farm Accident",
    labelTe: "వ్యవసాయ ప్రమాదం",
    icon: Tractor,
    priority: "HIGH",
    weight: 4,
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    id: "medical",
    labelEn: "Medical Emergency",
    labelTe: "వైద్య అత్యవసరం",
    icon: HeartPulse,
    priority: "CRITICAL",
    weight: 5,
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    id: "other",
    labelEn: "Other Emergency",
    labelTe: "ఇతర అత్యవసరం",
    icon: AlertTriangle,
    priority: "NORMAL",
    weight: 2,
    color: "text-gray-700",
    bgColor: "bg-gray-50 border-gray-200 hover:bg-gray-100",
  },
]

type LocationData = {
  latitude: number | null
  longitude: number | null
  status: "idle" | "capturing" | "success" | "error"
}

type SOSStep = "select" | "preview" | "sent" | "error"

export default function EmergencyPage() {
  const { lang, t } = useLanguage()
  const [selected, setSelected] = useState<EmergencyType | null>(null)
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    status: "idle",
  })
  const [step, setStep] = useState<SOSStep>("select")
  const [sending, setSending] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Init voices
  useEffect(() => {
    initVoices()
  }, [])

  // Auto-capture location on mount
  useEffect(() => {
    captureLocation()
  }, [])

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported")
      setLocation({ latitude: null, longitude: null, status: "error" })
      return
    }
    
    setLocation((prev) => ({ ...prev, status: "capturing" }))
    console.log("Starting location capture...")
    
    // Try with high accuracy first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Location captured successfully:", pos.coords)
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          status: "success",
        })
      },
      (error) => {
        console.error("High accuracy location error:", error.message)
        // Fallback to regular accuracy if high accuracy fails
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log("Location captured with fallback accuracy:", pos.coords)
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              status: "success",
            })
          },
          (fallbackError) => {
            console.error("Fallback location error:", fallbackError.message)
            setLocation({ latitude: null, longitude: null, status: "error" })
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
        )
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    )
  }, [])

  const handleSelect = (type: EmergencyType) => {
    setSelected(type)
    const priorityTe =
      type.priority === "CRITICAL"
        ? "అత్యంత తీవ్రం"
        : type.priority === "HIGH"
          ? "అధిక ప్రాధాన్యత"
          : "సాధారణం"
    const msg =
      lang === "te"
        ? `${type.labelTe} ఎంచుకున్నారు. ప్రాధాన్యత: ${priorityTe}`
        : `${type.labelEn} selected. Priority: ${type.priority}`
    speak(msg, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
  }

  const handleSend = useCallback(async () => {
    if (!selected) return
    
    // Check location before sending
    if (!location.latitude || !location.longitude) {
      const errorMsg = lang === "te" 
        ? "స్థానం కనుగొనలేకపోయాము. దయచేసి జిపిఎస్ ఆన్ చేసి, ఉన్నత ఆధిక్షేపణను అనుమతించండి."
        : "Unable to capture location. Please enable GPS and allow high accuracy location access."
      setErrorMessage(errorMsg)
      setStep("sent")
      const feedbackMsg = lang === "te"
        ? "స్థానం వివరాలు అందుబాటులో లేవు"
        : "Location data is not available"
      speak(feedbackMsg, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
      return
    }

    setSending(true)
    setStep("preview")
    setErrorMessage("")

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000"
      const requestPayload = {
        name: "Farmer",
        emergency: selected.id,
        priority: selected.priority,
        weight: selected.weight,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      }
      
      console.log("📤 Sending SOS request to:", apiBaseUrl)
      console.log("📋 Request payload:", requestPayload)
      
      const response = await fetch(`${apiBaseUrl}/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      console.log("📥 Response status:", response.status)
      
      // Read response text first
      const responseText = await response.text()
      console.log("📬 Response body:", responseText)
      
      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { rawResponse: responseText }
      }
      
      // Check if response is ok
      if (!response.ok) {
        console.error("❌ SOS API Error:", data)
        throw new Error(data.error || `HTTP ${response.status}: Failed to send SOS alert`)
      }

      console.log("✅ SOS sent successfully:", data)
      setSending(false)
      setStep("sent")

      // Voice confirmation only in the selected language
      const confirmMsg =
        lang === "te"
          ? "మీ అత్యవసర సందేశం సమీప ప్రాంతాలకు పంపబడింది. సహాయం త్వరలో చేరుతుంది."
          : "Your emergency alert has been sent to nearby areas. Help will reach you shortly."

      setTimeout(() => {
        speak(
          confirmMsg,
          lang,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        )
      }, 600)
    } catch (error) {
      console.error("❌ SOS Error:", error)
      // Show error feedback to user
      const errorMsg = error instanceof Error ? error.message : "Failed to send alert"
      setErrorMessage(errorMsg)
      const feedbackMsg = lang === "te" 
        ? "అలర్ట్ పంపడానికి సమస్య ఉంది. దయచేసి వైఫై లేదా నెట్‌వర్క్‌ని తనిఖీ చేయండి."
        : "Error sending alert. Please check your internet connection."
      
      speak(feedbackMsg, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
      setSending(false)
      setStep("sent")
    }
  }, [selected, location, lang])

  const handleReset = () => {
    stopSpeaking()
    setSelected(null)
    setStep("select")
    setSending(false)
    setIsSpeaking(false)
    setErrorMessage("")
    captureLocation()
  }

  const priorityBadge = (priority: "CRITICAL" | "HIGH" | "NORMAL") => {
    const cls =
      priority === "CRITICAL"
        ? "bg-red-100 text-red-800 border-red-200"
        : priority === "HIGH"
          ? "bg-orange-100 text-orange-800 border-orange-200"
          : "bg-gray-100 text-gray-700 border-gray-200"
    const label =
      priority === "CRITICAL"
        ? t.sosCritical
        : priority === "HIGH"
          ? t.sosHigh
          : t.sosNormal
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${cls}`}
      >
        {label}
      </span>
    )
  }

  const mapsLink =
    location.latitude && location.longitude
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 border border-red-200 mb-4">
          <Siren className="h-5 w-5 text-red-600" />
          <span className="text-sm font-bold text-red-700">{t.sosTitle}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
          {t.sosTitle}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-balance">
          {t.sosSubtitle}
        </p>
      </div>

      {/* Location Status */}
      <div className="mb-6 rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">{t.sosLocation}</h3>
          {location.status === "capturing" && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin ml-auto" />
          )}
          {location.status === "success" && (
            <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
          )}
        </div>
        {location.status === "capturing" && (
          <p className="text-xs text-muted-foreground">{t.sosCapturing}</p>
        )}
        {location.status === "error" && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-red-600">{t.sosLocationFailed}</p>
            <button
              onClick={captureLocation}
              className="text-xs text-blue-600 underline font-medium"
            >
              {lang === "te" ? "మళ్ళీ ప్రయత్నించు" : "Retry"}
            </button>
          </div>
        )}
        {location.status === "success" && location.latitude && location.longitude && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {t.sosLatitude}: {location.latitude.toFixed(5)}
            </span>
            <span>
              {t.sosLongitude}: {location.longitude.toFixed(5)}
            </span>
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-blue-600 font-medium hover:underline"
              >
                Map <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Step: Select Emergency Type */}
      {step === "select" && (
        <>
          <h2 className="font-semibold text-foreground text-lg mb-4">
            {t.sosSelectType}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {EMERGENCY_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = selected?.id === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                    isSelected
                      ? "ring-2 ring-red-400 border-red-400 scale-[1.03] shadow-lg " +
                        type.bgColor
                      : type.bgColor + " border"
                  }`}
                >
                  <Icon className={`h-8 w-8 ${type.color}`} />
                  <span className={`text-xs sm:text-sm font-semibold ${type.color}`}>
                    {lang === "te" ? type.labelTe : type.labelEn}
                  </span>
                  {priorityBadge(type.priority)}
                </button>
              )
            })}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!selected || sending || location.status !== "success"}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-600 text-white font-bold text-lg shadow-xl transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow: selected && location.status === "success"
                ? "0 0 30px rgba(220, 38, 38, 0.4)"
                : undefined,
            }}
          >
            {sending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                {t.sosSending}
              </>
            ) : location.status === "capturing" ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                {lang === "te" ? "స్థానం క్యాప్చర్ చేస్తోంది..." : "Capturing Location..."}
              </>
            ) : location.status === "error" ? (
              <>
                <AlertTriangle className="h-6 w-6" />
                {lang === "te" ? "స్థానం క్యాప్చర్ చేయడం విఫలమైంది" : "Location Failed"}
              </>
            ) : (
              <>
                <Send className="h-6 w-6" />
                {t.sosSendAlert}
              </>
            )}
          </button>
        </>
      )}

      {/* Step: Preview/Sending */}
      {step === "preview" && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
            <p className="text-lg font-semibold text-foreground">{t.sosSending}</p>
          </div>
        </div>
      )}

      {/* Step: Sent / Success */}
      {step === "sent" && selected && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Alert Preview Card */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Siren className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-red-800 text-lg">{t.sosAlertTitle}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground w-24">
                  {t.sosEmergency}:
                </span>
                <span className="text-foreground">
                  {lang === "te" ? selected.labelTe : selected.labelEn}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground w-24">
                  {t.sosPriority}:
                </span>
                {priorityBadge(selected.priority)}
              </div>
              {mapsLink && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground w-24">
                    {t.sosLocationLabel}:
                  </span>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium flex items-center gap-1"
                  >
                    Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <p className="text-xs text-red-600 mt-4 font-medium">
              {t.sosNearbyHelpers}
            </p>
          </div>

          {/* Success Message */}
          <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-6 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-800 mb-2">
              {t.sosSuccess}
            </h3>
            <p className="text-sm text-green-700 mb-1">{t.sosHelpNotify}</p>
            <p className="text-sm text-green-700 font-semibold">{t.sosHelpReach}</p>

            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 mt-4 text-green-700">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-medium">{t.speaking}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-2">
                {lang === "te" ? "సమస్య సంభవించింది" : "Error Sending Alert"}
              </h3>
              <p className="text-sm text-red-700 mb-2">{errorMessage}</p>
              <p className="text-xs text-red-600">
                {lang === "te" 
                  ? "దయచేసి ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి."
                  : "Please check your internet connection and try again."}
              </p>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-card border border-border text-foreground font-semibold text-sm shadow-sm transition-all hover:shadow-md hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            {t.sosNewAlert}
          </button>
        </div>
      )}
    </div>
  )
}
