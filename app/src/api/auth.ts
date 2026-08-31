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
