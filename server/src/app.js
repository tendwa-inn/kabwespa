require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminAuthRoutes = require("./routes/adminAuth");
const serviceRoutes = require("./routes/services");
const appointmentRoutes = require("./routes/appointments");
const transactionRoutes = require("./routes/transactions");
const promoCodeRoutes = require("./routes/promoCodes");
const userRoutes = require("./routes/users");
const assistantQuestionRoutes = require("./routes/assistantQuestions");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/promo-codes", promoCodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assistant-questions", assistantQuestionRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Something went wrong" });
});

module.exports = app;
