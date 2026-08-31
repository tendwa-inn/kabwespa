import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../../components/ScreenHeader";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { fetchServices } from "../../api/services";

const DEFAULT_NUMBER = "260974068912";

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function ReportProblemScreen() {
  const navigation = useNavigation<any>();
  const [message, setMessage] = useState("");
  const [number, setNumber] = useState(DEFAULT_NUMBER);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        if (data.settings.whatsappBubbleNumber) setNumber(digitsOnly(data.settings.whatsappBubbleNumber));
      })
      .catch(() => {});
  }, []);

  const send = () => {
    const text = message.trim()
      ? `Hi, I'd like to report a problem with The Kabwe Spa app:\n\n${message.trim()}`
      : "Hi, I'd like to report a problem with The Kabwe Spa app.";
    Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← Back
      </Text>
      <ScreenHeader
        eyebrow="Support"
        title="Report a Problem"
        subtitle="Tell us what went wrong and we'll get back to you on WhatsApp."
      />
      <TextField
        label="What happened?"
        value={message}
        onChangeText={setMessage}
        placeholder="e.g. My booking didn't save, or a photo won't upload"
        multiline
        numberOfLines={5}
        style={{ minHeight: 110, textAlignVertical: "top" }}
      />
      <Button label="Send on WhatsApp" onPress={send} />
      <Text style={styles.hint}>This opens WhatsApp with your message pre-filled — nothing sends until you do.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  back: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  hint: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
