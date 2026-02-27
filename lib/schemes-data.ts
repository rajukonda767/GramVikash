import type { Language } from "./translations"

export type SchemeData = {
  id: string
  crops: string[] // which crops this applies to ("all" = universal)
  farmSizes: string[] // "all" | "small" | "medium" | "large"
  title: { en: string; te: string }
  description: { en: string; te: string }
  amount: { en: string; te: string }
  icon: string // icon name key
  color: string // color key
  eligibility: { en: string[]; te: string[] }
  applySteps: { en: string[]; te: string[] }
  applyLink: string
  docs: { en: string[]; te: string[] }
  category: "central" | "ap"
}

export const ALL_SCHEMES: SchemeData[] = [
  // =================== CENTRAL SCHEMES ===================
  {
    id: "pmkisan",
    crops: ["all"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "PM-KISAN", te: "పీఎం కిసాన్" },
    description: {
      en: "Income support of Rs. 6,000/year in 3 installments to all landholding farmer families.",
      te: "సాగు భూమి ఉన్న రైతు కుటుంబాలకు సంవత్సరానికి రూ. 6,000 మూడు విడతలుగా.",
    },
    amount: { en: "Rs. 6,000/yr", te: "రూ. 6,000/సం" },
    icon: "shield",
    color: "emerald",
    eligibility: {
      en: ["All landholding farmer families with cultivable land", "Family: husband, wife & minor children", "Aadhaar must be linked with bank account", "Govt employees & income tax payers excluded"],
      te: ["సాగు భూమి ఉన్న అన్ని రైతు కుటుంబాలు", "కుటుంబం: భర్త, భార్య & మైనర్ పిల్లలు", "ఆధార్ బ్యాంకు ఖాతాతో లింక్ చేయాలి", "ప్రభుత్వ ఉద్యోగులు & ఆదాయపు పన్ను చెల్లింపుదారులు మినహాయింపు"],
    },
    applySteps: {
      en: ["Visit pmkisan.gov.in", "Click 'New Farmer Registration'", "Enter Aadhaar & personal details", "Upload land docs, submit form"],
      te: ["pmkisan.gov.in సందర్శించండి", "'కొత్త రైతు నమోదు' క్లిక్ చేయండి", "ఆధార్ & వ్యక్తిగత వివరాలు నమోదు", "భూమి పత్రాలు అప్‌లోడ్, ఫారమ్ సబ్మిట్"],
    },
    applyLink: "https://pmkisan.gov.in",
    docs: {
      en: ["Aadhaar Card", "Bank Passbook", "Land Documents"],
      te: ["ఆధార్ కార్డు", "బ్యాంకు పాస్‌బుక్", "భూమి పత్రాలు"],
    },
  },
  {
    id: "pmfby",
    crops: ["paddy", "cotton", "chilli", "groundnut", "sugarcane", "maize", "tomato", "turmeric"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "PM Fasal Bima Yojana", te: "పీఎం ఫసల్ బీమా యోజన" },
    description: {
      en: "Crop insurance at 2% premium (Kharif) & 1.5% (Rabi). Covers floods, drought, pest attack.",
      te: "ఖరీఫ్‌కు 2% & రబీకి 1.5% ప్రీమియంతో పంట బీమా. వరదలు, కరువు, పురుగుల దాడి నుండి రక్షణ.",
    },
    amount: { en: "2% Premium", te: "2% ప్రీమియం" },
    icon: "umbrella",
    color: "blue",
    eligibility: {
      en: ["Farmers growing notified crops in notified areas", "Both loanee & non-loanee farmers", "Tenant farmers with crop sowing proof", "Must enroll before cutoff date each season"],
      te: ["నోటిఫైడ్ ప్రాంతాల్లో పంటలు పండించే రైతులు", "రుణ & రుణేతర రైతులు ఇద్దరూ", "పంట విత్తన రుజువు ఉన్న కౌలు రైతులు", "ప్రతి సీజన్ కటాఫ్ తేదీలోగా నమోదు"],
    },
    applySteps: {
      en: ["Visit pmfby.gov.in or nearest bank/CSC", "Fill crop & land details", "Pay farmer's premium share", "Get policy confirmation"],
      te: ["pmfby.gov.in లేదా సమీప బ్యాంక్/CSC లో", "పంట & భూమి వివరాలు నింపండి", "రైతు ప్రీమియం వాటా చెల్లించండి", "పాలసీ ధృవీకరణ పొందండి"],
    },
    applyLink: "https://pmfby.gov.in",
    docs: {
      en: ["Aadhaar Card", "Bank Passbook", "Land Records", "Sowing Certificate"],
      te: ["ఆధార్ కార్డు", "బ్యాంకు పాస్‌బుక్", "భూమి రికార్డులు", "విత్తన ధృవీకరణ"],
    },
  },
  {
    id: "kcc",
    crops: ["all"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "Kisan Credit Card (KCC)", te: "కిసాన్ క్రెడిట్ కార్డ్ (KCC)" },
    description: {
      en: "Short-term crop loans up to Rs. 3 lakhs at 4% interest. 3% extra subvention for timely repayment.",
      te: "4% వడ్డీతో రూ. 3 లక్షల వరకు పంట రుణాలు. సకాలంలో చెల్లిస్తే మరో 3% సబ్వెన్షన్.",
    },
    amount: { en: "Rs. 3 Lakhs", te: "రూ. 3 లక్షలు" },
    icon: "creditCard",
    color: "amber",
    eligibility: {
      en: ["All farmers - individual or joint", "Tenant farmers & sharecroppers eligible", "Must be in crop production or allied activities", "No default on existing bank loans"],
      te: ["అన్ని రైతులు - వ్యక్తిగత లేదా సంయుక్త", "కౌలు రైతులు & భాగస్వామ్య రైతులు అర్హులు", "పంట ఉత్పత్తి లేదా అనుబంధ కార్యకలాపాల్లో", "ఇప్పటి బ్యాంకు రుణాల్లో డిఫాల్ట్ ఉండకూడదు"],
    },
    applySteps: {
      en: ["Visit nearest nationalized bank", "Fill KCC application form", "Submit land records + Aadhaar", "KCC issued within 14 days"],
      te: ["సమీప జాతీయ బ్యాంక్ శాఖకు వెళ్ళండి", "KCC దరఖాస్తు ఫారమ్ నింపండి", "భూమి రికార్డులు + ఆధార్ సమర్పించండి", "14 రోజుల్లో KCC జారీ"],
    },
    applyLink: "https://pmkisan.gov.in/KCCForm.aspx",
    docs: {
      en: ["Aadhaar Card", "Land Documents", "Bank Passbook", "Passport Photo"],
      te: ["ఆధార్ కార్డు", "భూమి పత్రాలు", "బ్యాంకు పాస్‌బుక్", "పాస్‌పోర్ట్ ఫోటో"],
    },
  },
  {
    id: "pmksy",
    crops: ["paddy", "sugarcane", "tomato", "chilli", "turmeric", "mango"],
    farmSizes: ["small", "medium"],
    category: "central",
    title: { en: "PM Krishi Sinchai Yojana", te: "పీఎం కృషి సించాయ్ యోజన" },
    description: {
      en: "55% subsidy on drip & sprinkler irrigation for small/marginal farmers. 'Per Drop More Crop'.",
      te: "చిన్న రైతులకు డ్రిప్ & స్ప్రింక్లర్ వ్యవస్థలపై 55% సబ్సిడీ. 'ప్రతి చుక్క - ఎక్కువ పంట'.",
    },
    amount: { en: "55% Subsidy", te: "55% సబ్సిడీ" },
    icon: "droplets",
    color: "cyan",
    eligibility: {
      en: ["All farmers with own or leased land", "Priority to small & marginal farmers", "Land must have a water source", "Not availed same subsidy in last 7 years"],
      te: ["స్వంత లేదా లీజు భూమితో రైతులు", "చిన్న & సన్నకారు రైతులకు ప్రాధాన్యత", "భూమికి నీటి వనరు ఉండాలి", "గత 7 సంవత్సరాల్లో ఇదే సబ్సిడీ పొందకూడదు"],
    },
    applySteps: {
      en: ["Apply at State Agriculture Department", "Submit land & water source proof", "Technical team verification", "Subsidy credited to bank account"],
      te: ["రాష్ట్ర వ్యవసాయ శాఖ ద్వారా దరఖాస్తు", "భూమి & నీటి వనరు రుజువు సమర్పణ", "సాంకేతిక బృందం ధృవీకరణ", "బ్యాంకు ఖాతాకు సబ్సిడీ జమ"],
    },
    applyLink: "https://pmksy.gov.in",
    docs: {
      en: ["Aadhaar Card", "Land Documents", "Bank Passbook", "Water Source Proof"],
      te: ["ఆధార్ కార్డు", "భూమి పత్రాలు", "బ్యాంకు పాస్‌బుక్", "నీటి వనరు రుజువు"],
    },
  },
  {
    id: "soil_health",
    crops: ["paddy", "cotton", "groundnut", "maize", "sugarcane", "turmeric"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "Soil Health Card Scheme", te: "సాయిల్ హెల్త్ కార్డ్ పథకం" },
    description: {
      en: "Free soil testing & nutrient-based recommendations. Issued every 2 years. Helps optimize fertilizer use.",
      te: "ఉచిత మట్టి పరీక్ష & పోషక ఆధారిత సిఫార్సులు. ప్రతి 2 సంవత్సరాలకు జారీ. ఎరువుల వాడకాన్ని ఆప్టిమైజ్ చేస్తుంది.",
    },
    amount: { en: "Free", te: "ఉచితం" },
    icon: "leaf",
    color: "lime",
    eligibility: {
      en: ["All farmers across India", "No minimum land requirement", "Both irrigated & rain-fed farmers"],
      te: ["భారతదేశం అంతటా అన్ని రైతులు", "కనీస భూమి అవసరం లేదు", "నీటిపారుదల & వర్షాధార రైతులు ఇద్దరూ"],
    },
    applySteps: {
      en: ["Visit nearest Krishi Vigyan Kendra or agriculture office", "Submit soil sample from your farm", "Receive Soil Health Card with recommendations", "Follow nutrient plan for better yield"],
      te: ["సమీప కృషి విజ్ఞాన కేంద్రం లేదా వ్యవసాయ కార్యాలయం", "మీ పొలం నుండి మట్టి నమూనా సమర్పించండి", "సిఫార్సులతో సాయిల్ హెల్త్ కార్డ్ పొందండి", "మెరుగైన దిగుబడి కోసం పోషక ప్రణాళిక పాటించండి"],
    },
    applyLink: "https://soilhealth.dac.gov.in",
    docs: { en: ["Aadhaar Card", "Land Location Details"], te: ["ఆధార్ కార్డు", "భూమి స్థానం వివరాలు"] },
  },
  {
    id: "nfsm",
    crops: ["paddy", "maize", "groundnut"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "National Food Security Mission", te: "జాతీయ ఆహార భద్రత మిషన్" },
    description: {
      en: "Subsidized seeds, equipment & training for rice, wheat, pulses & coarse cereals to boost production.",
      te: "వరి, గోధుమ, పప్పుధాన్యాలు & తృణధాన్యాల ఉత్పత్తి పెంచడానికి సబ్సిడీ విత్తనాలు, పరికరాలు & శిక్షణ.",
    },
    amount: { en: "Subsidized Inputs", te: "సబ్సిడీ ఇన్‌పుట్లు" },
    icon: "sprout",
    color: "green",
    eligibility: {
      en: ["Farmers in NFSM-identified districts", "Growing rice, wheat, pulses or coarse cereals", "Registered with local agriculture office"],
      te: ["NFSM-గుర్తించిన జిల్లాల్లోని రైతులు", "వరి, గోధుమ, పప్పుధాన్యాలు లేదా తృణధాన్యాలు పండించేవారు", "స్థానిక వ్యవసాయ కార్యాలయంలో నమోదు"],
    },
    applySteps: {
      en: ["Contact district agriculture officer", "Register for NFSM benefits", "Receive subsidized seeds & equipment", "Attend training programs if available"],
      te: ["జిల్లా వ్యవసాయ అధికారిని సంప్రదించండి", "NFSM ప్రయోజనాల కోసం నమోదు", "సబ్సిడీ విత్తనాలు & పరికరాలు పొందండి", "శిక్షణ కార్యక్రమాల్లో హాజరు కావండి"],
    },
    applyLink: "https://nfsm.gov.in",
    docs: { en: ["Aadhaar Card", "Land Records", "Bank Passbook"], te: ["ఆధార్ కార్డు", "భూమి రికార్డులు", "బ్యాంకు పాస్‌బుక్"] },
  },
  {
    id: "horticulture",
    crops: ["tomato", "chilli", "mango", "turmeric"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "Mission for Integrated Horticulture (MIDH)", te: "సమగ్ర ఉద్యాన మిషన్ (MIDH)" },
    description: {
      en: "40-75% subsidy for horticulture crops - seedlings, greenhouses, cold storage, processing units.",
      te: "ఉద్యాన పంటలకు 40-75% సబ్సిడీ - మొక్కలు, గ్రీన్‌హౌస్‌లు, శీతల గిడ్డంగులు, ప్రాసెసింగ్ యూనిట్లు.",
    },
    amount: { en: "Up to 75% Subsidy", te: "75% వరకు సబ్సిడీ" },
    icon: "flower",
    color: "pink",
    eligibility: {
      en: ["Farmers growing fruits, vegetables, spices, flowers", "Individual, groups, FPOs eligible", "Land suitable for horticulture"],
      te: ["పండ్లు, కూరగాయలు, సుగంధ ద్రవ్యాలు, పువ్వులు పండించే రైతులు", "వ్యక్తిగత, సమూహాలు, FPO లు అర్హులు", "ఉద్యాన పంటలకు అనువైన భూమి"],
    },
    applySteps: {
      en: ["Apply at District Horticulture Office", "Submit crop plan & land details", "Verification by horticulture officer", "Subsidy released in phases"],
      te: ["జిల్లా ఉద్యాన కార్యాలయంలో దరఖాస్తు", "పంట ప్రణాళిక & భూమి వివరాలు సమర్పణ", "ఉద్యాన అధికారి ధృవీకరణ", "దశల వారీగా సబ్సిడీ విడుదల"],
    },
    applyLink: "https://midh.gov.in",
    docs: {
      en: ["Aadhaar Card", "Land Documents", "Bank Passbook", "Project Plan"],
      te: ["ఆధార్ కార్డు", "భూమి పత్రాలు", "బ్యాంకు పాస్‌బుక్", "ప్రాజెక్ట్ ప్లాన్"],
    },
  },
  {
    id: "cotton_tmc",
    crops: ["cotton"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "Technology Mission on Cotton (TMC)", te: "పత్తి టెక్నాలజీ మిషన్ (TMC)" },
    description: {
      en: "Subsidized Bt cotton seeds, IPM kits, ginning/pressing units. Boosts cotton quality & yield.",
      te: "సబ్సిడీ Bt పత్తి విత్తనాలు, IPM కిట్లు, జిన్నింగ్/ప్రెస్సింగ్ యూనిట్లు. పత్తి నాణ్యత & దిగుబడి పెంపు.",
    },
    amount: { en: "Subsidized Inputs", te: "సబ్సిడీ ఇన్‌పుట్లు" },
    icon: "sprout",
    color: "teal",
    eligibility: {
      en: ["Cotton farmers in major growing districts", "Must use certified/notified seed varieties", "Registered at local agriculture office"],
      te: ["ప్రధాన పత్తి సాగు జిల్లాల్లోని రైతులు", "ధృవీకరించిన/నోటిఫైడ్ విత్తన రకాలు వాడాలి", "స్థానిక వ్యవసాయ కార్యాలయంలో నమోదు"],
    },
    applySteps: {
      en: ["Contact district agriculture officer", "Register as cotton farmer", "Avail subsidized seeds & IPM kits", "Attend cotton cultivation training"],
      te: ["జిల్లా వ్యవసాయ అధికారిని సంప్రదించండి", "పత్తి రైతుగా నమోదు", "సబ్సిడీ విత్తనాలు & IPM కిట్లు పొందండి", "పత్తి సాగు శిక్షణలో హాజరు"],
    },
    applyLink: "https://www.nfsm.gov.in/BriefNote/BN_NFSM_Commercial_Crops_Cotton.pdf",
    docs: { en: ["Aadhaar Card", "Land Records", "Bank Passbook"], te: ["ఆధార్ కార్డు", "భూమి రికార్డులు", "బ్యాంకు పాస్‌బుక్"] },
  },
  {
    id: "sugar_dev",
    crops: ["sugarcane"],
    farmSizes: ["all"],
    category: "central",
    title: { en: "Sugar Development Fund (SDF)", te: "చక్కెర అభివృద్ధి నిధి (SDF)" },
    description: {
      en: "Loans for sugar mills modernization. FRP (Fair & Remunerative Price) protection for cane farmers.",
      te: "చక్కెర మిల్లుల ఆధునీకరణకు రుణాలు. చెరకు రైతులకు FRP (న్యాయమైన ధర) రక్షణ.",
    },
    amount: { en: "FRP Protected", te: "FRP రక్షణ" },
    icon: "building",
    color: "orange",
    eligibility: {
      en: ["Sugarcane growing farmers", "Cane supply to registered sugar mills", "Valid cane supply agreement"],
      te: ["చెరకు పండించే రైతులు", "నమోదిత చక్కెర మిల్లులకు చెరకు సరఫరా", "చెల్లుబాటు అయ్యే చెరకు సరఫరా ఒప్పందం"],
    },
    applySteps: {
      en: ["Register with nearest sugar mill", "Get cane supply ID", "Supply cane & receive FRP payment", "Arrears settled via SDF intervention"],
      te: ["సమీప చక్కెర మిల్లులో నమోదు", "చెరకు సరఫరా ID పొందండి", "చెరకు సరఫరా & FRP చెల్లింపు పొందండి", "SDF జోక్యం ద్వారా బకాయిలు పరిష్కారం"],
    },
    applyLink: "https://dfpd.gov.in",
    docs: { en: ["Aadhaar Card", "Land Records", "Mill Supply Card"], te: ["ఆధార్ కార్డు", "భూమి రికార్డులు", "మిల్ సరఫరా కార్డు"] },
  },

  // =================== AP STATE SCHEMES ===================
  {
    id: "rythu",
    crops: ["all"],
    farmSizes: ["all"],
    category: "ap",
    title: { en: "YSR Rythu Bharosa", te: "వైఎస్ఆర్ రైతు భరోసా" },
    description: {
      en: "Rs. 13,500/year financial support to all eligible AP farmers. Paid in installments before each season.",
      te: "AP అర్హులైన రైతులకు సంవత్సరానికి రూ. 13,500 ఆర్థిక సహాయం. ప్రతి సీజన్ ముందు విడతలుగా.",
    },
    amount: { en: "Rs. 13,500/yr", te: "రూ. 13,500/సం" },
    icon: "building2",
    color: "orange",
    eligibility: {
      en: ["Must be AP resident farmer", "Own cultivable agricultural land", "Land records updated in Webland portal", "Aadhaar-linked bank account mandatory", "Tenant farmers with valid agreement also eligible"],
      te: ["AP నివాసి రైతు", "సాగు వ్యవసాయ భూమి కలిగి ఉండాలి", "వెబ్‌ల్యాండ్ పోర్టల్‌లో భూమి రికార్డులు", "ఆధార్-లింక్డ్ బ్యాంకు ఖాతా తప్పనిసరి", "చెల్లుబాటు ఒప్పందం ఉన్న కౌలు రైతులు అర్హులు"],
    },
    applySteps: {
      en: ["Visit nearest MeeSeva/Village Secretariat", "Carry Aadhaar, land passbook & bank passbook", "Fill application form", "Submit for VRO verification", "Track at ysrrythubharosa.ap.gov.in"],
      te: ["సమీప మీసేవ/గ్రామ సచివాలయానికి వెళ్ళండి", "ఆధార్, భూమి పాస్‌బుక్ & బ్యాంకు పాస్‌బుక్ తీసుకెళ్ళండి", "దరఖాస్తు ఫారమ్ నింపండి", "VRO ధృవీకరణ కోసం సమర్పించండి", "ysrrythubharosa.ap.gov.in లో ట్రాక్ చేయండి"],
    },
    applyLink: "https://ysrrythubharosa.ap.gov.in",
    docs: {
      en: ["Aadhaar Card", "Bank Passbook", "Pattadar Passbook", "Ration Card"],
      te: ["ఆధార్ కార్డు", "బ్యాంకు పాస్‌బుక్", "పట్టాదార్ పాస్‌బుక్", "రేషన్ కార్డు"],
    },
  },
  {
    id: "annadatha",
    crops: ["paddy", "cotton", "chilli", "groundnut", "maize", "sugarcane"],
    farmSizes: ["all"],
    category: "ap",
    title: { en: "YSR Annadatha Sukhibhava", te: "వైఎస్ఆర్ అన్నదాత సుఖీభవ" },
    description: {
      en: "Free crop insurance for Rythu Bharosa beneficiaries. Automatic enrollment. Covers natural calamities.",
      te: "రైతు భరోసా లబ్ధిదారులకు ఉచిత పంట బీమా. స్వయంచాలక నమోదు. ప్రకృతి వైపరీత్యాలను కవర్ చేస్తుంది.",
    },
    amount: { en: "Free Insurance", te: "ఉచిత బీమా" },
    icon: "sprout",
    color: "teal",
    eligibility: {
      en: ["Rythu Bharosa enrolled farmers", "Crop registered with agriculture dept", "Both landowners & tenant farmers"],
      te: ["రైతు భరోసాలో నమోదైన రైతులు", "వ్యవసాయ శాఖలో పంట నమోదు", "భూ యజమానులు & కౌలు రైతులు ఇద్దరూ"],
    },
    applySteps: {
      en: ["Automatic for Rythu Bharosa beneficiaries", "Verify at Village Secretariat", "Crop details updated by VRO/VAO"],
      te: ["రైతు భరోసా లబ్ధిదారులకు స్వయంచాలకం", "గ్రామ సచివాలయంలో ధృవీకరించండి", "VRO/VAO ద్వారా పంట వివరాలు నవీకరణ"],
    },
    applyLink: "https://ysrrythubharosa.ap.gov.in",
    docs: {
      en: ["Rythu Bharosa ID", "Aadhaar Card", "Crop Registration"],
      te: ["రైతు భరోసా ID", "ఆధార్ కార్డు", "పంట నమోదు"],
    },
  },
  {
    id: "apdrip",
    crops: ["tomato", "chilli", "sugarcane", "turmeric", "mango", "cotton"],
    farmSizes: ["small", "medium"],
    category: "ap",
    title: { en: "AP Micro Irrigation Subsidy", te: "AP మైక్రో ఇరిగేషన్ సబ్సిడీ" },
    description: {
      en: "90% subsidy for SC/ST farmers, 80% for others on drip & sprinkler systems in Andhra Pradesh.",
      te: "SC/ST రైతులకు 90%, ఇతరులకు 80% డ్రిప్ & స్ప్రింక్లర్ వ్యవస్థలపై సబ్సిడీ.",
    },
    amount: { en: "Up to 90%", te: "90% వరకు" },
    icon: "tractor",
    color: "indigo",
    eligibility: {
      en: ["AP farmers with own land", "Must have bore well or water source", "SC/ST: 90%, Others: 80% subsidy", "Minimum 0.5 acres land"],
      te: ["స్వంత భూమి ఉన్న AP రైతులు", "బోరు బావి లేదా నీటి వనరు", "SC/ST: 90%, ఇతరులు: 80% సబ్సిడీ", "కనీసం 0.5 ఎకరాలు భూమి"],
    },
    applySteps: {
      en: ["Apply at District Agriculture Office", "Select micro-irrigation company", "Pay farmer share (10-20%)", "Subsidy after field verification"],
      te: ["జిల్లా వ్యవసాయ కార్యాలయంలో దరఖాస్తు", "మైక్రో-ఇరిగేషన్ కంపెనీ ఎంపిక", "రైతు వాటా (10-20%) చెల్లింపు", "ఫీల్డ్ ధృవీకరణ తర్వాత సబ్సిడీ"],
    },
    applyLink: "https://www.apagrisnet.gov.in",
    docs: {
      en: ["Aadhaar Card", "Land Documents", "Caste Certificate (for SC/ST)", "Bank Passbook"],
      te: ["ఆధార్ కార్డు", "భూమి పత్రాలు", "కుల ధృవీకరణ (SC/ST కు)", "బ్యాంకు పాస్‌బుక్"],
    },
  },
  {
    id: "vasathi",
    crops: ["all"],
    farmSizes: ["small", "medium"],
    category: "ap",
    title: { en: "Jagananna Vasathi Deevena", te: "జగనన్న వసతి దీవెన" },
    description: {
      en: "Rs. 20,000/year for farmer children education - hostel & mess charges. Income below Rs. 2.5 lakhs.",
      te: "రైతు పిల్లల విద్యకు సంవత్సరానికి రూ. 20,000 - హాస్టల్ & మెస్ ఛార్జీలు. ఆదాయం రూ. 2.5 లక్షల లోపు.",
    },
    amount: { en: "Rs. 20,000/yr", te: "రూ. 20,000/సం" },
    icon: "graduationCap",
    color: "rose",
    eligibility: {
      en: ["Children of AP farmer families", "Studying in recognized institution", "Family income below Rs. 2.5 lakhs", "75% attendance mandatory"],
      te: ["AP రైతు కుటుంబాల పిల్లలు", "గుర్తింపు సంస్థలో చదువు", "కుటుంబ ఆదాయం రూ. 2.5 లక్షల లోపు", "75% హాజరు తప్పనిసరి"],
    },
    applySteps: {
      en: ["Apply through college", "Submit Aadhaar-linked application", "Income certificate from MeeSeva", "Institution verification"],
      te: ["కళాశాల ద్వారా దరఖాస్తు", "ఆధార్-లింక్డ్ దరఖాస్తు సమర్పణ", "మీసేవ నుండి ఆదాయ ధృవీకరణ", "సంస్థ ధృవీకరణ"],
    },
    applyLink: "https://jnanabhumi.ap.gov.in",
    docs: {
      en: ["Student Aadhaar", "Parent Aadhaar", "Income Certificate", "College ID"],
      te: ["విద్యార్థి ఆధార్", "తల్లిదండ్రుల ఆధార్", "ఆదాయ ధృవీకరణ", "కళాశాల ID"],
    },
  },
  {
    id: "ap_zero_interest",
    crops: ["paddy", "cotton", "groundnut", "chilli", "sugarcane"],
    farmSizes: ["small"],
    category: "ap",
    title: { en: "AP Zero Interest Crop Loans", te: "AP వడ్డీ లేని పంట రుణాలు" },
    description: {
      en: "Zero interest crop loans up to Rs. 1 lakh for small & marginal AP farmers through cooperative banks.",
      te: "చిన్న & సన్నకారు AP రైతులకు సహకార బ్యాంకుల ద్వారా రూ. 1 లక్ష వరకు వడ్డీ లేని పంట రుణాలు.",
    },
    amount: { en: "Rs. 1 Lakh 0%", te: "రూ. 1 లక్ష 0%" },
    icon: "creditCard",
    color: "emerald",
    eligibility: {
      en: ["Small & marginal AP farmers (below 5 acres)", "Must have cooperative bank account", "No existing loan defaults", "Valid land records"],
      te: ["చిన్న & సన్నకారు AP రైతులు (5 ఎకరాల లోపు)", "సహకార బ్యాంకు ఖాతా ఉండాలి", "ఇప్పటి రుణాల్లో డిఫాల్ట్ ఉండకూడదు", "చెల్లుబాటు భూమి రికార్డులు"],
    },
    applySteps: {
      en: ["Visit Primary Agricultural Cooperative Society (PACS)", "Submit loan application with land records", "Loan sanctioned within 7 days", "Repay within crop season for zero interest"],
      te: ["ప్రాథమిక వ్యవసాయ సహకార సంఘం (PACS) సందర్శించండి", "భూమి రికార్డులతో రుణ దరఖాస్తు సమర్పణ", "7 రోజుల్లో రుణ మంజూరు", "వడ్డీ లేకుండా పంట సీజన్‌లో తిరిగి చెల్లించండి"],
    },
    applyLink: "https://www.apcob.org",
    docs: {
      en: ["Aadhaar Card", "Land Documents", "Coop Bank Passbook", "Crop Details"],
      te: ["ఆధార్ కార్డు", "భూమి పత్రాలు", "సహకార బ్యాంకు పాస్‌బుక్", "పంట వివరాలు"],
    },
  },
  {
    id: "ap_rythu_bazaar",
    crops: ["tomato", "chilli", "mango", "turmeric"],
    farmSizes: ["all"],
    category: "ap",
    title: { en: "AP Rythu Bazaar", te: "AP రైతు బజార్" },
    description: {
      en: "Direct farmer-to-consumer market. No middlemen. Better prices for vegetables, fruits & spices.",
      te: "నేరుగా రైతు-వినియోగదారుల మార్కెట్. దళారులు లేరు. కూరగాయలు, పండ్లు & సుగంధ ద్రవ్యాలకు మంచి ధరలు.",
    },
    amount: { en: "Better Prices", te: "మంచి ధరలు" },
    icon: "store",
    color: "amber",
    eligibility: {
      en: ["AP farmers growing vegetables, fruits, spices", "Must register at Rythu Bazaar committee", "Fresh produce only - no stored goods"],
      te: ["కూరగాయలు, పండ్లు, సుగంధ ద్రవ్యాలు పండించే AP రైతులు", "రైతు బజార్ కమిటీలో నమోదు", "తాజా ఉత్పత్తులు మాత్రమే"],
    },
    applySteps: {
      en: ["Visit nearest Rythu Bazaar", "Register with market committee", "Get farmer ID & stall allotment", "Sell directly to consumers"],
      te: ["సమీప రైతు బజార్ సందర్శించండి", "మార్కెట్ కమిటీలో నమోదు", "రైతు ID & స్టాల్ కేటాయింపు పొందండి", "నేరుగా వినియోగదారులకు అమ్మండి"],
    },
    applyLink: "https://www.apmarkfed.in",
    docs: { en: ["Aadhaar Card", "Land Documents", "Farmer ID"], te: ["ఆధార్ కార్డు", "భూమి పత్రాలు", "రైతు ID"] },
  },
]

/**
 * Get relevant schemes for a given crop & farm size.
 * Returns top 4-5 schemes sorted by relevance.
 */
export function getRelevantSchemes(
  crop: string,
  farmSize: string,
): SchemeData[] {
  // Score each scheme for relevance
  const scored = ALL_SCHEMES.map((s) => {
    let score = 0
    // Crop match
    if (s.crops.includes("all")) score += 2
    else if (s.crops.includes(crop)) score += 5
    else score -= 10 // not relevant at all

    // Farm size match
    if (s.farmSizes.includes("all")) score += 1
    else if (s.farmSizes.includes(farmSize)) score += 3
    else score -= 2

    return { scheme: s, score }
  })

  // Filter only relevant (score > 0) and sort by score desc
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.scheme)
}
