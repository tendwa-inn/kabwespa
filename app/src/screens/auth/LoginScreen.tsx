import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import BrandMark from "../../components/BrandMark";
import { colors, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { logIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password");
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
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {navigation.canGoBack() && (
          <Text style={styles.back} onPress={() => navigation.goBack()}>
            ← {t("common.back")}
          </Text>
        )}
        <View style={styles.brandWrap}>
          <BrandMark size={56} />
          <Text style={styles.brand}>The Kabwe Spa</Text>
          <Text style={styles.brandSub}>{t("welcome.tagline")}</Text>
        </View>

        <Text style={styles.title}>{t("auth.welcomeBack")}</Text>
        <Text style={styles.subtitle}>{t("auth.signInSubtitle")}</Text>

        <TextField
          label={t("auth.username")}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          placeholder="e.g. mwansa21"
        />
        <TextField
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ height: spacing.sm }} />
        <Button label={t("welcome.signIn")} onPress={onSubmit} loading={loading} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{t("auth.newHere")} </Text>
          <Text style={styles.switchLink} onPress={() => navigation.navigate("SignUp")}>
            {t("auth.createAccountLink")}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  brandWrap: { alignItems: "center", marginBottom: spacing.xl, gap: spacing.sm },
  brand: { fontFamily: typography.headingBold, fontSize: 22, color: colors.textPrimary },
  brandSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  title: { fontFamily: typography.headingBold, fontSize: 24, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: typography.body, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  errorText: { fontFamily: typography.body, color: colors.danger, marginBottom: spacing.sm },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  switchText: { fontFamily: typography.body, color: colors.textSecondary },
  switchLink: { fontFamily: typography.bodyBold, color: colors.primary },
});
