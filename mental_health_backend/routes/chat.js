const express = require('express');
const axios = require('axios');
const db = require('../db');

const router = express.Router();

// =============================================
// KEYWORD GROUPS (mirrored from Python AI)
// =============================================
const CRISIS_WORDS = ["suicide","kill myself","end my life","want to die","no reason to live","can't go on","give up on life","self harm","hurt myself"];
const GREETINGS = ["hi","hello","hey","good morning","good evening","good afternoon","howdy","hiya","what's up","sup"];
const GRATITUDE_WORDS = ["thank you","thanks","thank u","grateful","appreciate","you helped","you're great","you're amazing"];
const LONELINESS_WORDS = ["lonely","alone","no one","nobody","isolated","no friends","no one cares","left out","ignored"];
const STRESS_WORDS = ["stressed","stress","overwhelmed","too much","pressure","burnout","exhausted","can't handle","so much work"];
const ANXIETY_WORDS = ["anxious","anxiety","nervous","panic","panic attack","worried","overthinking","can't stop thinking","scared"];
const SLEEP_WORDS = ["can't sleep","insomnia","sleep","tired","awake all night","sleepless","nightmares","not sleeping"];
const MOTIVATION_WORDS = ["unmotivated","lazy","procrastinate","no energy","no motivation","don't want to","stuck","can't start","lost interest"];
const RELATIONSHIP_WORDS = ["breakup","broke up","heartbreak","relationship","miss them","ex","divorce","fight with","argument","conflict"];
const SELF_ESTEEM_WORDS = ["ugly","worthless","useless","failure","not good enough","hate myself","stupid","dumb","can't do anything right"];
const HAPPINESS_WORDS = ["happy","excited","great","wonderful","amazing","love it","fantastic","awesome","celebrating","good news","joy","proud","achieved","success","won","got the job"];
const MINDFULNESS_WORDS = ["meditate","meditation","breathe","breathing","calm down","relax","mindfulness","peace","coping","grounding"];
const SHARE_KEYWORDS = ["i want to talk","i want to share","i need to say","tell you something","can i talk","just wanted to say"];
const SADNESS_WORDS = ["sad","depressed","depression","crying","cried","hopeless","unhappy","miserable","grief","down","blue"];
const FEAR_WORDS = ["afraid","fear","scared","terrified","dread","phobia","frightened"];
const ANGER_WORDS = ["angry","anger","furious","mad","rage","frustrated","irritated","annoyed","hate"];

