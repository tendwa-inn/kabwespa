import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import BrandMark from "../../components/BrandMark";
import LanguagePicker from "../../components/LanguagePicker";
import Footer from "../../components/Footer";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { fetchServices } from "../../api/services";
import { photoUrl } from "../../api/client";
import { WelcomeSlide } from "../../api/types";
import { readSettingsCacheSync, readSettingsCacheAsync, writeSettingsCache } from "../../lib/settingsCache";
import {
  BeautyIllustration,
  CouplesIllustration,
  SwedishIllustration,
} from "../../components/illustrations/SpaIllustrations";

const ILLUSTRATIONS = [SwedishIllustration, CouplesIllustration, BeautyIllustration];
const SLIDE_INTERVAL = 4500;

const FALLBACK_SLIDES: WelcomeSlide[] = [
  { id: "fallback-1", caption: "Traditional Swedish & Deep Tissue Techniques", photo: null },
  { id: "fallback-2", caption: "Couples & Four Hands Experiences", photo: null },
  { id: "fallback-3", caption: "Beauty Rituals & Full Body Renewal", photo: null },
];

const cachedSettings = readSettingsCacheSync();

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [slides, setSlides] = useState<WelcomeSlide[]>(
    cachedSettings?.welcomeSlides?.length ? cachedSettings.welcomeSlides : FALLBACK_SLIDES
  );
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!cachedSettings) {
      readSettingsCacheAsync().then((settings) => {
        if (settings?.welcomeSlides?.length) setSlides(settings.welcomeSlides);
      });
    }

    fetchServices()
      .then((data) => {
        if (data.settings.welcomeSlides?.length) setSlides(data.settings.welcomeSlides);
        writeSettingsCache(data.settings);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index] || FALLBACK_SLIDES[0];
  const Illustration = ILLUSTRATIONS[index % ILLUSTRATIONS.length];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.slideArea}>
        <Animated.View style={[styles.slideInner, { opacity: fade }]}>
          {slide.photo ? (
            <Image source={{ uri: photoUrl(slide.photo)! }} style={styles.slidePhoto} />
          ) : (
            <Illustration />
          )}
        </Animated.View>
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>{slide.caption}</Text>
        </View>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.brandRow}>
          <BrandMark size={44} />
          <View>
            <Text style={styles.brand}>The Kabwe Spa</Text>
            <Text style={styles.brandSub}>{t("welcome.tagline")}</Text>
          </View>
        </View>

        <Button label={t("welcome.signIn")} onPress={() => navigation.navigate("Login")} />
        <View style={{ height: spacing.sm }} />
        <Button label={t("welcome.createAccount")} variant="outline" onPress={() => navigation.navigate("SignUp")} />

        <View style={styles.linkRow}>
          <Text style={styles.link} onPress={() => navigation.navigate("AboutUs")}>
            {t("welcome.aboutUs")}
          </Text>
          <Text style={styles.linkDivider}>·</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("ContactUs")}>
            {t("welcome.contactUs")}
          </Text>
          <Text style={styles.linkDivider}>·</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Pricing")}>
            {t("welcome.pricing")}
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <LanguagePicker />
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  slideArea: { flex: 1, minHeight: 300, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  slideInner: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  slidePhoto: { width: "100%", height: "100%", borderRadius: radii.lg },
  captionWrap: { marginTop: spacing.md },
  caption: {
    fontFamily: typography.headingBold,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  dots: { flexDirection: "row", gap: 6, marginTop: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent, width: 20 },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.md },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm },
  brand: { fontFamily: typography.headingBold, fontSize: 18, color: colors.textPrimary },
  brandSub: { fontFamily: typography.body, fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  link: { fontFamily: typography.bodyMedium, fontSize: 13, color: colors.primary, textDecorationLine: "underline" },
  linkDivider: { color: colors.border },
});
