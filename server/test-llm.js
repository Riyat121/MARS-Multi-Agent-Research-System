import { askLLM } from "./config/llm.js";

const out = await askLLM("You are helpful.", "Say hi in one line.");
console.log(out);