import { AssistantCategory } from "../api/types";

export const ASSISTANT_CATEGORIES: { key: AssistantCategory; label: string; icon: string }[] = [
  { key: "general", label: "General", icon: "help-circle-outline" },
  { key: "location", label: "Location", icon: "map-marker-outline" },
  { key: "contact", label: "Contact", icon: "phone-outline" },
  { key: "massage", label: "Massage", icon: "spa-outline" },
  { key: "beauty", label: "Beauty", icon: "flower-outline" },
  { key: "videos", label: "Videos", icon: "play-circle-outline" },
  { key: "booking", label: "Booking", icon: "calendar-outline" },
];

export function categoryLabel(key: string): string {
  return ASSISTANT_CATEGORIES.find((c) => c.key === key)?.label || "General";
}
