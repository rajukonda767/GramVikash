/**
 * Shared TTS (Text-to-Speech) utilities used across the app.
 * Supports Telugu and English with server-side Google TTS proxy and browser fallback.
 */

let currentAudio: HTMLAudioElement | null = null
let abortChain = false

export function stopSpeaking() {
  if (typeof window === "undefined") return
  abortChain = true
  window.speechSynthesis?.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

/**
 * Split text into chunks suitable for TTS (max ~180 chars).
 * Breaks at sentence boundaries (. ! ? |), then commas, then spaces.
 */
function chunkText(text: string, maxLen = 180): string[] {
  const chunks: string[] = []
  let remaining = text.trim()

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }

    // Try to break at sentence-ending punctuation
    let breakIdx = -1
    for (const sep of [".", "!", "?", "|", "।"]) {
      const idx = remaining.lastIndexOf(sep, maxLen)
      if (idx > 20) { breakIdx = idx + 1; break }
    }
    // Try comma
    if (breakIdx < 20) {
      const idx = remaining.lastIndexOf(",", maxLen)
      if (idx > 20) breakIdx = idx + 1
    }
    // Try space
    if (breakIdx < 20) {
      const idx = remaining.lastIndexOf(" ", maxLen)
      if (idx > 10) breakIdx = idx
    }
    // Hard cut
    if (breakIdx < 10) breakIdx = maxLen

    chunks.push(remaining.substring(0, breakIdx).trim())
    remaining = remaining.substring(breakIdx).trim()
  }

  return chunks.filter(c => c.length > 0)
}

/**
 * Find the best Telugu voice available in the browser.
 * Priority: Google Chirp3-HD-Aoede > any Google Telugu > any te-IN voice > prefix match
 */
function findBestVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const prefix = langCode.split("-")[0]

  // 1. Prefer Google Chirp3-HD-Aoede (best fluent Telugu)
  const chirp = voices.find(
    (v) => v.name.includes("Chirp3-HD-Aoede") && v.lang.startsWith(prefix)
  )
  if (chirp) return chirp

  // 2. Any Google Chirp3 Telugu voice
  const chirp3 = voices.find(
    (v) => v.name.includes("Chirp3") && v.lang.startsWith(prefix)
  )
  if (chirp3) return chirp3

  // 3. Any Google Telugu voice
  const googleTe = voices.find(
    (v) => v.name.toLowerCase().includes("google") && v.lang.startsWith(prefix)
  )
  if (googleTe) return googleTe

  // 4. Exact locale match (e.g. te-IN)
  const exact = voices.find((v) => v.lang === langCode)
  if (exact) return exact

  // 5. Prefix match
  const prefixMatch = voices.find((v) => v.lang.startsWith(prefix))
  if (prefixMatch) return prefixMatch

  return null
}

function speakWithBrowserTTS(
  text: string,
  langCode: string,
  onStart: () => void,
  onEnd: () => void
) {
  if (!("speechSynthesis" in window)) {
    onEnd()
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langCode
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1

  const voice = findBestVoice(langCode)
  if (voice) utterance.voice = voice

  let hasStarted = false
  utterance.onstart = () => {
    if (!hasStarted) {
      hasStarted = true
      onStart()
    }
  }
  utterance.onend = () => {
    if (hasStarted) onEnd()
    else onEnd()
  }
  utterance.onerror = () => onEnd()
  window.speechSynthesis.speak(utterance)
}

function speakWithTTSAPI(
  text: string,
  langCode: string,
  onStart: () => void,
  onEnd: () => void
): HTMLAudioElement | null {
  const chunks = chunkText(text)
  let idx = 0
  let audio: HTMLAudioElement | null = null
  let hasStarted = false

  const browserFallback = (chunk: string, andThen: () => void) => {
    const fullLang = langCode === "te" ? "te-IN" : "en-IN"
    speakWithBrowserTTS(chunk, fullLang, () => {
      if (!hasStarted) {
        hasStarted = true
        onStart()
      }
    }, andThen)
  }

  const playNext = () => {
    if (abortChain || idx >= chunks.length) {
      onEnd()
      return
    }
    const chunk = chunks[idx]
    if (idx === 0) {
      hasStarted = true
      onStart()
    }

    const apiUrl = `/api/tts?text=${encodeURIComponent(chunk)}&lang=${langCode}`

    const advanceNext = () => {
      if (abortChain) { onEnd(); return }
      idx++
      playNext()
    }

    // Pre-fetch the audio as a blob first, then play from blob URL.
    // This ensures the ENTIRE audio is downloaded before playback starts,
    // so no beginning syllables get cut off.
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("TTS fetch failed")
        return res.blob()
      })
      .then((blob) => {
        if (abortChain) { onEnd(); return }
        if (blob.size < 100) throw new Error("Empty audio")

        const blobUrl = URL.createObjectURL(blob)
        audio = new Audio(blobUrl)
        currentAudio = audio

        audio.onended = () => {
          URL.revokeObjectURL(blobUrl)
          advanceNext()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(blobUrl)
          browserFallback(chunk, advanceNext)
        }

        // Minimal delay to let browser fully decode the audio buffer
        setTimeout(() => {
          if (abortChain) { onEnd(); return }
          audio?.play().catch(() => {
            URL.revokeObjectURL(blobUrl)
            browserFallback(chunk, advanceNext)
          })
        }, 20)
      })
      .catch(() => {
        browserFallback(chunk, advanceNext)
      })

    // Timeout: if fetch takes more than 3s, fall back to browser TTS
    setTimeout(() => {
      if (idx === chunks.indexOf(chunk) && (!audio || audio.paused)) {
        browserFallback(chunk, advanceNext)
      }
    }, 3000)
  }

  playNext()
  return audio
}

/**
 * Main speak function. Speaks in the given language using the best available method.
 * For Telugu, always uses Google TTS API proxy for natural-sounding Telugu.
 * For English, tries browser TTS first (usually good), falls back to API.
 */
export function speak(
  text: string,
  lang: "en" | "te",
  onStart: () => void,
  onEnd: () => void
) {
  if (typeof window === "undefined") { onEnd(); return }
  if (!text || text.trim().length === 0) { onEnd(); return }

  stopSpeaking()
  abortChain = false

  const langCode = lang === "te" ? "te" : "en"
  const fullLangCode = lang === "te" ? "te-IN" : "en-IN"

  if (lang === "te") {
    // Telugu: Always use API proxy for best quality
    currentAudio = speakWithTTSAPI(text, langCode, onStart, onEnd)
  } else {
    // English: Try browser TTS first, then API
    const voices = typeof window !== "undefined" && window.speechSynthesis
      ? window.speechSynthesis.getVoices()
      : []
    const hasEnglish = voices.some((v) => v.lang.startsWith("en"))
    if (hasEnglish) {
      speakWithBrowserTTS(text, fullLangCode, onStart, onEnd)
    } else {
      currentAudio = speakWithTTSAPI(text, langCode, onStart, onEnd)
    }
  }
}

/** Pre-load voices on init */
export function initVoices() {
  if (typeof window === "undefined") return
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
}
