import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "../../components/ScreenHeader";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { fetchAssistantQuestions } from "../../api/assistant";
import { AssistantQuestion, AssistantCategory } from "../../api/types";
import { ASSISTANT_CATEGORIES } from "../../data/assistantCategories";

type Bubble = { id: string; from: "bot" | "user"; text: string };

const TYPING_DELAY = 1600;

export default function AssistantScreen() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<AssistantQuestion[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [thread, setThread] = useState<Bubble[]>([]);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [typingDots, setTypingDots] = useState(".");
  const [category, setCategory] = useState<AssistantCategory | "all">("all");
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(() => {
    setLoadError(false);
    fetchAssistantQuestions()
      .then((data) => setQuestions(data.questions))
      .catch(() => setLoadError(true));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (questions.length === 0) load();
    }, [load, questions.length])
  );

  useEffect(() => {
    if (!typing) return;
    const timer = setInterval(() => {
      setTypingDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 350);
    return () => clearInterval(timer);
  }, [typing]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [thread, typing]);

  const ask = (item: AssistantQuestion) => {
    setThread((prev) => [...prev, { id: `${item.id}-q-${prev.length}`, from: "user", text: item.question }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setThread((prev) => [...prev, { id: `${item.id}-a-${prev.length}`, from: "bot", text: item.answer }]);
    }, TYPING_DELAY);
    setAskedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
  };

  const availableCategories = ASSISTANT_CATEGORIES.filter((c) => questions.some((q) => q.category === c.key));
  const remaining = questions
    .filter((q) => !askedIds.includes(q.id))
    .filter((q) => category === "all" || q.category === category);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="Ask Us" title={t("assistant.title")} subtitle={t("assistant.subtitle")} />

        <View style={[styles.bubble, styles.bubbleBot]}>
          <Text style={styles.bubbleText}>{t("assistant.intro")}</Text>
        </View>

        {thread.map((bubble) => (
          <View
            key={bubble.id}
            style={[styles.bubble, bubble.from === "bot" ? styles.bubbleBot : styles.bubbleUser]}
          >
            <Text style={[styles.bubbleText, bubble.from === "user" && styles.bubbleTextUser]}>
              {bubble.text}
            </Text>
          </View>
        ))}

        {typing && (
          <View style={[styles.bubble, styles.bubbleBot]}>
            <Text style={styles.bubbleText}>{typingDots}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.chipsWrap}>
        {availableCategories.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            <Pressable style={[styles.categoryChip, category === "all" && styles.categoryChipActive]} onPress={() => setCategory("all")}>
              <Text style={[styles.categoryChipText, category === "all" && styles.categoryChipTextActive]}>All</Text>
            </Pressable>
            {availableCategories.map((c) => (
              <Pressable
                key={c.key}
                style={[styles.categoryChip, category === c.key && styles.categoryChipActive]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={[styles.categoryChipText, category === c.key && styles.categoryChipTextActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {remaining.length === 0 ? (
          loadError ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.doneText}>Couldn't load questions — check your connection.</Text>
              <Pressable style={styles.retryButton} onPress={load}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.doneText}>
              {questions.length === 0
                ? "Loading questions…"
                : "You've asked everything here. Reach us on the Contact tab for anything else."}
            </Text>
          )
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {remaining.map((item) => (
              <Pressable key={item.id} style={styles.chip} onPress={() => ask(item)} disabled={typing}>
                <Text style={styles.chipText}>{item.question}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  bubble: {
    maxWidth: "85%",
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignSelf: "flex-start",
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  bubbleText: { fontFamily: typography.body, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  bubbleTextUser: { color: colors.textOnDark },
  chipsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.md,
  },
  categoryRow: { paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.sm },
  categoryChip: {
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    backgroundColor: colors.surface,
  },
  categoryChipActive: { backgroundColor: colors.accent },
  categoryChipText: { fontFamily: typography.bodyMedium, fontSize: 11, color: colors.textSecondary },
  categoryChipTextActive: { color: colors.textOnDark },
  chipsRow: { paddingHorizontal: spacing.md, gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.primary },
  doneText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.textOnDark },
});
