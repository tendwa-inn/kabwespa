import React, { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Alert } from "../lib/alertShim";
import Card from "./Card";
import { colors, spacing, typography } from "../theme/theme";
import { fetchServices } from "../api/services";
import { LocationCoords } from "../api/types";

const YANGO_PLAY_STORE = "https://play.google.com/store/apps/details?id=com.yandex.yango";
const YANGO_APP_STORE = "https://apps.apple.com/us/app/yango-taxi-food-delivery/id1437157286";

const DEFAULT_CENTER_PHONE = "+26077686722";
const DEFAULT_WHATSAPP_NUMBERS = ["+260974068912", "+260772180359"];
const DEFAULT_LOCATION = "Highridge, Kabwe";
const SPA_NAME = "The Kabwe Spa";

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

function confirmAndOpen(title: string, message: string, actionLabel: string, url: string, cancelLabel: string) {
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    { text: actionLabel, onPress: () => Linking.openURL(url) },
  ]);
}

function mapsUrl(coords: LocationCoords | null, location: string) {
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(location + ", Zambia")}`;
}

function detectMobileOS(): "ios" | "android" | null {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Android/i.test(ua)) return "android";
  }
  return null;
}

// Yango's app-opening deep link needs a partner tracking token we don't
// have (issued directly by Yango, not something available generically).
// Best available option on a phone: send guests straight to Yango's store
// listing so they can open it (if installed) or install it in one tap.
function rideUrl(coords: LocationCoords | null, location: string) {
  const os = detectMobileOS();
  if (os === "ios") return YANGO_APP_STORE;
  if (os === "android") return YANGO_PLAY_STORE;
  if (coords) {
    return `https://yango.com/en_int/order/?gto=${coords.lng},${coords.lat}`;
  }
  return "https://yango.com/en_int/order/";
}

export default function ContactInfo() {
  const { t } = useTranslation();
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [centerPhone, setCenterPhone] = useState(DEFAULT_CENTER_PHONE);
  const [whatsappNumbers, setWhatsappNumbers] = useState(DEFAULT_WHATSAPP_NUMBERS);
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setCoords(data.settings.locationCoords);
        if (data.settings.centerPhone) setCenterPhone(data.settings.centerPhone);
        if (data.settings.whatsappNumbers?.length) setWhatsappNumbers(data.settings.whatsappNumbers);
        if (data.settings.location) setLocation(data.settings.location);
      })
      .catch(() => {});
  }, []);

  const openDirections = () => {
    Alert.alert(location, "How would you like to get there?", [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.openInMaps"), onPress: () => Linking.openURL(mapsUrl(coords, location)) },
      { text: t("common.getARide"), onPress: () => Linking.openURL(rideUrl(coords, location)) },
    ]);
  };

  return (
    <Card>
      <Row
        label={t("contact.callCenter")}
        value={centerPhone}
        onPress={() =>
          confirmAndOpen("Call the center?", centerPhone, t("common.call"), `tel:${centerPhone}`, t("common.cancel"))
        }
      />
      <Divider />
      {whatsappNumbers.map((num, idx) => (
        <React.Fragment key={num}>
          <Row
            label={`WhatsApp ${idx === 0 ? "" : idx + 1}`.trim()}
            value={num}
            onPress={() =>
              confirmAndOpen(
                "Message on WhatsApp?",
                num,
                t("common.openWhatsApp"),
                `https://wa.me/${digitsOnly(num)}`,
                t("common.cancel")
              )
            }
          />
          <Divider />
        </React.Fragment>
      ))}
      <Row label={t("contact.location")} value={location} onPress={openDirections} />
    </Card>
  );
}

function Row({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Text onPress={onPress} style={styles.rowTouchable}>
      <Text style={styles.rowLabel}>{label}{"\n"}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Text>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  rowTouchable: { paddingVertical: spacing.sm },
  rowLabel: { fontFamily: typography.bodyMedium, fontSize: 12, color: colors.textSecondary },
  rowValue: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.primary },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
