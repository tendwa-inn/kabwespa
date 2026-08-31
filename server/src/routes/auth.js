const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../supabaseClient");
const upload = require("../upload");
const { uploadPhoto } = require("../storage");
const { sign, requireAuth } = require("../middleware/auth");

const router = express.Router();

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    phone: row.phone,
    area: row.area,
    photo: row.photo,
    verified: !!row.photo,
    role: row.role || "user",
  };
}

router.get("/check-username", async (req, res) => {
  const { username } = req.query || {};
  if (!username || String(username).trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .ilike("username", String(username).trim())
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ available: !data });
});

router.post("/signup", async (req, res) => {
  const { username, password, fullName, phone, area } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (String(username).trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: "Full name is required" });
  }
  if (!phone || !String(phone).trim()) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  if (!area || !String(area).trim()) {
    return res.status(400).json({ error: "Tell us which part of Kabwe you live in" });
  }
  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id")
    .ilike("username", String(username).trim())
    .maybeSingle();
  if (lookupError) return res.status(500).json({ error: lookupError.message });
  if (existing) return res.status(409).json({ error: "That username is already taken" });

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      username: String(username).trim(),
      full_name: String(fullName).trim(),
      phone: String(phone).trim(),
      area: String(area).trim(),
      role: "user",
      password_hash: bcrypt.hashSync(password, 10),
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  const token = sign({ sub: user.id, role: user.role, username: user.username });
  res.status(201).json({ token, user: toPublicUser(user) });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", String(username).trim())
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect username or password" });
  }
  const token = sign({ sub: user.id, role: user.role || "user", username: user.username });
  res.json({ token, user: toPublicUser(user) });
});

router.get("/me", requireAuth(["user", "manager", "admin"]), async (req, res) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("id", req.auth.sub).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "Account not found" });
  const token = sign({ sub: user.id, role: user.role || "user", username: user.username });
  res.json({ token, user: toPublicUser(user) });
});

router.put("/display-name", requireAuth(["user", "manager", "admin"]), async (req, res) => {
  const { fullName } = req.body || {};
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: "Enter a name" });
  }
  const { data: user, error } = await supabase
    .from("users")
    .update({ full_name: String(fullName).trim() })
    .eq("id", req.auth.sub)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "Account not found" });
  res.json({ user: toPublicUser(user) });
});

router.put("/username", requireAuth(["user", "manager", "admin"]), async (req, res) => {
  const { username } = req.body || {};
  const trimmed = String(username || "").trim();
  if (trimmed.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id")
    .ilike("username", trimmed)
    .neq("id", req.auth.sub)
    .maybeSingle();
  if (lookupError) return res.status(500).json({ error: lookupError.message });
  if (existing) return res.status(409).json({ error: "That username is already taken" });

  const { data: user, error } = await supabase
    .from("users")
    .update({ username: trimmed })
    .eq("id", req.auth.sub)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "Account not found" });
  const token = sign({ sub: user.id, role: user.role || "user", username: user.username });
  res.json({ token, user: toPublicUser(user) });
});

router.post("/change-password", requireAuth(["user", "manager", "admin"]), async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "Provide current password and a new password (6+ chars)" });
  }
  const { data: user, error } = await supabase.from("users").select("*").eq("id", req.auth.sub).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: bcrypt.hashSync(newPassword, 10) })
    .eq("id", req.auth.sub);
  if (updateError) return res.status(500).json({ error: updateError.message });
  res.json({ ok: true });
});

router.post("/photo", requireAuth(["user", "manager", "admin"]), upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
  let url;
  try {
    url = await uploadPhoto(req.file);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  const { data: user, error } = await supabase
    .from("users")
    .update({ photo: url })
    .eq("id", req.auth.sub)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: toPublicUser(user) });
});

module.exports = router;
