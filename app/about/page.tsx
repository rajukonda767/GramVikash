"use client"

import { useLanguage } from "@/lib/language-context"
import { Heart, Users, Leaf, Zap } from "lucide-react"

export default function AboutPage() {
  const { lang } = useLanguage()

  const values = [
    {
      icon: Heart,
      titleEn: "Farmer-First Approach",
      titleTe: "రైతు-కేంద్రీకృత విధానం",
      descEn: "We design everything with farmers' needs at the center",
      descTe: "రైతుల అవసరాలను కేంద్రగా విషయాలను రూపొందిస్తాము",
    },
    {
      icon: Leaf,
      titleEn: "Accessibility",
      titleTe: "అందుబాటు",
      descEn: "Voice-first interface in Telugu and English languages",
      descTe: "తెలుగు మరియు ఆంగ్లంలో వాయిస్-ప్రధాన ఇంటర్‌ఫేస్",
    },
    {
      icon: Zap,
      titleEn: "Innovation",
      titleTe: "ఆవిష్కరణ",
      descEn: "Cutting-edge AI models for accurate disease detection",
      descTe: "ఖచ్చితమైన వ్యాధి గుర్తింపు కోసం అత్యాధునిక AI నమూనాలు",
    },
    {
      icon: Users,
      titleEn: "Sustainability",
      titleTe: "స్థితిస్థాపకత",
      descEn: "Promoting eco-friendly farming practices",
      descTe: "పర్యావరణ-స్నేహీ వ్యవసాయ పద్ధతులను ప్రోత్సహించడం",
    },
  ]

  const team = [
    {
      name: "Kristhu Raju",
      role: "ML & Backend Developer",
      roleTe: "ML & బ్యాకెండ్ డెవలపర్",
      bio: "Expert in machine learning and backend systems",
      bioTe: "యంత్ర శిక్ష మరియు బ్యాకెండ్ సిస్టమ్‌ల నిపుణుడు",
      linkedin: "https://www.linkedin.com/in/kristhuraju",
      github: "https://github.com/rajukonda767",
    },
    {
      name: "Padmaraju",
      role: "Frontend Developer",
      roleTe: "ఫ్రంటెండ్ డెవలపర్",
      bio: "UI/UX specialist creating intuitive interfaces",
      bioTe: "సహజమైన ఇంటర్‌ఫేస్ సృష్టించే UI/UX నిపుణుడు",
      linkedin: "https://www.linkedin.com/in/padmaraju-86a12730b/",
      github: "https://github.com/rajukonda767",
    },
    {
      name: "Vineela",
      role: "Testing & Presentation Lead",
      roleTe: "టెస్టింగ్ మరియు ప్రదర్శన నేతృత్వం",
      bio: "Connecting systems and services seamlessly",
      bioTe: "సిస్టమ్‌లు మరియు సేవలను సమన్వయంగా అనుసంధாనించడం",
      linkedin: "https://www.linkedin.com/in/lankavineela18",
      github: "https://github.com/vineelalanka07",
    },
    {
      name: "Pujitha",
      role: "Research & Data Analyst",
      roleTe: "పరిశోధన & డేటా అనలిస్ట్",
      bio: "Ensuring quality through rigorous testing",
      bioTe: "కఠోరమైన పరీక్షల ద్వారా నాణ్యతను నిశ్చితం చేయడం",
      linkedin: "https://www.linkedin.com/in/pujitha-kondapalli-955a2b34b",
      github: "https://github.com/kondapallipujitha72",
    },
    {
      name: "Siva Nagendra Reddy",
      role: "API Integration",
      roleTe: "API ఇంటిగ్రేషన్",
      bio: "Specializing in seamless API integration and system connectivity",
      bioTe: "నిరపాయమైన API ఇంటిగ్రేషన్ మరియు సిస్టమ్ కనెక్టివిటీలో ప్రత్యేకవాళ్లు",
      linkedin: "https://www.linkedin.com/in/siva-nagendra-reddy-820533379/",
      github: "https://github.com/rajukonda767",
    },
    {
      name: "Dinesh Kumar",
      role: "System Design Analyst",
      roleTe: "సిస్టమ్ డిజైన్ విశ్లేషకుడు",
      bio: "Expert in designing robust and scalable system architectures",
      bioTe: "దృఢమైన మరియు విస్తరించదగిన సిస్టమ్ ఆర్కిటెక్చర్‌ల రూపకల్పనలో నిపుణుడు",
      linkedin: "https://www.linkedin.com/in/dinesh-kumar-318047356/",
      github: "https://github.com/rajukonda767",
    },
  ]

  const isEnglish = lang === "en"

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section - Brief */}
      <section className="px-4 pt-16 pb-16 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-green-500 to-emerald-500 bg-clip-text text-transparent">
            {isEnglish ? "About Us" : "మా గురించి"}
          </h1>
        </div>
      </section>

      {/* Middle Section - Brand Info + Features */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2">code4Climate</h2>
          </div>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-center">
            {isEnglish
              ? "At code4Climate, we are committed to empowering farmers with advanced AI technology to detect and manage crop diseases in real-time. Our mission is to make agricultural expertise accessible, affordable, and available to every farmer, regardless of their location or technical background."
              : "code4Climate లో, మేము రైతులకు అధునాతన AI సాంకేతికతను అందించడానికి కట్టుబడి ఉన్నాము, తద్వారా వారు పంట వ్యాధులను నిజ-సమయంలో గుర్తించి, నిర్వహించగలరు. మా లక్ష్యం వ్యవసాయ నిపుణత సులభతరం మరియు ప్రతి రైతుకు అందుబాటులో ఉండేలా చేయడం."}
          </p>

          {/* Features - Centered Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-primary">
                {isEnglish ? "Voice-First Platform" : "వాయిస్-ప్రధాన వేదిక"}
              </p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-primary">
                {isEnglish ? "AI-Powered Detection" : "AI-ఆధారిత గుర్తింపు"}
              </p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-primary">
                {isEnglish ? "Multilingual Support" : "బహుభాషా మద్దతు"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Below Brand Info */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isEnglish ? "Meet the code4Climate Team" : "code4Climate బృందాన్ని కలుసుకోండి"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEnglish
              ? "A passionate team of developers and innovators dedicated to solving farming challenges"
              : "వ్యవసాయ సవాళ్లను పరిష్కరించడానికి నిబద్ధమైన డెవలపర్లు మరియు ఆవిష్కారకుల ఉత్సాహీ బృందం"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors p-6 text-center"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                {member.name === "Kristhu Raju" ? (
                  <img
                    src="https://media.licdn.com/dms/image/v2/D5603AQF5BC2GL3L0Bw/profile-displayphoto-scale_200_200/B56ZoXZj8RJYAY-/0/1761329171032?e=2147483647&v=beta&t=szFa3c9VailXgR-AJVosPGmELAcmwkal4kNqBjb_dtM"
                    alt={member.name}
                    className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center text-3xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="font-bold text-lg mb-1 uppercase tracking-tight">
                {member.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isEnglish ? member.role : member.roleTe}
              </p>

              {/* Social Links */}
              <div className="flex justify-center gap-4">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {isEnglish ? "Our Values" : "మా విలువలు"}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon
            return (
              <div
                key={idx}
                className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 bg-primary/15 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {isEnglish ? value.titleEn : value.titleTe}
                </h3>
                <p className="text-muted-foreground">
                  {isEnglish ? value.descEn : value.descTe}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isEnglish
              ? "Join Us in Transforming Agriculture"
              : "వ్యవసాయాన్ని పరిరూపకరించడంలో మాతో చేరండి"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {isEnglish
              ? "Together, we can build a smarter, more sustainable future for farming and farmers."
              : "కలిసి, మేము క్రిషకత్వం మరియు రైతుల కోసం స్మార్టర్, మరింత స్థిరమైన భవిష్యత్‌ను నిర్మించగలము."}
          </p>
          <a
            href="/crop-disease"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            {isEnglish ? "Start Detection" : "గుర్తింపు ప్రారంభించండి"}
          </a>
        </div>
      </section>
    </main>
  )
}
