import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import { colors, currency, spacing, typography } from "../../theme/theme";
import { fetchAllAppointments } from "../../api/appointments";
import { Appointment } from "../../api/types";

export default function AppointmentsAdminScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAppointments();
      setAppointments(data.appointments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <ScreenHeader eyebrow="Manage" title="Bookings" />

      {appointments.map((appt) => (
        <Card key={appt.id} style={styles.card}>
          <Text style={styles.service}>{appt.serviceName}</Text>
          <Text style={styles.meta}>
            {appt.date} · {appt.time}
          </Text>
          <Text style={styles.meta}>
            Guest: {appt.fullName || appt.username} {appt.phone ? `· ${appt.phone}` : ""}
          </Text>
          <Text style={styles.price}>
            {currency(appt.price)} {appt.promoCode ? `(code ${appt.promoCode})` : ""}
          </Text>
        </Card>
      ))}

      {appointments.length === 0 && <Text style={styles.empty}>No appointments booked yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.sm },
  service: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary },
  meta: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  price: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.accent, marginTop: 6 },
  empty: { fontFamily: typography.body, color: colors.textSecondary, textAlign: "center", marginTop: spacing.lg },
});
