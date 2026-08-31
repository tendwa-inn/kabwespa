import React, { useEffect, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { createManagerAccount, deleteUser, fetchUsers, updateUserRole } from "../../api/admin";
import { AdminUserRow } from "../../api/types";
import { useAuth } from "../../context/AuthContext";

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function ManageUsersScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const contactUser = (u: AdminUserRow) => {
    if (!u.phone) return;
    Alert.alert(u.fullName || u.username, u.phone, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL(`tel:${u.phone}`) },
      { text: "WhatsApp", onPress: () => Linking.openURL(`https://wa.me/${digitsOnly(u.phone)}`) },
    ]);
  };

  const toggleRole = (u: AdminUserRow) => {
    if (u.role === "admin") {
      Alert.alert(
        "Demote to manager?",
        `${u.fullName || u.username} will lose admin access and become a manager instead (can record takings and expenses, but not the rest of the dashboard). They'll need to sign out and back in to see it. To make them admin again, you'll need to do that in Supabase.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Demote",
            style: "destructive",
            onPress: async () => {
              setBusyId(u.id);
              try {
                await updateUserRole(u.id, "manager");
                load();
              } catch (e: any) {
                Alert.alert("Could not update role", e.message);
              } finally {
                setBusyId(null);
              }
            },
          },
        ]
      );
      return;
    }
    const nextRole = u.role === "manager" ? "user" : "manager";
    Alert.alert(
      nextRole === "manager" ? "Make manager?" : "Remove manager role?",
      nextRole === "manager"
        ? `${u.fullName || u.username} will be able to record takings and expenses (but not delete them). They'll need to sign out and back in to see it.`
        : `${u.fullName || u.username} will lose access to recording takings and expenses.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextRole === "manager" ? "Make manager" : "Remove",
          onPress: async () => {
            setBusyId(u.id);
            try {
              await updateUserRole(u.id, nextRole);
              load();
            } catch (e: any) {
              Alert.alert("Could not update role", e.message);
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const removeUser = (u: AdminUserRow) => {
    Alert.alert(
      "Delete user?",
      `This permanently removes ${u.fullName || u.username}'s account. They will no longer be able to sign in.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusyId(u.id);
            try {
              await deleteUser(u.id);
              load();
            } catch (e: any) {
              Alert.alert("Could not delete user", e.message);
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const createManager = async () => {
    if (!newUsername.trim() || !newPassword || !newFullName.trim()) {
      Alert.alert("Missing info", "Username, password and full name are required.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    setCreating(true);
    try {
      await createManagerAccount({
        username: newUsername.trim(),
        password: newPassword,
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        role: "manager",
      });
      setNewUsername("");
      setNewPassword("");
      setNewFullName("");
      setNewPhone("");
      setShowCreate(false);
      Alert.alert("Manager account created", `${newFullName.trim()} can now sign in and record takings and expenses.`);
      load();
    } catch (e: any) {
      Alert.alert("Could not create account", e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <ScreenHeader eyebrow="Manage" title="Users" subtitle="Everyone signed up on the app." />

      <Text style={styles.sectionTitle}>Managers record takings & expenses</Text>
      <Text style={styles.hint}>
        Give someone a manager account directly, or promote an existing guest below. Managers can record
        income and expenses but can't view the full ledger or delete entries.
      </Text>
      {!showCreate ? (
        <Button label="+ Add manager account" variant="outline" onPress={() => setShowCreate(true)} />
      ) : (
        <Card style={styles.card}>
          <TextField label="Full name" value={newFullName} onChangeText={setNewFullName} />
          <TextField label="Phone number (optional)" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
          <TextField label="Username" autoCapitalize="none" autoCorrect={false} value={newUsername} onChangeText={setNewUsername} />
          <TextField label="Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="At least 6 characters" />
          <View style={styles.row}>
            <Button label="Create manager" onPress={createManager} loading={creating} fullWidth={false} />
            <Pressable onPress={() => setShowCreate(false)}>
              <Text style={styles.roleLink}>Cancel</Text>
            </Pressable>
          </View>
        </Card>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>All users</Text>
      {users.map((u) => (
        <Card key={u.id} style={styles.card}>
          <View style={styles.userHeaderRow}>
            <Text style={styles.service}>{u.fullName || u.username}</Text>
            {(u.role === "manager" || u.role === "admin") && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{u.role === "admin" ? "Admin" : "Manager"}</Text>
              </View>
            )}
          </View>
          <Text style={styles.meta}>@{u.username}</Text>
          {!!u.phone && (
            <Pressable onPress={() => contactUser(u)}>
              <Text style={styles.phoneLink}>{u.phone}</Text>
            </Pressable>
          )}
          {!!u.area && <Text style={styles.meta}>{u.area}, Kabwe</Text>}
          <Text style={styles.meta}>
            {u.appointmentCount} appointment(s) · joined {new Date(u.createdAt).toLocaleDateString()}
            {u.verified ? " · Verified" : ""}
          </Text>
          {u.id === currentUser?.id ? (
            <Text style={styles.meta}>This is you</Text>
          ) : (
            <View style={styles.actionsRow}>
              <Pressable onPress={() => toggleRole(u)} disabled={busyId === u.id}>
                <Text style={styles.roleLink}>
                  {u.role === "admin" ? "Demote to manager" : u.role === "manager" ? "Remove manager role" : "Make manager"}
                </Text>
              </Pressable>
              <Pressable onPress={() => removeUser(u)} disabled={busyId === u.id}>
                <Text style={styles.deleteLink}>Delete</Text>
              </Pressable>
            </View>
          )}
        </Card>
      ))}

      {users.length === 0 && <Text style={styles.empty}>No guests have signed up yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  userHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  service: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary },
  meta: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { fontFamily: typography.body, color: colors.textSecondary, textAlign: "center", marginTop: spacing.lg },
  phoneLink: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.primary, marginTop: 4 },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hint: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  roleBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  roleBadgeText: { fontFamily: typography.bodyBold, fontSize: 10, color: colors.accent, textTransform: "uppercase" },
  actionsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm, flexWrap: "wrap" },
  roleLink: { fontFamily: typography.body, fontSize: 12, color: colors.primary, textDecorationLine: "underline" },
  deleteLink: { fontFamily: typography.body, fontSize: 12, color: colors.danger, textDecorationLine: "underline" },
});
