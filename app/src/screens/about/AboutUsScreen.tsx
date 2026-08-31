import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import { colors, spacing, typography } from "../../theme/theme";

const VALUES = [
  {
    title: "Skilled hands",
    body: "Every treatment is carried out by trained therapists who take the time to understand what you need.",
  },
  {
    title: "A calm space",
    body: "Our Highridge location is set up for guests to properly switch off, whether it's a quick visit or a full package.",
  },
  {
    title: "Massage & beauty, together",
    body: "From Swedish and Deep Tissue massage to facials, waxing and pedicures, we cover both relaxation and upkeep in one place.",
  },
];

export default function AboutUsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← {t("common.back")}
      </Text>
      <ScreenHeader eyebrow="Our Story" title="About The Kabwe Spa" />

      <Text style={styles.intro}>
        The Kabwe Spa is Zarah's Massage Spa in Highridge, Kabwe — a neighbourhood spot for massage and beauty
        treatments, built around unhurried, attentive care.
      </Text>

      {VALUES.map((v) => (
        <Card key={v.title} style={styles.card}>
          <Text style={styles.cardTitle}>{v.title}</Text>
          <Text style={styles.cardBody}>{v.body}</Text>
        </Card>
      ))}

      <View style={{ height: spacing.md }} />
      <Text style={styles.footer}>
        Book straight from the app, or reach us on the Contact page if you'd rather speak to someone first.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  intro: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  card: { marginBottom: spacing.md },
  cardTitle: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary, marginBottom: 4 },
  cardBody: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  footer: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
});
