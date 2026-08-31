import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../theme/theme";

export const ANDROID_APK_URL = "https://expo.dev/artifacts/eas/5IWgu4K-cey_R1RdyCg_pHM--STCcv9TWHG6U8ARly8.apk";

const SOCIAL_LINKS = [
  { icon: "instagram" as const, url: "https://www.instagram.com/massagespakabwe?utm_source=qr" },
  { icon: "facebook" as const, url: "https://www.facebook.com/share/1Ezykvn3CS/?mibextid=wwXIfr" },
  { icon: "whatsapp" as const, url: "https://wa.me/260772180359" },
];

export default function Footer() {
  const navigation = useNavigation<any>();

  const downloadApk = () => {
    if (ANDROID_APK_URL) Linking.openURL(ANDROID_APK_URL);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />

      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((s) => (
          <Pressable key={s.icon} style={styles.socialButton} onPress={() => Linking.openURL(s.url)}>
            <FontAwesome name={s.icon} size={18} color={colors.textPrimary} />
          </Pressable>
        ))}
      </View>

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
  socialRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
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
