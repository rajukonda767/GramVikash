def get_severity(confidence):

    if confidence > 0.85:
        return "High"
    elif confidence > 0.65:
        return "Medium"
    else:
        return "Low"


TREATMENTS = {
  "paddy_bacterial_leaf_blight":{
    "treatment":"Streptocycline + Copper Oxychloride or Kasugamycin based bactericides",
    "prevention":"Use resistant varieties, maintain drainage, balanced fertilization and field sanitation"
  },

  "paddy_bacterial_leaf_streak":{
    "treatment":"Copper Hydroxide or Streptomycin Sulphate + Tetracycline spray",
    "prevention":"Use disease free seeds, apply potash, avoid excess moisture and maintain field hygiene"
  },

  "paddy_bacterial_panicle_blight":{
    "treatment":"Kasugamycin + Copper Oxychloride or Streptomycin based sprays",
    "prevention":"Use healthy seeds, balanced nutrition and regular field monitoring"
  },

  "paddy_blast":{
    "treatment":"Spray Tricyclazole or Trifloxystrobin + Tebuconazole fungicide",
    "prevention":"Maintain drainage, proper spacing and avoid excess nitrogen fertilizer"
  },

  "paddy_brown_spot":{
    "treatment":"Apply Tebuconazole or Azoxystrobin + Difenoconazole fungicide",
    "prevention":"Use healthy seeds, balanced potassium fertilization and avoid drought stress"
  },

  "paddy_downy_mildew":{
    "treatment":"Metalaxyl + Mancozeb or Fluopicolide based fungicide spray",
    "prevention":"Maintain proper irrigation management and improve air circulation"
  },

  "paddy_hispa":{
    "treatment":"Apply Fipronil, Cartap Hydrochloride or Chlorantraniliprole insecticide",
    "prevention":"Use neem products, encourage biological control and monitor pest population"
  },

  "paddy_tungro":{
    "treatment":"Control vector using Fipronil or Imidacloprid insecticide",
    "prevention":"Use resistant varieties, synchronize planting and control leafhopper population"
  },

  "tomato_target_spot":{
    "treatment":"Apply Difenoconazole or Fluxapyroxad + Pyraclostrobin fungicide",
    "prevention":"Maintain spacing, crop rotation and avoid leaf wetness"
  },

  "tomato_mosaic_virus":{
    "treatment":"Remove infected plants and apply SAR activators",
    "prevention":"Use resistant varieties, disinfect tools and manage vectors"
  },

  "tomato_yellow_leaf_curl_virus":{
    "treatment":"Control whiteflies using Cyantraniliprole or Imidacloprid",
    "prevention":"Use insect-proof nursery, neem sprays and weed management"
  },

  "tomato_bacterial_spot":{
    "treatment":"Spray Streptocycline or Copper Hydroxide bactericide",
    "prevention":"Use disease free seeds, avoid overhead irrigation and maintain sanitation"
  },

  "tomato_early_blight":{
    "treatment":"Apply Azoxystrobin + Difenoconazole or Tebuconazole fungicide",
    "prevention":"Crop rotation, proper spacing and removal of infected leaves"
  },

  "tomato_late_blight":{
    "treatment":"Apply Metalaxyl + Mancozeb or Ametoctradin + Dimethomorph fungicide",
    "prevention":"Ensure drainage, avoid dense planting and monitor during humid weather"
  },

  "tomato_leaf_mold":{
    "treatment":"Use Bacillus subtilis or Copper based fungicides",
    "prevention":"Improve ventilation, reduce humidity and maintain spacing"
  },

  "tomato_septoria_leaf_spot":{
    "treatment":"Apply Azoxystrobin + Difenoconazole or Chlorothalonil fungicide",
    "prevention":"Remove infected debris, crop rotation and avoid overhead irrigation"
  },

  "tomato_two_spotted_spider_mite":{
    "treatment":"Apply Abamectin or Spiromesifen miticide",
    "prevention":"Maintain field humidity, use neem oil and encourage natural predators"
  }
}