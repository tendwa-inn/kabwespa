require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mime = require("./mimeMap");
const supabase = require("./supabaseClient");
const { uploadPhoto } = require("./storage");

const DB_FILE = path.join(__dirname, "..", "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function loadDb() {
  if (!fs.existsSync(DB_FILE)) throw new Error(`No local database found at ${DB_FILE}`);
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

async function migratePhoto(localPath) {
  if (!localPath || !localPath.startsWith("/uploads/")) return localPath || null;
  const filename = localPath.replace("/uploads/", "");
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(fullPath)) return null;
  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(filename);
  const url = await uploadPhoto({
    originalname: filename,
    mimetype: mime(ext),
    buffer,
  });
  return url;
}

async function tableEmpty(table) {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return !count;
}

async function seed() {
  const db = loadDb();

  if (await tableEmpty("admins")) {
    const rows = (db.admins || []).map((a) => ({
      username: a.username,
      display_name: a.displayName || "Admin",
      password_hash: a.passwordHash,
      created_at: a.createdAt,
    }));
    if (rows.length) {
      const { error } = await supabase.from("admins").insert(rows);
      if (error) throw new Error(`admins: ${error.message}`);
      console.log(`Migrated ${rows.length} admin(s).`);
    }
  } else {
    console.log("Admins already exist, skipping.");
  }

  const userIdMap = {};
  if (await tableEmpty("users")) {
    for (const u of db.users || []) {
      const { data, error } = await supabase
        .from("users")
        .insert({
          username: u.username,
          full_name: u.fullName || "",
          phone: u.phone || "",
          area: u.area || "",
          photo: await migratePhoto(u.photo),
          role: u.role || "user",
          password_hash: u.passwordHash,
          created_at: u.createdAt,
        })
        .select()
        .single();
      if (error) throw new Error(`users: ${error.message}`);
      userIdMap[u.id] = data.id;
    }
    console.log(`Migrated ${(db.users || []).length} user(s).`);
  } else {
    console.log("Users already exist, skipping.");
  }

  const serviceIdMap = {};
  if (await tableEmpty("services")) {
    for (const s of db.services || []) {
      const { data, error } = await supabase
        .from("services")
        .insert({
          category: s.category,
          name: s.name,
          price: s.price,
          photo: await migratePhoto(s.photo),
          description: s.description || "",
          video_url: s.videoUrl || null,
        })
        .select()
        .single();
      if (error) throw new Error(`services: ${error.message}`);
      serviceIdMap[s.id] = data.id;
    }
    console.log(`Migrated ${(db.services || []).length} service(s).`);
  } else {
    console.log("Services already exist, skipping.");
  }

  if (await tableEmpty("appointments")) {
    for (const a of db.appointments || []) {
      const { error } = await supabase.from("appointments").insert({
        user_id: userIdMap[a.userId] || null,
        username: a.username,
        full_name: a.fullName || "",
        phone: a.phone || "",
        service_id: serviceIdMap[a.serviceId] || null,
        service_name: a.serviceName,
        category: a.category,
        original_price: a.originalPrice,
        price: a.price,
        promo_code: a.promoCode || null,
        date: a.date,
        time: a.time,
        notes: a.notes || "",
        status: a.status || "booked",
        created_at: a.createdAt,
      });
      if (error) throw new Error(`appointments: ${error.message}`);
    }
    console.log(`Migrated ${(db.appointments || []).length} appointment(s).`);
  } else {
    console.log("Appointments already exist, skipping.");
  }

  if (await tableEmpty("transactions")) {
    for (const t of db.transactions || []) {
      const { error } = await supabase.from("transactions").insert({
        type: t.type,
        service_id: serviceIdMap[t.serviceId] || null,
        service_name: t.serviceName || null,
        standard_price: t.standardPrice ?? null,
        amount: t.amount,
        is_discounted: !!t.isDiscounted,
        description: t.description || null,
        notes: t.notes || "",
        created_at: t.createdAt,
        created_by: t.createdBy || "Admin",
      });
      if (error) throw new Error(`transactions: ${error.message}`);
    }
    console.log(`Migrated ${(db.transactions || []).length} transaction(s).`);
  } else {
    console.log("Transactions already exist, skipping.");
  }

  if (await tableEmpty("carried_forward_entries")) {
    const rows = (db.carriedForwardEntries || []).map((c) => ({
      amount: c.amount,
      note: c.note || "",
      created_at: c.createdAt,
      created_by: c.createdBy || "Admin",
    }));
    if (rows.length) {
      const { error } = await supabase.from("carried_forward_entries").insert(rows);
      if (error) throw new Error(`carried_forward_entries: ${error.message}`);
      console.log(`Migrated ${rows.length} carried-forward entr(y/ies).`);
    }
  } else {
    console.log("Carried-forward entries already exist, skipping.");
  }

  if (await tableEmpty("promo_codes")) {
    for (const p of db.promoCodes || []) {
      const { error } = await supabase.from("promo_codes").insert({
        code: p.code,
        type: p.type,
        value: p.value,
        service_id: serviceIdMap[p.serviceId] || null,
        service_name: p.serviceName || "All services",
        expires_at: p.expiresAt || null,
        max_uses: p.maxUses ?? null,
        uses_count: p.usesCount || 0,
        created_at: p.createdAt,
      });
      if (error) throw new Error(`promo_codes: ${error.message}`);
    }
    console.log(`Migrated ${(db.promoCodes || []).length} promo code(s).`);
  } else {
    console.log("Promo codes already exist, skipping.");
  }

  if (await tableEmpty("assistant_questions")) {
    const rows = (db.assistantQuestions || []).map((q) => ({
      question: q.question,
      answer: q.answer,
      category: q.category || "general",
    }));
    if (rows.length) {
      const { error } = await supabase.from("assistant_questions").insert(rows);
      if (error) throw new Error(`assistant_questions: ${error.message}`);
      console.log(`Migrated ${rows.length} assistant question(s).`);
    }
  } else {
    console.log("Assistant questions already exist, skipping.");
  }

  const settings = db.settings || {};
  if (await tableEmpty("welcome_slides")) {
    const slides = settings.welcomeSlides || [];
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const { error } = await supabase.from("welcome_slides").insert({
        caption: s.caption,
        photo: await migratePhoto(s.photo),
        sort_order: i,
      });
      if (error) throw new Error(`welcome_slides: ${error.message}`);
    }
    console.log(`Migrated ${slides.length} welcome slide(s).`);
  } else {
    console.log("Welcome slides already exist, skipping.");
  }

  if (await tableEmpty("location_photos")) {
    const photos = settings.locationPhotos || [];
    for (const p of photos) {
      const { error } = await supabase.from("location_photos").insert({
        photo: await migratePhoto(p.photo),
        caption: p.caption || "",
        created_at: p.createdAt || new Date().toISOString(),
      });
      if (error) throw new Error(`location_photos: ${error.message}`);
    }
    console.log(`Migrated ${photos.length} location photo(s).`);
  } else {
    console.log("Location photos already exist, skipping.");
  }

  const settingsPatch = {
    logo: await migratePhoto(settings.logo),
    hero_photo: await migratePhoto(settings.heroPhoto),
    center_phone: settings.centerPhone || "+26077686722",
    whatsapp_numbers: settings.whatsappNumbers || ["+260974068912", "+260772180359"],
    whatsapp_bubble_number: settings.whatsappBubbleNumber || "+260974068912",
    location: settings.location || "Highridge, Kabwe",
    location_lat: settings.locationCoords?.lat ?? null,
    location_lng: settings.locationCoords?.lng ?? null,
  };
  const { error: settingsError } = await supabase.from("settings").update(settingsPatch).eq("id", 1);
  if (settingsError) throw new Error(`settings: ${settingsError.message}`);
  console.log("Settings migrated.");

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e.message);
    process.exit(1);
  });
