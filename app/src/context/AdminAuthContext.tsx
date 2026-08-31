import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, ADMIN_TOKEN_KEY } from "../api/client";

type Admin = { id: string; username: string; displayName: string };

type AdminAuthContextValue = {
  admin: Admin | null;
  loading: boolean;
  logIn: (params: { username: string; password: string }) => Promise<void>;
  logOut: () => Promise<void>;
  updateAdmin: (admin: Admin) => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
      const storedAdmin = await AsyncStorage.getItem("kabwe.admin.profile");
      if (token && storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
      setLoading(false);
    })();
  }, []);

  const logIn: AdminAuthContextValue["logIn"] = async (params) => {
    const data = await apiRequest<{ token: string; admin: Admin }>("/api/admin/auth/login", {
      method: "POST",
      body: params,
    });
    await AsyncStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    await AsyncStorage.setItem("kabwe.admin.profile", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logOut = async () => {
    await AsyncStorage.multiRemove([ADMIN_TOKEN_KEY, "kabwe.admin.profile"]);
    setAdmin(null);
  };

  const updateAdmin = async (nextAdmin: Admin) => {
    await AsyncStorage.setItem("kabwe.admin.profile", JSON.stringify(nextAdmin));
    setAdmin(nextAdmin);
  };

  const value = useMemo(() => ({ admin, loading, logIn, logOut, updateAdmin }), [admin, loading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
