import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import { colors, spacing, typography } from "../../theme/theme";

const SECTIONS = [
  {
    title: "1. Using the app",
    body: "The Kabwe Spa app lets you browse our massage and beauty services, book appointments, and manage your account. You must provide accurate information when signing up and keep your login details private. You're responsible for anything booked under your account.",
  },
  {
    title: "2. Bookings",
    body: "An appointment booked through the app holds a slot with us, but isn't a guaranteed contract until confirmed at the spa. Prices shown are in Zambian Kwacha and may change; the price at the time of booking is what applies to that visit. Promo codes are subject to their own expiry and usage limits shown at checkout.",
  },
  {
    title: "3. Cancellations",
    body: "You can cancel a booking from the Appointments tab before your visit. Repeated no-shows may affect your ability to book in future. If you need to reschedule, cancel the existing slot and book a new one.",
  },
  {
    title: "4. Conduct",
    body: "Please treat our staff and other guests with respect. We reserve the right to refuse service or suspend an account for abusive behaviour, fraudulent bookings, or misuse of the app.",
  },
  {
    title: "5. Accounts",
    body: "We may suspend or remove an account that violates these terms, provides false information, or is used for anything unlawful. You can stop using the app at any time; contact us if you'd like your account removed.",
  },
  {
    title: "6. Changes",
    body: "We may update these terms as the app and business evolve. Continued use of the app after a change means you accept the updated terms.",
  },
  {
    title: "7. Contact",
    body: "Questions about these terms can be sent to us through the Contact Us page or Report a Problem.",
  },
];

export default function TermsScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← Back
      </Text>
      <ScreenHeader eyebrow="Legal" title="Terms of Service" subtitle="Last updated August 2026." />

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
        </View>
      ))}

      <Text style={styles.footer}>The Kabwe Spa is operated by Zarah's Massage Spa, Highridge, Kabwe, Zambia.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary, marginBottom: 6 },
  sectionBody: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  footer: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
