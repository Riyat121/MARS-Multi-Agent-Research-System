import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function askLLM(system, user, model = process.env.GROQ_MODEL, retries = 4) {
    const MAX_USER_CHARS = 11000;
if (user.length > MAX_USER_CHARS) user = user.slice(0, MAX_USER_CHARS);
  for (let i = 0; i <= retries; i++) {
    console.log(model, "~input tokens:", Math.round((system.length + user.length) / 4));
    try {
      const res = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        max_completion_tokens: 2000,
        ...(model.startsWith("openai/") && { reasoning_effort: "low" }),
      });
      return res.choices[0].message.content;
    } catch (err) {
      if (err.status === 429 && i < retries) {
        const m = err.message.match(/try again in ([\d.]+)s/);
        const wait = m ? Math.ceil(parseFloat(m[1]) * 1000) + 1000 : 10000;
        console.log(`429 on ${model}, retrying in ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}