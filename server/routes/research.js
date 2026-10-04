import express from "express";
import { runPipeline } from "../pipeline.js";
import Research from "../models/Research.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests, try again later" },
});
const router = express.Router();

router.post("/", limiter, async (req, res) => {
  const { topic } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: "topic is required" });
  }
  try {
    const state = await runPipeline(topic.trim());
    let id = null;
    try {
      const saved = await Research.create({
        topic: state.topic,
        sources: state.scrapedContent.map((s) => ({ title: s.title, url: s.url })),
        draft: state.draft,
        critique: state.critique,
        finalDraft: state.finalDraft,
      });
      id = saved._id;
    } catch (dbErr) {
      console.error("DB save failed:", dbErr.message);
    }
    res.json({ id, ...state });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Pipeline failed", detail: err.message });
  }
});

router.get("/", async (req, res) => {
  const list = await Research.find({}, "topic createdAt").sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Research.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
});

export default router;