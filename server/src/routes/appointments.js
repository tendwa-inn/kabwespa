const express = require("express");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");
const { isPromoUsable } = require("../lib/promo");

const router = express.Router();

function toAppointment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    fullName: row.full_name,
    phone: row.phone,
    serviceId: row.service_id,
    serviceName: row.service_name,
    category: row.category,
    originalPrice: Number(row.original_price),
    price: Number(row.price),
    promoCode: row.promo_code,
    date: row.date,
    time: row.time,
    notes: row.notes || "",
    status: row.status,
    createdAt: row.created_at,
  };
}

async function resolvePromo(code, service) {
  if (!code) return { discount: 0, promo: null };
  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", String(code).trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!promo) return { discount: 0, promo: null, invalid: true };
  if (promo.service_id && promo.service_id !== service.id) {
    return { discount: 0, promo: null, invalid: true };
  }
  if (!isPromoUsable(promo).ok) {
    return { discount: 0, promo: null, invalid: true };
  }
  const discount =
    promo.type === "percent"
      ? Math.round((service.price * promo.value) / 100)
      : Math.min(promo.value, service.price);
  return { discount, promo };
}

router.post("/", requireAuth(["user", "manager"]), async (req, res) => {
  const { serviceId, date, time, notes, promoCode } = req.body || {};
  if (!serviceId || !date || !time) {
    return res.status(400).json({ error: "Service, date and time are required" });
  }
  try {
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();
    if (serviceError) throw new Error(serviceError.message);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.auth.sub)
      .maybeSingle();
    if (userError) throw new Error(userError.message);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { discount, promo, invalid } = await resolvePromo(promoCode, service);
    if (promoCode && invalid) {
      return res.status(400).json({ error: "That promo code isn't valid, has expired, or has reached its usage limit" });
    }
    const finalPrice = Math.max(0, Number(service.price) - discount);

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        user_id: user.id,
        username: user.username,
        full_name: user.full_name,
        phone: user.phone,
        service_id: service.id,
        service_name: service.name,
        category: service.category,
        original_price: service.price,
        price: finalPrice,
        promo_code: promo ? promo.code : null,
        date: String(date),
        time: String(time),
        notes: notes ? String(notes) : "",
        status: "booked",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (promo) {
      const { error: bumpError } = await supabase
        .from("promo_codes")
        .update({ uses_count: (promo.uses_count || 0) + 1 })
        .eq("id", promo.id);
      if (bumpError) throw new Error(bumpError.message);
    }

    res.status(201).json({ appointment: toAppointment(appointment) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/mine", requireAuth(["user", "manager"]), async (req, res) => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", req.auth.sub)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ appointments: (data || []).map(toAppointment) });
});

router.delete("/:id", requireAuth(["user", "manager"]), async (req, res) => {
  const { error, count } = await supabase
    .from("appointments")
    .delete({ count: "exact" })
    .eq("id", req.params.id)
    .eq("user_id", req.auth.sub);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "Appointment not found" });
  res.json({ ok: true });
});

router.get("/", requireAuth("admin"), async (req, res) => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ appointments: (data || []).map(toAppointment) });
});

module.exports = router;
