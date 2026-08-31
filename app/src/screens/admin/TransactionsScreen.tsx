import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, currency, radii, spacing, typography } from "../../theme/theme";
import {
  addCarriedForward,
  addExpense,
  addIncome,
  clearTransaction,
  deleteCarriedForwardEntry,
  fetchTransactions,
  updateCarriedForwardEntry,
} from "../../api/admin";
import { fetchServices } from "../../api/services";
import { photoUrl } from "../../api/client";
import { CarriedForwardEntry, Transaction, TransactionsSummary } from "../../api/types";
import { Service } from "../../api/types";
import { groupByKey, monthKey, monthLabel, weekKey, weekLabel } from "../../lib/dateGroups";
import { downloadCsv, toCsv } from "../../lib/exportCsv";
import { exportStatementPdf } from "../../lib/exportPdf";

type GroupMode = "all" | "weekly" | "monthly";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionsSummary>({ income: 0, expense: 0, carriedForward: 0, balance: 0 });
  const [services, setServices] = useState<Service[]>([]);
  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [groupMode, setGroupMode] = useState<GroupMode>("all");
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [carriedForwardEntries, setCarriedForwardEntries] = useState<CarriedForwardEntry[]>([]);
  const [carriedForwardModal, setCarriedForwardModal] = useState<CarriedForwardEntry | null | "new">(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const load = async () => {
    const [tx, sv] = await Promise.all([fetchTransactions(), fetchServices()]);
    setTransactions(tx.transactions);
    setSummary(tx.summary);
    setCarriedForwardEntries(tx.carriedForwardEntries);
    setServices(sv.services);
    setLogoUrl(photoUrl(sv.settings.logo));
  };

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => {
    if (groupMode === "all") return null;
    const getKey = groupMode === "weekly" ? weekKey : monthKey;
    const getLabel = groupMode === "weekly" ? weekLabel : monthLabel;
    return groupByKey(transactions, (t) => getKey(t.createdAt)).map((g) => {
      const income = g.items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = g.items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: getLabel(g.key), items: g.items, income, expense, balance: income - expense };
    });
  }, [transactions, groupMode]);

  const onClear = (id: string) => {
    Alert.alert("Clear transaction", "This will permanently remove this entry.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearTransaction(id);
          load();
        },
      },
    ]);
  };

  const removeCarriedForward = (entry: CarriedForwardEntry) => {
    Alert.alert("Delete entry", "This will permanently remove this carried forward amount.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const data = await deleteCarriedForwardEntry(entry.id);
          setSummary(data.summary);
          load();
        },
      },
    ]);
  };

  const exportToPdf = async () => {
    setExportingPdf(true);
    try {
      const scopeLabel =
        groupMode === "all"
          ? "All recorded entries"
          : groupMode === "weekly"
          ? "Grouped by week"
          : "Grouped by month";
      await exportStatementPdf(transactions, summary, scopeLabel, logoUrl);
    } catch (e: any) {
      Alert.alert("Export failed", e.message);
    } finally {
      setExportingPdf(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const rows: (string | number)[][] = [
        ["Date", "Time", "Type", "Description", "Standard Price", "Discounted", "Amount", "Recorded By"],
        ...transactions.map((t) => {
          const created = new Date(t.createdAt);
          return [
            created.toLocaleDateString(),
            created.toLocaleTimeString(),
            t.type,
            t.type === "income" ? t.serviceName || "" : t.description || "",
            t.type === "income" ? t.standardPrice ?? "" : "",
            t.type === "income" && t.isDiscounted ? "Yes" : "",
            t.amount,
            t.createdBy,
          ];
        }),
        [],
        ["Income", summary.income],
        ["Expenses", summary.expense],
        ["Carried Forward", summary.carriedForward],
        ["Balance", summary.balance],
      ];
      await downloadCsv(`kabwe-spa-transactions-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    } catch (e: any) {
      Alert.alert("Export failed", e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader eyebrow="Manage" title="Takings & Expenses" />

      <Card style={styles.summaryCard}>
        <SummaryRow label="Income" value={summary.income} color={colors.success} />
        <SummaryRow label="Expenses" value={summary.expense} color={colors.danger} />
        <SummaryRow label="Carried Forward" value={summary.carriedForward} color={colors.accent} />
        <View style={styles.divider} />
        <SummaryRow label="Balance" value={summary.balance} color={colors.primary} bold />
      </Card>

      <Text style={styles.sectionTitle}>Carried forward balance</Text>
      <Text style={styles.hint}>
        Cash brought over from before this app, or a previous period. Add, edit or delete as needed — the total is added to the running balance.
      </Text>
      {carriedForwardEntries.map((entry) => (
        <Card key={entry.id} style={styles.txCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.txTitle}>{entry.note || "Carried forward"}</Text>
            <Text style={styles.txMeta}>
              {new Date(entry.createdAt).toLocaleString()} · {entry.createdBy}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.txAmount, { color: colors.accent }]}>{currency(entry.amount)}</Text>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <Pressable onPress={() => setCarriedForwardModal(entry)}>
                <Text style={styles.clearLink}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => removeCarriedForward(entry)}>
                <Text style={styles.clearLink}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
      <Button label="+ Add carried forward amount" variant="outline" onPress={() => setCarriedForwardModal("new")} />
      <View style={{ height: spacing.lg }} />

      <View style={styles.actionsRow}>
        <View style={{ flex: 1 }}>
          <Button label="+ Record massage" onPress={() => setIncomeModal(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="− Add expense" variant="danger" onPress={() => setExpenseModal(true)} />
        </View>
      </View>

      <Button label="Export Statement (PDF)" onPress={exportToPdf} loading={exportingPdf} />
      <View style={{ height: spacing.sm }} />
      <Button label="Export raw data (CSV)" variant="outline" onPress={exportToExcel} loading={exporting} />

      <View style={styles.groupRow}>
        {(["all", "weekly", "monthly"] as GroupMode[]).map((mode) => (
          <Pressable
            key={mode}
            style={[styles.groupChip, groupMode === mode && styles.groupChipActive]}
            onPress={() => setGroupMode(mode)}
          >
            <Text style={[styles.groupChipText, groupMode === mode && styles.groupChipTextActive]}>
              {mode === "all" ? "All" : mode === "weekly" ? "By Week" : "By Month"}
            </Text>
          </Pressable>
        ))}
      </View>

      {groupMode === "all" ? (
        <>
          <Text style={styles.sectionTitle}>Recent entries</Text>
          {transactions.map((t) => (
            <TransactionCard key={t.id} t={t} onClear={onClear} />
          ))}
          {transactions.length === 0 && <Text style={styles.empty}>No entries recorded yet.</Text>}
        </>
      ) : (
        groups?.map((group) => (
          <View key={group.label} style={{ marginBottom: spacing.lg }}>
            <Card style={styles.groupSummaryCard}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupTotalsRow}>
                <Text style={styles.groupTotal}>
                  <Text style={{ color: colors.success }}>+{currency(group.income)}</Text>
                  {"  "}
                  <Text style={{ color: colors.danger }}>−{currency(group.expense)}</Text>
                </Text>
                <Text style={styles.groupBalance}>{currency(group.balance)}</Text>
              </View>
            </Card>
            {group.items.map((t) => (
              <TransactionCard key={t.id} t={t} onClear={onClear} />
            ))}
          </View>
        ))
      )}

      <IncomeModal
        visible={incomeModal}
        services={services}
        onClose={() => setIncomeModal(false)}
        onSaved={() => {
          setIncomeModal(false);
          load();
        }}
      />
      <ExpenseModal
        visible={expenseModal}
        onClose={() => setExpenseModal(false)}
        onSaved={() => {
          setExpenseModal(false);
          load();
        }}
      />
      <CarriedForwardModal
        entry={carriedForwardModal}
        onClose={() => setCarriedForwardModal(null)}
        onSaved={() => {
          setCarriedForwardModal(null);
          load();
        }}
      />
    </ScrollView>
  );
}

function TransactionCard({ t, onClear }: { t: Transaction; onClear: (id: string) => void }) {
  return (
    <Card style={styles.txCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{t.type === "income" ? t.serviceName : t.description}</Text>
        <Text style={styles.txMeta}>
          {new Date(t.createdAt).toLocaleString()} · {t.createdBy}
        </Text>
        {t.type === "income" && t.isDiscounted && (
          <Text style={styles.discountTag}>Discounted (standard {currency(t.standardPrice || 0)})</Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.txAmount, { color: t.type === "income" ? colors.success : colors.danger }]}>
          {t.type === "income" ? "+" : "−"}
          {currency(t.amount)}
        </Text>
        <Pressable onPress={() => onClear(t.id)}>
          <Text style={styles.clearLink}>Clear</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function SummaryRow({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }, bold && { fontFamily: typography.bodyBold, fontSize: 22 }]}>
        {currency(value)}
      </Text>
    </View>
  );
}

function IncomeModal({
  visible,
  services,
  onClose,
  onSaved,
}: {
  visible: boolean;
  services: Service[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && services.length && !serviceId) {
      setServiceId(services[0].id);
      setAmount(String(services[0].price));
    }
  }, [visible, services]);

  const selected = services.find((s) => s.id === serviceId);

  const save = async () => {
    if (!serviceId || !amount) return;
    setSaving(true);
    try {
      await addIncome(serviceId, Number(amount));
      onSaved();
      setAmount("");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Record a completed massage</Text>
          <Text style={styles.modalLabel}>Service</Text>
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
                <Text style={[styles.serviceChipText, serviceId === s.id && styles.serviceChipTextActive]}>
                  {s.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <TextField
            label={`Amount received (standard: ${selected ? currency(selected.price) : "-"})`}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.hint}>
            Entering less than the standard price will be recorded as a discount for accounting.
          </Text>
          <Button label="Save entry" onPress={save} loading={saving} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function ExpenseModal({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!description.trim() || !amount) return;
    setSaving(true);
    try {
      await addExpense(description.trim(), Number(amount));
      onSaved();
      setDescription("");
      setAmount("");
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add an expense</Text>
          <TextField label="Description" value={description} onChangeText={setDescription} placeholder="e.g. oils, laundry" />
          <TextField label="Amount (K)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <Button label="Save expense" variant="danger" onPress={save} loading={saving} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function CarriedForwardModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: CarriedForwardEntry | null | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = entry && entry !== "new";
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setAmount(String((entry as CarriedForwardEntry).amount));
      setNote((entry as CarriedForwardEntry).note);
    } else if (entry === "new") {
      setAmount("");
      setNote("");
    }
  }, [entry]);

  const save = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value)) {
      Alert.alert("Invalid amount", "Enter a number.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateCarriedForwardEntry((entry as CarriedForwardEntry).id, { amount: value, note: note.trim() });
      } else {
        await addCarriedForward(value, note.trim());
      }
      onSaved();
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={!!entry} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{isEdit ? "Edit carried forward amount" : "Add carried forward amount"}</Text>
          <TextField label="Amount (K)" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0" />
          <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. Cash from July" />
          <Button label="Save" onPress={save} loading={saving} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  summaryCard: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  summaryLabel: { fontFamily: typography.body, fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontFamily: typography.bodyBold, fontSize: 15 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 6 },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  groupRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md },
  groupChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  groupChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  groupChipText: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textPrimary },
  groupChipTextActive: { color: colors.textOnDark },
  groupSummaryCard: { marginBottom: spacing.sm, backgroundColor: colors.accentSoft },
  groupLabel: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textPrimary, marginBottom: 4 },
  groupTotalsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  groupTotal: { fontFamily: typography.bodyMedium, fontSize: 13 },
  groupBalance: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.primary },
  sectionTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  txCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  txTitle: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  txMeta: { fontFamily: typography.body, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  discountTag: { fontFamily: typography.body, fontSize: 11, color: colors.accent, marginTop: 4 },
  txAmount: { fontFamily: typography.bodyBold, fontSize: 15 },
  clearLink: { fontFamily: typography.body, fontSize: 12, color: colors.danger, marginTop: 4, textDecorationLine: "underline" },
  empty: { fontFamily: typography.body, color: colors.textSecondary, textAlign: "center", marginTop: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
  },
  modalTitle: { fontFamily: typography.headingBold, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.md },
  modalLabel: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  hint: { fontFamily: typography.body, fontSize: 11, color: colors.textSecondary, marginBottom: spacing.md },
  serviceChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  serviceChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceChipText: { fontFamily: typography.bodyMedium, fontSize: 12, color: colors.textPrimary },
  serviceChipTextActive: { color: colors.textOnDark },
});
