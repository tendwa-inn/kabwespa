import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, USER_TOKEN_KEY } from "../api/client";
import { refreshSession } from "../api/auth";
import { User } from "../api/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (params: {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    area: string;
  }) => Promise<void>;
  logIn: (params: { username: string; password: string }) => Promise<void>;
  logOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateSession: (token: string, user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loggedInRef = useRef(false);

  const persist = async (token: string, profile: User) => {
    await AsyncStorage.setItem(USER_TOKEN_KEY, token);
    await AsyncStorage.setItem("kabwe.user.profile", JSON.stringify(profile));
    setUser(profile);
    loggedInRef.current = true;
  };

  const silentRefresh = async () => {
    if (!loggedInRef.current) return;
    try {
      const data = await refreshSession();
      await persist(data.token, data.user);
    } catch {
      // Stale token or account removed — leave the cached session as-is
      // rather than logging the user out over a transient network error.
    }
  };

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem("kabwe.user.profile");
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        loggedInRef.current = true;
      }
      setLoading(false);
      silentRefresh();
    })();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") silentRefresh();
    });
    return () => subscription.remove();
  }, []);

  const signUp: AuthContextValue["signUp"] = async (params) => {
    const data = await apiRequest<{ token: string; user: User }>("/api/auth/signup", {
      method: "POST",
      body: params,
    });
    await persist(data.token, data.user);
  };

  const logIn: AuthContextValue["logIn"] = async (params) => {
    const data = await apiRequest<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: params,
    });
    await persist(data.token, data.user);
  };

  const logOut = async () => {
    loggedInRef.current = false;
    await AsyncStorage.multiRemove([USER_TOKEN_KEY, "kabwe.user.profile"]);
    setUser(null);
  };

  const updateUser = async (profile: User) => {
    await AsyncStorage.setItem("kabwe.user.profile", JSON.stringify(profile));
    setUser(profile);
  };

  const updateSession = async (token: string, profile: User) => {
    await persist(token, profile);
  };

  const value = useMemo(
    () => ({ user, loading, signUp, logIn, logOut, updateUser, updateSession }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
