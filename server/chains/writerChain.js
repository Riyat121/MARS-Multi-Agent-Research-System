import { askLLM } from "../config/llm.js";

export async function writerChain(state) {
  const sources = state.scrapedContent
    .map((s, i) => `[${i + 1}] ${s.title} (${s.url})\n${s.content}`)
    .join("\n\n");

 const system =
  "You are a research writer. Write a concise structured report (about 600 words) using ONLY the provided sources. " +
  "Use markdown: # for title, ## for sections, bullet lists. Do NOT use tables or HTML tags. " +
  "Cite sources like [1], [2] and end with a Sources list. Do not invent facts.";
  const user = `Topic: ${state.topic}\n\nSources:\n${sources}`;

  return askLLM(system, user, process.env.WRITER_MODEL);

}