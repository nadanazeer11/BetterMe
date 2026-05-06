// Single animated pot for the garden grid. State drives color, scale, and
// motion. When real pot artwork is dropped into ../assets/, swap the inner
// shape for an <Image source={POT_ART[state]} />.

import { Pressable, View } from "react-native";
import { MotiView } from "moti";
import { palette } from "@/shared/theme/colors";
import { potState, type PotState } from "../lib/potState";
import type { Pot as PotRow } from "../types";

const POT_SIZE = 56;

const visualForState: Record<
  PotState,
  { bg: string; inner: string; opacity: number; scale: number; shadow: string }
> = {
  future: { bg: palette.lavender.soft, inner: palette.lavender.base, opacity: 0.55, scale: 0.92, shadow: palette.lavender.deep },
  today: { bg: palette.butter.soft, inner: palette.butter.deep, opacity: 1.0, scale: 1.0, shadow: palette.butter.deep },
  missed: { bg: palette.ink.faint, inner: palette.ink.faint, opacity: 0.35, scale: 0.88, shadow: palette.ink.faint },
  met: { bg: palette.sage.base, inner: palette.sage.deep, opacity: 1.0, scale: 1.0, shadow: palette.sage.deep },
  under: { bg: palette.mint.base, inner: palette.mint.deep, opacity: 1.0, scale: 1.05, shadow: palette.mint.deep },
  over: { bg: palette.peach.soft, inner: palette.blush.deep, opacity: 0.85, scale: 0.94, shadow: palette.blush.deep },
};

type PotProps = {
  pot: PotRow;
  todayISO: string;
  index: number;
  onPress: () => void;
};

export function Pot({ pot, todayISO, index, onPress }: PotProps) {
  const state = potState(pot, todayISO);
  const v = visualForState[state];
  const isToday = state === "today";

  const body = (
    <View
      style={{
        width: POT_SIZE,
        height: POT_SIZE,
        borderRadius: POT_SIZE / 2,
        backgroundColor: v.bg,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: v.shadow,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <View
        style={{
          width: POT_SIZE * 0.46,
          height: POT_SIZE * 0.46,
          borderRadius: POT_SIZE * 0.23,
          backgroundColor: v.inner,
        }}
      />
    </View>
  );

  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <MotiView
        from={{ opacity: 0, translateY: 6, scale: 0.85 }}
        animate={{ opacity: v.opacity, translateY: 0, scale: v.scale }}
        transition={{ type: "spring", damping: 14, stiffness: 130, delay: 60 + index * 18 }}
      >
        {isToday ? (
          <MotiView
            from={{ scale: 1.0 }}
            animate={{ scale: 1.08 }}
            transition={{ loop: true, type: "timing", duration: 1400, repeatReverse: true }}
          >
            {body}
          </MotiView>
        ) : (
          body
        )}
      </MotiView>
    </Pressable>
  );
}
