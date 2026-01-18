
import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");
const ADHYAKSH_PASSWORD = "kirtan123";

app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  res.json(data);
});

app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADHYAKSH_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.post("/update", (req, res) => {
  const { password, data } = req.body;
  if (password !== ADHYAKSH_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
