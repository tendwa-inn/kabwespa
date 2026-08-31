import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import BrandMark from "../../components/BrandMark";
import { colors, spacing, typography } from "../../theme/theme";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLoginScreen() {
  const navigation = useNavigation<any>();
  const { logIn } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Enter the admin username and password");
      return;
    }
    setLoading(true);
    try {
      await logIn({ username: username.trim(), password });
    } catch (e: any) {
      setError(e.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primaryDark }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <BrandMark size={48} />
        <Text style={styles.eyebrow}>Staff area</Text>
        <Text style={styles.title}>Admin sign in</Text>
        <Text style={styles.subtitle}>Manage prices, photos, bookings and takings.</Text>

        <TextField
          label="Admin username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Button label="Sign In" onPress={onSubmit} loading={loading} />
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back to guest login
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xl },
  eyebrow: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.accent,
    marginTop: spacing.md,
    marginBottom: 6,
  },
  title: { fontFamily: typography.headingBold, fontSize: 26, color: colors.textOnDark, marginBottom: 4 },
  subtitle: { fontFamily: typography.body, fontSize: 14, color: "#C9CFC7", marginBottom: spacing.lg },
  input: { backgroundColor: colors.surface },
  errorText: { fontFamily: typography.body, color: "#E7A79A", marginBottom: spacing.sm },
  back: {
    fontFamily: typography.body,
    color: "#C9CFC7",
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
