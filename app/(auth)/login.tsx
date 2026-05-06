import { useState } from "react";
import { View, Pressable } from "react-native";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelInput } from "@/shared/ui/PastelInput";
import { PastelButton } from "@/shared/ui/PastelButton";
import { useAuth } from "@/shared/auth/AuthProvider";
import { palette } from "@/shared/theme/colors";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      setError("Please fill both fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
  };

  return (
    <Screen scroll={false}>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        className="flex-1 justify-center gap-8"
      >
        <View>
          <Body tone="soft" size="sm" className="uppercase tracking-widest">
            welcome back
          </Body>
          <Heading size="xl" className="mt-2">
            Soft hello
          </Heading>
          <Body tone="soft" className="mt-2">
            Sign in to tend your garden.
          </Body>
        </View>

        <View className="gap-4">
          <PastelInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@somewhere.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
          />
          <PastelInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            error={error}
          />
        </View>

        <View className="gap-4">
          <PastelButton
            label={submitting ? "Signing in…" : "Sign in"}
            hue="sage"
            onPress={onSubmit}
            disabled={submitting}
          />
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Body tone="soft" className="text-center">
                New here?{" "}
                <Body className="font-display-semibold" style={{ color: palette.lavender.deep }}>
                  Make a softer life
                </Body>
              </Body>
            </Pressable>
          </Link>
        </View>
      </MotiView>
    </Screen>
  );
}
