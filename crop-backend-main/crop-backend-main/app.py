from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import cv2
import numpy as np
from PIL import Image

from predict import predict_disease
from nlp_engine import generate_advice
from voice import speak_telugu
from agri_knowledge import AGRI_KNOWLEDGE
from disease_names import get_clean_disease_name

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


# ===============================
# INTELLIGENT LEAF DETECTION
# ===============================
def is_valid_leaf_image(filepath):
    """
    Intelligent detection of leaf/plant images using computer vision
    Returns tuple: (is_valid, confidence_score, reason)
    """
    try:
        # Read image
        img = cv2.imread(filepath)
        if img is None:
            return False, 0.0, "Cannot read image file"
        
        # Convert to HSV for better color detection
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # ===== Check 1: Green Color Dominance =====
        # Define range for green color in HSV
        lower_green = np.array([25, 40, 40])
        upper_green = np.array([100, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        green_pixels = cv2.countNonZero(green_mask)
        total_pixels = img.shape[0] * img.shape[1]
        green_ratio = green_pixels / total_pixels
        
        print(f"🍃 Green color ratio: {green_ratio:.2%}")
        
        # ===== Check 2: Edge Detection (Vein Patterns) =====
        # Convert to grayscale for edge detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Canny edge detection
        edges = cv2.Canny(blurred, 30, 100)
        edge_pixels = cv2.countNonZero(edges)
        edge_ratio = edge_pixels / total_pixels
        
        print(f"🌿 Edge detection ratio: {edge_ratio:.2%}")
        
        # ===== Check 3: Contour Analysis =====
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            return False, 0.0, "No distinct edges detected - not a leaf"
        
        # Find largest contour (should be the leaf)
        largest_contour = max(contours, key=cv2.contourArea)
        contour_area = cv2.contourArea(largest_contour)
        contour_ratio = contour_area / total_pixels
        
        print(f"📐 Contour area ratio: {contour_ratio:.2%}")
        
        # ===== Check 4: Aspect Ratio Analysis =====
        x, y, w, h = cv2.boundingRect(largest_contour)
        aspect_ratio = float(w) / h if h != 0 else 0
        
        # Leaves typically have aspect ratio between 0.3 and 3.0
        valid_aspect = 0.2 < aspect_ratio < 4.0
        
        print(f"📊 Aspect ratio: {aspect_ratio:.2f}, Valid: {valid_aspect}")
        
        # ===== Check 5: Texture Analysis (Laplacian Variance) =====
        laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
        texture_variance = laplacian.var()
        
        # Leaves have moderate to high texture variance
        valid_texture = texture_variance > 50  # Threshold for detecting texture
        
        print(f"🎨 Texture variance: {texture_variance:.2f}, Valid: {valid_texture}")
        
        # ===== Scoring System =====
        score = 0.0
        max_score = 5.0
        reasons = []
        
        # Green color: Most important for leaves
        if green_ratio > 0.15:
            score += 1.5
        else:
            reasons.append(f"Low green color ({green_ratio:.0%})")
        
        # Edge detection: Should have significant edges for vein patterns
        if edge_ratio > 0.08:
            score += 1.0
        else:
            reasons.append(f"Insufficient edge patterns ({edge_ratio:.0%})")
        
        # Contour area: Should detect a distinct object
        if contour_ratio > 0.05:
            score += 1.0
        else:
            reasons.append(f"Object too small ({contour_ratio:.0%})")
        
        # Aspect ratio: Leaves have reasonable proportions
        if valid_aspect:
            score += 0.75
        else:
            reasons.append(f"Invalid aspect ratio ({aspect_ratio:.2f})")
        
        # Texture: Leaves have distinct texture
        if valid_texture:
            score += 0.75
        else:
            reasons.append(f"Insufficient texture ({texture_variance:.0f})")
        
        confidence = score / max_score
        is_valid = confidence > 0.5  # 50% combined score threshold
        
        reason = ", ".join(reasons) if reasons else "Valid leaf detected"
        
        print(f"🔍 Leaf validation score: {confidence:.2%}")
        print(f"📝 Validation reason: {reason}")
        
        return is_valid, confidence, reason
        
    except Exception as e:
        print(f"⚠️  Leaf detection error: {str(e)}")
        return False, 0.0, f"Image analysis error: {str(e)}"


# ===============================
# HELPER: Get Disease Name
# ===============================
def get_disease_name(disease_key):
    """Get Telugu and English disease names from key"""
    disease_name_te = get_clean_disease_name(disease_key, "te")
    disease_name_en = get_clean_disease_name(disease_key, "en")
    return disease_name_te, disease_name_en


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
        print(f"📷 Image saved: {filepath}")

        # ===== AI Prediction =====
        disease_key, confidence = predict_disease(filepath)
        print(f"🔍 Model predicted: {disease_key}, Confidence: {confidence:.2%}")

        # ===== VALIDATION: Check if image is valid leaf/plant photo =====
        print(f"\n🔍 Starting image validation...")
        is_valid_leaf, leaf_confidence, validation_reason = is_valid_leaf_image(filepath)
        
        if not is_valid_leaf:
            print(f"❌ Image validation failed: {validation_reason} (Score: {leaf_confidence:.0%})")
            return jsonify({
                "error": "Invalid image",
                "message": "పన్న ఎక్కుటకు సరిపడిన చేతిలేక ఈ చిత్రం భరించిన ఫలితం కాదు. దయచేసి పండు లేదా ఆకు యొక్క స్పష్ట చిత్రం పంపండి.",
                "message_en": "The uploaded image does not appear to be a valid crop leaf or plant photo. Please upload a clear photo of a plant leaf or crop."
            }), 400
        
        print(f"✅ Image validation passed: {validation_reason} (Score: {leaf_confidence:.0%})")

        # ===== Get Language Parameter =====
        language = request.form.get("language", "te").lower()
        if language not in ["en", "te"]:
            language = "te"
        print(f"🌐 Language selected: {language} (English)" if language == "en" else f"🌐 Language selected: {language} (Telugu)")

        # ===== Get Disease Name =====
        disease_name_te, disease_name_en = get_disease_name(disease_key)
        print(f"📝 Disease Name (Telugu): {disease_name_te}")

        # ===== NLP Advice =====
        try:
            message, severity, treatments, preventions = generate_advice(
                disease_key,
                confidence,
                language=language
            )
            print(f"✅ Generated {language.upper()} advice for: {disease_name_te}")
        except Exception as e:
            print(f"⚠️ NLP Error: {e}")
            # Provide language-appropriate fallback
            if language == "en":
                message = f"Disease: {disease_name_en}"
                treatments = ["Consult with an agricultural specialist"]
                preventions = ["Monitor crop regularly for signs of disease"]
            else:
                message = f"రోగం: {disease_name_te}"
                treatments = ["వ్యవసాయ శాస్త్రవేత్తను సంప్రదించండి"]
                preventions = ["పంట నియమిత రూపంలో పర్యవేక్షణ చేయండి"]
            severity = "Unknown"

        # ===== Voice Generation =====
        audio_path = os.path.join(app.config["UPLOAD_FOLDER"], "response.mp3")
        try:
            speak_telugu(message, audio_path)
            print(f"🔊 Audio generated")
        except Exception as e:
            print(f"⚠️ Audio Error: {e}")

        response_data = {
            "disease": disease_key,
            "disease_name_te": disease_name_te,
            "disease_name_en": disease_name_en,
            "confidence": round(confidence * 100, 2),
            "severity": severity,
            "language": language,
            "message": message,
            "treatments": treatments,
            "preventions": preventions,
            "voice_file": request.host_url + "response.mp3"
        }
        print(f"✅ Sending response: {response_data}")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


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
    app.run(host="0.0.0.0", port=port)