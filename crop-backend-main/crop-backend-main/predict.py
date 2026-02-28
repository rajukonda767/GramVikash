import tensorflow as tf
import json
import numpy as np
import os
from preprocess import preprocess_image


# ==============================
# SAFE PATH SETUP (RENDER SAFE)
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "plant_disease_model.keras"
)

CLASS_INDICES_PATH = os.path.join(
    BASE_DIR,
    "class_indices.json"
)

print("Loading model from:", MODEL_PATH)

# ==============================
# LOAD MODEL
# ==============================
model = tf.keras.models.load_model(MODEL_PATH)

# ==============================
# LOAD LABELS
# ==============================
idx_to_class = {}
if os.path.exists(CLASS_INDICES_PATH):
    try:
        with open(CLASS_INDICES_PATH) as f:
            class_indices = json.load(f)
        # Convert string keys to integers (0, 1, 2, etc) and map to disease names
        idx_to_class = {int(k): v for k, v in class_indices.items()}
        print(f"Loaded {len(idx_to_class)} class mappings from {CLASS_INDICES_PATH}")
    except Exception as e:
        # file exists but couldn't be read/parsed; warn and continue
        print("Warning: failed to parse class_indices.json", e)
else:
    # Missing file is common in some deployment setups; fall back to
    # numeric labels and log a notice so it's easier to debug later.
    print(
        f"Warning: '{CLASS_INDICES_PATH}' not found; predictions will"
        " use numeric class IDs instead of names."
    )


# ==============================
# PREDICTION FUNCTION
# ==============================
def predict_disease(img_path):

    img = preprocess_image(img_path)

    preds = model.predict(img)

    class_id = np.argmax(preds)
    confidence = float(np.max(preds))

    # fallback to a placeholder name if mapping absent
    disease = idx_to_class.get(class_id, f"class_{class_id}")

    return disease, confidence