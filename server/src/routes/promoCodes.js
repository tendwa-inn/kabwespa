const express = require("express");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");
const { isPromoUsable, toPromoCode } = require("../lib/promo");

const router = express.Router();

router.get("/", requireAuth("admin"), async (req, res) => {
  const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ promoCodes: (data || []).map(toPromoCode) });
});

router.post("/", requireAuth("admin"), async (req, res) => {
  const { code, type, value, serviceId, expiresAt, maxUses } = req.body || {};
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: "Code, type and value are required" });
  }
  if (!["percent", "fixed"].includes(type)) {
    return res.status(400).json({ error: "Type must be 'percent' or 'fixed'" });
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return res.status(400).json({ error: "Value must be a positive number" });
  }
  let expiresAtIso = null;
  if (expiresAt) {
    const d = new Date(expiresAt);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ error: "Enter a valid expiry date" });
    d.setHours(23, 59, 59, 999);
    expiresAtIso = d.toISOString();
  }
  let maxUsesNum = null;
  if (maxUses !== undefined && maxUses !== null && maxUses !== "") {
    maxUsesNum = Number(maxUses);
    if (!Number.isInteger(maxUsesNum) || maxUsesNum <= 0) {
      return res.status(400).json({ error: "Max uses must be a positive whole number" });
    }
  }
  const normalized = String(code).trim().toUpperCase();
  try {
    const { data: existing, error: lookupError } = await supabase
      .from("promo_codes")
      .select("id")
      .eq("code", normalized)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing) return res.status(409).json({ error: "That promo code already exists" });

    let service = null;
    if (serviceId) {
      const { data: svc, error: svcError } = await supabase.from("services").select("*").eq("id", serviceId).maybeSingle();
      if (svcError) throw new Error(svcError.message);
      if (!svc) return res.status(404).json({ error: "Service not found" });
      service = svc;
    }

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .insert({
        code: normalized,
        type,
        value: numeric,
        service_id: service ? service.id : null,
        service_name: service ? service.name : "All services",
        expires_at: expiresAtIso,
        max_uses: maxUsesNum,
        uses_count: 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ promoCode: toPromoCode(promo) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", requireAuth("admin"), async (req, res) => {
  const { error, count } = await supabase.from("promo_codes").delete({ count: "exact" }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "Promo code not found" });
  res.json({ ok: true });
});

router.post("/check", requireAuth(["user", "manager"]), async (req, res) => {
  const { code, serviceId } = req.body || {};
  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", String(code || "").trim())
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  const invalid = !promo || (promo.service_id && promo.service_id !== serviceId) || !isPromoUsable(promo || {}).ok;
  if (invalid) {
    const reason = promo ? isPromoUsable(promo).reason : null;
    const message =
      reason === "expired"
        ? "That promo code has expired"
        : reason === "limit_reached"
        ? "That promo code has reached its usage limit"
        : "Promo code not valid for this service";
    return res.status(404).json({ error: message });
  }
  res.json({ promoCode: toPromoCode(promo) });
});

module.exports = router;
