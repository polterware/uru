import { useThemeColor } from "@/features/settings/hooks/useThemeColor";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface ThemedInputProps extends TextInputProps {
  placeholder?: string;
}

export const ThemedInput = ({
  style,
  placeholder,
  ...props
}: ThemedInputProps) => {
  const shadowColor = useThemeColor(
    { light: undefined, dark: undefined },
    "shadowColor"
  );

  const borderColor = useThemeColor(
    { light: undefined, dark: undefined },
    "borderColor"
  );

  const backgroundColor = useThemeColor(
    { light: undefined, dark: undefined },
    "background"
  );

  const textColor = useThemeColor({ light: "#222", dark: "#999" }, "text");

  return (
    <TextInput
      className="rounded-lg p-2.5 border shadow-sm"
      style={[
        {
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        style,
        { shadowColor, borderColor, backgroundColor, color: textColor },
      ]}
      placeholderTextColor={textColor}
      placeholder={placeholder}
      {...props}
    />
  );
};
