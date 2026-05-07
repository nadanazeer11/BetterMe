// List of out-of-hand expenses below the garden, with a running total and
// an "Add" button that opens the AddExpenseSheet.

import { useRef } from "react";
import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "moti";
import { SoftCard } from "@/shared/ui/SoftCard";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { palette } from "@/shared/theme/colors";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useChallengeExpenses } from "../hooks/useChallengeExpenses";
import { formatMoney } from "../lib/format";
import { AddExpenseSheet, type AddExpenseSheetHandle } from "./AddExpenseSheet";

type ExpensesSectionProps = {
  challengeId: string;
};

export function ExpensesSection({ challengeId }: ExpensesSectionProps) {
  const expenses = useChallengeExpenses(challengeId);
  const haptic = useHaptic();
  const sheetRef = useRef<AddExpenseSheetHandle>(null);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View>
      <View className="flex-row items-end justify-between mb-3">
        <View>
          <Heading size="md">Out-of-hand</Heading>
          <Body tone="soft" size="sm" className="mt-1">
            Things outside your daily allowance.
          </Body>
        </View>
        <Pressable
          onPress={() => {
            haptic.tap();
            sheetRef.current?.present();
          }}
          hitSlop={8}
        >
          <View
            className="flex-row items-center px-4 py-2 rounded-pillow"
            style={{ backgroundColor: palette.peach.base }}
          >
            <Ionicons name="add" size={18} color={palette.ink.base} />
            <Body className="font-display-semibold ml-1">Add</Body>
          </View>
        </Pressable>
      </View>

      {expenses.length === 0 ? (
        <SoftCard hue="peach" tone="soft">
          <Body tone="soft">
            Nothing logged yet. Tap{" "}
            <Body className="font-display-semibold">Add</Body> when you spend on
            something outside your daily plan.
          </Body>
        </SoftCard>
      ) : (
        <View className="gap-3">
          <SoftCard hue="peach" tone="soft">
            <View className="flex-row items-center justify-between">
              <Body tone="soft" size="sm" className="uppercase tracking-widest">
                total
              </Body>
              <Heading size="md">{formatMoney(total)}</Heading>
            </View>
          </SoftCard>

          {expenses.map((e, i) => (
            <MotiView
              key={e.id}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: i * 30 }}
            >
              <View
                className="flex-row items-center justify-between rounded-soft px-4 py-3"
                style={{ backgroundColor: "white" }}
              >
                <View className="flex-1 mr-3">
                  <Body className="font-display-semibold">{e.name}</Body>
                  {e.spentOn && (
                    <Body tone="soft" size="sm" className="mt-0.5">
                      {e.spentOn}
                    </Body>
                  )}
                </View>
                <Body className="font-display-semibold">{formatMoney(e.amount)}</Body>
              </View>
            </MotiView>
          ))}
        </View>
      )}

      <AddExpenseSheet ref={sheetRef} challengeId={challengeId} />
    </View>
  );
}
