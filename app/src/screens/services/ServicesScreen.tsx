import React, { useCallback, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import ServiceIcon from "../../components/ServiceIcon";
import VideoModal from "../../components/VideoModal";
import { colors, currency, radii, spacing, typography } from "../../theme/theme";
import { fetchServices } from "../../api/services";
import { photoUrl } from "../../api/client";
import { Service } from "../../api/types";

export default function ServicesScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [category, setCategory] = useState<"massage" | "beauty">("massage");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState<Service | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchServices();
      setServices(data.services);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = services.filter((s) => s.category === category);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <ScreenHeader
        eyebrow="The Kabwe Spa"
        title={t("services.title")}
        subtitle={t("services.subtitle")}
      />

      <View style={styles.toggle}>
        <Pressable
          style={[styles.toggleItem, category === "massage" && styles.toggleItemActive]}
          onPress={() => setCategory("massage")}
        >
          <Text style={[styles.toggleText, category === "massage" && styles.toggleTextActive]}>{t("services.massage")}</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleItem, category === "beauty" && styles.toggleItemActive]}
          onPress={() => setCategory("beauty")}
        >
          <Text style={[styles.toggleText, category === "beauty" && styles.toggleTextActive]}>{t("services.beauty")}</Text>
        </Pressable>
      </View>

      {visible.map((service) => (
        <Card key={service.id} style={styles.card}>
          <View style={styles.cardRow}>
            {service.photo ? (
              <Image source={{ uri: photoUrl(service.photo)! }} style={styles.thumb} />
            ) : (
              <ServiceIcon name={service.name} style={{ marginRight: spacing.md }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{service.name}</Text>
              {!!service.description && <Text style={styles.serviceDesc}>{service.description}</Text>}
              <Text style={styles.servicePrice}>{currency(service.price)}</Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.bookButton}
              onPress={() => navigation.navigate("Book", { screen: "BookAppointment", params: { serviceId: service.id } })}
            >
              <Text style={styles.bookButtonText}>{t("services.bookThis")}</Text>
            </Pressable>
            {!!service.videoUrl && (
              <Pressable style={styles.watchButton} onPress={() => setWatching(service)}>
                <MaterialCommunityIcons name="play-circle-outline" size={16} color={colors.textOnDark} />
                <Text style={styles.watchButtonText}>{t("services.watch")}</Text>
              </Pressable>
            )}
          </View>
        </Card>
      ))}

      {!loading && visible.length === 0 && (
        <Text style={styles.empty}>No services listed yet.</Text>
      )}

      <VideoModal
        visible={!!watching}
        title={watching?.name || ""}
        description={watching?.description}
        videoUrl={watching?.videoUrl || null}
        onClose={() => setWatching(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleItem: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, alignItems: "center" },
  toggleItemActive: { backgroundColor: colors.primary },
  toggleText: { fontFamily: typography.bodyBold, color: colors.primary, fontSize: 14 },
  toggleTextActive: { color: colors.textOnDark },
  card: { marginBottom: spacing.md },
  cardRow: { flexDirection: "row", marginBottom: spacing.sm },
  thumb: { width: 64, height: 64, borderRadius: radii.sm, marginRight: spacing.md, backgroundColor: colors.accentSoft },
  serviceName: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.textPrimary },
  serviceDesc: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  servicePrice: { fontFamily: typography.headingBold, fontSize: 16, color: colors.accent, marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  bookButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  bookButtonText: { fontFamily: typography.bodyBold, color: colors.primary, fontSize: 13 },
  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  watchButtonText: { fontFamily: typography.bodyBold, color: colors.textOnDark, fontSize: 13 },
  empty: { textAlign: "center", color: colors.textSecondary, fontFamily: typography.body, marginTop: spacing.xl },
});
