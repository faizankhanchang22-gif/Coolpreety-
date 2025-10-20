import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const BOT_TOKEN = "8028942186:AAHbloJnS0H4LhmVA3Q1hpoyJ5VtETvthqY";
const API_URL = "https://likes-by-dugu-yfkl.vercel.app/like";
const ALLOWED_GROUP_ID = -1003089918721;

const REQUIRED_CHANNELS = [
  "@owner_of_this_all",
  "@freefirelkies",
  "https://t.me/+KIFczlOSbYc5OWE9",
  "https://t.me/+kYroGKs753I4Njc1"
];

app.post("/api/webhook", async (req, res) => {
  const msg = req.body?.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text?.trim();

  if (chatId !== ALLOWED_GROUP_ID) {
    await send(chatId, "❌ This bot only works in the official group!");
    return res.sendStatus(200);
  }

  for (const ch of REQUIRED_CHANNELS) {
    if (ch.startsWith("https://t.me/+")) continue;
    const resCheck = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${ch}&user_id=${userId}`
    );
    const status = resCheck.data?.result?.status || "";
    if (!["member", "administrator", "creator"].includes(status)) {
      await send(chatId, `⚠️ Join all channels first:\n\n${REQUIRED_CHANNELS.join("\n")}`);
      return res.sendStatus(200);
    }
  }

  if (text === "/start") {
    await send(chatId, "👋 Welcome! Send your UID to get likes instantly!");
  } else if (/^\d+$/.test(text)) {
    const resLike = await axios.get(`${API_URL}?uid=${text}&server_name=ind`);
    await send(chatId, `✅ Likes sent!\n\nAPI Response:\n${resLike.data}`);
  } else {
    await send(chatId, "📩 Please send your Free Fire UID!");
  }

  res.sendStatus(200);
});

async function send(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text,
  });
}

app.get("/", (req, res) => res.send("✅ Bot is live on Vercel!"));

export default app;
