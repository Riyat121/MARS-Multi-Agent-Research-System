import { searchAgent } from "./agents/searchAgent.js";
import { readerAgent } from "./agents/readerAgent.js";
import { writerChain } from "./chains/writerChain.js";
import { criticChain } from "./chains/criticChain.js";
import { reviseChain } from "./chains/reviseChain.js";   // top pe import add


export async function runPipeline(topic) {
  const state = {
    topic,
    searchResults: [],
    scrapedContent: [],
    draft: "",
    critique: "",
    finalDraft: "",  // add finalDraft to state
  };

  state.searchResults = await searchAgent(topic);
  state.scrapedContent = await readerAgent(state.searchResults);
  state.draft = await writerChain(state);
  state.critique = await criticChain(state);
    state.finalDraft = await reviseChain(state);  // add finalDraft to state

  return state;
}
