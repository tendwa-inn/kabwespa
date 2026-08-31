import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManagePricesScreen from "../screens/admin/ManagePricesScreen";
import ManagePhotosScreen from "../screens/admin/ManagePhotosScreen";
import TransactionsScreen from "../screens/admin/TransactionsScreen";
import AppointmentsAdminScreen from "../screens/admin/AppointmentsAdminScreen";
import PromoCodesScreen from "../screens/admin/PromoCodesScreen";
import ChangePasswordScreen from "../screens/admin/ChangePasswordScreen";
import ManageAssistantScreen from "../screens/admin/ManageAssistantScreen";
import ManageUsersScreen from "../screens/admin/ManageUsersScreen";
import { colors, typography } from "../theme/theme";

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { fontFamily: typography.bodyBold, color: colors.textPrimary },
  headerTintColor: colors.primary,
  headerShadowVisible: false,
};

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManagePrices" component={ManagePricesScreen} options={{ headerShown: true, title: "Prices", ...headerOptions }} />
      <Stack.Screen name="ManagePhotos" component={ManagePhotosScreen} options={{ headerShown: true, title: "Photos", ...headerOptions }} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ headerShown: true, title: "Takings & Expenses", ...headerOptions }} />
      <Stack.Screen name="AppointmentsAdmin" component={AppointmentsAdminScreen} options={{ headerShown: true, title: "Bookings", ...headerOptions }} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ headerShown: true, title: "Users", ...headerOptions }} />
      <Stack.Screen name="PromoCodes" component={PromoCodesScreen} options={{ headerShown: true, title: "Promo Codes", ...headerOptions }} />
      <Stack.Screen name="ManageAssistant" component={ManageAssistantScreen} options={{ headerShown: true, title: "Assistant Questions", ...headerOptions }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: "Account Settings", ...headerOptions }} />
    </Stack.Navigator>
  );
}
