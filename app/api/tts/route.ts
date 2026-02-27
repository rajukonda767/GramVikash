import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")
  const lang = request.nextUrl.searchParams.get("lang") || "te"

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 })
  }

  try {
    const encoded = encodeURIComponent(text)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://translate.google.com/",
      },
    })

    if (!response.ok) {
      throw new Error(`TTS fetch failed: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 500 }
    )
  }
}