// =============================================
// RESPONSE BANKS
// =============================================
const RESPONSES = {
  greeting: [
    "Hey there! 😊 I'm so glad you stopped by. How are you feeling today?",
    "Hello! Welcome to NeuroCare 💙 I'm here to listen — what's on your mind?",
    "Hi! 🌟 It's great to see you. How's your day going so far?",
    "Hey! I'm here for you. Feel free to share anything — big or small. 💛",
  ],
  gratitude: [
    "Aww, that really means a lot! 🥰 I'm always here whenever you need me.",
    "You're so kind! 💙 It makes me happy knowing I could help even a little.",
    "Thank YOU for trusting me with your feelings. That takes courage. 🌟",
    "So glad I could be here for you! Remember — you're never alone. 💛",
  ],
  crisis: [
    "I hear you, and I want you to know — your life has real value. 💙\nPlease reach out to someone you trust right now.\nYou can also contact iCall (India): 📞 9152987821 — they're kind and confidential.\nYou matter more than you know. 💛",
    "I'm really sorry you're going through this. You don't have to face it alone. 💔\nPlease talk to someone close to you, or call Vandrevala Foundation: 📞 1860-2662-345 (24/7).\nYou are loved. Please stay. 🌿",
  ],
  loneliness: [
    "Feeling lonely is so hard, and I want you to know — I'm right here with you. 💙\nYou matter, even when it doesn't feel that way. Can you tell me more about what's going on?",
    "Loneliness can really weigh heavy. 💛 You reached out today — that shows strength.\nIs there someone in your life you haven't talked to in a while? Sometimes a small message can rebuild a connection.",
    "You are seen. You are heard. And you are not as alone as it feels right now. 🌸\nI'm here — talk to me about what's been making you feel this way.",
  ],
  stress: [
    "That sounds really exhausting. 😔 You're carrying a lot right now.\nTry this: take 3 slow deep breaths, and just focus on one thing at a time. You don't have to solve everything today. 🌿",
    "Stress piles up when we forget we're human too. 💙\nWhat's the one thing stressing you the most right now? Sometimes naming it makes it feel smaller.",
    "I hear you — it's a lot. 💛 Remember: you've survived tough days before, and you'll get through this too.\nTry to take a 5-minute break from screens, stretch a little, and breathe.",
  ],
  anxiety: [
    "Anxiety can feel like your mind won't stop running. 💙 Let's slow it down together.\nTry the 5-4-3-2-1 technique: name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.\nYou are safe right now. 🌿",
    "Panic and worry are exhausting. I'm glad you're talking about it. 💛\nTake a slow breath in for 4 counts, hold for 4, out for 4. Repeat 3 times. 🫁\nWhat specifically is worrying you most right now?",
    "Your feelings are valid — anxiety is real, and it's hard. 💙\nOne thing that helps: write down your worries on paper. Getting them out of your head can bring relief.",
  ],
  sleep: [
    "Poor sleep makes everything feel harder. 😴 Try to avoid screens 30 minutes before bed and keep a consistent sleep time.\nChamomile tea or light stretching before bed can also help. 🌿",
    "Insomnia is so tough. 💛 Your mind might be too active at night.\nTry a body scan: close your eyes and slowly relax each part of your body from head to toe. It works!",
    "Not sleeping well affects your mood, focus, and energy. 💙\nWrite down any worries before bed to 'park' them for tomorrow. Your body needs rest — be gentle with yourself.",
  ],
  motivation: [
    "Feeling stuck is totally normal — even the most motivated people feel this way sometimes. 💛\nTry the 2-minute rule: just start the task for 2 minutes. Often that's enough to get going. 🌟",
    "Low motivation can be your mind asking for rest or a change. 💙\nBreak your task into the tiniest possible step and do just that. Progress, not perfection! 🌿",
    "You don't need to feel motivated to take action — sometimes action comes first, then motivation follows. 💛\nWhat's one tiny thing you can do right now? Even making your bed counts. 🌸",
  ],
  relationship: [
    "Relationship pain is one of the deepest kinds of hurt. 💔 I'm sorry you're going through this.\nGive yourself permission to feel sad — it's okay to grieve. What happened, if you'd like to share?",
    "Heartbreak and conflict are so hard. 💛 You're not weak for feeling this way — you're human.\nTake it one day at a time. Healing isn't linear, but it does happen. 🌸",
    "I hear you. 💙 Sometimes relationships hurt more than anything else.\nFocus on taking care of yourself right now — eat well, rest, and be around people who lift you up.",
  ],
  self_esteem: [
    "I want you to hear this: you are not your worst thoughts about yourself. 💙\nThe fact that you're here, seeking help, shows real strength. What's been making you feel this way?",
    "Those thoughts can feel so real, but they aren't the truth. 💛\nTry this: write down 3 things — however small — that you did well today. You might be surprised.",
    "You matter. Full stop. 🌟\nEveryone struggles with self-doubt. But you are worthy of kindness — especially from yourself. 💙",
  ],
  happiness: [
    "That's amazing! 🎉 I love hearing this — tell me more! What happened?",
    "Yay! 😄 You deserve every bit of this happiness. Celebrate yourself today!",
    "That's so wonderful! 🌟 Happy moments are precious — hold on to this feeling. You did great!",
    "Aww this made my day too! 💛 You're glowing — keep riding this wave of joy! 🌈",
  ],
  mindfulness: [
    "Mindfulness is such a powerful tool. 💙 Even 5 minutes of deep breathing can reset your entire mood.\nTry box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat. 🫁",
    "You're already doing something wonderful by focusing on calm. 🌿\nTry a 5-minute body scan: lie down, close your eyes, and slowly relax each muscle group from toes to head.",
    "Grounding yourself is so healthy. 💛 Try stepping outside, even briefly — fresh air and nature are natural mood boosters. 🌸",
  ],
  sharing: [
    "I'm all ears. 💛 Take your time — this is a safe space.",
    "I'm here and I'm listening. 💙 Share whatever feels right.",
    "Go ahead — I'm with you. 🌿 Nothing you say will be judged here.",
  ],
  sadness: [
    "I'm so sorry you're feeling sad. 💛 Your feelings are completely valid.\nSometimes just letting yourself feel it — without judgement — is the first step to healing.",
    "It's okay to not be okay. 💙 I'm right here with you.\nWould you like to talk about what's making you feel this way?",
    "Sadness can feel so heavy. 😔 Be gentle with yourself today.\nDo something small that brings comfort — a warm drink, a favourite song, or just rest. 🌿",
  ],
  fear: [
    "Fear is your mind trying to protect you — but sometimes it goes into overdrive. 💙\nRemind yourself: right now, in this moment, you are safe. Take one breath at a time.",
    "It's okay to feel scared. 💛 You don't have to face it all at once.\nWhat's the fear about? Talking about it often takes away some of its power. 🌿",
  ],
  anger: [
    "It's okay to feel angry — anger is a signal that something matters to you. 💙\nTry to step away for a moment, take some slow breaths, and give yourself space before reacting.",
    "I hear your frustration. 💛 Your feelings are valid.\nWhen you're ready, try writing down what's making you angry — it can help release the pressure.",
  ],
  neutral: [
    "I'm here for you, whatever's on your mind. 💙 How are you doing today?",
    "Thanks for reaching out. 🌿 Is there something specific you'd like to talk about?",
    "I'm listening. 💛 Feel free to share anything — I'm here without judgement.",
    "Hey, it's good to hear from you! What's going on in your world today? 🌸",
  ],
};

