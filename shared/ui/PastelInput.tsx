import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { palette } from "@/shared/theme/colors";
import { Body } from "./Body";

type PastelInputProps = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function PastelInput({ label, error, style, ...rest }: PastelInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      {label && (
        <Body tone="soft" size="sm" className="font-display-semibold ml-1">
          {label}
        </Body>
      )}
      <TextInput
        placeholderTextColor={palette.ink.faint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="rounded-pillow px-5 py-4 text-ink font-display text-base"
        style={[
          {
            backgroundColor: "white",
            borderWidth: 1.5,
            borderColor: error
              ? palette.blush.deep
              : focused
                ? palette.lavender.deep
                : "transparent",
            shadowColor: palette.lavender.deep,
            shadowOpacity: focused ? 0.2 : 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: focused ? 3 : 1,
          },
          style,
        ]}
        {...rest}
      />
      {error && (
        <Body size="sm" className="ml-1" style={{ color: palette.blush.deep }}>
          {error}
        </Body>
      )}
    </View>
  );
}
