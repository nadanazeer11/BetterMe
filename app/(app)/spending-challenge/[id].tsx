import { useRef } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { palette } from "@/shared/theme/colors";
import { useHaptic } from "@/shared/hooks/useHaptic";
import {
  ExpensesSection,
  Garden,
  ProgressRibbon,
  RevealSheet,
} from "@/modules/spending-challenge/components";
import {
  localISODate,
  useChallenge,
  useChallengePots,
  useChallengeProgress,
  type Pot,
} from "@/modules/spending-challenge";

export default function ChallengeGarden() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptic = useHaptic();
  const todayISO = localISODate();

  const challenge = useChallenge(id);
  const pots = useChallengePots(id);
  const progress = useChallengeProgress(id);

  const sheetRef = useRef<{ present: (p: Pot) => void; dismiss: () => void }>(null);

  if (!challenge) {
    return (
      <Screen>
        <View className="pt-2 pb-4">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={palette.ink.base} />
          </Pressable>
        </View>
        <Body tone="soft">Loading…</Body>
      </Screen>
    );
  }

  const onPotPress = (p: Pot) => {
    haptic.tap();
    sheetRef.current?.present(p);
  };

  return (
    <Screen>
      <View className="pt-2 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={palette.ink.base} />
        </Pressable>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        className="mt-4"
      >
        {progress && (
          <ProgressRibbon
            challengeName={challenge.name}
            bloomed={progress.bloomed}
            totalDays={progress.totalDays}
            totalSpent={progress.totalSpent}
            totalBudget={progress.totalBudget}
            aheadBy={progress.aheadBy}
          />
        )}
      </MotiView>

      <View className="mt-8">
        <Heading size="md">Your garden</Heading>
        <Body tone="soft" className="mt-1">
          Tap a pot to open it.
        </Body>
      </View>

      <View className="mt-6">
        <Garden pots={pots} todayISO={todayISO} onPotPress={onPotPress} />
      </View>

      <View className="mt-12">
        <ExpensesSection challengeId={id} />
      </View>

      <RevealSheet ref={sheetRef} todayISO={todayISO} />
    </Screen>
  );
}
