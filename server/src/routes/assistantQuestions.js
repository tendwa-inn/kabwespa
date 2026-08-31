const express = require("express");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const CATEGORIES = ["location", "contact", "massage", "beauty", "videos", "booking", "general"];

function toQuestion(row) {
  return { id: row.id, question: row.question, answer: row.answer, category: row.category };
}

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("assistant_questions").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ questions: (data || []).map(toQuestion), categories: CATEGORIES });
});

router.post("/", requireAuth("admin"), async (req, res) => {
  const { question, answer, category } = req.body || {};
  if (!question || !String(question).trim() || !answer || !String(answer).trim()) {
    return res.status(400).json({ error: "Question and answer are required" });
  }
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }
  const { data: item, error } = await supabase
    .from("assistant_questions")
    .insert({ question: String(question).trim(), answer: String(answer).trim(), category: category || "general" })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ question: toQuestion(item) });
});

router.put("/:id", requireAuth("admin"), async (req, res) => {
  const { question, answer, category } = req.body || {};
  const patch = {};
  if (question !== undefined) {
    if (!String(question).trim()) return res.status(400).json({ error: "Question cannot be empty" });
    patch.question = String(question).trim();
  }
  if (answer !== undefined) {
    if (!String(answer).trim()) return res.status(400).json({ error: "Answer cannot be empty" });
    patch.answer = String(answer).trim();
  }
  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category" });
    patch.category = category;
  }
  const { data: item, error } = await supabase
    .from("assistant_questions")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!item) return res.status(404).json({ error: "Question not found" });
  res.json({ question: toQuestion(item) });
});

router.delete("/:id", requireAuth("admin"), async (req, res) => {
  const { error, count } = await supabase.from("assistant_questions").delete({ count: "exact" }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "Question not found" });
  res.json({ ok: true });
});

module.exports = router;
