import { KeyboardAvoidingView, Platform, ScrollView, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
  scroll?: boolean;
  keyboardAware?: boolean;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export function Screen({
  scroll = true,
  keyboardAware = false,
  edges,
  className,
  children,
  ...rest
}: ScreenProps) {
  const inner = scroll ? (
    <ScrollView
      className={`flex-1 px-6 ${className ?? ""}`}
      contentContainerClassName="grow pb-12 pt-2"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...(rest as any)}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-6 ${className ?? ""}`} {...(rest as any)}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges ?? ["top", "left", "right"]} className="flex-1 bg-cream">
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}
