export const motion = {
  springSoft: { damping: 15, stiffness: 120, mass: 1 },
  springBouncy: { damping: 8, stiffness: 110, mass: 1 },
  springSnug: { damping: 18, stiffness: 180, mass: 1 },
  fade: { type: "timing", duration: 400 } as const,
  bloom: { type: "spring", damping: 12, stiffness: 90, mass: 1 } as const,
};

export const tileEntry = (delay: number) => ({
  from: { opacity: 0, translateY: 12 },
  animate: { opacity: 1, translateY: 0 },
  transition: { type: "spring" as const, damping: 14, stiffness: 110, delay },
});
