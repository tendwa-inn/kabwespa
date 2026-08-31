import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const SERVICE_ICONS: Record<string, IconName> = {
  "Swedish Massage": "spa-outline",
  "Thai Massage": "yoga",
  "Deep Tissue Massage": "hand-back-right-outline",
  "Full Body Massage": "meditation",
  "Traditional Rinsing Massage": "hand-water",
  "Couples Massage": "human-male-female",
  "Four Hands Massage": "hand-clap",
  "Gentleman's Essence Package": "razor-double-edge",
  "Facial Scrubbing": "face-woman-outline",
  "Full Scrubbing": "shower",
  "Face Waxing": "flower-outline",
  "Full Waxing": "flower-tulip-outline",
  Pedicure: "foot-print",
};

export const DEFAULT_SERVICE_ICON: IconName = "spa-outline";

export function iconForService(name: string): IconName {
  return SERVICE_ICONS[name] || DEFAULT_SERVICE_ICON;
}
