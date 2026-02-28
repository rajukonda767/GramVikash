# Quick Start Guide - Testing Twilio SMS Fix

## Backend Setup

### Step 1: Install Dependencies
```bash
cd crop-backend-main/crop-backend-main
pip install -r requirements.txt
```

### Step 2: Verify .env Configuration
Check that `.env` file exists with:
```
TWILIO_ACCOUNT_SID=ACe4b3e4f5778c6b41ba27b8e67bd3c1d0
TWILIO_AUTH_TOKEN=bcea493a7fd73854a926bc1f07408cdd
TWILIO_PHONE_NUMBER=+18382312521
TWILIO_RECIPIENT_PHONE=+919390616956
```

### Step 3: Start Backend Server
```bash
python app.py
```
You should see:
```
* Running on http://127.0.0.1:5000
```

### Step 4: Test SOS Endpoint (Optional)
In another terminal, test the API:
```bash
curl -X POST http://127.0.0.1:5000/sos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "emergency": "fire",
    "latitude": 17.3850,
    "longitude": 78.4867,
    "priority": "HIGH"
  }'
```

Expected response:
```json
{
  "status": "SOS Sent Successfully",
  "message_sid": "SMxxxxxxxxxxxxxx"
}
```

---

## Frontend Setup

### Step 1: Verify .env.local
Check that `.env.local` exists with:
```
GROQ_API_KEY=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
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```

### Step 2: Start Frontend
```bash
cd v0-farmer-voice-scheme-assistant-main/v0-farmer-voice-scheme-assistant-main
pnpm dev
```

Open browser: `http://localhost:3000`

---

## Testing the Emergency Alert Flow

### Via Web UI
1. Go to **Emergency** page (`/emergency`)
2. Select an emergency type (e.g., "Fire Emergency")
3. Allow location access when prompted
4. Click **"Send Emergency Alert"**
5. You should see:
   - Loading spinner while sending
   - Success message with green background (SMS was sent)
   - OR Error message with red background (SMS failed)
6. Click **"Send New Alert"** to try again

### Expected Outcomes

**Success:**
- Green alert box appears
- Shows "Emergency alert has been sent..."
- Voice notification plays
- SMS is sent to authority phone number

**Error (Network Issue):**
- Red alert box appears
- Shows specific error message
- Voice notification says "Error sending alert..."
- Check console (F12) for details

**Error (Missing Location):**
- Backend returns: "Location data is required"
- Frontend shows error message
- Try clicking "Retry" on location capture

---

## Debugging Tips

### If SMS is Not Sending

1. **Check Backend Logs:**
   - Look for "SOS SMS sent successfully" message
   - Or error message starting with "Twilio error:"

2. **Check Network Tab in Browser (F12):**
   - Go to Emergency page
   - Open DevTools → Network tab
   - Send alert and check the `/sos` request
   - Look at Response tab to see error details

3. **Verify Twilio Credentials:**
   - Check `.env` file has correct credentials
   - Test credentials at: https://console.twilio.com

4. **Check CORS:**
   - If you see CORS error in browser console
   - Backend is running and has `CORS(app)` (already enabled)

### If Frontend Can't Connect to Backend

1. Check backend is running on port 5000
2. Verify `.env.local` has: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000`
3. In browser console, you should see no CORS errors

---

## What Was Fixed

✅ **Environment Variables**: API URL and Twilio credentials now in `.env` files
✅ **Error Handling**: Frontend shows clear error messages to user
✅ **Response Validation**: Backend checks response before showing success
✅ **Proper Logging**: Both frontend and backend log detailed info
✅ **Security**: Credentials no longer hardcoded in source code

---

## Next Steps for Production

1. Update API URLs for production domain
2. Use production Twilio credentials in `.env`
3. Add proper HTTPS/SSL
4. Use AWS Secrets Manager or similar for credentials
5. Add rate limiting to `/sos` endpoint
6. Consider adding SMS confirmation/retry logic
7. Add database to log all SOS alerts
8. Set up proper monitoring and alerting
