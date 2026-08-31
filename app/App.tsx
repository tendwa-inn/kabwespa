import "react-native-gesture-handler";
import "./src/i18n";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { Karla_400Regular, Karla_500Medium, Karla_700Bold } from "@expo-google-fonts/karla";

import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import WhatsAppButton from "./src/components/WhatsAppButton";
import AlertHost from "./src/components/AlertHost";
import { colors } from "./src/theme/theme";
import { restoreLanguage } from "./src/i18n";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Karla_400Regular,
    Karla_500Medium,
    Karla_700Bold,
  });
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    restoreLanguage().finally(() => setLanguageReady(true));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && languageReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, languageReady]);

  if (!fontsLoaded || !languageReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <AuthProvider>
            <NavigationContainer
              theme={{
                dark: true,
                colors: {
                  primary: colors.primary,
                  background: colors.background,
                  card: colors.surface,
                  text: colors.textPrimary,
                  border: colors.border,
                  notification: colors.accent,
                },
                fonts: {
                  regular: { fontFamily: "Karla_400Regular", fontWeight: "400" },
                  medium: { fontFamily: "Karla_500Medium", fontWeight: "500" },
                  bold: { fontFamily: "Karla_700Bold", fontWeight: "700" },
                  heavy: { fontFamily: "Karla_700Bold", fontWeight: "700" },
                },
              }}
            >
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
          <WhatsAppButton />
          <AlertHost />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
