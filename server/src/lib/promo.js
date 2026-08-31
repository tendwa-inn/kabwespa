function isPromoUsable(promo) {
  if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (promo.max_uses != null && promo.uses_count >= promo.max_uses) {
    return { ok: false, reason: "limit_reached" };
  }
  return { ok: true };
}

function toPromoCode(row) {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    serviceId: row.service_id,
    serviceName: row.service_name,
    expiresAt: row.expires_at,
    maxUses: row.max_uses,
    usesCount: row.uses_count,
    createdAt: row.created_at,
  };
}

module.exports = { isPromoUsable, toPromoCode };
