import { ScrollView, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
  scroll?: boolean;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export function Screen({ scroll = true, edges, className, children, ...rest }: ScreenProps) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={edges ?? ["top", "left", "right"]} className="flex-1 bg-cream">
      <Body
        className={`flex-1 px-6 ${className ?? ""}`}
        contentContainerClassName={scroll ? "pb-12 pt-2" : undefined}
        showsVerticalScrollIndicator={false}
        {...(rest as any)}
      >
        {children}
      </Body>
    </SafeAreaView>
  );
}
