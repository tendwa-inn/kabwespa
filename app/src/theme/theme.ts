export const colors = {
  background: "#171B18",
  surface: "#20241F",
  surfaceMuted: "#262B24",
  border: "#333A30",
  textPrimary: "#F3F0E7",
  textSecondary: "#A6A499",
  textOnDark: "#F7F3EC",
  primary: "#4A6350",
  primaryDark: "#0E1210",
  accent: "#C9A66B",
  accentSoft: "#2C3327",
  success: "#6FA382",
  danger: "#D98A79",
  overlay: "rgba(8, 10, 8, 0.75)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  heading: "PlayfairDisplay_600SemiBold",
  headingBold: "PlayfairDisplay_700Bold",
  body: "Karla_400Regular",
  bodyMedium: "Karla_500Medium",
  bodyBold: "Karla_700Bold",
};

export const shadow = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
};

export function currency(amount: number): string {
  return `K${Number(amount).toFixed(0)}`;
}
