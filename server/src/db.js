const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function defaultServices() {
  const massage = [
    ["Swedish Massage", 250],
    ["Thai Massage", 300],
    ["Deep Tissue Massage", 350],
    ["Full Body Massage", 350],
    ["Traditional Rinsing Massage", 400],
    ["Couples Massage", 700],
    ["Four Hands Massage", 600],
    ["Gentleman's Essence Package", 1000],
  ];
  const beauty = [
    ["Facial Scrubbing", 250],
    ["Full Scrubbing", 600],
    ["Face Waxing", 200],
    ["Full Waxing", 800],
    ["Pedicure", 200],
  ];
  const descriptions = {
    "Swedish Massage": "Gentle, flowing strokes to ease tension and help you unwind.",
    "Thai Massage": "Assisted stretching and rhythmic pressure to loosen tight muscles.",
    "Deep Tissue Massage": "Firm, targeted pressure for chronic tension and tight spots.",
    "Full Body Massage": "A head-to-toe session for complete relaxation and renewal.",
    "Traditional Rinsing Massage": "A classic massage finished with a warm, refreshing rinse.",
    "Couples Massage": "Side-by-side massage for two, at the same time and pace.",
    "Four Hands Massage": "Two therapists working in sync for a deeply immersive session.",
    "Gentleman's Essence Package": "A signature grooming and relaxation experience for him.",
    "Facial Scrubbing": "A refreshing scrub to clear and brighten the skin.",
    "Full Scrubbing": "A full-body exfoliation leaving skin soft and renewed.",
    "Face Waxing": "Smooth, precise waxing for a clean, polished look.",
    "Full Waxing": "Complete body waxing for lasting smoothness.",
    Pedicure: "Foot care and polish to leave you fresh and pampered.",
  };
  const videoUrls = {
    "Swedish Massage": "https://www.youtube.com/watch?v=kqBMbW6tHI4",
    "Thai Massage": "https://www.youtube.com/watch?v=SG3qDnJVaRg",
    "Deep Tissue Massage": "https://www.youtube.com/watch?v=rd2XcsRq3TY",
    "Full Body Massage": "https://www.youtube.com/watch?v=iYzeKEQ5XhI",
    "Traditional Rinsing Massage": "https://www.youtube.com/watch?v=s1kq9nuhn68",
    "Couples Massage": "https://www.youtube.com/watch?v=yzmOharNan0",
    "Four Hands Massage": "https://www.youtube.com/watch?v=W_52tZRd4Gg",
  };
  const toRecord = (category) => ([name, price]) => ({
    id: uuid(),
    category,
    name,
    price,
    photo: null,
    description: descriptions[name] || "",
    videoUrl: videoUrls[name] || null,
  });
  return [...massage.map(toRecord("massage")), ...beauty.map(toRecord("beauty"))];
}

