import React from "react";
import { TouchableOpacity } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNavigation } from "expo-router";
import { StyleSheet } from "react-native";

interface LowCategoryListProps {
  categories: { [category: string]: number };
}

export const LowCategoryList: React.FC<LowCategoryListProps> = ({
  categories,
}) => {
  const navigation = useNavigation();
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 4);

  return (
    <Card className="mb-6 py-6">
      <ThemedText className="text-xl font-bold mb-6 mt-1">
        Categorias Mais em Falta:
      </ThemedText>
      {sortedCategories.length > 0 ? (
        <ThemedView className="flex-row flex-wrap justify-between">
          {sortedCategories.map(([category, quantity], index) => (
            <Card key={index} className="w-[48%] p-4 mb-3 items-center">
              <ThemedText className="text-base font-bold mb-2 text-center">{category}</ThemedText>
              <ThemedText className="text-sm text-center">
                Qtd: {quantity}
              </ThemedText>
            </Card>
          ))}
        </ThemedView>
      ) : (
        <ThemedText className="text-sm mt-2 italic text-center">
          Nenhuma categoria cadastrada no momento.
        </ThemedText>
      )}
      <TouchableOpacity
        className="bg-[#F5A689] py-2.5 rounded-lg mt-4 shadow-sm"
        onPress={() => navigation.navigate("inventory" as never)}
      >
        <ThemedText className="text-white text-center font-semibold text-base">Ver Estoque</ThemedText>
      </TouchableOpacity>
    </Card>
  );
};
