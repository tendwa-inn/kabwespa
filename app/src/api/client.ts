import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Update this to your computer's LAN IP when testing on a physical device,
// e.g. "http://192.168.1.20:4000". Android emulator uses 10.0.2.2 to reach
// the host machine's localhost.
const LOCAL_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE = `http://${LOCAL_HOST}:4000`;

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
  return `${API_BASE}${path}`;
}
