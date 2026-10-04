import mongoose from "mongoose";

const researchSchema = new mongoose.Schema(
  {
    topic: String,
    sources: [{ title: String, url: String }],
    draft: String,
    critique: String,
    finalDraft: String,
  },
  { timestamps: true }
);

export default mongoose.model("Research", researchSchema);