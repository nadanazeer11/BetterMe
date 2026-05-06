import "../global.css";
import "react-native-reanimated";

import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import { AuthProvider, useAuth } from "@/shared/auth/AuthProvider";
import { db } from "@/shared/db/client";
import migrations from "@/shared/db/drizzle/migrations";
import { Screen } from "@/shared/ui/Screen";
import { SoftCard } from "@/shared/ui/SoftCard";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, loading, segments, router]);

  return null;
}

function MigrationGate({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <SoftCard hue="blush" tone="soft">
            <Heading size="md">Local database error</Heading>
            <Body tone="soft" className="mt-3">
              {error.message}
            </Body>
          </SoftCard>
        </View>
      </Screen>
    );
  }

  if (!success) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MigrationGate>
          <AuthProvider>
            <AuthGate />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#FFF8F0" },
                animation: "fade",
              }}
            />
            <StatusBar style="dark" />
          </AuthProvider>
        </MigrationGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
