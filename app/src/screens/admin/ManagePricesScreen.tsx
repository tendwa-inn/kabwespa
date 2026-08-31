import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, spacing, typography } from "../../theme/theme";
import { createService, deleteService, fetchServices, updateService } from "../../api/services";
import { Service } from "../../api/types";

type Draft = { price: string; description: string; videoUrl: string };

export default function ManagePricesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState<Record<string, string>>({ massage: "", beauty: "" });
  const [newPrice, setNewPrice] = useState<Record<string, string>>({ massage: "", beauty: "" });
  const [creating, setCreating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchServices();
      setServices(data.services);
      const nextDrafts: Record<string, Draft> = {};
      data.services.forEach((s) => {
        nextDrafts[s.id] = { price: String(s.price), description: s.description, videoUrl: s.videoUrl || "" };
      });
      setDrafts(nextDrafts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (service: Service) => {
    const draft = drafts[service.id];
    const value = Number(draft.price);
    if (!Number.isFinite(value) || value < 0) {
      Alert.alert("Invalid price", "Enter a positive number.");
      return;
    }
    setSavingId(service.id);
    try {
      await updateService(service.id, { price: value, description: draft.description, videoUrl: draft.videoUrl });
      Alert.alert("Saved", `${service.name} is now K${value}.`);
      load();
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingId(null);
    }
  };

  const remove = (service: Service) => {
    Alert.alert("Remove service", `"${service.name}" will no longer be offered to guests.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setDeletingId(service.id);
          try {
            await deleteService(service.id);
            load();
          } catch (e: any) {
            Alert.alert("Could not remove", e.message);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const create = async (category: "massage" | "beauty") => {
    const name = newName[category].trim();
    const price = Number(newPrice[category]);
    if (!name) {
      Alert.alert("Missing name", "Enter a name for the new service.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      Alert.alert("Invalid price", "Enter a positive number.");
      return;
    }
    setCreating(category);
    try {
      await createService({ category, name, price });
      setNewName((prev) => ({ ...prev, [category]: "" }));
      setNewPrice((prev) => ({ ...prev, [category]: "" }));
      load();
    } catch (e: any) {
      Alert.alert("Could not add service", e.message);
    } finally {
      setCreating(null);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Manage" title="Prices" subtitle="Update what guests see on the Services tab." />

      {(["massage", "beauty"] as const).map((cat) => (
        <View key={cat}>
          <Text style={styles.sectionTitle}>{cat === "massage" ? "Massage" : "Beauty"}</Text>
          {services
            .filter((s) => s.category === cat)
            .map((service) => (
              <Card key={service.id} style={styles.card}>
                <Text style={styles.name}>{service.name}</Text>
                <TextField
                  label="Price (K)"
                  keyboardType="numeric"
                  value={drafts[service.id]?.price ?? ""}
                  onChangeText={(v) => setDrafts((prev) => ({ ...prev, [service.id]: { ...prev[service.id], price: v } }))}
                />
                <TextField
                  label="Description"
                  value={drafts[service.id]?.description ?? ""}
                  onChangeText={(v) =>
                    setDrafts((prev) => ({ ...prev, [service.id]: { ...prev[service.id], description: v } }))
                  }
                  placeholder="Short description guests will see"
                  multiline
                />
                <TextField
                  label="YouTube video link (optional)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={drafts[service.id]?.videoUrl ?? ""}
                  onChangeText={(v) =>
                    setDrafts((prev) => ({ ...prev, [service.id]: { ...prev[service.id], videoUrl: v } }))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <View style={styles.row}>
                  <Button label="Save" onPress={() => save(service)} loading={savingId === service.id} fullWidth={false} />
                  <Pressable onPress={() => remove(service)} disabled={deletingId === service.id}>
                    <Text style={styles.removeLink}>{deletingId === service.id ? "Removing…" : "Remove"}</Text>
                  </Pressable>
                </View>
              </Card>
            ))}

          <Card style={styles.card}>
            <Text style={styles.name}>Add a {cat} service</Text>
            <TextField
              label="Name"
              value={newName[cat]}
              onChangeText={(v) => setNewName((prev) => ({ ...prev, [cat]: v }))}
              placeholder="e.g. Hot Stone Massage"
            />
            <TextField
              label="Price (K)"
              keyboardType="numeric"
              value={newPrice[cat]}
              onChangeText={(v) => setNewPrice((prev) => ({ ...prev, [cat]: v }))}
            />
            <Button label="Add service" onPress={() => create(cat)} loading={creating === cat} fullWidth={false} />
          </Card>
        </View>
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
  name: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  removeLink: { fontFamily: typography.body, fontSize: 13, color: colors.danger, textDecorationLine: "underline" },
});
