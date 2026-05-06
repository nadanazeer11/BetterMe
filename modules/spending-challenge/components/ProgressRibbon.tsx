// Progress summary at the top of a challenge's garden. Shows blooms-of-total,
// money spent vs budget, and how far ahead/behind the day-by-day plan.

import { View } from "react-native";
import { SoftCard } from "@/shared/ui/SoftCard";
import { Body } from "@/shared/ui/Body";
import { Heading } from "@/shared/ui/Heading";
import { palette } from "@/shared/theme/colors";
import { formatMoney } from "../lib/format";

type ProgressRibbonProps = {
  challengeName: string;
  bloomed: number;
  totalDays: number;
  totalSpent: number;
  totalBudget: number;
  aheadBy: number;
};

const fmt = formatMoney;

export function ProgressRibbon({
  challengeName,
  bloomed,
  totalDays,
  totalSpent,
  totalBudget,
  aheadBy,
}: ProgressRibbonProps) {
  const aheadColor = aheadBy >= 0 ? palette.sage.deep : palette.blush.deep;
  const aheadLabel =
    aheadBy === 0
      ? "right on plan"
      : aheadBy > 0
        ? `${fmt(aheadBy)} ahead`
        : `${fmt(-aheadBy)} over`;

  return (
    <SoftCard hue="sage" tone="soft">
      <Heading size="md">{challengeName}</Heading>
      <View className="flex-row mt-4 gap-6">
        <View className="flex-1">
          <Body tone="soft" size="sm" className="uppercase tracking-widest">
            bloomed
          </Body>
          <Body className="font-display-bold mt-1" style={{ fontSize: 20 }}>
            {bloomed}
            <Body tone="soft"> / {totalDays}</Body>
          </Body>
        </View>
        <View className="flex-1">
          <Body tone="soft" size="sm" className="uppercase tracking-widest">
            spent
          </Body>
          <Body className="font-display-bold mt-1" style={{ fontSize: 20 }}>
            {fmt(totalSpent)}
            <Body tone="soft"> / {fmt(totalBudget)}</Body>
          </Body>
        </View>
      </View>
      <View className="mt-4">
        <Body className="font-display-semibold" style={{ color: aheadColor }}>
          {aheadLabel}
        </Body>
      </View>
    </SoftCard>
  );
}
