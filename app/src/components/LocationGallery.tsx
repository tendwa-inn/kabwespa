import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme/theme";
import { fetchServices } from "../api/services";
import { photoUrl } from "../api/client";
import { LocationPhoto } from "../api/types";

export default function LocationGallery() {
  const [photos, setPhotos] = useState<LocationPhoto[]>([]);

  useEffect(() => {
    fetchServices()
      .then((data) => setPhotos(data.settings.locationPhotos || []))
      .catch(() => {});
  }, []);

  if (photos.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Find Us</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {photos.map((item) => (
          <View key={item.id} style={styles.item}>
            <Image source={{ uri: photoUrl(item.photo)! }} style={styles.photo} />
            {!!item.caption && <Text style={styles.caption}>{item.caption}</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: { gap: spacing.sm },
  item: { width: 150 },
  photo: { width: 150, height: 110, borderRadius: radii.md, backgroundColor: colors.accentSoft },
  caption: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
