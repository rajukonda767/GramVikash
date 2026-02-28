/**
 * Open-Meteo weather API utilities.
 * Free API, no key required. Provides real-time weather for any lat/lng.
 * Default location: Andhra Pradesh center (Guntur ~16.3°N, 80.4°E)
 */

export interface CurrentWeather {
  temperature: number
  humidity: number
  rain: number
  precipitation: number
  weatherCode: number
  windSpeed: number
  time: string
}

export interface DailyForecast {
  date: string
  maxTemp: number
  minTemp: number
  precipitation: number
  rain: number
  weatherCode: number
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyForecast[]
  location: { lat: number; lng: number }
}

// Default: Guntur, Andhra Pradesh
const DEFAULT_LAT = 16.3
const DEFAULT_LNG = 80.44

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

export async function fetchWeather(
  lat: number = DEFAULT_LAT,
  lng: number = DEFAULT_LNG
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: "temperature_2m,rain,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,weather_code",
    timezone: "Asia/Kolkata",
    forecast_days: "3",
  })

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
    next: { revalidate: 900 }, // cache 15 minutes
  })

  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()

  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    rain: data.current.rain,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    time: data.current.time,
  }

  const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
    date,
    maxTemp: data.daily.temperature_2m_max[i],
    minTemp: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
    rain: data.daily.rain_sum[i],
    weatherCode: data.daily.weather_code[i],
  }))

  return { current, daily, location: { lat, lng } }
}

/**
 * WMO Weather Code to description
 * https://open-meteo.com/en/docs
 */
export function weatherCodeToDescription(code: number, lang: "en" | "te"): string {
  const descriptions: Record<number, { en: string; te: string }> = {
    0: { en: "Clear sky", te: "నిర్మలమైన ఆకాశం" },
    1: { en: "Mainly clear", te: "ఎక్కువగా నిర్మలం" },
    2: { en: "Partly cloudy", te: "పాక్షికంగా మేఘావృతం" },
    3: { en: "Overcast", te: "పూర్తిగా మేఘావృతం" },
    45: { en: "Foggy", te: "పొగమంచు" },
    48: { en: "Depositing rime fog", te: "దట్టమైన పొగమంచు" },
    51: { en: "Light drizzle", te: "తేలికపాటి జల్లు" },
    53: { en: "Moderate drizzle", te: "మధ్యస్థ జల్లు" },
    55: { en: "Dense drizzle", te: "భారీ జల్లు" },
    61: { en: "Slight rain", te: "తేలికపాటి వర్షం" },
    63: { en: "Moderate rain", te: "మధ్యస్థ వర్షం" },
    65: { en: "Heavy rain", te: "భారీ వర్షం" },
    71: { en: "Slight snow", te: "తేలికపాటి మంచు" },
    73: { en: "Moderate snow", te: "మధ్యస్థ మంచు" },
    75: { en: "Heavy snow", te: "భారీ మంచు" },
    80: { en: "Slight rain showers", te: "తేలికపాటి వర్షపు జల్లులు" },
    81: { en: "Moderate rain showers", te: "మధ్యస్థ వర్షపు జల్లులు" },
    82: { en: "Violent rain showers", te: "తీవ్రమైన వర్షపు జల్లులు" },
    95: { en: "Thunderstorm", te: "ఉరుములతో కూడిన వర్షం" },
    96: { en: "Thunderstorm with slight hail", te: "వడగళ్ళతో ఉరుములు" },
    99: { en: "Thunderstorm with heavy hail", te: "భారీ వడగళ్ళతో ఉరుములు" },
  }
  const desc = descriptions[code] || descriptions[0]!
  return lang === "te" ? desc.te : desc.en
}

/**
 * Get a weather icon based on WMO code
 */
export function weatherCodeToIcon(code: number): string {
  if (code === 0) return "sun"
  if (code <= 2) return "cloud-sun"
  if (code === 3) return "cloud"
  if (code <= 48) return "cloud-fog"
  if (code <= 55) return "cloud-drizzle"
  if (code <= 65) return "cloud-rain"
  if (code <= 75) return "snowflake"
  if (code <= 82) return "cloud-rain-wind"
  return "cloud-lightning"
}

/**
 * Format weather data as a short text summary for AI chat context
 */
export function weatherToSummary(data: WeatherData, lang: "en" | "te"): string {
  const c = data.current
  const today = data.daily[0]
  const condition = weatherCodeToDescription(c.weatherCode, lang)

  if (lang === "te") {
    return `ప్రస్తుత వాతావరణం (${data.location.lat.toFixed(1)}°N, ${data.location.lng.toFixed(1)}°E):
- పరిస్థితి: ${condition}
- ఉష్ణోగ్రత: ${c.temperature}°C (ఈరోజు గరిష్ట ${today?.maxTemp ?? "-"}°C, కనిష్ట ${today?.minTemp ?? "-"}°C)
- తేమ: ${c.humidity}%
- వర్షపాతం: ${c.rain > 0 ? `${c.rain} mm వర్షం పడుతోంది` : "వర్షం లేదు"}
- గాలి వేగం: ${c.windSpeed} km/h`
  }

  return `Current weather (${data.location.lat.toFixed(1)}°N, ${data.location.lng.toFixed(1)}°E):
- Condition: ${condition}
- Temperature: ${c.temperature}°C (Today max ${today?.maxTemp ?? "-"}°C, min ${today?.minTemp ?? "-"}°C)
- Humidity: ${c.humidity}%
- Rain: ${c.rain > 0 ? `${c.rain} mm rain` : "No rain"}
- Wind: ${c.windSpeed} km/h`
}
