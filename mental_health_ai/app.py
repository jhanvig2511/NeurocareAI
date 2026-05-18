from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from autocorrect import Speller
import emoji
import re

# =========================
# APP SETUP
# =========================
app = FastAPI(title="NeuroCare AI Chat Bot")

# =========================
# 🌐 CORS (PRODUCTION READY)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3000/",
        "https://neurocare-git-main-jhanvi-gupta-s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODELS
# =========================
emotion_model = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None
)

spell = Speller(lang="en")

# =========================
# INPUT SCHEMA
# =========================
class Message(BaseModel):
    session_id: str | None = None
    message: str

# =========================
# CONSTANTS
# =========================
CRISIS_WORDS = [
    "suicide", "kill myself", "end my life",
    "want to die", "die", "hopeless",
    "no reason to live"
]

CONTACT_KEYWORDS = [
    "doctor", "psychiatrist", "counsellor",
    "contact", "help number", "phone",
    "call", "consult"
]

SHARE_KEYWORDS = [
    "share", "tell something", "i want to talk", "i want to say"
]

# =========================
# PREPROCESSING
# =========================
def preprocess(text: str) -> str:
    text = text.lower()
    text = spell(text)
    text = emoji.demojize(text)
    text = re.sub(r"(.)\1{2,}", r"\1", text)
    return text.strip()

# =========================
# HELPERS
# =========================
def is_crisis(text: str) -> bool:
    return any(word in text for word in CRISIS_WORDS)

def is_asking_for_contact(text: str) -> bool:
    return any(word in text for word in CONTACT_KEYWORDS)

def user_wants_to_share(text: str) -> bool:
    return any(word in text for word in SHARE_KEYWORDS)

# =========================
# CONTACT INFO
# =========================
def psychiatrist_contact():
    return (
        "🧑‍⚕️ Psychiatrist Contact:\n"
        "• Dr. Lovely Verma\n"
        "• 📞 +91 9717101995"
    )

def counsellor_contact():
    return (
        "🚨 Crisis Support:\n"
        "• Dr. Shivam Mehta\n"
        "• 📞 +91 9667978445"
    )

# =========================
# RESPONSE ENGINE
# =========================
def generate_response(text: str, emotion: str) -> str:

    if is_crisis(text):
        return (
            "I'm really sorry you're feeling this way. 💔\n"
            "You matter. Please reach out:\n\n"
            + counsellor_contact()
        )

    if user_wants_to_share(text):
        return "I'm here for you 💛 Tell me anything."

    if is_asking_for_contact(text):
        return psychiatrist_contact()

    if emotion == "sadness":
        return "I'm here for you 💛 Try talking to someone you trust or take a small break."

    if emotion == "fear":
        return "Try deep breathing. You are safe right now."

    if emotion == "anger":
        return "Pause and take slow breaths. Step away for a moment."

    if emotion == "joy":
        return "That's wonderful 😄 Keep going!"

    return "You're doing okay. Take things one step at a time 🌿"

# =========================
# CHAT ROUTE
# =========================
@app.post("/chat")
def chat(data: Message):

    raw_text = data.message
    clean_text = preprocess(raw_text)

    try:
        result = emotion_model(clean_text)[0]
        emotion = max(result, key=lambda x: x["score"])["label"]
    except Exception:
        emotion = "neutral"

    reply = generate_response(clean_text, emotion)

    return {
        "emotion": emotion,
        "bot": reply
    }

# =========================
# ROOT
# =========================
@app.get("/")
def home():
    return {"status": "NeuroCare AI Bot Running 🚀"}