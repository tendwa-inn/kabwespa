import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import * as ImagePicker from "expo-image-picker";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import ServiceIcon from "../../components/ServiceIcon";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, radii, spacing, typography } from "../../theme/theme";
import {
  deleteLocationPhoto,
  fetchServices,
  updateContactInfo,
  updateLocationCoords,
  uploadHeroPhoto,
  uploadLocationPhoto,
  uploadLogoPhoto,
  uploadServicePhoto,
  uploadWelcomeSlidePhoto,
} from "../../api/services";
import { photoUrl } from "../../api/client";
import { Service, Settings } from "../../api/types";

export default function ManagePhotosScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [savingCoords, setSavingCoords] = useState(false);
  const [centerPhone, setCenterPhone] = useState("");
  const [whatsapp1, setWhatsapp1] = useState("");
  const [whatsapp2, setWhatsapp2] = useState("");
  const [whatsappBubble, setWhatsappBubble] = useState("");
  const [locationText, setLocationText] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [addingGalleryPhoto, setAddingGalleryPhoto] = useState(false);

  const load = async () => {
    const data = await fetchServices();
    setServices(data.services);
    setSettings(data.settings);
    setLat(data.settings.locationCoords ? String(data.settings.locationCoords.lat) : "");
    setLng(data.settings.locationCoords ? String(data.settings.locationCoords.lng) : "");
    setCenterPhone(data.settings.centerPhone);
    setWhatsapp1(data.settings.whatsappNumbers[0] || "");
    setWhatsapp2(data.settings.whatsappNumbers[1] || "");
    setWhatsappBubble(data.settings.whatsappBubbleNumber);
    setLocationText(data.settings.location);
  };

  useEffect(() => {
    load();
  }, []);

  const saveCoords = async () => {
    setSavingCoords(true);
    try {
      const data = await updateLocationCoords(lat ? Number(lat) : null, lng ? Number(lng) : null);
      setSettings(data.settings);
      Alert.alert("Saved", "The map pin used for directions has been updated.");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingCoords(false);
    }
  };

  const saveContact = async () => {
    if (!centerPhone.trim() || !whatsapp1.trim() || !whatsapp2.trim() || !whatsappBubble.trim() || !locationText.trim()) {
      Alert.alert("Missing info", "All contact fields are required.");
      return;
    }
    setSavingContact(true);
    try {
      const data = await updateContactInfo({
        centerPhone: centerPhone.trim(),
        whatsappNumbers: [whatsapp1.trim(), whatsapp2.trim()],
        whatsappBubbleNumber: whatsappBubble.trim(),
        location: locationText.trim(),
      });
      setSettings(data.settings);
      Alert.alert("Saved", "Contact details updated.");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingContact(false);
    }
  };

  const addGalleryPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to add gallery photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setAddingGalleryPhoto(true);
    try {
      const data = await uploadLocationPhoto(
        asset.uri,
        asset.fileName || `photo-${Date.now()}.jpg`,
        asset.mimeType || "image/jpeg",
        galleryCaption.trim()
      );
      setSettings(data.settings);
      setGalleryCaption("");
    } catch (e: any) {
      Alert.alert("Upload failed", e.message);
    } finally {
      setAddingGalleryPhoto(false);
    }
  };

  const removeGalleryPhoto = (id: string) => {
    Alert.alert("Remove photo", "This will remove it from the spa gallery.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const data = await deleteLocationPhoto(id);
          setSettings(data.settings);
        },
      },
    ]);
  };

  const pickAndUpload = async (target: "hero" | "logo" | string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to update spa photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const fileName = asset.fileName || `photo-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || "image/jpeg";

    setBusyId(target);
    try {
      if (target === "hero") {
        const data = await uploadHeroPhoto(asset.uri, fileName, mimeType);
        setSettings(data.settings);
      } else if (target === "logo") {
        const data = await uploadLogoPhoto(asset.uri, fileName, mimeType);
        setSettings(data.settings);
      } else if (target.startsWith("welcome:")) {
        const slideId = target.slice("welcome:".length);
        const data = await uploadWelcomeSlidePhoto(slideId, asset.uri, fileName, mimeType);
        setSettings(data.settings);
      } else {
        await uploadServicePhoto(target, asset.uri, fileName, mimeType);
        load();
      }
    } catch (e: any) {
      Alert.alert("Upload failed", e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Manage" title="Photos" subtitle="Choose photos from this device to update the app." />

      <Text style={styles.sectionTitle}>Spa location pin</Text>
      <Text style={styles.hint}>
        Used for the "Get directions" and "Get a ride" options guests see. Drop a pin on your spa in
        Google Maps, then copy the latitude and longitude here for an exact location.
      </Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField label="Latitude" keyboardType="numbers-and-punctuation" value={lat} onChangeText={setLat} placeholder="e.g. -14.4469" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Longitude" keyboardType="numbers-and-punctuation" value={lng} onChangeText={setLng} placeholder="e.g. 28.4464" />
          </View>
        </View>
        <Button label="Save location" onPress={saveCoords} loading={savingCoords} fullWidth={false} />
      </Card>

      <Text style={styles.sectionTitle}>Spa gallery</Text>
      <Text style={styles.hint}>
        Photos guests see to recognise your spa — the gate, entrance, reception, and each room.
      </Text>
      <Card style={styles.card}>
        <TextField
          label="Caption (optional)"
          value={galleryCaption}
          onChangeText={setGalleryCaption}
          placeholder="e.g. Front gate on Kalonga Road"
        />
        <Button label="Add photo" onPress={addGalleryPhoto} loading={addingGalleryPhoto} fullWidth={false} />
      </Card>
      {(settings?.locationPhotos || []).map((item) => (
        <Card key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Image source={{ uri: photoUrl(item.photo)! }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.caption || "Untitled photo"}</Text>
              <Pressable onPress={() => removeGalleryPhoto(item.id)}>
                <Text style={styles.removeLink}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}

      <Text style={styles.sectionTitle}>App logo</Text>
      <Text style={styles.hint}>Replaces the leaf mark shown on sign-in and the welcome screen.</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          {settings?.logo ? (
            <Image source={{ uri: photoUrl(settings.logo)! }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.placeholderTextSmall}>Default mark</Text>
            </View>
          )}
          <Pressable style={styles.uploadButtonSmall} onPress={() => pickAndUpload("logo")}>
            <Text style={styles.uploadButtonText}>{busyId === "logo" ? "Uploading…" : "Choose photo"}</Text>
          </Pressable>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Contact numbers</Text>
      <Card style={styles.card}>
        <TextField label="Center phone" keyboardType="phone-pad" value={centerPhone} onChangeText={setCenterPhone} />
        <TextField label="WhatsApp 1" keyboardType="phone-pad" value={whatsapp1} onChangeText={setWhatsapp1} />
        <TextField label="WhatsApp 2" keyboardType="phone-pad" value={whatsapp2} onChangeText={setWhatsapp2} />
        <TextField
          label="Floating WhatsApp bubble number"
          keyboardType="phone-pad"
          value={whatsappBubble}
          onChangeText={setWhatsappBubble}
        />
        <TextField label="Location" value={locationText} onChangeText={setLocationText} />
        <Button label="Save contact details" onPress={saveContact} loading={savingContact} fullWidth={false} />
      </Card>

      <Text style={styles.sectionTitle}>Home hero photo</Text>
      <Card style={styles.card}>
        {settings?.heroPhoto ? (
          <Image source={{ uri: photoUrl(settings.heroPhoto)! }} style={styles.heroPreview} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.placeholderText}>No hero photo yet</Text>
          </View>
        )}
        <Pressable style={styles.uploadButton} onPress={() => pickAndUpload("hero")}>
          <Text style={styles.uploadButtonText}>{busyId === "hero" ? "Uploading…" : "Choose photo"}</Text>
        </Pressable>
      </Card>

      <Text style={styles.sectionTitle}>Welcome slideshow</Text>
      <Text style={styles.hint}>
        Shown on the first screen guests see. Leave a slide blank to keep the built-in illustration.
      </Text>
      {(settings?.welcomeSlides || []).map((slide) => (
        <Card key={slide.id} style={styles.card}>
          <View style={styles.row}>
            {slide.photo ? (
              <Image source={{ uri: photoUrl(slide.photo)! }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Text style={styles.placeholderTextSmall}>Illustration</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{slide.caption}</Text>
              <Pressable style={styles.uploadButtonSmall} onPress={() => pickAndUpload(`welcome:${slide.id}`)}>
                <Text style={styles.uploadButtonText}>
                  {busyId === `welcome:${slide.id}` ? "Uploading…" : "Choose photo"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}

      <Text style={styles.sectionTitle}>Service photos</Text>
      <Text style={styles.hint}>
        No stock photos are pre-loaded. Add your own — of your space, your therapists, or your clients
        with their consent — for each treatment.
      </Text>
      {services.map((service) => (
        <Card key={service.id} style={styles.card}>
          <View style={styles.row}>
            {service.photo ? (
              <Image source={{ uri: photoUrl(service.photo)! }} style={styles.thumb} />
            ) : (
              <ServiceIcon name={service.name} size={56} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{service.name}</Text>
              <Pressable style={styles.uploadButtonSmall} onPress={() => pickAndUpload(service.id)}>
                <Text style={styles.uploadButtonText}>
                  {busyId === service.id ? "Uploading…" : "Choose photo"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: { marginBottom: spacing.md },
  heroPreview: { width: "100%", height: 160, borderRadius: radii.sm, marginBottom: spacing.sm, backgroundColor: colors.accentSoft },
  heroPlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { fontFamily: typography.body, color: colors.textSecondary },
  logoPreview: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  placeholderTextSmall: { fontFamily: typography.body, color: colors.textSecondary, fontSize: 11, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  thumb: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.accentSoft },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textPrimary, marginBottom: 6 },
  uploadButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  uploadButtonSmall: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  uploadButtonText: { fontFamily: typography.bodyBold, fontSize: 12, color: colors.textOnDark },
  removeLink: { fontFamily: typography.body, fontSize: 12, color: colors.danger, textDecorationLine: "underline" },
});
