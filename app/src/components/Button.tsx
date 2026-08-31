import React from "react";
import { Pressable, StyleSheet, Text, ActivityIndicator, GestureResponderEvent } from "react-native";
import { colors, radii, spacing, typography } from "../theme/theme";

type Variant = "primary" | "outline" | "ghost" | "danger";

type Props = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  fullWidth = true,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && { alignSelf: "stretch" },
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.textOnDark : colors.primary} />
      ) : (
        <Text style={[styles.label, textStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.danger },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.textOnDark },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.textOnDark },
});
