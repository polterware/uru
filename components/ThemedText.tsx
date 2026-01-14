import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/features/settings/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      className={`
        ${type === "default" ? "text-base leading-6" : ""}
        ${type === "defaultSemiBold" ? "text-base leading-6 font-semibold" : ""}
        ${type === "title" ? "text-[32px] font-bold leading-8" : ""}
        ${type === "subtitle" ? "text-xl font-bold" : ""}
        ${type === "link" ? "text-base leading-[30px] text-[#0a7ea4]" : ""}
      `}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
