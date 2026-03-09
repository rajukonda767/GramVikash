// Disease name mapping - converts raw model output to clean display names
export const DISEASE_NAME_MAP: Record<string, { en: string; te: string }> = {
  // Paddy diseases
  paddy_bacterial_leaf_blight: {
    en: "Bacterial Leaf Blight",
    te: "పడ్డి బాక్టీరియల్ లీఫ్ బ్లైట్"
  },
  paddy_bacterial_leaf_streak: {
    en: "Bacterial Leaf Streak",
    te: "పడ్డి బాక్టీరియల్ లీఫ్ స్ట్రీక్"
  },
  paddy_bacterial_panicle_blight: {
    en: "Bacterial Panicle Blight",
    te: "పడ్డి బాక్టీరియల్ పానికల్ బ్లైట్"
  },
  paddy_blast: {
    en: "Rice Blast",
    te: "పడ్డి బ్లాస్ట్"
  },
  paddy_brown_spot: {
    en: "Brown Spot",
    te: "పడ్డి బ్రౌన్ స్పాట్"
  },
  paddy_dead_heart: {
    en: "Dead Heart",
    te: "పడ్డి డెడ్ హార్ట్"
  },
  paddy_downy_mildew: {
    en: "Downy Mildew",
    te: "పడ్డి డౌనీ మిల్డ్యూ"
  },
  paddy_hispa: {
    en: "Hispa",
    te: "పడ్డి హిస్పా"
  },
  paddy_normal: {
    en: "Healthy Crop",
    te: "ఆరోగ్యకరమైన పంట"
  },
  paddy_tungro: {
    en: "Tungro",
    te: "పడ్డి టుంగ్రో"
  },
  
  // Tomato diseases
  tomato_Tomato_Bacterial_spot: {
    en: "Bacterial Spot",
    te: "టమాటో బాక్టీరియల్ స్పాట్"
  },
  tomato_Tomato_Early_blight: {
    en: "Early Blight",
    te: "టమాటో ఎర్లీ బ్లైట్"
  },
  tomato_Tomato_Late_blight: {
    en: "Late Blight",
    te: "టమాటో లేట్ బ్లైట్"
  },
  tomato_Tomato_Leaf_Mold: {
    en: "Leaf Mold",
    te: "టమాటో లీఫ్ మోల్డ్"
  },
  tomato_Tomato_Septoria_leaf_spot: {
    en: "Septoria Leaf Spot",
    te: "టమాటో సెప్టోరియా లీఫ్ స్పాట్"
  },
  tomato_Tomato_Spider_mites_Two_spotted_spider_mite: {
    en: "Spider Mites",
    te: "టమాటో స్పైడర్ మైట్‍స్"
  },
  "tomato_Tomato__Target_Spot": {
    en: "Target Spot",
    te: "టమాటో టార్గెట్ స్పాట్"
  },
  "tomato_Tomato__Tomato_YellowLeaf__Curl_Virus": {
    en: "Yellow Leaf Curl Virus",
    te: "టమాటో యెల్లో లీఫ్ కర్ల్ వైరస్"
  },
  "tomato_Tomato__Tomato_mosaic_virus": {
    en: "Mosaic Virus",
    te: "టమాటో మోజాయిక్ వైరస్"
  },
  tomato_Tomato_healthy: {
    en: "Healthy Crop",
    te: "ఆరోగ్యకరమైన టమాటో"
  }
}

/**
 * Get clean disease name by disease key
 * @param diseaseKey - Raw disease key from model (e.g., "tomato_Tomato_Late_blight")
 * @param lang - Language: "en" for English, "te" for Telugu
 * @returns Clean disease name
 */
export function getCleanDiseaseName(diseaseKey: string, lang: "en" | "te" = "en"): string {
  // Try exact match first
  if (diseaseKey in DISEASE_NAME_MAP) {
    return DISEASE_NAME_MAP[diseaseKey][lang]
  }
  
  // Try to find by looking for the key as substring
  for (const [key, names] of Object.entries(DISEASE_NAME_MAP)) {
    if (diseaseKey.includes(key) || key.includes(diseaseKey)) {
      return names[lang]
    }
  }
  
  // Fallback: clean up the raw name
  return diseaseKey
    .replace(/^(tomato|paddy|cotton|chilli|groundnut|sugarcane|maize)_/i, "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
}
