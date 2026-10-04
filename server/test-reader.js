import { searchAgent } from "./agents/searchAgent.js";
import { readerAgent } from "./agents/readerAgent.js";

const results = await searchAgent("impact of AI on healthcare");
const scraped = await readerAgent(results);
scraped.forEach((s) => console.log(s.url, "->", s.content.length, "chars"));