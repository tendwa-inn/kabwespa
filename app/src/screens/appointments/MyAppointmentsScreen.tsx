import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { colors, currency, spacing, typography } from "../../theme/theme";
import { cancelAppointment, fetchMyAppointments } from "../../api/appointments";
import { Appointment } from "../../api/types";

export default function MyAppointmentsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyAppointments();
      setAppointments(data.appointments);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onCancel = (id: string) => {
    Alert.alert("Cancel booking", "Are you sure you want to cancel this appointment?", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: async () => {
          await cancelAppointment(id);
          load();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <ScreenHeader eyebrow="Your Visits" title={t("appointments.title")} />

      {appointments.length === 0 && !loading && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t("appointments.noAppointments")}</Text>
          <Button label={t("services.bookThis")} onPress={() => navigation.navigate("Book")} />
        </View>
      )}

      {appointments.map((appt) => (
        <Card key={appt.id} style={styles.card}>
          <Text style={styles.service}>{appt.serviceName}</Text>
          <Text style={styles.datetime}>
            {appt.date} · {appt.time}
          </Text>
          <View style={styles.priceRow}>
            {appt.promoCode ? (
              <>
                <Text style={styles.strike}>{currency(appt.originalPrice)}</Text>
                <Text style={styles.price}>{currency(appt.price)}</Text>
                <Text style={styles.promoTag}>{appt.promoCode}</Text>
              </>
            ) : (
              <Text style={styles.price}>{currency(appt.price)}</Text>
            )}
          </View>
          {!!appt.notes && <Text style={styles.notes}>{appt.notes}</Text>}
          <Button label={t("appointments.cancelBooking")} variant="ghost" onPress={() => onCancel(appt.id)} />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  service: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.textPrimary },
  datetime: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, gap: spacing.sm },
  strike: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  price: { fontFamily: typography.bodyBold, fontSize: 17, color: colors.accent },
  promoTag: {
    fontFamily: typography.bodyBold,
    fontSize: 11,
    color: colors.success,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  notes: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
  emptyWrap: { alignItems: "center", paddingTop: spacing.xl, gap: spacing.md },
  emptyText: { fontFamily: typography.body, color: colors.textSecondary, textAlign: "center" },
});
