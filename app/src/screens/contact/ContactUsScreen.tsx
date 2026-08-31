import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import ContactInfo from "../../components/ContactInfo";
import LocationGallery from "../../components/LocationGallery";
import { colors, spacing, typography } from "../../theme/theme";

export default function ContactUsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← {t("common.back")}
      </Text>
      <ScreenHeader
        eyebrow="Get In Touch"
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
      />
      <ContactInfo />
      <LocationGallery />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
});
