import random
from agri_knowledge import AGRI_KNOWLEDGE


def get_severity(confidence):

    if confidence > 0.85:
        return "High"
    elif confidence > 0.65:
        return "Medium"
    else:
        return "Low"


def generate_telugu_advice(disease, confidence):

    severity = get_severity(confidence)

    data = AGRI_KNOWLEDGE.get(disease)
    
    # handle missing disease entry (e.g. when class_indices.json is absent)
    if data is None:
        message = (
            f"పంటకు వ్యాధి గుర్తించబడింది ({disease}). "
            f"ఖచ్చితత్వం {round(confidence*100,1)}%. "
            f"కాలిన కృషి సంస్థకు సంప్రదించండి."
        )
        return message, severity, [], []

    disease_name = data["name_te"]
    severity_text = data["severity_msg"][severity]

    treatments = random.sample(data["treatments"], 2)
    preventions = random.sample(data["preventions"], 2)

    message = (
    f"మీ పంటకు {disease_name} గుర్తించబడింది. "
    f"ఖచ్చితత్వం {round(confidence*100,1)} శాతం. "
    f"{severity_text}. "
    f"తక్షణ చికిత్సలు: "
    f"ఒకటి {treatments[0]}. "
    f"రెండు {treatments[1]}. "
    f"భవిష్యత్ నివారణలు: "
    f"ఒకటి {preventions[0]}. "
    f"రెండు {preventions[1]}."
    )

    return message, severity,treatments,preventions