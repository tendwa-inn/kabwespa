import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ContactInfo from "../../components/ContactInfo";
import LocationGallery from "../../components/LocationGallery";
import LanguagePicker from "../../components/LanguagePicker";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { uploadProfilePhoto } from "../../api/auth";
import { photoUrl } from "../../api/client";
import { Alert } from "../../lib/alertShim";

export default function ProfileScreen() {
  const { user, logOut, updateUser } = useAuth();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const addPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to add a profile photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const data = await uploadProfilePhoto(asset.uri, asset.fileName || `photo-${Date.now()}.jpg`, asset.mimeType || "image/jpeg");
      await updateUser(data.user);
    } catch (e: any) {
      Alert.alert("Could not upload photo", e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Your Visit" title={t("profile.title")} />

      <Card style={styles.card}>
        <View style={styles.row}>
          {user?.photo ? (
            <Image source={{ uri: photoUrl(user.photo)! }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={32} color={colors.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t("profile.signedInAs")}</Text>
            <Text style={styles.name}>{user?.fullName || user?.username}</Text>
            <Text style={styles.username}>@{user?.username}</Text>
          </View>
        </View>

        {!!user?.phone && <Text style={styles.detail}>{user.phone}</Text>}
        {!!user?.area && <Text style={styles.detail}>{user.area}, Kabwe</Text>}

        <View style={styles.verifyRow}>
          {user?.verified ? (
            <View style={[styles.badge, styles.badgeVerified]}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={colors.success} />
              <Text style={[styles.badgeText, { color: colors.success }]}>{t("profile.verified")}</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeUnverified]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={[styles.badgeText, { color: colors.danger }]}>{t("profile.notVerified")}</Text>
            </View>
          )}
        </View>

        {!user?.verified && (
          <>
            <Text style={styles.verifyHint}>Add a profile photo to get verified.</Text>
            <Button label={t("profile.addProfilePhoto")} onPress={addPhoto} loading={uploading} fullWidth={false} />
          </>
        )}
      </Card>

      <Text style={styles.sectionTitle}>{t("contact.reachTheSpa")}</Text>
      <View style={styles.card}>
        <ContactInfo />
      </View>
      <LocationGallery />

      <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
        <LanguagePicker />
      </View>

      <View style={{ height: spacing.lg }} />
      <Button label={t("profile.logOut")} variant="outline" onPress={logOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary },
  name: { fontFamily: typography.headingBold, fontSize: 20, color: colors.textPrimary, marginTop: 2 },
  username: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detail: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  verifyRow: { marginTop: spacing.sm },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  badgeVerified: { borderColor: colors.success, backgroundColor: colors.accentSoft },
  badgeUnverified: { borderColor: colors.danger, backgroundColor: colors.accentSoft },
  badgeText: { fontFamily: typography.bodyBold, fontSize: 12 },
  verifyHint: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
