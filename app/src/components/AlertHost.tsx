import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertButton, registerAlertHost } from "../lib/alertShim";
import { colors, radii, spacing, typography } from "../theme/theme";

type PendingAlert = { title: string; message?: string; buttons: AlertButton[] };

export default function AlertHost() {
  const [pending, setPending] = useState<PendingAlert | null>(null);

  useEffect(() => {
    registerAlertHost((title, message, buttons) => setPending({ title, message, buttons }));
    return () => registerAlertHost(null);
  }, []);

  if (!pending) return null;

  const dismiss = (button: AlertButton) => {
    setPending(null);
    button.onPress?.();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setPending(null)}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{pending.title}</Text>
          {!!pending.message && <Text style={styles.message}>{pending.message}</Text>}
          <View style={styles.buttons}>
            {pending.buttons.map((button, idx) => (
              <Pressable
                key={idx}
                onPress={() => dismiss(button)}
                style={({ pressed }) => [
                  styles.button,
                  button.style === "cancel" && styles.buttonCancel,
                  button.style === "destructive" && styles.buttonDestructive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.buttonTextCancel,
                    button.style === "destructive" && styles.buttonTextDestructive,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
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
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: { fontFamily: typography.headingBold, fontSize: 18, color: colors.textPrimary, marginBottom: 6 },
  message: { fontFamily: typography.body, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  buttons: { gap: spacing.sm },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonCancel: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  buttonDestructive: { backgroundColor: colors.danger },
  buttonText: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textOnDark },
  buttonTextCancel: { color: colors.textSecondary },
  buttonTextDestructive: { color: colors.textOnDark },
});
