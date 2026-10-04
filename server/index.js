import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import researchRoutes from "./routes/research.js";
import { connectDB } from "./config/db.js";   

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/research", researchRoutes);

app.get("/", (req, res) => res.send("MAS API running"));

const PORT = process.env.PORT || 5000;
connectDB()
.then(() => {
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
})
.catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));