from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from autocorrect import Speller
import emoji
import re
import random

# =========================
# APP SETUP
# =========================
app = FastAPI(title="NeuroCare AI Chat Bot")

# =========================
# CORS
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
# KEYWORD GROUPS
# =========================
CRISIS_WORDS = [
    "suicide", "kill myself", "end my life",
    "want to die", "no reason to live", "can't go on",
    "give up on life", "self harm", "hurt myself"
]

GREETINGS = [
    "hi", "hello", "hey", "good morning", "good evening",
    "good afternoon", "howdy", "hiya", "what's up", "sup"
]

GRATITUDE_WORDS = [
    "thank you", "thanks", "thank u", "grateful", "appreciate",
    "you helped", "you're great", "you're amazing"
]

LONELINESS_WORDS = [
    "lonely", "alone", "no one", "nobody", "isolated",
    "no friends", "no one cares", "left out", "ignored"
]

STRESS_WORDS = [
    "stressed", "stress", "overwhelmed", "too much", "pressure",
    "burnout", "exhausted", "can't handle", "so much work"
]

ANXIETY_WORDS = [
    "anxious", "anxiety", "nervous", "panic", "panic attack",
    "worried", "overthinking", "can't stop thinking", "scared"
]

SLEEP_WORDS = [
    "can't sleep", "insomnia", "sleep", "tired", "awake all night",
    "sleepless", "nightmares", "not sleeping"
]

MOTIVATION_WORDS = [
    "unmotivated", "lazy", "procrastinate", "no energy", "no motivation",
    "don't want to", "stuck", "can't start", "lost interest"
]

RELATIONSHIP_WORDS = [
    "breakup", "broke up", "heartbreak", "relationship", "miss them",
    "ex", "divorce", "fight with", "argument", "conflict"
]

SELF_ESTEEM_WORDS = [
    "ugly", "worthless", "useless", "failure", "not good enough",
    "hate myself", "stupid", "dumb", "can't do anything right"
]

HAPPINESS_WORDS = [
    "happy", "excited", "great", "wonderful", "amazing", "love it",
    "fantastic", "awesome", "celebrating", "good news", "joy",
    "proud", "achieved", "success", "won", "got the job"
]

MINDFULNESS_WORDS = [
    "meditate", "meditation", "breathe", "breathing", "calm down",
    "relax", "mindfulness", "peace", "coping", "grounding"
]

SHARE_KEYWORDS = [
    "i want to talk", "i want to share", "i need to say",
    "tell you something", "can i talk", "just wanted to say"
]

