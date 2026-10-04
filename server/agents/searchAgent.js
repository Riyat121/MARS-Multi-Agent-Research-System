import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function searchAgent(topic, maxResults = 5) {
  const res = await axios.post(
    "https://api.tavily.com/search",
    { query: topic, max_results: maxResults },
    { headers: { Authorization: `Bearer ${process.env.TAVILY_API_KEY}` } }
  );

  return res.data.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
  }));
}