// =============================================
// HELPER: pick random response
// =============================================
function pick(key) {
  const bank = RESPONSES[key] || RESPONSES["neutral"];
  return bank[Math.floor(Math.random() * bank.length)];
}

// =============================================
// KEYWORD TOPIC DETECTION
// =============================================
function detectTopic(text) {
  const t = text.toLowerCase();
  if (CRISIS_WORDS.some(w => t.includes(w))) return "crisis";
  if (GREETINGS.some(w => t.includes(w)) && t.split(" ").length <= 5) return "greeting";
  if (GRATITUDE_WORDS.some(w => t.includes(w))) return "gratitude";
  if (HAPPINESS_WORDS.some(w => t.includes(w))) return "happiness";
  if (LONELINESS_WORDS.some(w => t.includes(w))) return "loneliness";
  if (STRESS_WORDS.some(w => t.includes(w))) return "stress";
  if (ANXIETY_WORDS.some(w => t.includes(w))) return "anxiety";
  if (SLEEP_WORDS.some(w => t.includes(w))) return "sleep";
  if (MOTIVATION_WORDS.some(w => t.includes(w))) return "motivation";
  if (RELATIONSHIP_WORDS.some(w => t.includes(w))) return "relationship";
  if (SELF_ESTEEM_WORDS.some(w => t.includes(w))) return "self_esteem";
  if (MINDFULNESS_WORDS.some(w => t.includes(w))) return "mindfulness";
  if (SHARE_KEYWORDS.some(w => t.includes(w))) return "sharing";
  if (SADNESS_WORDS.some(w => t.includes(w))) return "sadness";
  if (FEAR_WORDS.some(w => t.includes(w))) return "fear";
  if (ANGER_WORDS.some(w => t.includes(w))) return "anger";
  return null;
}

// =============================================
// GENERATE RESPONSE (keyword → fallback neutral)
// =============================================
function generateResponse(message) {
  const topic = detectTopic(message);
  return {
    reply: pick(topic || "neutral"),
    emotion: topic || "neutral"
  };
}

// =============================================
// CHAT ENDPOINT
// =============================================
router.post("/", async (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message)
    return res.status(400).json({ message: "Missing user_id or message" });

  // Try the external Python AI first (if AI_URL env var is set)
  const AI_URL = process.env.AI_URL || null;
  if (AI_URL) {
    try {
      const aiRes = await axios.post(`${AI_URL}/chat`, {
        session_id: String(user_id),
        message: message,
      });
      const { bot: aiResponse, emotion } = aiRes.data;
      saveChat(user_id, message, aiResponse);
      return res.json({ reply: aiResponse, emotion });
    } catch (err) {
      console.warn("Python AI unreachable, using built-in engine:", err.message);
    }
  }

  // Built-in keyword/response engine (always works)
  const { reply, emotion } = generateResponse(message);
  saveChat(user_id, message, reply);
  res.json({ reply, emotion });
});

// =============================================
// HELPER: save chat to DB
// =============================================
function saveChat(user_id, userMsg, botMsg) {
  const sql = "INSERT INTO chat_history (user_id, session_id, message, sender, created_at) VALUES (?, ?, ?, ?, NOW())";
  db.query(sql, [user_id, 'default-session', userMsg, 'user'], (err) => {
    if (err) console.error("DB insert error (user):", err);
  });
  db.query(sql, [user_id, 'default-session', botMsg, 'bot'], (err) => {
    if (err) console.error("DB insert error (bot):", err);
  });
}

// =============================================
// CHAT HISTORY
// =============================================
router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;