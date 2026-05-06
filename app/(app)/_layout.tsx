import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function AppLayout() {
  return (
    <BottomSheetModalProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFF8F0" },
          animation: "fade",
        }}
      />
    </BottomSheetModalProvider>
  );
}
