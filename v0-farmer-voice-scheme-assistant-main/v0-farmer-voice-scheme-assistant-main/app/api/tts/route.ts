import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")
  const lang = request.nextUrl.searchParams.get("lang") || "te"

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 })
  }

  // Chunk long text - Google TTS has a ~200 char limit
  const maxLen = 200
  const chunk = text.length > maxLen ? text.substring(0, maxLen) : text

  const urls = [
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`,
    `https://translate.google.co.in/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`,
  ]

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
          Accept: "audio/mpeg, audio/*, */*",
        },
      })

      if (!response.ok) continue

      const audioBuffer = await response.arrayBuffer()
      if (audioBuffer.byteLength < 100) continue

      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      })
    } catch {
      continue
    }
  }

  return NextResponse.json(
    { error: "TTS generation failed" },
    { status: 500 }
  )
}
