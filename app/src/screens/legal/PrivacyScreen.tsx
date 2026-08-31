import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import { colors, spacing, typography } from "../../theme/theme";

const SECTIONS = [
  {
    title: "What we collect",
    body: "When you sign up we collect your username, password (stored securely, never in plain text), full name, phone number and area. When you book an appointment, we store the service, date, time and any notes you add. If you upload a profile photo, we store that too.",
  },
  {
    title: "How we use it",
    body: "Your details are used to run your account, manage your bookings, and let our staff contact you about a visit if needed. Your phone number is only used by the spa — we don't sell or share it with outside advertisers.",
  },
  {
    title: "Who can see it",
    body: "Spa staff and managers can see your name, phone number, area and appointment history so they can serve you. Other guests never see your personal details.",
  },
  {
    title: "Storage & security",
    body: "Your data is stored with Supabase, a hosted database provider, and accessed only through our own app and staff tools. Passwords are hashed and never stored or viewable as plain text.",
  },
  {
    title: "Your choices",
    body: "You can update your profile at any time from the Profile tab. If you'd like your account and data deleted entirely, contact us through Report a Problem or Contact Us and we'll action it.",
  },
  {
    title: "Changes to this policy",
    body: "If how we handle your data changes meaningfully, we'll update this page. Continued use of the app after an update means you accept the revised policy.",
  },
];

export default function PrivacyScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← Back
      </Text>
      <ScreenHeader eyebrow="Legal" title="Privacy Policy" subtitle="Last updated August 2026." />

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
