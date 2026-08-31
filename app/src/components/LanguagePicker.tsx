import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../theme/theme";
import { LANGUAGES, LanguageCode, setLanguage } from "../i18n";

export default function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const choose = async (code: LanguageCode) => {
    setOpen(false);
    await setLanguage(code);
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <MaterialCommunityIcons name="translate" size={16} color={colors.primary} />
        <Text style={styles.triggerText}>{current.label}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.card}>
            <Text style={styles.title}>{t("common.language")}</Text>
            {LANGUAGES.map((lang) => (
              <Pressable key={lang.code} style={styles.row} onPress={() => choose(lang.code)}>
                <Text style={[styles.rowText, lang.code === current.code && styles.rowTextActive]}>
                  {lang.label}
                </Text>
                {lang.code === current.code && (
                  <MaterialCommunityIcons name="check" size={18} color={colors.accent} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  triggerText: { fontFamily: typography.bodyMedium, fontSize: 12, color: colors.primary },
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  card: { width: "100%", maxWidth: 320, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg },
  title: { fontFamily: typography.headingBold, fontSize: 16, color: colors.textPrimary, marginBottom: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: { fontFamily: typography.body, fontSize: 15, color: colors.textPrimary },
  rowTextActive: { fontFamily: typography.bodyBold, color: colors.accent },
});
