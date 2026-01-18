import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");
const ADHYAKSH_PASSWORD = "kirtan123";

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* ================= PUBLIC ================= */

app.get("/data", (req, res) => {
  const data = readData();
  res.json(data);
});

/* ================= ADMIN ================= */

app.post("/login", (req, res) => {
  if (req.body.password === ADHYAKSH_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

/*
  Monthly update:
  body = { password, memberId, month (YYYY-MM), paid (true/false) }
*/
app.post("/monthly-update", (req, res) => {
  const { password, memberId, month, paid } = req.body;

  if (password !== ADHYAKSH_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const data = readData();
  const member = data.members.find(m => m.id === memberId);

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  if (!member.monthlyPayments) {
    member.monthlyPayments = {};
  }

  member.monthlyPayments[month] = paid;
  writeData(data);

  res.json({ success: true });
});

/*
  Full update (admin save all)
*/
app.post("/update", (req, res) => {
  const { password, data } = req.body;

  if (password !== ADHYAKSH_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  data.members.forEach(m => {
    if (!m.monthlyPayments) m.monthlyPayments = {};
    if (!m.loan) {
      m.loan = {
        taken: false,
        amount: 0,
        interest: 0,
        dueDate: null,
        outstanding: 0
      };
    }
  });

  writeData(data);
  res.json({ success: true });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on http://localhost:3000");
});
