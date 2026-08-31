const express = require("express");
const supabase = require("../supabaseClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function toTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    serviceId: row.service_id,
    serviceName: row.service_name,
    standardPrice: row.standard_price != null ? Number(row.standard_price) : undefined,
    isDiscounted: row.is_discounted,
    description: row.description,
    notes: row.notes || "",
    amount: Number(row.amount),
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function toCarriedForward(row) {
  return {
    id: row.id,
    amount: Number(row.amount),
    note: row.note || "",
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

async function recorderName(req) {
  const { data: user } = await supabase.from("users").select("full_name, username").eq("id", req.auth.sub).maybeSingle();
  if (!user) return req.auth.username;
  const name = user.full_name || user.username;
  return req.auth.role === "manager" ? `${name} (Manager)` : name;
}

async function computeSummary() {
  const { data: txs, error: txError } = await supabase.from("transactions").select("type, amount");
  if (txError) throw new Error(txError.message);
  const income = (txs || []).filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = (txs || []).filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const { data: cf, error: cfError } = await supabase.from("carried_forward_entries").select("amount");
  if (cfError) throw new Error(cfError.message);
  const carriedForward = (cf || []).reduce((s, e) => s + Number(e.amount), 0);
  return { income, expense, carriedForward, balance: income - expense + carriedForward };
}

router.get("/", requireAuth("admin"), async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: cfEntries, error: cfError } = await supabase
      .from("carried_forward_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (cfError) throw new Error(cfError.message);
    res.json({
      transactions: (transactions || []).map(toTransaction),
      carriedForwardEntries: (cfEntries || []).map(toCarriedForward),
      summary: await computeSummary(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/carried-forward", requireAuth("admin"), async (req, res) => {
  const { amount, note } = req.body || {};
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return res.status(400).json({ error: "Enter a valid amount" });
  }
  try {
    const { data: entry, error } = await supabase
      .from("carried_forward_entries")
      .insert({ amount: numeric, note: note ? String(note).trim() : "", created_by: await recorderName(req) })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ entry: toCarriedForward(entry), summary: await computeSummary() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/carried-forward/:id", requireAuth("admin"), async (req, res) => {
  const { amount, note } = req.body || {};
  const patch = {};
  if (amount !== undefined) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return res.status(400).json({ error: "Enter a valid amount" });
    patch.amount = numeric;
  }
  if (note !== undefined) patch.note = String(note).trim();
  try {
    const { data: entry, error } = await supabase
      .from("carried_forward_entries")
      .update(patch)
      .eq("id", req.params.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ entry: toCarriedForward(entry), summary: await computeSummary() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/carried-forward/:id", requireAuth("admin"), async (req, res) => {
  try {
    const { error, count } = await supabase
      .from("carried_forward_entries")
      .delete({ count: "exact" })
      .eq("id", req.params.id);
    if (error) throw new Error(error.message);
    if (!count) return res.status(404).json({ error: "Entry not found" });
    res.json({ ok: true, summary: await computeSummary() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/income", requireAuth(["admin", "manager"]), async (req, res) => {
  const { serviceId, amount, notes } = req.body || {};
  if (!serviceId || amount === undefined) {
    return res.status(400).json({ error: "Service and amount are required" });
  }
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  try {
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();
    if (serviceError) throw new Error(serviceError.message);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const { data: entry, error } = await supabase
      .from("transactions")
      .insert({
        type: "income",
        service_id: service.id,
        service_name: service.name,
        standard_price: service.price,
        amount: numeric,
        is_discounted: numeric < Number(service.price),
        notes: notes ? String(notes) : "",
        created_by: await recorderName(req),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ transaction: toTransaction(entry) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/expense", requireAuth(["admin", "manager"]), async (req, res) => {
  const { description, amount } = req.body || {};
  if (!description || amount === undefined) {
    return res.status(400).json({ error: "Description and amount are required" });
  }
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  try {
    const { data: entry, error } = await supabase
      .from("transactions")
      .insert({
        type: "expense",
        description: String(description),
        amount: numeric,
        created_by: await recorderName(req),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.status(201).json({ transaction: toTransaction(entry) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", requireAuth("admin"), async (req, res) => {
  const { error, count } = await supabase.from("transactions").delete({ count: "exact" }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "Transaction not found" });
  res.json({ ok: true });
});

module.exports = router;
