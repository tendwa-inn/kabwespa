import { apiRequest, USER_TOKEN_KEY } from "./client";
import { Transaction, PromoCode, AdminUserRow, TransactionsSummary, CarriedForwardEntry } from "./types";

export function fetchTransactions() {
  return apiRequest<{
    transactions: Transaction[];
    carriedForwardEntries: CarriedForwardEntry[];
    summary: TransactionsSummary;
  }>("/api/transactions", {
    tokenKey: USER_TOKEN_KEY,
  });
}

export function addCarriedForward(amount: number, note?: string) {
  return apiRequest<{ entry: CarriedForwardEntry; summary: TransactionsSummary }>(
    "/api/transactions/carried-forward",
    {
      method: "POST",
      body: { amount, note },
      tokenKey: USER_TOKEN_KEY,
    }
  );
}

export function updateCarriedForwardEntry(id: string, changes: { amount?: number; note?: string }) {
  return apiRequest<{ entry: CarriedForwardEntry; summary: TransactionsSummary }>(
    `/api/transactions/carried-forward/${id}`,
    {
      method: "PUT",
      body: changes,
      tokenKey: USER_TOKEN_KEY,
    }
  );
}

export function deleteCarriedForwardEntry(id: string) {
  return apiRequest<{ ok: boolean; summary: TransactionsSummary }>(`/api/transactions/carried-forward/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}

export function addIncome(serviceId: string, amount: number, notes?: string) {
  return apiRequest<{ transaction: Transaction }>("/api/transactions/income", {
    method: "POST",
    body: { serviceId, amount, notes },
    tokenKey: USER_TOKEN_KEY,
  });
}

export function addExpense(description: string, amount: number) {
  return apiRequest<{ transaction: Transaction }>("/api/transactions/expense", {
    method: "POST",
    body: { description, amount },
    tokenKey: USER_TOKEN_KEY,
  });
}

export function clearTransaction(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/transactions/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}

export function fetchPromoCodes() {
  return apiRequest<{ promoCodes: PromoCode[] }>("/api/promo-codes", { tokenKey: USER_TOKEN_KEY });
}

export function addPromoCode(params: {
  code: string;
  type: "percent" | "fixed";
  value: number;
  serviceId?: string | null;
  expiresAt?: string | null;
  maxUses?: number | null;
}) {
  return apiRequest<{ promoCode: PromoCode }>("/api/promo-codes", {
    method: "POST",
    body: params,
    tokenKey: USER_TOKEN_KEY,
  });
}

export function deletePromoCode(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/promo-codes/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}

export function fetchUsers() {
  return apiRequest<{ users: AdminUserRow[] }>("/api/users", { tokenKey: USER_TOKEN_KEY });
}

export function createManagerAccount(params: {
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  area?: string;
  role?: "user" | "manager";
}) {
  return apiRequest<{ user: AdminUserRow }>("/api/users", {
    method: "POST",
    body: params,
    tokenKey: USER_TOKEN_KEY,
  });
}

export function updateUserRole(id: string, role: "user" | "manager") {
  return apiRequest<{ user: { id: string; role: string } }>(`/api/users/${id}/role`, {
    method: "PUT",
    body: { role },
    tokenKey: USER_TOKEN_KEY,
  });
}

export function deleteUser(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/users/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}
