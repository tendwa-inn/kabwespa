import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// EXPO_PUBLIC_API_URL overrides everything below (set it for native builds
// pointed at a deployed API). On web in production, requests go to the same
// origin's /api routes. In local dev, use the LAN IP / emulator host below
// (10.0.2.2 reaches the host machine's localhost from the Android emulator).
const LOCAL_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
export const API_BASE =
  envApiUrl || (Platform.OS === "web" && !__DEV__ ? "" : `http://${LOCAL_HOST}:4000`);

export const USER_TOKEN_KEY = "kabwe.user.token";
export const ADMIN_TOKEN_KEY = "kabwe.admin.token";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  tokenKey?: string | null;
  isForm?: boolean;
};

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, tokenKey, isForm } = options;
  const headers: Record<string, string> = {};
  if (!isForm) headers["Content-Type"] = "application/json";

  if (tokenKey) {
    const token = await AsyncStorage.getItem(tokenKey);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function photoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}
