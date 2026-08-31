import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, currency, radii, spacing, typography } from "../../theme/theme";
import { fetchServices } from "../../api/services";
import { recordManagerExpense, recordManagerIncome } from "../../api/manager";
import { Service } from "../../api/types";

type LoggedEntry = { id: string; label: string; amount: number; type: "income" | "expense" };

export default function ManagerTakingsScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [savingIncome, setSavingIncome] = useState(false);

  const [description, setDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);

  const [logged, setLogged] = useState<LoggedEntry[]>([]);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServices(data.services);
        if (data.services[0]) {
          setServiceId(data.services[0].id);
          setAmount(String(data.services[0].price));
        }
      })
      .catch(() => {});
  }, []);

  const selected = services.find((s) => s.id === serviceId);

  const saveIncome = async () => {
    if (!serviceId || !amount) return;
    setSavingIncome(true);
    try {
      const data = await recordManagerIncome(serviceId, Number(amount));
      setLogged((prev) => [
        { id: data.transaction.id, label: data.transaction.serviceName || "", amount: data.transaction.amount, type: "income" },
        ...prev,
      ]);
      Alert.alert("Recorded", "This has been sent to the admin.");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingIncome(false);
    }
  };

  const saveExpense = async () => {
    if (!description.trim() || !expenseAmount) return;
    setSavingExpense(true);
    try {
      const data = await recordManagerExpense(description.trim(), Number(expenseAmount));
      setLogged((prev) => [
        { id: data.transaction.id, label: data.transaction.description || "", amount: data.transaction.amount, type: "expense" },
        ...prev,
      ]);
      setDescription("");
      setExpenseAmount("");
      Alert.alert("Recorded", "This has been sent to the admin.");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingExpense(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader
        eyebrow="Manager"
        title="Record Takings"
        subtitle="Entries are sent straight to admin — you can't edit or remove them here."
      />

      <Text style={styles.sectionTitle}>Record a completed massage</Text>
      <Card style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {services.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => {
                setServiceId(s.id);
                setAmount(String(s.price));
              }}
              style={[styles.serviceChip, serviceId === s.id && styles.serviceChipActive]}
            >
              <Text style={[styles.serviceChipText, serviceId === s.id && styles.serviceChipTextActive]}>{s.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <TextField
          label={`Amount received (standard: ${selected ? currency(selected.price) : "-"})`}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Button label="+ Record massage" onPress={saveIncome} loading={savingIncome} />
      </Card>

      <Text style={styles.sectionTitle}>Add an expense</Text>
      <Card style={styles.card}>
        <TextField label="Description" value={description} onChangeText={setDescription} placeholder="e.g. oils, laundry" />
        <TextField label="Amount (K)" keyboardType="numeric" value={expenseAmount} onChangeText={setExpenseAmount} />
        <Button label="− Add expense" variant="danger" onPress={saveExpense} loading={savingExpense} />
      </Card>

      {logged.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recorded this session</Text>
          {logged.map((entry) => (
            <Card key={entry.id} style={styles.logCard}>
              <Text style={styles.logLabel}>{entry.label}</Text>
              <Text style={[styles.logAmount, { color: entry.type === "income" ? colors.success : colors.danger }]}>
                {entry.type === "income" ? "+" : "−"}
                {currency(entry.amount)}
              </Text>
            </Card>
          ))}
        </>
      )}
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
  serviceChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  serviceChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceChipText: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textPrimary },
  serviceChipTextActive: { color: colors.textOnDark },
  logCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  logLabel: { fontFamily: typography.bodyMedium, fontSize: 14, color: colors.textPrimary },
  logAmount: { fontFamily: typography.bodyBold, fontSize: 14 },
});
