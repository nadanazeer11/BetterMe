import { Text, TextProps } from "react-native";

type BodyProps = TextProps & {
  tone?: "default" | "soft" | "faint";
  size?: "sm" | "md" | "lg";
};

const toneClass = {
  default: "text-ink",
  soft: "text-ink-soft",
  faint: "text-ink-faint",
};

const sizeClass = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Body({ tone = "default", size = "md", className, children, ...rest }: BodyProps) {
  return (
    <Text
      className={`font-display ${toneClass[tone]} ${sizeClass[size]} leading-6 ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Text>
  );
}
