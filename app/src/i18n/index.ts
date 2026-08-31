import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en";
import ar from "./locales/ar";
import ny from "./locales/ny";
import bem from "./locales/bem";
import zh from "./locales/zh";
import hi from "./locales/hi";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ny", label: "Chichewa" },
  { code: "bem", label: "Ichibemba" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export const RTL_LANGUAGES: LanguageCode[] = ["ar"];

const LANGUAGE_STORAGE_KEY = "kabwe.language";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    ny: { translation: ny },
    bem: { translation: bem },
    zh: { translation: zh },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export async function restoreLanguage() {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) await i18n.changeLanguage(stored);
  } catch {
    // Ignore — falls back to English.
  }
}

export async function setLanguage(code: LanguageCode) {
  await i18n.changeLanguage(code);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
}

export default i18n;
