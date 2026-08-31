import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import { colors, radii, spacing, typography } from "../theme/theme";
import { youtubeEmbedUrl } from "../lib/youtube";

export default function VideoModal({
  visible,
  title,
  description,
  videoUrl,
  onClose,
}: {
  visible: boolean;
  title: string;
  description?: string;
  videoUrl: string | null;
  onClose: () => void;
}) {
  const embedUrl = youtubeEmbedUrl(videoUrl);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.playerWrap}>
            {embedUrl ? (
              <VideoPlayer embedUrl={embedUrl} />
            ) : (
              <Text style={styles.missing}>Video unavailable.</Text>
            )}
          </View>
          {!!description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "92%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: { fontFamily: typography.headingBold, fontSize: 18, color: colors.textPrimary, flex: 1, marginRight: spacing.md },
  playerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: "black",
  },
  missing: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.textOnDark,
    fontFamily: typography.body,
  },
  description: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 19,
  },
});
