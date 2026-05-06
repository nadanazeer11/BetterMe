import { useState } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { palette } from "@/shared/theme/colors";
import { Body } from "./Body";

type PastelInputProps = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function PastelInput({
  label,
  error,
  style,
  secureTextEntry,
  ...rest
}: PastelInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isSecure = !!secureTextEntry;
  const obscured = isSecure && hidden;

  return (
    <View className="gap-2">
      {label && (
        <Body tone="soft" size="sm" className="font-display-semibold ml-1">
          {label}
        </Body>
      )}
      <View style={{ position: "relative", justifyContent: "center" }}>
        <TextInput
          placeholderTextColor={palette.ink.faint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={obscured}
          className="rounded-pillow text-ink font-display"
          style={[
            {
              fontSize: 16,
              lineHeight: 22,
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 20,
              paddingRight: isSecure ? 52 : 20,
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
              includeFontPadding: false,
              textAlignVertical: "center",
            },
            style,
          ]}
          {...rest}
        />
        {isSecure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            style={{
              position: "absolute",
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={palette.ink.soft}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Body size="sm" className="ml-1" style={{ color: palette.blush.deep }}>
          {error}
        </Body>
      )}
    </View>
  );
}