# =========================
# RESPONSE BANKS
# =========================
RESPONSES = {

    "greeting": [
        "Hey there! 😊 I'm so glad you stopped by. How are you feeling today?",
        "Hello! Welcome to NeuroCare 💙 I'm here to listen — what's on your mind?",
        "Hi! 🌟 It's great to see you. How's your day going so far?",
        "Hey! I'm here for you. Feel free to share anything — big or small. 💛",
    ],

    "gratitude": [
        "Aww, that really means a lot! 🥰 I'm always here whenever you need me.",
        "You're so kind! 💙 It makes me happy knowing I could help even a little.",
        "Thank YOU for trusting me with your feelings. That takes courage. 🌟",
        "So glad I could be here for you! Remember — you're never alone. 💛",
    ],

    "crisis": [
        "I hear you, and I want you to know — your life has real value. 💙\n"
        "Please reach out to someone you trust right now.\n"
        "You can also contact iCall (India): 📞 9152987821 — they're kind and confidential.\n"
        "You matter more than you know. 💛",

        "I'm really sorry you're going through this. You don't have to face it alone. 💔\n"
        "Please talk to someone close to you, or call Vandrevala Foundation: 📞 1860-2662-345 (24/7).\n"
        "You are loved. Please stay. 🌿",
    ],

    "loneliness": [
        "Feeling lonely is so hard, and I want you to know — I'm right here with you. 💙\n"
        "You matter, even when it doesn't feel that way. Can you tell me more about what's going on?",

        "Loneliness can really weigh heavy. 💛 You reached out today — that shows strength.\n"
        "Is there someone in your life you haven't talked to in a while? Sometimes a small message can rebuild a connection.",

        "You are seen. You are heard. And you are not as alone as it feels right now. 🌸\n"
        "I'm here — talk to me about what's been making you feel this way.",
    ],

    "stress": [
        "That sounds really exhausting. 😔 You're carrying a lot right now.\n"
        "Try this: take 3 slow deep breaths, and just focus on one thing at a time. You don't have to solve everything today. 🌿",

        "Stress piles up when we forget we're human too. 💙\n"
        "What's the one thing stressing you the most right now? Sometimes naming it makes it feel smaller.",

        "I hear you — it's a lot. 💛 Remember: you've survived tough days before, and you'll get through this too.\n"
        "Try to take a 5-minute break from screens, stretch a little, and breathe.",
    ],

    "anxiety": [
        "Anxiety can feel like your mind won't stop running. 💙 Let's slow it down together.\n"
        "Try the 5-4-3-2-1 technique: name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.\n"
        "You are safe right now. 🌿",

        "Panic and worry are exhausting. I'm glad you're talking about it. 💛\n"
        "Take a slow breath in for 4 counts, hold for 4, out for 4. Repeat 3 times. 🫁\n"
        "What specifically is worrying you most right now?",

        "Your feelings are valid — anxiety is real, and it's hard. 💙\n"
        "One thing that helps: write down your worries on paper. Getting them out of your head can bring relief.",
    ],

    "sleep": [
        "Poor sleep makes everything feel harder. 😴 Try to avoid screens 30 minutes before bed and keep a consistent sleep time.\n"
        "Chamomile tea or light stretching before bed can also help. 🌿",

        "Insomnia is so tough. 💛 Your mind might be too active at night.\n"
        "Try a body scan: close your eyes and slowly relax each part of your body from head to toe. It works!",

        "Not sleeping well affects your mood, focus, and energy. 💙\n"
        "Write down any worries before bed to 'park' them for tomorrow. Your body needs rest — be gentle with yourself.",
    ],

    "motivation": [
        "Feeling stuck is totally normal — even the most motivated people feel this way sometimes. 💛\n"
        "Try the 2-minute rule: just start the task for 2 minutes. Often that's enough to get going. 🌟",

        "Low motivation can be your mind asking for rest or a change. 💙\n"
        "Break your task into the tiniest possible step and do just that. Progress, not perfection! 🌿",

        "You don't need to feel motivated to take action — sometimes action comes first, then motivation follows. 💛\n"
        "What's one tiny thing you can do right now? Even making your bed counts. 🌸",
    ],

    "relationship": [
        "Relationship pain is one of the deepest kinds of hurt. 💔 I'm sorry you're going through this.\n"
        "Give yourself permission to feel sad — it's okay to grieve. What happened, if you'd like to share?",

        "Heartbreak and conflict are so hard. 💛 You're not weak for feeling this way — you're human.\n"
        "Take it one day at a time. Healing isn't linear, but it does happen. 🌸",

        "I hear you. 💙 Sometimes relationships hurt more than anything else.\n"
        "Focus on taking care of yourself right now — eat well, rest, and be around people who lift you up.",
    ],

    "self_esteem": [
        "I want you to hear this: you are not your worst thoughts about yourself. 💙\n"
        "The fact that you're here, seeking help, shows real strength. What's been making you feel this way?",

        "Those thoughts can feel so real, but they aren't the truth. 💛\n"
        "Try this: write down 3 things — however small — that you did well today. You might be surprised.",

        "You matter. Full stop. 🌟\n"
        "Everyone struggles with self-doubt. But you are worthy of kindness — especially from yourself. 💙",
    ],

    "happiness": [
        "That's amazing! 🎉 I love hearing this — tell me more! What happened?",
        "Yay! 😄 You deserve every bit of this happiness. Celebrate yourself today!",
        "That's so wonderful! 🌟 Happy moments are precious — hold on to this feeling. You did great!",
        "Aww this made my day too! 💛 You're glowing — keep riding this wave of joy! 🌈",
    ],

    "mindfulness": [
        "Mindfulness is such a powerful tool. 💙 Even 5 minutes of deep breathing can reset your entire mood.\n"
        "Try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat. 🫁",

        "You're already doing something wonderful by focusing on calm. 🌿\n"
        "Try a 5-minute body scan: lie down, close your eyes, and slowly relax each muscle group from toes to head.",

        "Grounding yourself is so healthy. 💛 Try stepping outside, even briefly — fresh air and nature are natural mood boosters. 🌸",
    ],

    "sharing": [
        "I'm all ears. 💛 Take your time — this is a safe space.",
        "I'm here and I'm listening. 💙 Share whatever feels right.",
        "Go ahead — I'm with you. 🌿 Nothing you say will be judged here.",
    ],

    "sadness": [
        "I'm so sorry you're feeling sad. 💛 Your feelings are completely valid.\n"
        "Sometimes just letting yourself feel it — without judgement — is the first step to healing.",

        "It's okay to not be okay. 💙 I'm right here with you.\n"
        "Would you like to talk about what's making you feel this way?",

        "Sadness can feel so heavy. 😔 Be gentle with yourself today.\n"
        "Do something small that brings comfort — a warm drink, a favourite song, or just rest. 🌿",
    ],

    "fear": [
        "Fear is your mind trying to protect you — but sometimes it goes into overdrive. 💙\n"
        "Remind yourself: right now, in this moment, you are safe. Take one breath at a time.",

        "It's okay to feel scared. 💛 You don't have to face it all at once.\n"
        "What's the fear about? Talking about it often takes away some of its power. 🌿",
    ],

    "anger": [
        "It's okay to feel angry — anger is a signal that something matters to you. 💙\n"
        "Try to step away for a moment, take some slow breaths, and give yourself space before reacting.",

        "I hear your frustration. 💛 Your feelings are valid.\n"
        "When you're ready, try writing down what's making you angry — it can help release the pressure.",
    ],

    "joy": [
        "Love this energy! 😄 What's got you feeling so good today?",
        "Yes! This makes me so happy for you! 🌟 Joy is contagious — keep it going!",
        "This is wonderful! 💛 You deserve all good things. Celebrate yourself!",
    ],

    "neutral": [
        "I'm here for you, whatever's on your mind. 💙 How are you doing today?",
        "Thanks for reaching out. 🌿 Is there something specific you'd like to talk about?",
        "I'm listening. 💛 Feel free to share anything — I'm here without judgement.",
        "Hey, it's good to hear from you! What's going on in your world today? 🌸",
    ],
}

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
# KEYWORD DETECTION
# =========================
def detect_topic(text: str):
    if any(w in text for w in CRISIS_WORDS):
        return "crisis"
    if any(w in text for w in GREETINGS) and len(text.split()) <= 5:
        return "greeting"
    if any(w in text for w in GRATITUDE_WORDS):
        return "gratitude"
    if any(w in text for w in HAPPINESS_WORDS):
        return "happiness"
    if any(w in text for w in LONELINESS_WORDS):
        return "loneliness"
    if any(w in text for w in STRESS_WORDS):
        return "stress"
    if any(w in text for w in ANXIETY_WORDS):
        return "anxiety"
    if any(w in text for w in SLEEP_WORDS):
        return "sleep"
    if any(w in text for w in MOTIVATION_WORDS):
        return "motivation"
    if any(w in text for w in RELATIONSHIP_WORDS):
        return "relationship"
    if any(w in text for w in SELF_ESTEEM_WORDS):
        return "self_esteem"
    if any(w in text for w in MINDFULNESS_WORDS):
        return "mindfulness"
    if any(w in text for w in SHARE_KEYWORDS):
        return "sharing"
    return None

def pick(key: str) -> str:
    return random.choice(RESPONSES.get(key, RESPONSES["neutral"]))

# =========================
# RESPONSE ENGINE
# =========================
def generate_response(text: str, emotion: str) -> str:
    topic = detect_topic(text)

    if topic:
        return pick(topic)

    emotion_map = {
        "sadness": "sadness",
        "grief": "sadness",
        "remorse": "sadness",
        "fear": "fear",
        "nervousness": "anxiety",
        "anger": "anger",
        "annoyance": "anger",
        "disapproval": "anger",
        "joy": "joy",
        "excitement": "happiness",
        "amusement": "happiness",
        "pride": "happiness",
        "gratitude": "gratitude",
        "love": "happiness",
        "optimism": "happiness",
        "relief": "happiness",
        "admiration": "happiness",
        "caring": "sharing",
        "curiosity": "neutral",
        "confusion": "neutral",
        "surprise": "neutral",
        "neutral": "neutral",
        "disappointment": "sadness",
        "embarrassment": "self_esteem",
        "realization": "neutral",
    }

    mapped = emotion_map.get(emotion, "neutral")
    return pick(mapped)

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