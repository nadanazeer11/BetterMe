// The grid of pots — one per day in the challenge. Pots wrap naturally on
// any phone width via flex-wrap.

import { View } from "react-native";
import { Pot } from "./Pot";
import type { Pot as PotRow } from "../types";

type GardenProps = {
  pots: PotRow[];
  todayISO: string;
  onPotPress: (pot: PotRow) => void;
};

export function Garden({ pots, todayISO, onPotPress }: GardenProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
        justifyContent: "flex-start",
      }}
    >
      {pots.map((p, i) => (
        <Pot
          key={p.id}
          pot={p}
          todayISO={todayISO}
          index={i}
          onPress={() => onPotPress(p)}
        />
      ))}
    </View>
  );
}
