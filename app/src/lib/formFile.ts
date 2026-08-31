import { Image, Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

// Vercel serverless functions cap request bodies at ~4.5MB, and both phone
// camera photos and full-quality desktop images routinely exceed that (or
// are just needlessly heavy for what's usually a small on-screen photo).
// Resize + re-encode before upload on every platform so uploads stay small
// and load fast for guests.
const MAX_DIMENSION = 1600;
const COMPRESS_QUALITY = 0.6;

function getImageWidth(uri: string): Promise<number | null> {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width) => resolve(width),
      () => resolve(null)
    );
  });
}

async function compressNative(uri: string): Promise<{ uri: string; mimeType: string }> {
  try {
    const width = await getImageWidth(uri);
    const actions = width && width > MAX_DIMENSION ? [{ resize: { width: MAX_DIMENSION } }] : [];
    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { uri: result.uri, mimeType: "image/jpeg" };
  } catch {
    return { uri, mimeType: "image/jpeg" };
  }
}

// Plain Canvas API — more reliably supported across browsers than
// expo-image-manipulator's web shim (which caused silent upload failures).
async function compressWeb(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas context");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("toBlob failed"))), "image/jpeg", COMPRESS_QUALITY);
  });
}

export async function appendPhotoField(
  form: FormData,
  fieldName: string,
  uri: string,
  fileName: string,
  mimeType: string
) {
  const finalName = fileName.replace(/\.\w+$/, "") + ".jpg";

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const rawBlob = await response.blob();
    let blob = rawBlob;
    try {
      blob = await compressWeb(rawBlob);
    } catch {
      blob = rawBlob;
    }
    form.append(fieldName, blob, finalName);
    return;
  }

  const { uri: finalUri, mimeType: finalType } = await compressNative(uri);
  // @ts-ignore React Native FormData file shape
  form.append(fieldName, { uri: finalUri, name: finalName, type: finalType });
}
