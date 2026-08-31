import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../theme/theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function TextField({ label, error, style, secureTextEntry, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...rest}
          secureTextEntry={isPassword && !visible}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            isPassword && styles.inputWithIcon,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            style,
          ]}
        />
        {isPassword && (
          <Pressable style={styles.eyeButton} onPress={() => setVisible((v) => !v)} hitSlop={10}>
            <MaterialCommunityIcons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputRow: { position: "relative", justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputWithIcon: { paddingRight: spacing.xl },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  eyeButton: {
    position: "absolute",
    right: spacing.sm,
    padding: 4,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
});
