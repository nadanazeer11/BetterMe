import { Pressable, PressableProps, Text, View } from "react-native";
import { MotiView } from "moti";
import { palette, type PastelHue } from "@/shared/theme/colors";
import { useHaptic } from "@/shared/hooks/useHaptic";

type PastelButtonProps = PressableProps & {
  label: string;
  hue?: PastelHue;
  variant?: "filled" | "ghost";
};

export function PastelButton({
  label,
  hue = "sage",
  variant = "filled",
  onPress,
  disabled,
  ...rest
}: PastelButtonProps) {
  const haptic = useHaptic();
  const bg = variant === "filled" ? palette[hue].base : "transparent";
  const border = variant === "ghost" ? palette[hue].deep : "transparent";

  return (
    <Pressable
      onPress={(e) => {
        haptic.tap();
        onPress?.(e);
      }}
      disabled={disabled}
      {...rest}
    >
      {({ pressed }) => (
        <MotiView
          animate={{ scale: pressed ? 0.97 : 1, opacity: disabled ? 0.5 : 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          style={{
            backgroundColor: bg,
            borderColor: border,
            borderWidth: variant === "ghost" ? 1.5 : 0,
            shadowColor: palette[hue].deep,
            shadowOpacity: variant === "filled" ? 0.22 : 0,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: variant === "filled" ? 3 : 0,
          }}
          className="rounded-pillow px-7 py-4 items-center justify-center"
        >
          <Text
            className="font-display-semibold text-base"
            style={{ color: variant === "filled" ? palette.ink.base : palette[hue].deep }}
          >
            {label}
          </Text>
        </MotiView>
      )}
    </Pressable>
  );
}
