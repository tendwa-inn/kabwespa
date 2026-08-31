import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../theme/theme";
import { fetchServices } from "../api/services";
import { photoUrl } from "../api/client";
import { readSettingsCacheSync, readSettingsCacheAsync, writeSettingsCache } from "../lib/settingsCache";

type Props = { size?: number };

const PETAL_D = "M100,100 C82,82 82,42 100,26 C118,42 118,82 100,100 Z";

let cachedLogo: string | null | undefined = readSettingsCacheSync()?.logo;
let fetchStarted = false;

export default function BrandMark({ size = 56 }: Props) {
  const [logo, setLogo] = useState<string | null | undefined>(cachedLogo);

  useEffect(() => {
    if (cachedLogo === undefined) {
      readSettingsCacheAsync().then((settings) => {
        if (settings && cachedLogo === undefined) {
          cachedLogo = settings.logo;
          setLogo(settings.logo);
        }
      });
    }

    if (fetchStarted) return;
    fetchStarted = true;
    fetchServices()
      .then((data) => {
        cachedLogo = data.settings.logo;
        setLogo(cachedLogo);
        writeSettingsCache(data.settings);
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
