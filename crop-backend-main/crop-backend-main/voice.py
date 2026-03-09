import asyncio
import edge_tts
import re
import os

VOICE = "te-IN-ShrutiNeural"   # BEST Telugu Female Voice


def clean_text(text):
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


async def generate_voice_async(message, output_path):
    """Generate Telugu voice audio and save to specified path"""
    
    try:
        message = clean_text(message)
        print(f"🎤 Generating audio for: {message[:50]}...")

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Simple SSML - keep it minimal to avoid intro/outro
        # Use brief property to minimize extra content
        #ssml = f"""<speak version='1.0' xml:lang='te-IN' xmlns='http://www.w3.org/2001/10/synthesis'><voice name='{VOICE}' xml:lang='te-IN'>{message}</voice></speak>"""

        communicate = edge_tts.Communicate(
            text=message,
            voice=VOICE,
            rate="-10%"  # Slightly slower speech
        )

        await communicate.save(output_path)
        print(f"✅ Audio generated and saved to: {output_path}")
        return output_path

    except Exception as e:
        print(f"❌ Error generating audio: {str(e)}")
        raise


def speak_telugu(message, output_path=None):
    """Main function to generate Telugu speech"""
    if output_path is None:
        # Default to uploads folder
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(root_dir, "uploads", "response.mp3")
    
    return asyncio.run(generate_voice_async(message, output_path))