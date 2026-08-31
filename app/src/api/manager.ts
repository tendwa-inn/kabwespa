import { apiRequest, USER_TOKEN_KEY } from "./client";
import { Transaction } from "./types";

export function recordManagerIncome(serviceId: string, amount: number) {
  return apiRequest<{ transaction: Transaction }>("/api/transactions/income", {
    method: "POST",
    body: { serviceId, amount },
    tokenKey: USER_TOKEN_KEY,
  });
}

export function recordManagerExpense(description: string, amount: number) {
  return apiRequest<{ transaction: Transaction }>("/api/transactions/expense", {
    method: "POST",
    body: { description, amount },
    tokenKey: USER_TOKEN_KEY,
  });
}
