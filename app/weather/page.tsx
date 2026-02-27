"use client"

import { useLanguage } from "@/lib/language-context"
import { useState, useEffect, useCallback } from "react"
import { speak, stopSpeaking } from "@/lib/tts"
import {
  weatherCodeToDescription,
  type WeatherData,
  type DailyForecast,
} from "@/lib/weather"
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  RefreshCw,
  Volume2,
  Sun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudRainWind,
  Sprout,
  Loader2,
  AlertCircle,
} from "lucide-react"

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0) return <Sun className={className} />
  if (code <= 2) return <CloudSun className={className} />
  if (code === 3) return <Cloud className={className} />
  if (code <= 48) return <CloudFog className={className} />
  if (code <= 55) return <CloudDrizzle className={className} />
  if (code <= 65) return <CloudRain className={className} />
  if (code <= 75) return <Snowflake className={className} />
  if (code <= 82) return <CloudRainWind className={className} />
  return <CloudLightning className={className} />
}

function getFarmTip(data: WeatherData, lang: "en" | "te"): string {
  const temp = data.current.temperature
  const rain = data.current.rain
  const humidity = data.current.humidity

  if (lang === "te") {
    if (rain > 5) return "భారీ వర్షం ఉంది. పొలంలో నీరు పారే ఏర్పాటు చేయండి. పురుగు మందులు చల్లకండి."
    if (rain > 0) return "తేలికపాటి వర్షం ఉంది. ఎరువులు వేయడానికి మంచి సమయం. నేల తడిగా ఉన్నప్పుడు ఎరువులు బాగా పనిచేస్తాయి."
    if (temp > 38) return "చాలా వేడిగా ఉంది. పంటలకు అదనపు నీరు ఇవ్వండి. మధ్యాహ్నం పొలంలో పని తగ్గించండి."
    if (temp > 33) return "వేడిగా ఉంది. ఉదయం లేదా సాయంత్రం నీరు ఇవ్వండి. మధ్యాహ్నం నీరు ఇస్తే ఆవిరై పోతుంది."
    if (humidity > 80) return "తేమ ఎక్కువగా ఉంది. ఫంగస్ వ్యాధులు రావచ్చు. పంటలను గమనించండి. అవసరమైతే ఫంగిసైడ్ వాడండి."
    if (humidity < 30) return "తేమ చాలా తక్కువగా ఉంది. పంటలకు నీరు ఇవ్వండి. మల్చింగ్ చేస్తే నేల తేమ నిలుస్తుంది."
    return "వాతావరణం బాగుంది. పంట పనులకు అనుకూలమైన సమయం."
  }

  if (rain > 5) return "Heavy rain. Ensure proper field drainage. Avoid spraying pesticides today."
  if (rain > 0) return "Light rain. Good time for fertilizer application. Nutrients absorb better in moist soil."
  if (temp > 38) return "Very hot. Provide extra irrigation to crops. Avoid fieldwork during peak afternoon hours."
  if (temp > 33) return "Hot weather. Irrigate in early morning or evening. Midday watering loses more to evaporation."
  if (humidity > 80) return "High humidity. Watch for fungal diseases on crops. Apply fungicide if needed."
  if (humidity < 30) return "Low humidity. Irrigate crops and consider mulching to retain soil moisture."
  return "Weather is favorable. Good conditions for regular farm activities."
}

function DayCard({ day, lang, t }: { day: DailyForecast; lang: "en" | "te"; t: ReturnType<typeof useLanguage>["t"] }) {
  const dayName = new Date(day.date).toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  const condition = weatherCodeToDescription(day.weatherCode, lang)

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-card/70 backdrop-blur-xl border border-border p-4 text-center">
      <span className="text-xs font-medium text-muted-foreground">{dayName}</span>
      <WeatherIcon code={day.weatherCode} className="h-8 w-8 text-primary" />
      <span className="text-xs text-muted-foreground">{condition}</span>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">{Math.round(day.maxTemp)}°</span>
        <span className="text-muted-foreground">{Math.round(day.minTemp)}°</span>
      </div>
      {day.rain > 0 && (
        <span className="text-xs text-blue-600 font-medium">{day.rain} mm</span>
      )}
    </div>
  )
}