function defaultAssistantQuestions() {
  const items = [
    ["general", "What should I wear during my session?", "You'll be draped with a towel or sheet at all times, and only the area being worked on is uncovered. Most guests undress to their comfort level. Our therapists are trained to maintain your privacy and comfort throughout."],
    ["booking", "How early should I arrive for my appointment?", "Please arrive about 10–15 minutes early so you can settle in, fill in a short intake form if it's your first visit, and relax before your session begins."],
    ["massage", "What's the difference between Swedish and Deep Tissue massage?", "Swedish massage uses long, flowing strokes for gentle relaxation. Deep Tissue works on deeper muscle layers with firmer pressure, ideal for chronic tension or muscle tightness. Let your therapist know your preference before starting."],
    ["massage", "Is it normal to feel sore after a massage?", "Mild soreness for a day, especially after a Deep Tissue session, is common and usually fades quickly. Drinking water afterward helps. If discomfort continues beyond a couple of days, please contact us."],
    ["booking", "Can I request a specific therapist?", "Yes, you're welcome to request a therapist you've enjoyed before, subject to availability. Just mention it when booking or let our front desk know."],
    ["booking", "What if I need to cancel or reschedule?", "You can cancel a booking from your Appointments tab any time before your visit. If you'd like to reschedule instead, cancel the current slot and book a new time that works for you."],
    ["general", "How should I prepare, and what should I do afterward?", "Arrive hydrated and avoid a heavy meal right before your session. Afterward, drink plenty of water, move gently, and give yourself a little time to rest before rushing back into your day."],
    ["massage", "What is the Couples Massage like?", "Two guests are treated side by side in the same room by two therapists, at the same pace. It's a relaxed shared experience — great for partners, friends, or family."],
    ["massage", "What is a Four Hands massage?", "Two therapists work on you at the same time with synchronized movements. It's deeply relaxing and often chosen by guests who want a more immersive session."],
    ["massage", "What's included in the Gentleman's Essence Package?", "It's our signature package tailored for a complete grooming and relaxation experience. Ask our front desk for the full breakdown when you book, as it may be customised to what's available that day."],
    ["general", "How much do your services cost?", "You can see up-to-date pricing for every massage and beauty service on the Services tab. Prices are shown in Kwacha (K) and are kept current by our team."],
    ["booking", "How do I use a promo code?", "When booking an appointment, there's a promo code field before you confirm. Enter your code there and the discount will be applied automatically if it's valid for that service."],
    ["location", "Where are you located and how do I reach you?", "We're in Highridge, Kabwe. You can call or WhatsApp us directly from the Contact tab — we're happy to help with anything not covered here."],
    ["contact", "How do I contact the spa directly?", "Call or WhatsApp us straight from the Contact tab in the app, or from your Profile once signed in — both the center number and WhatsApp are one tap away."],
    ["beauty", "What beauty treatments do you offer?", "Facial scrubbing, full body scrubbing, face and full waxing, and pedicures — check the Beauty tab on Services for current prices."],
    ["videos", "Can I watch what a treatment looks like before booking?", "Yes — on the Services tab, treatments with a video have a Watch button so you can see what to expect before you book."],
    ["booking", "Can I book an appointment through this assistant?", "This assistant answers common questions, but booking itself happens on the Book tab, where you can pick a service, date and time in a few taps."],
  ];
  return items.map(([category, question, answer]) => ({ id: uuid(), category, question, answer }));
}

function seedData() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "KabweAdmin2026";
  return {
    users: [],
    admins: [
      {
        id: uuid(),
        username: adminUsername,
        displayName: "Admin",
        passwordHash: bcrypt.hashSync(adminPassword, 10),
        createdAt: new Date().toISOString(),
      },
    ],
    services: defaultServices(),
    appointments: [],
    transactions: [],
    carriedForwardEntries: [],
    promoCodes: [],
    assistantQuestions: defaultAssistantQuestions(),
    settings: {
      logo: null,
      heroPhoto: null,
      centerPhone: "+26077686722",
      whatsappNumbers: ["+260974068912", "+260772180359"],
      whatsappBubbleNumber: "+260974068912",
      location: "Highridge, Kabwe",
      locationCoords: null,
      locationPhotos: [],
      welcomeSlides: [
        {
          id: uuid(),
          caption: "Traditional Swedish & Deep Tissue Techniques",
          photo: null,
        },
        {
          id: uuid(),
          caption: "Couples & Four Hands Experiences",
          photo: null,
        },
        {
          id: uuid(),
          caption: "Beauty Rituals & Full Body Renewal",
          photo: null,
        },
      ],
    },
  };
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData(), null, 2));
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

let writeQueue = Promise.resolve();
function writeDb(data) {
  writeQueue = writeQueue.then(
    () =>
      new Promise((resolve, reject) => {
        fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), (err) => {
          if (err) reject(err);
          else resolve();
        });
      })
  );
  return writeQueue;
}

module.exports = { readDb, writeDb, uuid };
