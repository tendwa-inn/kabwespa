import { apiRequest, USER_TOKEN_KEY } from "./client";
import { appendPhotoField } from "../lib/formFile";
import { Service, Settings } from "./types";

export function fetchServices() {
  return apiRequest<{ services: Service[]; settings: Settings }>("/api/services");
}

export function createService(params: {
  category: "massage" | "beauty";
  name: string;
  price: number;
  description?: string;
}) {
  return apiRequest<{ service: Service }>(`/api/services`, {
    method: "POST",
    body: params,
    tokenKey: USER_TOKEN_KEY,
  });
}

export function deleteService(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/services/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}

export function updateService(
  id: string,
  changes: { price?: number; description?: string; name?: string; videoUrl?: string }
) {
  return apiRequest<{ service: Service }>(`/api/services/${id}`, {
    method: "PUT",
    body: changes,
    tokenKey: USER_TOKEN_KEY,
  });
}

export async function uploadServicePhoto(id: string, uri: string, fileName: string, mimeType: string) {
  const form = new FormData();
  await appendPhotoField(form, "photo", uri, fileName, mimeType);
  return apiRequest<{ service: Service }>(`/api/services/${id}/photo`, {
    method: "POST",
    body: form,
    tokenKey: USER_TOKEN_KEY,
    isForm: true,
  });
}

export async function uploadHeroPhoto(uri: string, fileName: string, mimeType: string) {
  const form = new FormData();
  await appendPhotoField(form, "photo", uri, fileName, mimeType);
  return apiRequest<{ settings: Settings }>(`/api/services/hero-photo`, {
    method: "POST",
    body: form,
    tokenKey: USER_TOKEN_KEY,
    isForm: true,
  });
}

export async function uploadLogoPhoto(uri: string, fileName: string, mimeType: string) {
  const form = new FormData();
  await appendPhotoField(form, "photo", uri, fileName, mimeType);
  return apiRequest<{ settings: Settings }>(`/api/services/logo-photo`, {
    method: "POST",
    body: form,
    tokenKey: USER_TOKEN_KEY,
    isForm: true,
  });
}

export function updateContactInfo(changes: {
  centerPhone?: string;
  whatsappNumbers?: string[];
  whatsappBubbleNumber?: string;
  location?: string;
}) {
  return apiRequest<{ settings: Settings }>(`/api/services/contact`, {
    method: "PUT",
    body: changes,
    tokenKey: USER_TOKEN_KEY,
  });
}

export async function uploadLocationPhoto(uri: string, fileName: string, mimeType: string, caption: string) {
  const form = new FormData();
  await appendPhotoField(form, "photo", uri, fileName, mimeType);
  form.append("caption", caption);
  return apiRequest<{ settings: Settings }>(`/api/services/location-photos`, {
    method: "POST",
    body: form,
    tokenKey: USER_TOKEN_KEY,
    isForm: true,
  });
}

export function deleteLocationPhoto(id: string) {
  return apiRequest<{ settings: Settings }>(`/api/services/location-photos/${id}`, {
    method: "DELETE",
    tokenKey: USER_TOKEN_KEY,
  });
}

export function updateLocationCoords(lat: number | null, lng: number | null) {
  return apiRequest<{ settings: Settings }>(`/api/services/location`, {
    method: "PUT",
    body: { lat, lng },
    tokenKey: USER_TOKEN_KEY,
  });
}

export async function uploadWelcomeSlidePhoto(slideId: string, uri: string, fileName: string, mimeType: string) {
  const form = new FormData();
  await appendPhotoField(form, "photo", uri, fileName, mimeType);
  return apiRequest<{ settings: Settings }>(`/api/services/welcome-slides/${slideId}/photo`, {
    method: "POST",
    body: form,
    tokenKey: USER_TOKEN_KEY,
    isForm: true,
  });
}
