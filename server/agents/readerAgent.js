import axios from "axios";
import * as cheerio from "cheerio";
import { cleanText } from "../utils/cleanText.js";

async function readUrl(url) {
  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(data);
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();
  const text = $("article").text() || $("main").text() || $("body").text();
  return cleanText(text);
}

export async function readerAgent(searchResults) {
  const settled = await Promise.allSettled(
    searchResults.map(async (r) => ({
      title: r.title,
      url: r.url,
      content: await readUrl(r.url),
    }))
  );

  // fail hua page skip, snippet fallback
  return settled.map((s, i) =>
    s.status === "fulfilled" && s.value.content.length > 200
      ? s.value
      : {
          title: searchResults[i].title,
          url: searchResults[i].url,
          content: cleanText(searchResults[i].snippet),
        }
  );
}