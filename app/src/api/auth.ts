import { apiRequest, USER_TOKEN_KEY } from "./client";
import { appendPhotoField } from "../lib/formFile";
import { User } from "./types";

export function checkUsername(username: string) {
  return apiRequest<{ available: boolean }>(
    `/api/auth/check-username?username=${encodeURIComponent(username)}`
  );
}

export function refreshSession() {
  return apiRequest<{ token: string; user: User }>("/api/auth/me", {
    tokenKey: USER_TOKEN_KEY,
  });
}

export async function uploadProfilePhoto(uri: string, fileName: string, mimeType: string) {
  const form = new FormData();
  await appendPhotoField(form, "photo", uri, fileName, mimeType);
  return apiRequest<{ user: User }>("/api/auth/photo", {
    method: "POST",
    body: form,
    tokenKey: USER_TOKEN_KEY,
    isForm: true,
  });
}

export function updateDisplayName(fullName: string) {
  return apiRequest<{ user: User }>("/api/auth/display-name", {
    method: "PUT",
    body: { fullName },
    tokenKey: USER_TOKEN_KEY,
  });
}

export function updateUsername(username: string) {
  return apiRequest<{ token: string; user: User }>("/api/auth/username", {
    method: "PUT",
    body: { username },
    tokenKey: USER_TOKEN_KEY,
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ ok: boolean }>("/api/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
    tokenKey: USER_TOKEN_KEY,
  });
}
