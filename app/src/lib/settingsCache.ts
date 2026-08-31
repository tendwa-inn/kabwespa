import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings } from "../api/types";

const KEY = "kabwe.settings.cache";

// Synchronous on web so first paint can already use last-known settings
// (logo, welcome slides, etc) instead of flashing placeholders while the
// network fetch is in flight. Native has no synchronous storage, so native
// screens fall back to the async read below.
export function readSettingsCacheSync(): Settings | null {
  if (Platform.OS !== "web") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function readSettingsCacheAsync(): Promise<Settings | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSettingsCache(settings: Settings) {
  const raw = JSON.stringify(settings);
  if (Platform.OS === "web") {
    try {
      window.localStorage.setItem(KEY, raw);
    } catch {}
  }
  AsyncStorage.setItem(KEY, raw).catch(() => {});
}
