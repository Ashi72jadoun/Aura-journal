export interface MoodConfig {
  name: string;
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  emoji: string;
}

export const MOOD_PALETTE: Record<string, MoodConfig> = {
  peaceful: {
    name: "peaceful",
    label: "Peaceful",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    emoji: "🌿",
  },
  grateful: {
    name: "grateful",
    label: "Grateful",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    emoji: "✨",
  },
  joyful: {
    name: "joyful",
    label: "Joyful",
    bg: "bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-500/30",
    dot: "bg-yellow-500",
    emoji: "☀️",
  },
  reflective: {
    name: "reflective",
    label: "Reflective",
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    dot: "bg-indigo-500",
    emoji: "🌙",
  },
  inspired: {
    name: "inspired",
    label: "Inspired",
    bg: "bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/30",
    dot: "bg-teal-500",
    emoji: "💡",
  },
  hopeful: {
    name: "hopeful",
    label: "Hopeful",
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/30",
    dot: "bg-sky-500",
    emoji: "🌱",
  },
  stressed: {
    name: "stressed",
    label: "Stressed",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
    emoji: "🌧️",
  },
  anxious: {
    name: "anxious",
    label: "Anxious",
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
    emoji: "⚡",
  },
  overwhelmed: {
    name: "overwhelmed",
    label: "Overwhelmed",
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
    dot: "bg-purple-500",
    emoji: "🌊",
  },
  sad: {
    name: "sad",
    label: "Sad",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
    emoji: "💧",
  },
  tired: {
    name: "tired",
    label: "Tired / Depleted",
    bg: "bg-stone-500/10",
    text: "text-stone-700 dark:text-stone-300",
    border: "border-stone-500/30",
    dot: "bg-stone-500",
    emoji: "🕯️",
  },
  grounded: {
    name: "grounded",
    label: "Grounded",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    emoji: "🏔️",
  },
};

export function getMoodConfig(moodName: string): MoodConfig {
  const normalized = (moodName || "reflective").toLowerCase().trim();
  if (MOOD_PALETTE[normalized]) {
    return MOOD_PALETTE[normalized];
  }
  // Check substring matches
  for (const key of Object.keys(MOOD_PALETTE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return MOOD_PALETTE[key];
    }
  }
  return {
    name: normalized,
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/30",
    dot: "bg-slate-500",
    emoji: "📝",
  };
}
