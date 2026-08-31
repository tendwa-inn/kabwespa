import { Image, Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

// Vercel serverless functions cap request bodies at ~4.5MB, and phone camera
// photos routinely exceed that. Resize + re-encode before upload so this
// never hits the limit.
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

async function compress(uri: string): Promise<{ uri: string; mimeType: string }> {
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

export async function appendPhotoField(
  form: FormData,
  fieldName: string,
  uri: string,
  fileName: string,
  mimeType: string
) {
  const { uri: finalUri, mimeType: finalType } = await compress(uri);
  const finalName = fileName.replace(/\.\w+$/, "") + ".jpg";

  if (Platform.OS === "web") {
    const response = await fetch(finalUri);
    const blob = await response.blob();
    form.append(fieldName, blob, finalName);
  } else {
    // @ts-ignore React Native FormData file shape
    form.append(fieldName, { uri: finalUri, name: finalName, type: finalType });
  }
}
