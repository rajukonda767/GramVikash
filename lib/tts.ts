/**
 * Shared TTS (Text-to-Speech) utilities used across the app.
 * Supports Telugu and English with Google Translate TTS proxy fallback.
 */

let currentAudio: HTMLAudioElement | null = null

export function stopSpeaking() {
  if (typeof window === "undefined") return
  window.speechSynthesis?.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
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
  utterance.rate = 0.85
  utterance.pitch = 1
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()
  const prefix = langCode.split("-")[0]
  const voice =
    voices.find((v) => v.lang === langCode) ||
    voices.find((v) => v.lang.startsWith(prefix)) ||
    voices.find((v) => v.name.toLowerCase().includes(prefix))
  if (voice) utterance.voice = voice

  utterance.onstart = onStart
  utterance.onend = onEnd
  utterance.onerror = onEnd
  window.speechSynthesis.speak(utterance)
}

function speakWithTTSAPI(
  text: string,
  langCode: string,
  onStart: () => void,
  onEnd: () => void
): HTMLAudioElement | null {
  const maxLen = 180
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }
    let breakIdx = remaining.lastIndexOf(".", maxLen)
    if (breakIdx < 20) breakIdx = remaining.lastIndexOf(" ", maxLen)
    if (breakIdx < 20) breakIdx = maxLen
    chunks.push(remaining.substring(0, breakIdx + 1))
    remaining = remaining.substring(breakIdx + 1).trim()
  }

  let idx = 0
  let audio: HTMLAudioElement | null = null

  const playNext = () => {
    if (idx >= chunks.length) {
      onEnd()
      return
    }
    const chunk = chunks[idx]
    if (idx === 0) onStart()

    const apiUrl = `/api/tts?text=${encodeURIComponent(chunk)}&lang=${langCode}`
    audio = new Audio(apiUrl)
    currentAudio = audio

    audio.onended = () => {
      idx++
      playNext()
    }
    audio.onerror = () => {
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`
      const audio2 = new Audio(googleUrl)
      currentAudio = audio2
      audio2.onended = () => { idx++; playNext() }
      audio2.onerror = () => {
        const fullLang = langCode === "te" ? "te-IN" : "en-IN"
        speakWithBrowserTTS(chunk, fullLang, () => {}, () => { idx++; playNext() })
      }
      audio2.play().catch(() => {
        const fullLang = langCode === "te" ? "te-IN" : "en-IN"
        speakWithBrowserTTS(chunk, fullLang, () => {}, () => { idx++; playNext() })
      })
    }
    audio.play().catch(() => {
      audio?.onerror?.(new Event("error") as ErrorEvent)
    })
  }

  playNext()
  return audio
}

/**
 * Main speak function. Speaks in the given language using the best available method.
 * For Telugu uses Google TTS API proxy. For English tries browser TTS first.
 */
export function speak(
  text: string,
  lang: "en" | "te",
  onStart: () => void,
  onEnd: () => void
) {
  stopSpeaking()
  const langCode = lang === "te" ? "te" : "en"
  const fullLangCode = lang === "te" ? "te-IN" : "en-IN"

  if (lang === "te") {
    currentAudio = speakWithTTSAPI(text, langCode, onStart, onEnd)
  } else {
    const voices = window.speechSynthesis?.getVoices() || []
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
