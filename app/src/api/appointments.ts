import { apiRequest, USER_TOKEN_KEY, ADMIN_TOKEN_KEY } from "./client";
import { Appointment } from "./types";

export function createAppointment(params: {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  promoCode?: string;
}) {
  return apiRequest<{ appointment: Appointment }>("/api/appointments", {
    method: "POST",
    body: params,
    tokenKey: USER_TOKEN_KEY,
  });
}

export function fetchMyAppointments() {
  return apiRequest<{ appointments: Appointment[] }>("/api/appointments/mine", {
    tokenKey: USER_TOKEN_KEY,
  });
}

export function cancelAppointment(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/appointments/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}

export function fetchAllAppointments() {
  return apiRequest<{ appointments: Appointment[] }>("/api/appointments", {
    tokenKey: ADMIN_TOKEN_KEY,
  });
}

export function checkPromoCode(code: string, serviceId: string) {
  return apiRequest<{ promoCode: any }>("/api/promo-codes/check", {
    method: "POST",
    body: { code, serviceId },
    tokenKey: USER_TOKEN_KEY,
  });
}
