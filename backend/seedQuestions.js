import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./quiz-app.db",
  logging: false,
});

const Question = sequelize.define("Question", {
  question: { type: DataTypes.STRING, allowNull: false },
  options: { type: DataTypes.TEXT, allowNull: false },
  answer: { type: DataTypes.STRING, allowNull: false },
});

await sequelize.sync();

const questions = [
  {
    question: "What is the capital of France?",
    options: JSON.stringify(["Berlin", "London", "Paris", "Madrid"]),
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: JSON.stringify(["Earth", "Mars", "Jupiter", "Venus"]),
    answer: "Mars",
  },
  {
    question: "Who wrote 'Hamlet'?",
    options: JSON.stringify(["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"]),
    answer: "William Shakespeare",
  },
];

for (const q of questions) {
  const exists = await Question.findOne({ where: { question: q.question } });
  if (!exists) await Question.create(q);
}

console.log("Questions seeded successfully!");
await sequelize.close();
