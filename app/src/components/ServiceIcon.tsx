import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../theme/theme";
import { iconForService } from "../data/serviceIcons";

export default function ServiceIcon({
  name,
  size = 64,
  style,
}: {
  name: string;
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radii.sm }, style]}>
      <MaterialCommunityIcons name={iconForService(name)} size={size * 0.5} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
