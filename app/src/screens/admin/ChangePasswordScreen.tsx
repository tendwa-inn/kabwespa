import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { changePassword, updateDisplayName } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function ChangePasswordScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.fullName || "");
  const [savingName, setSavingName] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const saveDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert("Enter a name", "This is the name shown on statements instead of your username.");
      return;
    }
    setSavingName(true);
    try {
      const data = await updateDisplayName(displayName.trim());
      await updateUser(data.user);
      Alert.alert("Saved", "New entries will now be recorded under this name.");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingName(false);
    }
  };

  const submit = async () => {
    if (!current || !next || next.length < 6) {
      Alert.alert("Check your entries", "New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      Alert.alert("Passwords don't match", "Re-enter the new password.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(current, next);
      Alert.alert("Password updated", "Use your new password next time you sign in.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Could not update password", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Manage" title="Account Settings" />

      <Text style={styles.sectionTitle}>Display name</Text>
      <Text style={styles.hint}>
        Shown on statements and transaction records instead of your username.
      </Text>
      <Card style={styles.card}>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="e.g. Zarah" />
        <Button label="Save name" onPress={saveDisplayName} loading={savingName} fullWidth={false} />
      </Card>

      <Text style={styles.sectionTitle}>Password</Text>
      <Card style={styles.card}>
        <TextField label="Current password" secureTextEntry value={current} onChangeText={setCurrent} />
        <TextField label="New password" secureTextEntry value={next} onChangeText={setNext} />
        <TextField label="Confirm new password" secureTextEntry value={confirm} onChangeText={setConfirm} />
        <Button label="Update password" onPress={submit} loading={saving} fullWidth={false} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hint: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { marginBottom: spacing.md },
});
