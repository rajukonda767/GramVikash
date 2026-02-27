import { fetchWeather } from "@/lib/weather"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get("lat") || "16.3")
  const lng = parseFloat(searchParams.get("lng") || "80.44")

  try {
    const data = await fetchWeather(lat, lng)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    )
  }
}