export default function WeatherPage() {
  const { lang, t } = useLanguage()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const fetchData = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (lat && lng) {
        params.set("lat", lat.toString())
        params.set("lng", lng.toString())
      }
      const res = await fetch(`/api/weather?${params.toString()}`)
      if (!res.ok) throw new Error("fetch failed")
      const data: WeatherData = await res.json()
      setWeather(data)
    } catch {
      setError(t.weatherError)
    } finally {
      setLoading(false)
    }
  }, [t.weatherError])

  useEffect(() => {
    // Try to get user's location for local weather
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          fetchData(loc.lat, loc.lng)
        },
        () => {
          // Fall back to default (AP center)
          fetchData()
        },
        { timeout: 5000 }
      )
    } else {
      fetchData()
    }
  }, [fetchData])

  const handleSpeak = () => {
    if (!weather) return
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      return
    }
    const c = weather.current
    const condition = weatherCodeToDescription(c.weatherCode, lang)
    const tip = getFarmTip(weather, lang)

    const text =
      lang === "te"
        ? `ప్రస్తుత వాతావరణం: ${condition}. ఉష్ణోగ్రత ${Math.round(c.temperature)} డిగ్రీలు. తేమ ${c.humidity} శాతం. ${c.rain > 0 ? `${c.rain} మిల్లీమీటర్ల వర్షం పడుతోంది.` : "వర్షం లేదు."} గాలి వేగం ${Math.round(c.windSpeed)} కిలోమీటర్లు. వ్యవసాయ సూచన: ${tip}`
        : `Current weather: ${condition}. Temperature ${Math.round(c.temperature)} degrees. Humidity ${c.humidity} percent. ${c.rain > 0 ? `${c.rain} mm rain.` : "No rain."} Wind speed ${Math.round(c.windSpeed)} kilometers per hour. Farm tip: ${tip}`

    speak(text, lang, () => setIsSpeaking(true), () => setIsSpeaking(false))
  }

  const handleRefresh = () => {
    if (userLocation) {
      fetchData(userLocation.lat, userLocation.lng)
    } else {
      fetchData()
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <CloudSun className="h-5 w-5 text-sky-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">{t.weatherTitle}</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.weatherSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeak}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${isSpeaking ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            aria-label="Listen to weather"
          >
            <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-pulse" : ""}`} />
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="h-10 w-10 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            aria-label={t.weatherRefresh}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && !weather && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t.weatherLoading}</p>
        </div>
      )}

      {/* Error */}
      {error && !weather && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {t.weatherRefresh}
          </button>
        </div>
      )}

      {/* Weather Data */}
      {weather && (
        <div className="flex flex-col gap-6">
          {/* Current Weather Hero Card */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs text-sky-700 font-medium mb-4">
              <MapPin className="h-3.5 w-3.5" />
              <span>{t.weatherLocation}: {weather.location.lat.toFixed(2)}°N, {weather.location.lng.toFixed(2)}°E</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl sm:text-6xl font-bold text-foreground">{Math.round(weather.current.temperature)}°</span>
                  <span className="text-lg text-muted-foreground mb-2">C</span>
                </div>
                <p className="text-base font-medium text-foreground mb-1">
                  {weatherCodeToDescription(weather.current.weatherCode, lang)}
                </p>
                {weather.daily[0] && (
                  <p className="text-sm text-muted-foreground">
                    {t.weatherMax} {Math.round(weather.daily[0].maxTemp)}° / {t.weatherMin} {Math.round(weather.daily[0].minTemp)}°
                  </p>
                )}
              </div>
              <WeatherIcon code={weather.current.weatherCode} className="h-16 w-16 text-sky-500 shrink-0" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-sky-200">
              <div className="flex flex-col items-center gap-1">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span className="text-xs text-muted-foreground">{t.weatherHumidity}</span>
                <span className="text-sm font-semibold text-foreground">{weather.current.humidity}%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Wind className="h-5 w-5 text-slate-500" />
                <span className="text-xs text-muted-foreground">{t.weatherWind}</span>
                <span className="text-sm font-semibold text-foreground">{Math.round(weather.current.windSpeed)} km/h</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CloudRain className="h-5 w-5 text-blue-600" />
                <span className="text-xs text-muted-foreground">{t.weatherRain}</span>
                <span className="text-sm font-semibold text-foreground">
                  {weather.current.rain > 0 ? `${weather.current.rain} mm` : t.weatherNoRain}
                </span>
              </div>
            </div>
          </div>

          {/* Farm Tip */}
          <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">{t.weatherFarmTip}</span>
            </div>
            <p className="text-sm text-green-700 leading-relaxed">{getFarmTip(weather, lang)}</p>
          </div>

          {/* 3-Day Forecast */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">{t.weatherForecast}</h2>
            <div className="grid grid-cols-3 gap-3">
              {weather.daily.map((day) => (
                <DayCard key={day.date} day={day} lang={lang} t={t} />
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-xs text-center text-muted-foreground">
            {t.weatherUpdated}: {new Date(weather.current.time).toLocaleString(lang === "te" ? "te-IN" : "en-IN")}
          </p>
        </div>
      )}
    </div>
  )
}
