import { askLLM } from "../config/llm.js";

export async function reviseChain(state) {
  const sources = state.scrapedContent
    .map((s, i) => `[${i + 1}] ${s.title} (${s.url})\n${s.content.slice(0, 400)}`)
    .join("\n\n");

  const system =
    "You are a research writer revising your report using the critic's feedback. " +
    "Use ONLY the provided sources. Apply feedback where the sources allow it. " +
    "If feedback asks for information not in the sources, ignore that point. " +
    "Never add regulations, statistics, named organisations or study results unless they literally appear in the sources. " +
    "Use plain markdown only; never use HTML tags like <br>. " +
    "Keep markdown headings, [n] citations and the Sources list. Output only the revised report.";

  const user =
    `Topic: ${state.topic}\n\n` +
    `Critic feedback:\n${state.critique.slice(0, 1800)}\n\n` +
    `Sources:\n${sources}\n\n` +
    `Current draft:\n${state.draft.slice(0, 4500)}`;

  return askLLM(system, user, process.env.REVISE_MODEL);
}