# Quick Start: Deploy to Render & Vercel

## ⚡ TL;DR - Fast Track (10 minutes)

### Backend (Render) - 5 minutes

1. **Prepare credentials:**
   ```
   Twilio Account SID: [from console.twilio.com]
   Twilio Auth Token: [from console.twilio.com]
   Twilio Phone: +1234567890
   Recipients: +919390616956,+919493263589,+917801095563,+917032590418
   ```

2. **Deploy:**
   - Go to https://render.com → New Web Service
   - Connect GitHub repo → Select `crop-backend-main`
   - Build: `pip install -r requirements.txt`
   - Start: `python app.py`
   - Add environment variables (see above)
   - Click Deploy
   - **Save URL:** https://crop-disease-api.onrender.com (example)

### Frontend (Vercel) - 5 minutes

1. **Update code:**
   ```bash
   # Edit v0-farmer-voice-scheme-assistant-main/.env.local
   NEXT_PUBLIC_API_BASE_URL=https://crop-disease-api.onrender.com
   ```

2. **Deploy:**
   - Go to https://vercel.com → Add New Project
   - Select your GitHub repo
   - Root: `v0-farmer-voice-scheme-assistant-main`
   - Add env vars:
     ```
     GROQ_API_KEY=gsk_...
     NEXT_PUBLIC_API_BASE_URL=https://crop-disease-api.onrender.com
     ```
   - Click Deploy

3. **Done!** Your app is live at `https://your-project.vercel.app`

---

## 🔑 Environment Variables Needed

### Backend (.env in Render)
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+14155552368
TWILIO_RECIPIENT_PHONES=+919390616956,+919493263589,+917801095563,+917032590418
PORT=5000
```

### Frontend (.env.local locally, environment in Vercel)
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

---

## ✅ Verify It Works

### Test Backend
```bash
curl https://your-backend.onrender.com/
# Should return: 200 OK (health check)

curl -X POST https://your-backend.onrender.com/sos \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","emergency":"Fire","latitude":17.385,"longitude":78.486}'
# Should return: {"status":"success","sent":4,"failed":0,"total":4}
```

### Test Frontend
1. Open https://your-frontend.vercel.app
2. Click Emergency button
3. Allow geolocation
4. Should send SMS to all 4 phone numbers

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend 404 | Wait 30s (cold start), then reload |
| SMS not sending | Check Twilio balance & phone verification |
| Frontend can't reach API | Verify `NEXT_PUBLIC_API_BASE_URL` in Vercel env |
| Geolocation denied | Enable HTTPS + allow browser permission |
| Cold start slow | Upgrade from free Render tier |

---

## 📞 Support Links

- **Render Issues:** https://render.com/docs
- **Vercel Issues:** https://vercel.com/docs
- **Twilio Issues:** https://www.twilio.com/docs
- **Groq Issues:** https://console.groq.com/docs

---

## 🎯 Success Indicators

- ✅ Backend shows no errors in Render Logs
- ✅ Frontend builds successfully on Vercel
- ✅ SMS received on phone after clicking Emergency
- ✅ Location shows on Google Maps link in SMS

**You're done!** 🎉 Application ready for users.

