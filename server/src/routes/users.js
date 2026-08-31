const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth("admin"), async (req, res) => {
  try {
    const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: appointments, error: apptError } = await supabase.from("appointments").select("user_id");
    if (apptError) throw new Error(apptError.message);
    const counts = {};
    (appointments || []).forEach((a) => {
      counts[a.user_id] = (counts[a.user_id] || 0) + 1;
    });
    res.json({
      users: (users || []).map((u) => ({
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        phone: u.phone,
        area: u.area || "",
        verified: !!u.photo,
        role: u.role || "user",
        createdAt: u.created_at,
        appointmentCount: counts[u.id] || 0,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", requireAuth("admin"), async (req, res) => {
  const { username, password, fullName, phone, area, role } = req.body || {};
  if (!username || String(username).trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: "Full name is required" });
  }
  if (role && !["user", "manager"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'user' or 'manager'" });
  }
  try {
    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .ilike("username", String(username).trim())
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing) return res.status(409).json({ error: "That username is already taken" });

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        username: String(username).trim(),
        full_name: String(fullName).trim(),
        phone: phone ? String(phone).trim() : "",
        area: area ? String(area).trim() : "",
        role: role || "manager",
        password_hash: bcrypt.hashSync(password, 10),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        phone: user.phone,
        area: user.area,
        verified: false,
        role: user.role,
        createdAt: user.created_at,
        appointmentCount: 0,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id/role", requireAuth("admin"), async (req, res) => {
  const { role } = req.body || {};
  if (!["user", "manager"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'user' or 'manager'" });
  }
  const { data: user, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: { id: user.id, role: user.role } });
});

router.post("/:id/promote-to-admin", requireAuth("admin"), async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", req.params.id).maybeSingle();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { data: existingAdmin, error: lookupError } = await supabase
      .from("admins")
      .select("id")
      .ilike("username", user.username)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existingAdmin) return res.status(409).json({ error: "An admin account with this username already exists" });

    const { data: admin, error } = await supabase
      .from("admins")
      .insert({
        username: user.username,
        display_name: user.full_name || user.username,
        password_hash: user.password_hash,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ admin: { id: admin.id, username: admin.username, displayName: admin.display_name } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", requireAuth("admin"), async (req, res) => {
  const { error, count } = await supabase.from("users").delete({ count: "exact" }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "User not found" });
  res.json({ ok: true });
});

module.exports = router;
