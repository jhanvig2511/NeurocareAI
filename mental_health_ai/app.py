from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from autocorrect import Speller
import emoji
import re

# =====================================
# APP SETUP
# =====================================
app = FastAPI(title="NeuroCare AI Chatbot")

# =====================================
# CORS
# =====================================
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

# =====================================
# EMOTION MODEL
# =====================================
emotion_model = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None
)

spell = Speller(lang="en")

# =====================================
# REQUEST MODEL
# =====================================
class Message(BaseModel):
    session_id: str | None = None
    message: str

# =====================================
# GREETINGS
# =====================================
GREETINGS = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
]

# =====================================
# CRISIS KEYWORDS
# =====================================
CRISIS_WORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "want to die",
    "die",
    "hopeless",
    "no reason to live",
]

# =====================================
# SHARE KEYWORDS
# =====================================
SHARE_KEYWORDS = [
    "share",
    "i want to talk",
    "i want to say",
    "tell you something",
]

# =====================================
# PREPROCESSING
# =====================================
def preprocess(text: str) -> str:
    text = text.lower()
    text = spell(text)
    text = emoji.demojize(text)
    text = re.sub(r"(.)\1{2,}", r"\1", text)
    return text.strip()

# =====================================
# HELPERS
# =====================================
def is_crisis(text: str):
    return any(word in text for word in CRISIS_WORDS)

def user_wants_to_share(text: str):
    return any(word in text for word in SHARE_KEYWORDS)

# =====================================
# RESPONSE ENGINE
# =====================================
def generate_response(text, emotion):

    if is_crisis(text):
        return (
            "I'm really sorry you're feeling this way. 💛 "
            "You matter and your feelings are important. "
            "Please consider reaching out to someone you trust and seek immediate support."
        )

    if user_wants_to_share(text):
        return (
            "I'm listening. 💙 "
            "Take your time and tell me whatever is on your mind."
        )

    if emotion == "sadness":
        return (
            "I can sense some sadness in your words. 💛 "
            "Be kind to yourself today. "
            "A short walk, journaling, or talking with someone you trust may help."
        )

    elif emotion == "fear":
        return (
            "It sounds like something may be worrying you. 🌿 "
            "Try focusing on one thing you can control right now and take a few slow breaths."
        )

    elif emotion == "anger":
        return (
            "I understand you're feeling frustrated. ❤️ "
            "Giving yourself a few minutes to pause and breathe can help clear your thoughts."
        )

    elif emotion == "joy":
        return (
            "That's wonderful to hear! 😄 "
            "Take a moment to appreciate what's going well and enjoy the positive moment."
        )

    elif emotion == "nervousness":
        return (
            "Feeling nervous is completely normal. 🌱 "
            "Focus on the present moment and take things one step at a time."
        )

    elif emotion == "disappointment":
        return (
            "That sounds disappointing. 💙 "
            "Remember that setbacks happen to everyone and don't define your future."
        )

    elif emotion == "loneliness":
        return (
            "Feeling lonely can be difficult. 🤗 "
            "Connecting with someone you trust or doing an activity you enjoy may help."
        )

    elif emotion == "gratitude":
        return (
            "It's wonderful to feel grateful. 🌸 "
            "Holding onto those positive moments can improve overall well-being."
        )

    elif emotion == "love":
        return (
            "Love and connection are powerful emotions. ❤️ "
            "Cherish those meaningful relationships in your life."
        )

    else:
        return (
            "Thank you for sharing. 🌿 "
            "Take things one step at a time and remember to take care of yourself today."
        )

# =====================================
# CHAT API
# =====================================
@app.post("/chat")
def chat(data: Message):

    raw_text = data.message
    clean_text = preprocess(raw_text)

    # Greeting response
    if clean_text in GREETINGS:
        return {
            "emotion": "greeting",
            "bot": (
                "Hello! 🌱 I'm NeuroCare AI. "
                "How are you feeling today?"
            )
        }

    try:
        result = emotion_model(clean_text)[0]

        emotion = max(
            result,
            key=lambda x: x["score"]
        )["label"]

    except Exception as e:
        print("Emotion Error:", e)
        emotion = "neutral"

    reply = generate_response(clean_text, emotion)

    return {
        "emotion": emotion,
        "bot": reply
    }

# =====================================
# HEALTH CHECK
# =====================================
@app.get("/")
def home():
    return {
        "status": "NeuroCare AI Running 🚀"
    }