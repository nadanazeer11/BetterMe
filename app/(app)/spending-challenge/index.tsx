import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { SoftCard } from "@/shared/ui/SoftCard";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelButton } from "@/shared/ui/PastelButton";
import { palette } from "@/shared/theme/colors";
import { tileEntry } from "@/shared/theme/motion";
import { formatMoney, useChallenges } from "@/modules/spending-challenge";

export default function SpendingChallengeList() {
  const router = useRouter();
  const challenges = useChallenges();
  const isEmpty = challenges && challenges.length === 0;

  return (
    <Screen>
      <View className="pt-2 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={palette.ink.base} />
        </Pressable>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        className="pt-4 pb-6"
      >
        <Heading size="xl">Spending challenges</Heading>
        <Body tone="soft" className="mt-2">
          A daily allowance from a fixed budget. Open today, log what you spent.
        </Body>
      </MotiView>

      {isEmpty && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          className="mt-2"
        >
          <SoftCard hue="lavender" tone="soft">
            <Heading size="md">No challenges yet</Heading>
            <Body tone="soft" className="mt-3">
              Create one to start tracking.
            </Body>
          </SoftCard>
        </MotiView>
      )}

      <View className="gap-4 mt-2">
        {challenges?.map((c, i) => (
          <MotiView key={c.id} {...tileEntry(120 + i * 70)}>
            <Link href={`/(app)/spending-challenge/${c.id}` as any} asChild>
              <Pressable>
                <SoftCard hue="sage" tone="soft">
                  <Heading size="md">{c.name}</Heading>
                  <Body tone="soft" className="mt-2">
                    {c.startDate} → {c.endDate} · {formatMoney(c.totalBudget)}
                  </Body>
                </SoftCard>
              </Pressable>
            </Link>
          </MotiView>
        ))}
      </View>

      <View className="mt-8">
        <PastelButton
          label="Create challenge"
          hue="lavender"
          onPress={() => router.push("/(app)/spending-challenge/new")}
        />
      </View>
    </Screen>
  );
}
