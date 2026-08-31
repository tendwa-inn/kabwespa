import React, { useEffect, useState } from "react";
import { Image, Platform } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/theme";
import { fetchServices } from "../api/services";
import { photoUrl } from "../api/client";

type Props = { size?: number };

const PETAL_D = "M100,100 C82,82 82,42 100,26 C118,42 118,82 100,100 Z";
const LOGO_CACHE_KEY = "kabwe.logo.cache";

// Read synchronously on web so the very first render already shows the
// last-known logo instead of flashing the default mark before the network
// fetch resolves. Native falls back to the async AsyncStorage read below.
function readSyncCache(): string | null | undefined {
  if (Platform.OS !== "web") return undefined;
  try {
    const raw = window.localStorage.getItem(LOGO_CACHE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

let cachedLogo: string | null | undefined = readSyncCache();
let fetchStarted = false;

export default function BrandMark({ size = 56 }: Props) {
  const [logo, setLogo] = useState<string | null | undefined>(cachedLogo);

  useEffect(() => {
    if (cachedLogo === undefined && Platform.OS !== "web") {
      AsyncStorage.getItem(LOGO_CACHE_KEY)
        .then((raw) => {
          if (raw !== null && cachedLogo === undefined) {
            const parsed = JSON.parse(raw);
            cachedLogo = parsed;
            setLogo(parsed);
          }
        })
        .catch(() => {});
    }

    if (fetchStarted) return;
    fetchStarted = true;
    fetchServices()
      .then((data) => {
        const next = data.settings.logo;
        cachedLogo = next;
        setLogo(next);
        AsyncStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(next)).catch(() => {});
      })
      .catch(() => {});
  }, []);

  if (logo) {
    return (
      <Image
        source={{ uri: photoUrl(logo)! }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx={100} cy={100} r={92} fill={colors.primary} />
      <Circle cx={100} cy={100} r={87} fill="none" stroke={colors.accent} strokeWidth={1.5} opacity={0.6} />
      <Path d={PETAL_D} fill={colors.accent} transform="rotate(0 100 100)" />
      <Path d={PETAL_D} fill={colors.accent} transform="rotate(120 100 100)" />
      <Path d={PETAL_D} fill={colors.accent} transform="rotate(240 100 100)" />
      <Circle cx={100} cy={100} r={7} fill={colors.background} />
    </Svg>
  );
}
