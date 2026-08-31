import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import AdminStack from "./AdminStack";
import { colors } from "../theme/theme";

export default function RootNavigator() {
  const { user, loading: userLoading } = useAuth();
  const { admin, loading: adminLoading } = useAdminAuth();

  if (userLoading || adminLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (admin) return <AdminStack />;
  if (user) return <AppTabs />;
  return <AuthStack />;
}
