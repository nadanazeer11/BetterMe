import { Text, TextProps } from "react-native";

type HeadingProps = TextProps & { size?: "xl" | "lg" | "md" };

const sizeClass = {
  xl: "text-4xl",
  lg: "text-3xl",
  md: "text-2xl",
};

export function Heading({ size = "lg", className, children, ...rest }: HeadingProps) {
  return (
    <Text
      className={`font-display-bold text-ink ${sizeClass[size]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Text>
  );
}
