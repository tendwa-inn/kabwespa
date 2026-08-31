import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, currency, radii, spacing, typography } from "../../theme/theme";
import { fetchServices } from "../../api/services";
import { createAppointment } from "../../api/appointments";
import { Service } from "../../api/types";

const TIME_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(route.params?.serviceId ?? null);
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data.services);
      if (!serviceId && data.services[0]) setServiceId(data.services[0].id);
    });
  }, []);

  useEffect(() => {
    if (route.params?.serviceId) setServiceId(route.params.serviceId);
  }, [route.params?.serviceId]);

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);

  const confirm = async () => {
    if (!serviceId || !date || !time) {
      Alert.alert("Missing details", "Choose a service, date and time.");
      return;
    }
    setSaving(true);
    try {
      await createAppointment({ serviceId, date, time, notes: notes.trim(), promoCode: promoCode.trim() || undefined });
      Alert.alert("Booked", "Your appointment has been confirmed.", [
        { text: "OK", onPress: () => navigation.navigate("Appointments") },
      ]);
      setTime(null);
      setNotes("");
      setPromoCode("");
    } catch (e: any) {
      Alert.alert("Could not book", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Book" title={t("booking.title")} subtitle={t("booking.subtitle")} />

      <Text style={styles.sectionTitle}>{t("booking.service")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {services.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setServiceId(s.id)}
            style={[styles.serviceChip, serviceId === s.id && styles.serviceChipActive]}
          >
            <Text style={[styles.serviceChipText, serviceId === s.id && styles.serviceChipTextActive]}>{s.name}</Text>
            <Text style={[styles.serviceChipPrice, serviceId === s.id && styles.serviceChipTextActive]}>
              {currency(s.price)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>{t("booking.date")}</Text>
      <Card style={{ marginBottom: spacing.lg, padding: 0, overflow: "hidden" }}>
        <Calendar
          minDate={todayIso()}
          onDayPress={(d: DateData) => setDate(d.dateString)}
          markedDates={{ [date]: { selected: true, selectedColor: colors.primary } }}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.textOnDark,
            todayTextColor: colors.accent,
            dayTextColor: colors.textPrimary,
            arrowColor: colors.primary,
            monthTextColor: colors.textPrimary,
            textMonthFontFamily: typography.bodyBold,
            textDayFontFamily: typography.body,
            textDayHeaderFontFamily: typography.bodyMedium,
          }}
        />
      </Card>

      <Text style={styles.sectionTitle}>{t("booking.time")}</Text>
      <View style={styles.timeGrid}>
        {TIME_SLOTS.map((slot) => (
          <Pressable
            key={slot}
            onPress={() => setTime(slot)}
            style={[styles.timeChip, time === slot && styles.timeChipActive]}
          >
            <Text style={[styles.timeChipText, time === slot && styles.timeChipTextActive]}>{slot}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <TextField
          label={t("booking.promoCode")}
          autoCapitalize="characters"
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="e.g. KABWE10"
        />
        <TextField
          label={t("booking.notes")}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any preference you'd like us to know"
        />
      </View>

      {selectedService && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{selectedService.name}</Text>
          <Text style={styles.summaryPrice}>{currency(selectedService.price)}</Text>
        </Card>
      )}

      <Button label={t("booking.confirmBooking")} onPress={confirm} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  serviceChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    minWidth: 140,
  },
  serviceChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceChipText: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textPrimary },
  serviceChipPrice: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.accent, marginTop: 4 },
  serviceChipTextActive: { color: colors.textOnDark },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  timeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  timeChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  timeChipText: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textPrimary },
  timeChipTextActive: { color: colors.textOnDark },
  summaryCard: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary },
  summaryPrice: { fontFamily: typography.headingBold, fontSize: 18, color: colors.accent },
});
