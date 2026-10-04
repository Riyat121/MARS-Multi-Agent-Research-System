import { askLLM } from "../config/llm.js";

export async function criticChain(state) {
 const system =
  "You are a strict research critic. Review the report ONLY against the provided sources. " +
  "Check: claims not supported by the sources, missing or wrong citations, gaps, bias, clarity. " +
  "Only suggest an addition if you can point to the exact source text that supports it; never claim a source mentions something unless it does. " +
  "Do NOT invent or suggest external papers, authors, or studies. " +
  "Keep the review under 250 words. Use bullet lists, no tables. " +
  "Give a score out of 10 and 3-5 concrete improvements.";
const user = `Topic: ${state.topic}\n\nSources:\n${state.scrapedContent
  .map((s, i) => `[${i + 1}] ${s.title} (${s.url})\n${s.content.slice(0, 800)}`)
  .join("\n\n")}\n\nReport:\n${state.draft}`;

  return askLLM(system, user, process.env.CRITIC_MODEL);

}