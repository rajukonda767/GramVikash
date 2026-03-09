import random
from agri_knowledge import AGRI_KNOWLEDGE


def get_severity(confidence):

    if confidence > 0.85:
        return "High"
    elif confidence > 0.65:
        return "Medium"
    else:
        return "Low"


def generate_advice(disease, confidence, language="te"):
    """
    Generate disease advice in the requested language (Telugu or English)
    
    Args:
        disease: Disease key from predictions
        confidence: Model confidence score (0-1)
        language: "te" for Telugu, "en" for English
        
    Returns:
        tuple: (message, severity, treatments, preventions)
    """
    
    severity = get_severity(confidence)

    data = AGRI_KNOWLEDGE.get(disease)
    
    # Handle unknown diseases
    if data is None:
        print(f"Warning: Unknown disease '{disease}' - defaulting to healthy")
        # Default to healthy crop
        disease = "paddy_normal"
        data = AGRI_KNOWLEDGE.get(disease)

    # Select language-specific content
    if language == "en":
        disease_name = data.get("name_en", data.get("name_te", disease))
        severity_text = data.get("severity_msg_en", {}).get(severity, "Unknown severity")
        treatments = random.sample(data.get("treatments_en", data.get("treatments", [])), 2)
        preventions = random.sample(data.get("preventions_en", data.get("preventions", [])), 2)
        
        message = (
            f"Your crop has been identified with {disease_name}. "
            f"Confidence level is {round(confidence*100,1)} percent. "
            f"{severity_text}. "
            f"Immediate treatments: "
            f"One, {treatments[0]}. "
            f"Two, {treatments[1]}. "
            f"Future prevention methods: "
            f"One, {preventions[0]}. "
            f"Two, {preventions[1]}."
        )
    else:  # Telugu (default)
        disease_name = data.get("name_te", data.get("name_en", disease))
        severity_text = data.get("severity_msg", {}).get(severity, "తెలియని తీవ్రత")
        treatments = random.sample(data.get("treatments", []), 2)
        preventions = random.sample(data.get("preventions", []), 2)
        
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

    return message, severity, treatments, preventions


# Keep backward compatibility with old function name
def generate_telugu_advice(disease, confidence):
    """Backward compatibility wrapper - generates Telugu advice"""
    return generate_advice(disease, confidence, language="te")