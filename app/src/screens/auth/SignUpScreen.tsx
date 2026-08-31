import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { colors, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { checkUsername } from "../../api/auth";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const checkSeq = useRef(0);

  useEffect(() => {
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setUsernameStatus(trimmed.length === 0 ? "idle" : "invalid");
      return;
    }
    setUsernameStatus("checking");
    const seq = ++checkSeq.current;
    const timer = setTimeout(async () => {
      try {
        const data = await checkUsername(trimmed);
        if (checkSeq.current === seq) setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        if (checkSeq.current === seq) setUsernameStatus("idle");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  const onSubmit = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Username and password are required");
      return;
    }
    if (usernameStatus === "taken") {
      setError("That username is already taken — please choose another");
      return;
    }
    if (usernameStatus === "invalid") {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!area.trim()) {
      setError("Tell us which part of Kabwe you live in");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUp({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        area: area.trim(),
      });
    } catch (e: any) {
      setError(e.message || "Could not create your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {navigation.canGoBack() && (
          <Text style={styles.back} onPress={() => navigation.goBack()}>
            ← {t("common.back")}
          </Text>
        )}
        <Text style={styles.title}>{t("auth.createAccountTitle")}</Text>
        <Text style={styles.subtitle}>{t("auth.createAccountSubtitle")}</Text>

        <TextField label={t("auth.fullName")} value={fullName} onChangeText={setFullName} placeholder="Your full name" />
        <TextField
          label={t("auth.phoneNumber")}
          value={phone}
          onChangeText={setPhone}
          placeholder="Your phone number"
          keyboardType="phone-pad"
        />
        <TextField
          label={t("auth.areaLabel")}
          value={area}
          onChangeText={setArea}
          placeholder="e.g. Highridge"
        />
        <TextField
          label={t("auth.username")}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
        />
        {usernameStatus === "checking" && <Text style={styles.usernameHint}>Checking availability…</Text>}
        {usernameStatus === "available" && (
          <Text style={[styles.usernameHint, styles.usernameAvailable]}>Username available</Text>
        )}
        {usernameStatus === "taken" && (
          <Text style={[styles.usernameHint, styles.usernameTaken]}>Username already taken — try another</Text>
        )}
        {usernameStatus === "invalid" && (
          <Text style={[styles.usernameHint, styles.usernameTaken]}>Username must be at least 3 characters</Text>
        )}

        <TextField
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />
        <TextField
          label={t("auth.confirmPassword")}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="Re-enter password"
        />
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ height: spacing.sm }} />
        <Button label={t("welcome.createAccount")} onPress={onSubmit} loading={loading} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{t("auth.alreadyHaveAccount")} </Text>
          <Text style={styles.switchLink} onPress={() => navigation.navigate("Login")}>
            {t("auth.signInLink")}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  title: { fontFamily: typography.headingBold, fontSize: 24, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: typography.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  usernameHint: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -10,
    marginBottom: spacing.md,
  },
  usernameAvailable: { color: colors.success },
  usernameTaken: { color: colors.danger },
  errorText: { fontFamily: typography.body, color: colors.danger, marginBottom: spacing.sm },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  switchText: { fontFamily: typography.body, color: colors.textSecondary },
  switchLink: { fontFamily: typography.bodyBold, color: colors.primary },
});
