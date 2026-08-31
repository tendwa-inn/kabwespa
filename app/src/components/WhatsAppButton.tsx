import React, { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { fetchServices } from "../api/services";

const DEFAULT_NUMBER = "260974068912";
const WHATSAPP_GREEN = "#25D366";
const SIZE = 54;

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function WhatsAppButton() {
  const [number, setNumber] = useState(DEFAULT_NUMBER);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        if (data.settings.whatsappBubbleNumber) {
          setNumber(digitsOnly(data.settings.whatsappBubbleNumber));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Pressable
      onPress={() => Linking.openURL(`https://wa.me/${number}`)}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
      accessibilityLabel="Message us on WhatsApp"
    >
      <FontAwesome name="whatsapp" size={28} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -SIZE / 2,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: WHATSAPP_GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 50,
  },
});
