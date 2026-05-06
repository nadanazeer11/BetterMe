import { View, ViewProps } from "react-native";
import { palette, type PastelHue } from "@/shared/theme/colors";

type SoftCardProps = ViewProps & {
  hue?: PastelHue;
  tone?: "base" | "soft";
};

const shadowFor = (hue: PastelHue): string => palette[hue].deep;

export function SoftCard({ hue = "lavender", tone = "soft", className, style, children, ...rest }: SoftCardProps) {
  const bg = palette[hue][tone];
  return (
    <View
      className={`rounded-pillow p-6 ${className ?? ""}`}
      style={[
        {
          backgroundColor: bg,
          shadowColor: shadowFor(hue),
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 4,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
