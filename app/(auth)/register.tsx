import { useState } from "react";
import { View, Pressable } from "react-native";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelInput } from "@/shared/ui/PastelInput";
import { PastelButton } from "@/shared/ui/PastelButton";
import { SoftCard } from "@/shared/ui/SoftCard";
import { useAuth } from "@/shared/auth/AuthProvider";
import { palette } from "@/shared/theme/colors";

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      setError("Please fill both fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password needs at least 6 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err, needsConfirmation } = await signUp(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    if (needsConfirmation) setConfirmationSent(true);
  };

  if (confirmationSent) {
    return (
      <Screen scroll={false}>
        <View className="flex-1 justify-center">
          <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 14 }}
          >
            <SoftCard hue="mint" tone="soft">
              <Heading size="md">Check your inbox</Heading>
              <Body tone="soft" className="mt-3">
                We sent a confirmation link to{" "}
                <Body className="font-display-semibold">{email}</Body>. Tap it, then come back and sign in.
              </Body>
            </SoftCard>
            <View className="mt-6">
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Body tone="soft" className="text-center">
                    Back to{" "}
                    <Body className="font-display-semibold" style={{ color: palette.sage.deep }}>
                      sign in
                    </Body>
                  </Body>
                </Pressable>
              </Link>
            </View>
          </MotiView>
        </View>
      </Screen>
    );
  }

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
            new here
          </Body>
          <Heading size="xl" className="mt-2">
            A soft start
          </Heading>
          <Body tone="soft" className="mt-2">
            Make an account so your garden can grow with you.
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
            placeholder="at least 6 characters"
            secureTextEntry
            autoComplete="new-password"
            error={error}
          />
        </View>

        <View className="gap-4">
          <PastelButton
            label={submitting ? "Creating…" : "Create account"}
            hue="lavender"
            onPress={onSubmit}
            disabled={submitting}
          />
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Body tone="soft" className="text-center">
                Already have one?{" "}
                <Body className="font-display-semibold" style={{ color: palette.sage.deep }}>
                  Sign in
                </Body>
              </Body>
            </Pressable>
          </Link>
        </View>
      </MotiView>
    </Screen>
  );
}
