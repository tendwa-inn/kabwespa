import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../theme/theme";

// Filled in once the Android build is published.
export const ANDROID_APK_URL = "";

export default function Footer() {
  const navigation = useNavigation<any>();

  const downloadApk = () => {
    if (ANDROID_APK_URL) Linking.openURL(ANDROID_APK_URL);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />

      {Platform.OS === "web" && (
        <Pressable style={styles.downloadRow} onPress={downloadApk}>
          <MaterialCommunityIcons name="android" size={16} color={colors.accent} />
          <Text style={styles.downloadLink}>Download the Android App</Text>
        </Pressable>
      )}

      <View style={styles.linkRow}>
        <Text style={styles.link} onPress={() => navigation.navigate("Terms")}>
          Terms of Service
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.link} onPress={() => navigation.navigate("Privacy")}>
          Privacy Policy
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.link} onPress={() => navigation.navigate("ReportProblem")}>
          Report a Problem
        </Text>
      </View>

      <Text style={styles.copyright}>© 2026 The Kabwe Spa · Zarah's Massage Spa, Kabwe</Text>
      <Text style={styles.developer}>Built by Tendwa Innovations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    alignSelf: "stretch",
    marginBottom: spacing.lg,
  },
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  downloadLink: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.accent,
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  link: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  dot: { color: colors.border, fontSize: 12 },
  copyright: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  developer: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textSecondary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 2,
  },
});
