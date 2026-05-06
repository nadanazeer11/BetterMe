import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { SoftCard } from "@/shared/ui/SoftCard";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { tileEntry } from "@/shared/theme/motion";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useAuth } from "@/shared/auth/AuthProvider";
import { palette, type PastelHue } from "@/shared/theme/colors";

type Module = {
  id: string;
  title: string;
  blurb: string;
  hue: PastelHue;
  status: "live" | "soon";
  href?: string;
};

const MODULES: Module[] = [
  {
    id: "spending-challenge",
    title: "Spending challenge",
    blurb: "Random daily allowance from a fixed budget. Log what you spent each day.",
    hue: "sage",
    status: "live",
    href: "/(app)/spending-challenge",
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
  const router = useRouter();
  const { user } = useAuth();
  const firstLetter = (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <Screen>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        className="pt-6 pb-8 flex-row items-center justify-between"
      >
        <Heading size="xl">betterMe</Heading>
        <Pressable
          onPress={() => {
            haptic.tap();
            router.push("/(app)/profile");
          }}
          hitSlop={8}
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: palette.lavender.base,
              shadowColor: palette.lavender.deep,
              shadowOpacity: 0.2,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <Body className="font-display-bold" style={{ color: palette.ink.base, fontSize: 16 }}>
              {firstLetter}
            </Body>
          </View>
        </Pressable>
      </MotiView>

      <View className="gap-5">
        {MODULES.map((m, i) => (
          <MotiView key={m.id} {...tileEntry(120 + i * 80)}>
            <Pressable
              onPress={() => {
                haptic.tap();
                if (m.status === "live" && m.href) router.push(m.href as any);
              }}
            >
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
