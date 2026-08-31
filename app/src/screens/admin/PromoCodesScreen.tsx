import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { addPromoCode, deletePromoCode, fetchPromoCodes } from "../../api/admin";
import { fetchServices } from "../../api/services";
import { PromoCode, Service } from "../../api/types";

function promoStatus(p: PromoCode): { label: string; expired: boolean } | null {
  if (p.expiresAt && new Date(p.expiresAt).getTime() < Date.now()) {
    return { label: "Expired", expired: true };
  }
  if (p.maxUses != null && p.usesCount >= p.maxUses) {
    return { label: "Limit reached", expired: true };
  }
  return null;
}

export default function PromoCodesScreen() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [pc, sv] = await Promise.all([fetchPromoCodes(), fetchServices()]);
    setPromoCodes(pc.promoCodes);
    setServices(sv.services);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!code.trim() || !value) {
      Alert.alert("Missing info", "Enter a code and a discount value.");
      return;
    }
    setSaving(true);
    try {
      await addPromoCode({
        code: code.trim(),
        type,
        value: Number(value),
        serviceId,
        expiresAt: expiresAt.trim() || null,
        maxUses: maxUses.trim() ? Number(maxUses) : null,
      });
      setCode("");
      setValue("");
      setServiceId(null);
      setExpiresAt("");
      setMaxUses("");
      load();
    } catch (e: any) {
      Alert.alert("Could not create code", e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: string) => {
    Alert.alert("Remove promo code", "This code will no longer work at checkout.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deletePromoCode(id);
          load();
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Manage" title="Promo Codes" />

      <Card style={styles.formCard}>
        <TextField label="Code" autoCapitalize="characters" value={code} onChangeText={setCode} placeholder="e.g. KABWE10" />

        <Text style={styles.label}>Discount type</Text>
        <View style={styles.typeRow}>
          <Pressable style={[styles.typeChip, type === "percent" && styles.typeChipActive]} onPress={() => setType("percent")}>
            <Text style={[styles.typeChipText, type === "percent" && styles.typeChipTextActive]}>Percent %</Text>
          </Pressable>
          <Pressable style={[styles.typeChip, type === "fixed" && styles.typeChipActive]} onPress={() => setType("fixed")}>
            <Text style={[styles.typeChipText, type === "fixed" && styles.typeChipTextActive]}>Fixed (K)</Text>
          </Pressable>
        </View>

        <TextField
          label={type === "percent" ? "Percent off (e.g. 10)" : "Amount off in K"}
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
        />

        <Text style={styles.label}>Applies to</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          <Pressable style={[styles.serviceChip, serviceId === null && styles.serviceChipActive]} onPress={() => setServiceId(null)}>
            <Text style={[styles.serviceChipText, serviceId === null && styles.serviceChipTextActive]}>All services</Text>
          </Pressable>
          {services.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.serviceChip, serviceId === s.id && styles.serviceChipActive]}
              onPress={() => setServiceId(s.id)}
            >
              <Text style={[styles.serviceChipText, serviceId === s.id && styles.serviceChipTextActive]}>{s.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextField
          label="Expiry date (optional)"
          value={expiresAt}
          onChangeText={setExpiresAt}
          placeholder="YYYY-MM-DD"
        />
        <TextField
          label="Max number of uses (optional)"
          keyboardType="numeric"
          value={maxUses}
          onChangeText={setMaxUses}
          placeholder="e.g. 50"
        />

        <Button label="Create promo code" onPress={create} loading={saving} />
      </Card>

      <Text style={styles.sectionTitle}>Active codes</Text>
      {promoCodes.map((p) => {
        const status = promoStatus(p);
        return (
          <Card key={p.id} style={styles.codeCard}>
            <View style={{ flex: 1 }}>
              <View style={styles.codeHeaderRow}>
                <Text style={styles.codeText}>{p.code}</Text>
                {status && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{status.label}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.codeMeta}>
                {p.type === "percent" ? `${p.value}% off` : `K${p.value} off`} · {p.serviceName}
              </Text>
              <Text style={styles.codeMeta}>
                {p.expiresAt ? `Expires ${new Date(p.expiresAt).toLocaleDateString()}` : "No expiry"}
                {" · "}
                {p.maxUses != null ? `${p.usesCount}/${p.maxUses} used` : `${p.usesCount} used`}
              </Text>
            </View>
            <Pressable onPress={() => remove(p.id)}>
              <Text style={styles.removeLink}>Remove</Text>
            </Pressable>
          </Card>
        );
      })}
      {promoCodes.length === 0 && <Text style={styles.empty}>No promo codes yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  formCard: { marginBottom: spacing.lg },
  label: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  typeChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: spacing.md },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textPrimary },
  typeChipTextActive: { color: colors.textOnDark },
  serviceChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  serviceChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  serviceChipText: { fontFamily: typography.bodyMedium, fontSize: 12, color: colors.textPrimary },
  serviceChipTextActive: { color: colors.textOnDark },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  codeCard: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  codeHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  codeText: { fontFamily: typography.headingBold, fontSize: 16, color: colors.textPrimary, letterSpacing: 1 },
  codeMeta: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  statusBadgeText: { fontFamily: typography.bodyBold, fontSize: 10, color: colors.textOnDark, textTransform: "uppercase" },
  removeLink: { fontFamily: typography.body, fontSize: 12, color: colors.danger, textDecorationLine: "underline" },
  empty: { fontFamily: typography.body, color: colors.textSecondary, textAlign: "center" },
});
