import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "SUPER_SECRET_KEY";

// Initialize SQLite DB
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./quiz-app.db",
  logging: false,
});

// ===== MODELS =====
const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Question = sequelize.define("Question", {
  question: { type: DataTypes.STRING, allowNull: false },
  options: { type: DataTypes.TEXT, allowNull: false }, // JSON string
  answer: { type: DataTypes.STRING, allowNull: false },
});

const Result = sequelize.define("Result", {
  score: { type: DataTypes.INTEGER, allowNull: false },
  passed: { type: DataTypes.BOOLEAN, allowNull: false },
});

User.hasMany(Result);
Result.belongsTo(User);

await sequelize.sync({ alter: true });
console.log("SQLite DB synced");

// ===== AUTH =====
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed });

    const token = jwt.sign({ id: user.id }, SECRET);
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email }, 
      token 
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id }, SECRET);
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email }, 
      token 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ===== QUIZ APIs =====
app.get("/quiz/questions", async (req, res) => {
  const questions = await Question.findAll();
  const formatted = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: JSON.parse(q.options),
    answer: q.answer,
  }));
  res.json(formatted);
});

app.post("/quiz/result", async (req, res) => {
  const { userId, score, passed } = req.body;
  const result = await Result.create({ UserId: userId, score, passed });
  res.json(result);
});

app.get("/quiz/results/:userId", async (req, res) => {
  const results = await Result.findAll({ where: { UserId: req.params.userId } });
  res.json(results);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
