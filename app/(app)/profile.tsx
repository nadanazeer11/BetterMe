import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelButton } from "@/shared/ui/PastelButton";
import { useAuth } from "@/shared/auth/AuthProvider";
import { palette } from "@/shared/theme/colors";

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const firstLetter = (user?.email?.[0] ?? "?").toUpperCase();

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
        className="items-center pt-8 pb-10"
      >
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: palette.lavender.base,
            shadowColor: palette.lavender.deep,
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <Heading size="xl">{firstLetter}</Heading>
        </View>
        <Body tone="soft">{user?.email}</Body>
      </MotiView>

      <View className="mt-8">
        <PastelButton
          label="Sign out"
          hue="blush"
          onPress={async () => {
            await signOut();
          }}
        />
      </View>
    </Screen>
  );
}
