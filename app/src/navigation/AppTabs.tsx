import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ServicesScreen from "../screens/services/ServicesScreen";
import BookAppointmentScreen from "../screens/booking/BookAppointmentScreen";
import AssistantScreen from "../screens/assistant/AssistantScreen";
import MyAppointmentsScreen from "../screens/appointments/MyAppointmentsScreen";
import ManagerTakingsScreen from "../screens/manager/ManagerTakingsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { colors, typography } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();
const BookStack = createNativeStackNavigator();

function BookStackNavigator() {
  return (
    <BookStack.Navigator screenOptions={{ headerShown: false }}>
      <BookStack.Screen name="BookAppointment" component={BookAppointmentScreen} />
    </BookStack.Navigator>
  );
}

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Services: "grid",
  Book: "calendar",
  Assistant: "message-circle",
  Appointments: "clock",
  Takings: "briefcase",
  Profile: "user",
};

export default function AppTabs() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isManager = user?.role === "manager";
  const bottomPad = Math.max(6, insets.bottom);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 52 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
        },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarLabel: ({ color, children }) => (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: typography.bodyMedium,
              fontSize: 10,
              color,
              textAlign: "center",
            }}
          >
            {children}
          </Text>
        ),
        tabBarIcon: ({ color, size }) => (
          <Feather name={ICONS[route.name]} size={size ? size - 3 : 19} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarLabel: t("nav.services") }} />
      <Tab.Screen name="Book" component={BookStackNavigator} options={{ tabBarLabel: t("nav.book") }} />
      <Tab.Screen name="Assistant" component={AssistantScreen} options={{ tabBarLabel: t("nav.assistant") }} />
      <Tab.Screen
        name="Appointments"
        component={MyAppointmentsScreen}
        options={{ tabBarLabel: t("nav.appointments") }}
      />
      {isManager && (
        <Tab.Screen name="Takings" component={ManagerTakingsScreen} options={{ tabBarLabel: t("nav.takings") }} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t("nav.profile") }} />
    </Tab.Navigator>
  );
}
