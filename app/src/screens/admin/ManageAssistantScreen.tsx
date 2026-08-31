import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "../../lib/alertShim";
import ScreenHeader from "../../components/ScreenHeader";
import Card from "../../components/Card";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors, radii, spacing, typography } from "../../theme/theme";
import {
  addAssistantQuestion,
  deleteAssistantQuestion,
  fetchAssistantQuestions,
  updateAssistantQuestion,
} from "../../api/assistant";
import { AssistantCategory, AssistantQuestion } from "../../api/types";
import { ASSISTANT_CATEGORIES } from "../../data/assistantCategories";

type Draft = { question: string; answer: string; category: AssistantCategory };

export default function ManageAssistantScreen() {
  const [questions, setQuestions] = useState<AssistantQuestion[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState<AssistantCategory>("general");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<AssistantCategory | "all">("all");

  const load = async () => {
    const data = await fetchAssistantQuestions();
    setQuestions(data.questions);
    const nextDrafts: Record<string, Draft> = {};
    data.questions.forEach((q) => (nextDrafts[q.id] = { question: q.question, answer: q.answer, category: q.category }));
    setDrafts(nextDrafts);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (id: string) => {
    const draft = drafts[id];
    if (!draft?.question.trim() || !draft?.answer.trim()) {
      Alert.alert("Missing info", "Both question and answer are required.");
      return;
    }
    setSavingId(id);
    try {
      await updateAssistantQuestion(id, draft);
      load();
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSavingId(null);
    }
  };

  const remove = (id: string) => {
    Alert.alert("Remove question", "Guests will no longer see this question in the assistant.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteAssistantQuestion(id);
          load();
        },
      },
    ]);
  };

  const create = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      Alert.alert("Missing info", "Enter both a question and an answer.");
      return;
    }
    setAdding(true);
    try {
      await addAssistantQuestion(newQuestion.trim(), newAnswer.trim(), newCategory);
      setNewQuestion("");
      setNewAnswer("");
      setNewCategory("general");
      load();
    } catch (e: any) {
      Alert.alert("Could not add question", e.message);
    } finally {
      setAdding(false);
    }
  };

  const visible = filter === "all" ? questions : questions.filter((q) => q.category === filter);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <ScreenHeader
        eyebrow="Manage"
        title="Assistant Questions"
        subtitle="Edit what guests can ask, and the answers they get."
      />

      <Text style={styles.sectionTitle}>Add a question</Text>
      <Card style={styles.card}>
        <TextField label="Question" value={newQuestion} onChangeText={setNewQuestion} placeholder="e.g. Do you offer home visits?" />
        <TextField
          label="Answer"
          value={newAnswer}
          onChangeText={setNewAnswer}
          placeholder="The reply guests will see"
          multiline
        />
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipsRow}>
          {ASSISTANT_CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              style={[styles.chip, newCategory === c.key && styles.chipActive]}
              onPress={() => setNewCategory(c.key)}
            >
              <Text style={[styles.chipText, newCategory === c.key && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
        <Button label="Add question" onPress={create} loading={adding} fullWidth={false} />
      </Card>

      <Text style={styles.sectionTitle}>Existing questions</Text>
      <View style={styles.chipsRow}>
        <Pressable style={[styles.chip, filter === "all" && styles.chipActive]} onPress={() => setFilter("all")}>
          <Text style={[styles.chipText, filter === "all" && styles.chipTextActive]}>All</Text>
        </Pressable>
        {ASSISTANT_CATEGORIES.map((c) => (
          <Pressable key={c.key} style={[styles.chip, filter === c.key && styles.chipActive]} onPress={() => setFilter(c.key)}>
            <Text style={[styles.chipText, filter === c.key && styles.chipTextActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      {visible.map((q) => (
        <Card key={q.id} style={styles.card}>
          <TextField
            label="Question"
            value={drafts[q.id]?.question ?? ""}
            onChangeText={(v) => setDrafts((prev) => ({ ...prev, [q.id]: { ...prev[q.id], question: v } }))}
          />
          <TextField
            label="Answer"
            value={drafts[q.id]?.answer ?? ""}
            onChangeText={(v) => setDrafts((prev) => ({ ...prev, [q.id]: { ...prev[q.id], answer: v } }))}
            multiline
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipsRow}>
            {ASSISTANT_CATEGORIES.map((c) => (
              <Pressable
                key={c.key}
                style={[styles.chip, drafts[q.id]?.category === c.key && styles.chipActive]}
                onPress={() => setDrafts((prev) => ({ ...prev, [q.id]: { ...prev[q.id], category: c.key } }))}
              >
                <Text style={[styles.chipText, drafts[q.id]?.category === c.key && styles.chipTextActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <Button label="Save" onPress={() => save(q.id)} loading={savingId === q.id} fullWidth={false} />
            <Pressable onPress={() => remove(q.id)}>
              <Text style={styles.removeLink}>Remove</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      {visible.length === 0 && <Text style={styles.empty}>No questions in this category yet.</Text>}
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
  label: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  card: { marginBottom: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.lg, marginTop: spacing.xs },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: typography.bodyMedium, fontSize: 12, color: colors.textPrimary },
  chipTextActive: { color: colors.textOnDark },
  removeLink: { fontFamily: typography.body, fontSize: 13, color: colors.danger, textDecorationLine: "underline" },
  empty: { fontFamily: typography.body, color: colors.textSecondary, textAlign: "center" },
});
