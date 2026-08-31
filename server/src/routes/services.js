const express = require("express");
const supabase = require("../supabaseClient");
const upload = require("../upload");
const { uploadPhoto } = require("../storage");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function toService(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    price: Number(row.price),
    photo: row.photo,
    description: row.description || "",
    videoUrl: row.video_url,
  };
}

function toSlide(row) {
  return { id: row.id, caption: row.caption, photo: row.photo };
}

function toLocationPhoto(row) {
  return { id: row.id, photo: row.photo, caption: row.caption || "" };
}

async function buildSettings() {
  const { data: settingsRow, error: settingsError } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (settingsError) throw new Error(settingsError.message);
  const { data: slides, error: slidesError } = await supabase
    .from("welcome_slides")
    .select("*")
    .order("sort_order", { ascending: true });
  if (slidesError) throw new Error(slidesError.message);
  const { data: photos, error: photosError } = await supabase
    .from("location_photos")
    .select("*")
    .order("created_at", { ascending: true });
  if (photosError) throw new Error(photosError.message);

  return {
    logo: settingsRow.logo,
    heroPhoto: settingsRow.hero_photo,
    centerPhone: settingsRow.center_phone,
    whatsappNumbers: settingsRow.whatsapp_numbers,
    whatsappBubbleNumber: settingsRow.whatsapp_bubble_number,
    location: settingsRow.location,
    locationCoords:
      settingsRow.location_lat != null && settingsRow.location_lng != null
        ? { lat: Number(settingsRow.location_lat), lng: Number(settingsRow.location_lng) }
        : null,
    locationPhotos: (photos || []).map(toLocationPhoto),
    welcomeSlides: (slides || []).map(toSlide),
  };
}

router.get("/", async (req, res) => {
  try {
    const { data: services, error } = await supabase.from("services").select("*").order("category");
    if (error) throw new Error(error.message);
    const settings = await buildSettings();
    res.json({ services: (services || []).map(toService), settings });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", requireAuth("admin"), async (req, res) => {
  const { category, name, price, description } = req.body || {};
  if (!["massage", "beauty"].includes(category)) {
    return res.status(400).json({ error: "Category must be 'massage' or 'beauty'" });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Service name is required" });
  }
  const numeric = Number(price);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return res.status(400).json({ error: "Price must be a positive number" });
  }
  const { data: service, error } = await supabase
    .from("services")
    .insert({
      category,
      name: String(name).trim(),
      price: numeric,
      description: description ? String(description).trim() : "",
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ service: toService(service) });
});

router.delete("/:id", requireAuth("admin"), async (req, res) => {
  const { error, count } = await supabase.from("services").delete({ count: "exact" }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: "Service not found" });
  res.json({ ok: true });
});

router.put("/:id", requireAuth("admin"), async (req, res) => {
  const { price, description, name, videoUrl } = req.body || {};
  const patch = {};
  if (price !== undefined) {
    const numeric = Number(price);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    patch.price = numeric;
  }
  if (description !== undefined) patch.description = String(description);
  if (name !== undefined && String(name).trim()) patch.name = String(name).trim();
  if (videoUrl !== undefined) {
    const trimmed = String(videoUrl).trim();
    if (!trimmed) {
      patch.video_url = null;
    } else if (/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(trimmed)) {
      patch.video_url = trimmed;
    } else {
      return res.status(400).json({ error: "Enter a valid YouTube link" });
    }
  }
  const { data: service, error } = await supabase
    .from("services")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ service: toService(service) });
});

router.post("/:id/photo", requireAuth("admin"), upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
  try {
    const url = await uploadPhoto(req.file);
    const { data: service, error } = await supabase
      .from("services")
      .update({ photo: url })
      .eq("id", req.params.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json({ service: toService(service) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/logo-photo", requireAuth("admin"), upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
  try {
    const url = await uploadPhoto(req.file);
    const { error } = await supabase.from("settings").update({ logo: url }).eq("id", 1);
    if (error) throw new Error(error.message);
    res.json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/hero-photo", requireAuth("admin"), upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
  try {
    const url = await uploadPhoto(req.file);
    const { error } = await supabase.from("settings").update({ hero_photo: url }).eq("id", 1);
    if (error) throw new Error(error.message);
    res.json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/contact", requireAuth("admin"), async (req, res) => {
  const { centerPhone, whatsappNumbers, whatsappBubbleNumber, location } = req.body || {};
  const patch = {};
  if (centerPhone !== undefined) {
    if (!String(centerPhone).trim()) return res.status(400).json({ error: "Center phone is required" });
    patch.center_phone = String(centerPhone).trim();
  }
  if (whatsappNumbers !== undefined) {
    if (!Array.isArray(whatsappNumbers) || whatsappNumbers.some((n) => !String(n).trim())) {
      return res.status(400).json({ error: "Enter valid WhatsApp numbers" });
    }
    patch.whatsapp_numbers = whatsappNumbers.map((n) => String(n).trim());
  }
  if (whatsappBubbleNumber !== undefined) {
    if (!String(whatsappBubbleNumber).trim()) return res.status(400).json({ error: "WhatsApp bubble number is required" });
    patch.whatsapp_bubble_number = String(whatsappBubbleNumber).trim();
  }
  if (location !== undefined) {
    if (!String(location).trim()) return res.status(400).json({ error: "Location is required" });
    patch.location = String(location).trim();
  }
  try {
    const { error } = await supabase.from("settings").update(patch).eq("id", 1);
    if (error) throw new Error(error.message);
    res.json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/location", requireAuth("admin"), async (req, res) => {
  const { lat, lng } = req.body || {};
  try {
    if (lat === null && lng === null) {
      const { error } = await supabase.from("settings").update({ location_lat: null, location_lng: null }).eq("id", 1);
      if (error) throw new Error(error.message);
      return res.json({ settings: await buildSettings() });
    }
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum) || Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) {
      return res.status(400).json({ error: "Enter a valid latitude (-90 to 90) and longitude (-180 to 180)" });
    }
    const { error } = await supabase.from("settings").update({ location_lat: latNum, location_lng: lngNum }).eq("id", 1);
    if (error) throw new Error(error.message);
    res.json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/location-photos", requireAuth("admin"), upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
  try {
    const url = await uploadPhoto(req.file);
    const { error } = await supabase.from("location_photos").insert({
      photo: url,
      caption: req.body?.caption ? String(req.body.caption).trim() : "",
    });
    if (error) throw new Error(error.message);
    res.status(201).json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/location-photos/:photoId", requireAuth("admin"), async (req, res) => {
  try {
    const { error, count } = await supabase
      .from("location_photos")
      .delete({ count: "exact" })
      .eq("id", req.params.photoId);
    if (error) throw new Error(error.message);
    if (!count) return res.status(404).json({ error: "Photo not found" });
    res.json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/welcome-slides/:slideId/photo", requireAuth("admin"), upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
  try {
    const url = await uploadPhoto(req.file);
    const { data: slide, error } = await supabase
      .from("welcome_slides")
      .update({ photo: url })
      .eq("id", req.params.slideId)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!slide) return res.status(404).json({ error: "Slide not found" });
    res.json({ settings: await buildSettings() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
