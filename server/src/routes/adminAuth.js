const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../supabaseClient");
const { sign, requireAuth } = require("../middleware/auth");

const router = express.Router();

function toPublicAdmin(row) {
  return { id: row.id, username: row.username, displayName: row.display_name || row.username };
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .ilike("username", String(username).trim())
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Incorrect admin username or password" });
  }
  const token = sign({ sub: admin.id, role: "admin", username: admin.username });
  res.json({ token, admin: toPublicAdmin(admin) });
});

router.get("/me", requireAuth("admin"), async (req, res) => {
  const { data: admin, error } = await supabase.from("admins").select("*").eq("id", req.auth.sub).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  res.json({ admin: toPublicAdmin(admin) });
});

router.put("/display-name", requireAuth("admin"), async (req, res) => {
  const { displayName } = req.body || {};
  if (!displayName || !String(displayName).trim()) {
    return res.status(400).json({ error: "Enter a display name" });
  }
  const { data: admin, error } = await supabase
    .from("admins")
    .update({ display_name: String(displayName).trim() })
    .eq("id", req.auth.sub)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  res.json({ admin: toPublicAdmin(admin) });
});

router.post("/change-password", requireAuth("admin"), async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "Provide current password and a new password (6+ chars)" });
  }
  const { data: admin, error } = await supabase.from("admins").select("*").eq("id", req.auth.sub).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  const { error: updateError } = await supabase
    .from("admins")
    .update({ password_hash: bcrypt.hashSync(newPassword, 10) })
    .eq("id", req.auth.sub);
  if (updateError) return res.status(500).json({ error: updateError.message });
  res.json({ ok: true });
});

module.exports = router;
