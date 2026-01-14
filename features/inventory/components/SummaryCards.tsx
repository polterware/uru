import React from "react";
import { View } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { StyleSheet } from "react-native";

interface SummaryCardsProps {
  totalProducts: number;
  totalCategories: number;
  lowStockCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalProducts,
  totalCategories,
  lowStockCount,
}) => (

  <View className="flex-row justify-between mb-6">
    <Card className="flex-1 p-4 mx-1 rounded-lg items-center">
      <ThemedText className="text-xl font-bold text-[#F5A689]">{totalProducts}</ThemedText>
      <ThemedText className="text-sm">Produtos</ThemedText>
    </Card>
    <Card className="flex-1 p-4 mx-1 rounded-lg items-center">
      <ThemedText className="text-xl font-bold text-[#F5A689]">{totalCategories}</ThemedText>
      <ThemedText className="text-sm">Categorias</ThemedText>
    </Card>
    <Card className="flex-1 p-4 mx-1 rounded-lg items-center">
      <ThemedText className="text-xl font-bold text-[#F5A689]">{lowStockCount}</ThemedText>
      <ThemedText className="text-sm">Em Falta</ThemedText>
    </Card>
  </View>
);
