import { Pressable, View } from "react-native";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { SoftCard } from "@/shared/ui/SoftCard";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { tileEntry } from "@/shared/theme/motion";
import { useHaptic } from "@/shared/hooks/useHaptic";
import type { PastelHue } from "@/shared/theme/colors";

type Module = {
  id: string;
  title: string;
  blurb: string;
  hue: PastelHue;
  status: "live" | "soon";
};

const MODULES: Module[] = [
  {
    id: "spending-challenge",
    title: "Spending challenge",
    blurb: "Random daily allowance from a fixed budget. Log what you spent each day.",
    hue: "sage",
    status: "soon",
  },
  {
    id: "daily-rules",
    title: "Daily rules",
    blurb: "Things to do (or avoid) every day.",
    hue: "blush",
    status: "soon",
  },
  {
    id: "monthly-habits",
    title: "Monthly habits",
    blurb: "Things to do once or twice a month.",
    hue: "lavender",
    status: "soon",
  },
];

export default function Home() {
  const haptic = useHaptic();

  return (
    <Screen>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        className="pt-6 pb-8"
      >
        <Heading size="xl">betterMe</Heading>
      </MotiView>

      <View className="gap-5">
        {MODULES.map((m, i) => (
          <MotiView key={m.id} {...tileEntry(120 + i * 80)}>
            <Pressable onPress={() => haptic.tap()}>
              <SoftCard hue={m.hue} tone="soft">
                <View className="flex-row items-center justify-between mb-2">
                  <Heading size="md">{m.title}</Heading>
                  {m.status === "soon" && (
                    <View className="px-3 py-1 rounded-full bg-white/60">
                      <Body size="sm" tone="soft" className="font-display-semibold">
                        soon
                      </Body>
                    </View>
                  )}
                </View>
                <Body tone="soft">{m.blurb}</Body>
              </SoftCard>
            </Pressable>
          </MotiView>
        ))}
      </View>
    </Screen>
  );
}
