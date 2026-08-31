import { Platform } from "react-native";

export async function appendPhotoField(
  form: FormData,
  fieldName: string,
  uri: string,
  fileName: string,
  mimeType: string
) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    form.append(fieldName, blob, fileName);
  } else {
    // @ts-ignore React Native FormData file shape
    form.append(fieldName, { uri, name: fileName, type: mimeType });
  }
}
