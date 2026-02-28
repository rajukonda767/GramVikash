"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { speak, stopSpeaking, initVoices } from "@/lib/tts"
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Stethoscope,
  Volume2,
  Square,
  RotateCcw,
  Loader2,
  ImageIcon,
} from "lucide-react"

type PredictionResult = {
  disease_name: string
  confidence: number
  severity_rate: string
  prevention: string[]
  treatment: string[]
}

// Demo predictions for when no backend is connected
const demoPredictions: Record<string, { en: PredictionResult; te: PredictionResult }> = {
  blast: {
    en: {
      disease_name: "Rice Blast",
      confidence: 92.5,
      severity_rate: "Medium",
      prevention: [
        "Use resistant varieties like MTU 1010 or BPT 5204",
        "Avoid excessive nitrogen fertilizer application",
        "Maintain proper spacing between plants for air circulation",
        "Drain fields periodically to reduce humidity",
      ],
      treatment: [
        "Apply Tricyclazole 75% WP at 0.6 grams per liter of water",
        "Spray Isoprothiolane 40% EC at 1.5 ml per liter",
        "Apply Carbendazim 50% WP at 1 gram per liter as foliar spray",
        "Repeat application after 10-15 days if symptoms persist",
      ],
    },
    te: {
      disease_name: "వరి బ్లాస్ట్ వ్యాధి",
      confidence: 92.5,
      severity_rate: "మధ్యస్థం",
      prevention: [
        "MTU 1010 లేదా BPT 5204 వంటి నిరోధక రకాలను వాడండి",
        "అధిక నత్రజని ఎరువు వాడకం నివారించండి",
        "గాలి ప్రసరణ కోసం మొక్కల మధ్య సరైన దూరం ఉంచండి",
        "తేమ తగ్గించడానికి పొలాలను ఎప్పటికప్పుడు ఎండబెట్టండి",
      ],
      treatment: [
        "ట్రైసైక్లజోల్ 75% WP ను లీటరు నీటికి 0.6 గ్రాములు కలిపి పిచికారి చేయండి",
        "ఐసోప్రొథియోలేన్ 40% EC ను లీటరు నీటికి 1.5 ml కలిపి స్ప్రే చేయండి",
        "కార్బెండజిమ్ 50% WP ను లీటరు నీటికి 1 గ్రాము కలిపి ఆకు పిచికారి చేయండి",
        "లక్షణాలు కొనసాగితే 10-15 రోజుల తర్వాత మళ్ళీ పిచికారి చేయండి",
      ],
    },
  },
  healthy: {
    en: {
      disease_name: "Healthy Leaf",
      confidence: 97.8,
      severity_rate: "Low",
      prevention: [
        "Continue regular watering and fertilization schedule",
        "Monitor regularly for early signs of disease",
        "Maintain proper crop rotation practices",
      ],
      treatment: [
        "No treatment needed - your crop is healthy!",
        "Continue with standard maintenance practices",
      ],
    },
    te: {
      disease_name: "ఆరోగ్యకరమైన ఆకు",
      confidence: 97.8,
      severity_rate: "తక్కువ",
      prevention: [
        "సాధారణ నీరు మరియు ఎరువు షెడ్యూల్ కొనసాగించండి",
        "వ్యాధి ప్రారంభ సంకేతాల కోసం క్రమం తప్పకుండా పర్యవేక్షించండి",
        "సరైన పంట మార్పిడి పద్ధతులను పాటించండి",
      ],
      treatment: [
        "చికిత్స అవసరం లేదు - మీ పంట ఆరోగ్యంగా ఉంది!",
        "సాధారణ నిర్వహణ పద్ధతులు కొనసాగించండి",
      ],
    },
  },
}

function SeverityBadge({ level, t }: { level: string; t: ReturnType<typeof useLanguage>["t"] }) {
  const normalized = level.toLowerCase()
  const config = {
    low: { label: t.severityLow, cls: "bg-primary/15 text-primary border-primary/30" },
    medium: { label: t.severityMedium, cls: "bg-accent/15 text-accent border-accent/30" },
    high: { label: t.severityHigh, cls: "bg-destructive/15 text-destructive border-destructive/30" },
  }
  const c = normalized.includes("low") || normalized.includes("తక్కువ")
    ? config.low
    : normalized.includes("high") || normalized.includes("ఎక్కువ")
      ? config.high
      : config.medium

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      {c.label}
    </span>
  )
}

