export const palette = {
  cream: "#FFF8F0",
  sage: { base: "#B8D4C2", deep: "#7FB295", soft: "#DEEBE2" },
  blush: { base: "#FFD6D6", deep: "#F8A5A5", soft: "#FFEAEA" },
  butter: { base: "#FFF4C2", deep: "#F5D85C", soft: "#FFFAE0" },
  lavender: { base: "#E0D4F8", deep: "#B8A4E8", soft: "#EFE9FB" },
  mint: { base: "#D4F5E5", deep: "#8FD4B0", soft: "#E8FAF1" },
  peach: { base: "#FFE0CC", deep: "#F8B088", soft: "#FFEEDF" },
  ink: { base: "#4A3F4D", soft: "#8A7E92", faint: "#C4BCC8" },
} as const;

export type PastelHue = "sage" | "blush" | "butter" | "lavender" | "mint" | "peach";
