from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Heavy ML / TTS imports are performed lazily inside the predict route
# to allow the server to start for health checks even when TensorFlow
# (or other heavy deps) aren't installed in the environment.
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
TWILIO_RECIPIENTS_STR = os.getenv("TWILIO_RECIPIENT_PHONES")
TWILIO_RECIPIENTS = [phone.strip() for phone in TWILIO_RECIPIENTS_STR.split(",")] if TWILIO_RECIPIENTS_STR else []

# Initialize Twilio client
client = None
if ACCOUNT_SID and AUTH_TOKEN and TWILIO_NUMBER and TWILIO_RECIPIENTS:
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
    except Exception:
        client = None

app = Flask(__name__)
CORS(app)

# ===============================
# SAFE PATH SETUP (VERY IMPORTANT)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def has_sufficient_green_content(image_path, threshold=0.02):
    """
    Simple heuristic to reject images that are clearly not plants/crops.
    Looks for minimum green pixel ratio to filter out faces, people, buildings, etc.
    Uses a very lenient threshold so legitimate crops still pass.
    """
    try:
        from PIL import Image
        import numpy as np
        
        img = Image.open(image_path).convert("RGB")
        pixels = np.array(img)
        
        r = pixels[:, :, 0].astype(float)
        g = pixels[:, :, 1].astype(float)
        b = pixels[:, :, 2].astype(float)
        
        # Count pixels where green is noticeably higher than red and blue
        green_pixels = (g > r + 15) & (g > b + 15) & (g > 50)
        green_ratio = green_pixels.sum() / (pixels.shape[0] * pixels.shape[1])
        
        return green_ratio >= threshold
    except Exception:
        # On error, allow the image through to the disease predictor
        return True


# ===============================
# HEALTH CHECK
# ===============================
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "API is running"}), 200


# ===============================
# AUDIO FILE SERVING
# ===============================
@app.route("/response.mp3")
def serve_audio():
    audio_path = os.path.join(app.config["UPLOAD_FOLDER"], "response.mp3")

    if os.path.exists(audio_path):
        return send_file(audio_path, mimetype="audio/mpeg")

    return jsonify({"error": "Audio file not found"}), 404


# ===============================
# PREDICTION ROUTE
# ===============================
@app.route("/sos", methods=["POST", "OPTIONS"])
def send_sos():
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
        
    try:
        # Check if Twilio is properly configured
        if not client or not TWILIO_RECIPIENTS:
            return jsonify({
                "status": "failed",
                "message": "SMS service not configured"
            }), 500
        
        data = request.json

        name = data.get("name", "Raju")
        emergency = data.get("emergency")
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if not latitude or not longitude:
            return jsonify({
                "status": "failed",
                "message": "Location data required"
            }), 400

        location_link = f"https://maps.google.com/?q={latitude},{longitude}"

        message_body = f""" GramVikash ALERT

Farmer: {name}
Emergency: {emergency}

Location:
{location_link}

Please respond immediately."""

        try:
            sent = 0
            failed = 0
            
            # Send SMS to each member
            for recipient in TWILIO_RECIPIENTS:
                try:
                    client.messages.create(
                        body=message_body,
                        from_=TWILIO_NUMBER,
                        to=recipient
                    )
                    sent += 1
                except Exception:
                    failed += 1
            
            status_code = 200 if failed == 0 else 206
            return jsonify({
                "status": "success",
                "sent": sent,
                "failed": failed,
                "total": len(TWILIO_RECIPIENTS)
            }), status_code
            
        except Exception:
            return jsonify({
                "status": "failed",
                "message": "Unable to send SMS"
            }), 500

    except Exception:
        return jsonify({
            "status": "failed",
            "message": "Server error"
        }), 500

@app.route("/predict", methods=["POST"])
def predict():

    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # Check if image has sufficient green content (basic crop validation)
        # This prevents classifying human faces or other non-crops as healthy plants
        if not has_sufficient_green_content(filepath, threshold=0.02):
            telugu_msg = "దయచేసి పంట లేదా ఆకును అప్‌లోడ్ చేయండి. మానవ ఫోటోలు అనుమతించబడవు."
            english_msg = "Please upload a crop or leaf photo. Human photos are not supported."
            return jsonify({
                "error": english_msg,
                "english_message": english_msg,
                "telugu_message": telugu_msg,
                "disease_name": None,
                "confidence": 0.0,
                "severity_rate": None,
                "treatment": [],
                "prevention": [],
            }), 400

        # Previously there was a leaf/crop detection step here.  all
        # heuristics and binary classifiers have been removed, so every
        # uploaded image is now forwarded directly to the disease predictor.
        # This keeps the API simple and avoids spurious "not a leaf" errors.

        # Lazy imports: import heavy modules only when prediction is requested
        from predict import predict_disease
        from nlp_engine import generate_telugu_advice
        from voice import speak_telugu

        # ===== AI Prediction =====
        disease, confidence = predict_disease(filepath)

        # ===== NLP Advice =====
        message, severity, treatments, preventions = generate_telugu_advice(
            disease,
            confidence
        )

        # ===== Voice Generation =====
        audio_path = os.path.join(app.config["UPLOAD_FOLDER"], "response.mp3")

        try:
            speak_telugu(message, audio_path)
        except Exception:
            pass

        return jsonify({
            "disease_name": disease,
            "confidence": round(confidence * 100, 2),
            "severity_rate": severity,
            "telugu_message": message,
            "treatment": treatments,
            "prevention": preventions,
            "voice_file": request.host_url + "response.mp3"
        })

    except Exception as e:
        return jsonify({"error": "Prediction failed"}), 500


# ===============================
# ERROR HANDLERS
# ===============================
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal Server Error"}), 500


# ===============================
# LOCAL RUN
# ===============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)