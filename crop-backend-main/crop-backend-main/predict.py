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
with open(CLASS_INDICES_PATH) as f:
    class_indices = json.load(f)

idx_to_class = {v: k for k, v in class_indices.items()}


# ==============================
# PREDICTION FUNCTION
# ==============================
def predict_disease(img_path):

    img = preprocess_image(img_path)

    preds = model.predict(img)

    class_id = np.argmax(preds)
    confidence = float(np.max(preds))

    disease = idx_to_class[class_id]

    return disease, confidence