export default function CropDiseasePage() {
  const { lang, t } = useLanguage()
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // callback to speak the result again when user clicks listen button
  const speakResult = useCallback(() => {
    if (!result) return
    // speak disease name with confidence info
    const message = `${result.disease_name}, ${parseInt(String(result.confidence))}% ${t.accuracy}`
    speak(
      message,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    )
  }, [result, lang, t])

  useEffect(() => { initVoices() }, [])

  const handleFileChange = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    setFileName(file.name)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }, [handleFileChange])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        setError(null)
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
      }
    } catch {
      alert(lang === "te" ? "కెమెరా అందుబాటులో లేదు" : "Camera not available")
    }
  }, [lang])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      setImage(canvas.toDataURL("image/jpeg"))
      setFileName("camera-capture.jpg")
      setResult(null)
    }
    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach((t) => t.stop())
    setCameraActive(false)
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach((t) => t.stop())
    }
    setCameraActive(false)
  }, [])

  const predict = useCallback(async () => {
    if (!image) return;

    setError(null)
    setIsAnalyzing(true);

    try {

      // convert base64 image → file
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], "leaf.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      // 🔥 CALL FLASK BACKEND
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000"
      const response = await fetch(`${apiBaseUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);

      // ✅ ERROR CASE (non-leaf image)
      if (data.error || data.disease_name === null) {
        const msg = data.telugu_message || data.error || (lang === "te" ? "దయచేసి పత్తి ఆకును ఎంచుకోండి" : "Please upload a leaf image");
        setError(msg);
        setIsAnalyzing(false);
        return;
      }

      // ✅ MAP BACKEND → FRONTEND FORMAT
      const resultData: PredictionResult = {
        disease_name: data.disease_name,
        confidence: Number(data.confidence.toFixed(1)),
        severity_rate: data.severity_rate,
        prevention: data.prevention || [],
        treatment: data.treatment || [],
      };

      setResult(resultData);
      setIsAnalyzing(false);

      // 🔊 AUTO SPEAK BACKEND MESSAGE
      speak(
        data.telugu_message || data.english_message,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );

    } catch (err) {
      console.error(err);
      setError(lang === "te" ? "బ్యాక్‌ఎండ్ కనెక్షన్ విఫలమైంది" : "Backend connection failed");
      setIsAnalyzing(false);
    }
  }, [image, lang]);

  const reset = useCallback(() => {
    setImage(null)
    setFileName("")
    setResult(null)
    stopSpeaking()
    setIsSpeaking(false)
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Leaf className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t.cropDiseaseTitle}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
          {t.cropDiseaseTitle}
        </h1>
        <p className="text-muted-foreground text-balance">{t.cropDiseaseSubtitle}</p>
      </div>

      {/* Upload / Camera area */}
      {!result && (
        <div className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera view */}
          {cameraActive && (
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
              <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg hover:scale-105 transition-all"
                >
                  <Camera className="h-4 w-4 inline mr-2" />
                  {lang === "te" ? "ఫోటో తీయండి" : "Capture"}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm shadow-sm hover:scale-105 transition-all"
                >
                  {lang === "te" ? "రద్దు" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Drop zone */}
          {!cameraActive && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : image
                    ? "border-primary/30 bg-card/70"
                    : "border-border hover:border-primary/50 hover:bg-card/50"
              }`}
            >
              {image ? (
                <div className="space-y-4">
                  <img
                    src={image}
                    alt="Selected leaf"
                    className="max-h-72 mx-auto rounded-xl shadow-md object-contain"
                  />
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{t.dragDrop}</p>
                  <p className="text-xs text-muted-foreground">{t.supported}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileChange(file)
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Action buttons */}
          {!cameraActive && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                <Upload className="h-4 w-4" />
                {t.uploadImage}
              </button>
              <button
                onClick={startCamera}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                <Camera className="h-4 w-4" />
                {t.captureCamera}
              </button>
              <button
                onClick={predict}
                disabled={!image || isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <Leaf className="h-4 w-4" />
                    {t.predict}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          {/* Result header */}
          <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{t.resultReady}</p>
                  <h2 className="text-xl font-bold text-foreground">{result.disease_name}</h2>
                </div>
              </div>
              <SeverityBadge level={result.severity_rate} t={t} />
            </div>

            {/* Confidence bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium">{t.confidence}</span>
                <span className="font-bold text-foreground">{result.confidence}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Severity */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t.severity}:</span>
              <span className="font-semibold text-foreground">{result.severity_rate}</span>
            </div>
          </div>

          {/* Listen button */}
          <div className="flex items-center gap-3">
            <button
              onClick={isSpeaking ? () => { stopSpeaking(); setIsSpeaking(false) } : speakResult}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isSpeaking
                  ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="h-4 w-4" />
                  {t.speakingResult}
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  {t.listenResult}
                </>
              )}
            </button>
          </div>

          {/* Preview image */}
          {image && (
            <div className="rounded-2xl overflow-hidden border border-border shadow-md">
              <img src={image} alt="Analyzed leaf" className="w-full max-h-64 object-contain bg-muted/30" />
            </div>
          )}

          {/* Prevention */}
          <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">{t.prevention}</h3>
            </div>
            <ul className="space-y-3">
              {result.prevention.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Treatment */}
          <div className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">{t.treatment}</h3>
            </div>
            <ul className="space-y-3">
              {result.treatment.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/10 text-accent text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Retake */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            {t.retake}
          </button>
        </div>
      )}
    </div>
  )
}
