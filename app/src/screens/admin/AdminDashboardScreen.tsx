import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import { colors, spacing, typography } from "../../theme/theme";
import { useAdminAuth } from "../../context/AdminAuthContext";

const ITEMS: { key: string; title: string; desc: string }[] = [
  { key: "ManagePrices", title: "Prices & Descriptions", desc: "Edit what each service costs" },
  { key: "ManagePhotos", title: "Photos", desc: "Update service and hero photos" },
  { key: "Transactions", title: "Takings & Expenses", desc: "Record income, log expenses, review balance" },
  { key: "AppointmentsAdmin", title: "Appointments", desc: "See every booking made by guests" },
  { key: "ManageUsers", title: "Users", desc: "See everyone signed up, promote or remove accounts" },
  { key: "PromoCodes", title: "Promo Codes", desc: "Create and remove discount codes" },
  { key: "ManageAssistant", title: "Assistant Questions", desc: "Edit what guests can ask the AI assistant" },
  { key: "ChangePassword", title: "Account Settings", desc: "Display name and password" },
];

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { admin, logOut } = useAdminAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Staff Area" title="Admin Dashboard" subtitle={`Signed in as ${admin?.username}`} />

      {ITEMS.map((item) => (
        <Pressable key={item.key} onPress={() => navigation.navigate(item.key)}>
          <Card style={styles.card}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDesc}>{item.desc}</Text>
          </Card>
        </Pressable>
      ))}

      <Text style={styles.logout} onPress={logOut}>
        Log out of admin
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  itemTitle: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.textPrimary },
  itemDesc: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  logout: {
    fontFamily: typography.body,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.lg,
    textDecorationLine: "underline",
  },
});
