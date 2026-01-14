import React from "react";
import { Card } from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, StyleSheet } from "react-native";
import { useThemeColor } from "@/features/settings/hooks/useThemeColor";

interface SearchBarDebtorsProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
}

export const SearchBarDebtors: React.FC<SearchBarDebtorsProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const textColor = useThemeColor({ light: "#222", dark: "#999" }, "text");
  return (
    <Card className="mb-2.5 p-2.5 flex-row items-center rounded-[20px]">
      <Ionicons
        name="search"
        size={20}
        color={textColor}
        style={{ marginRight: 8 }}
      />
      <TextInput
        className="bg-transparent flex-1"
        style={{ color: textColor }}
        placeholder="Pesquisar devedores..."
        placeholderTextColor={textColor}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </Card>
  );
};
