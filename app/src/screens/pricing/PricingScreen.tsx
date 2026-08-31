import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import ServiceIcon from "../../components/ServiceIcon";
import VideoPlayer from "../../components/VideoPlayer";
import ContactInfo from "../../components/ContactInfo";
import { colors, currency, radii, spacing, typography } from "../../theme/theme";
import { fetchServices } from "../../api/services";
import { photoUrl } from "../../api/client";
import { Service, Settings } from "../../api/types";
import { youtubeEmbedUrl } from "../../lib/youtube";

function mapEmbedUrl(settings: Settings | null): string | null {
  if (!settings) return null;
  if (settings.locationCoords) {
    return `https://www.google.com/maps?q=${settings.locationCoords.lat},${settings.locationCoords.lng}&z=16&output=embed`;
  }
  if (settings.location) {
    return `https://www.google.com/maps?q=${encodeURIComponent(settings.location + ", Zambia")}&z=15&output=embed`;
  }
  return null;
}

export default function PricingScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServices(data.services);
        setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const mapUrl = mapEmbedUrl(settings);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← {t("common.back")}
      </Text>
      <ScreenHeader
        eyebrow="Full Menu"
        title="Pricing"
        subtitle="Every massage and beauty treatment we offer, in detail."
      />

      {(["massage", "beauty"] as const).map((cat) => {
        const items = services.filter((s) => s.category === cat);
        if (!items.length) return null;
        return (
          <View key={cat}>
            <Text style={styles.sectionTitle}>{cat === "massage" ? "Massage" : "Beauty"}</Text>
            {items.map((service) => {
              const embed = youtubeEmbedUrl(service.videoUrl);
              return (
                <Card key={service.id} style={styles.card}>
                  {service.photo ? (
                    <Image source={{ uri: photoUrl(service.photo)! }} style={styles.photo} />
                  ) : null}
                  <View style={styles.head}>
                    {!service.photo && <ServiceIcon name={service.name} size={44} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{service.name}</Text>
                      <Text style={styles.price}>{currency(service.price)}</Text>
                    </View>
                  </View>
                  {!!service.description && <Text style={styles.description}>{service.description}</Text>}
                  {embed && (
                    <View style={styles.videoWrap}>
                      <VideoPlayer embedUrl={embed} />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        );
      })}

      {!loading && !services.length && <Text style={styles.empty}>No services listed yet.</Text>}

      <Text style={styles.sectionTitle}>Find Us</Text>
      {mapUrl && (
        <View style={styles.mapWrap}>
          <VideoPlayer embedUrl={mapUrl} />
        </View>
      )}
      <ContactInfo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: { marginBottom: spacing.md },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.sm,
  },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  name: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.textPrimary },
  price: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.accent, marginTop: 2 },
  description: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  videoWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "black",
    marginTop: spacing.md,
  },
  mapWrap: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  empty: { textAlign: "center", color: colors.textSecondary, fontFamily: typography.body, marginTop: spacing.xl },
});
