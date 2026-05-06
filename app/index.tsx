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
    title: "Spending garden",
    blurb: "A pot for every day. Open today's, see your allowance, water it well.",
    hue: "sage",
    status: "soon",
  },
  {
    id: "daily-rules",
    title: "Daily rules",
    blurb: "Tiny promises to yourself, checked off one soft tap at a time.",
    hue: "blush",
    status: "soon",
  },
  {
    id: "monthly-rules",
    title: "Monthly rituals",
    blurb: "Bigger kindnesses you owe yourself. A massage. A long walk.",
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
        transition={{ type: "timing", duration: 500 }}
        className="pt-6 pb-8"
      >
        <Body tone="soft" size="sm" className="uppercase tracking-widest">
          Hello, you
        </Body>
        <Heading size="xl" className="mt-2">
          betterMe
        </Heading>
        <Body tone="soft" className="mt-2">
          A soft place to keep the small promises you make to yourself.
        </Body>
      </MotiView>

      <View className="gap-5">
        {MODULES.map((m, i) => (
          <MotiView key={m.id} {...tileEntry(150 + i * 90)}>
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
