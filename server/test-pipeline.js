import { runPipeline } from "./pipeline.js";

const state = await runPipeline("impact of AI on healthcare");
console.log("===== DRAFT =====\n", state.draft);
console.log("\n===== CRITIQUE =====\n", state.critique);
console.log("\n===== FINAL DRAFT =====\n", state.finalDraft);