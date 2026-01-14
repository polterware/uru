import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNavigation } from "expo-router";
import { StyleSheet } from "react-native";
import { useLowStockNotification } from "../hooks/useLowStockNotification";

interface Item {
  id: string;
  name: string;
  quantity: number;
}

interface LowStockListProps {
  lowStock: Item[];
}

export const LowStockList: React.FC<LowStockListProps> = ({ lowStock }) => {
  const navigation = useNavigation();
  useLowStockNotification(lowStock);
  return (
    <Card className="mb-6 py-6">
      <ThemedText className="text-xl font-bold mb-6 mt-1">
        Produtos com baixo estoque:
      </ThemedText>
      {lowStock.length > 0 ? (
        <ThemedView className="flex-row flex-wrap justify-between">
          {lowStock.slice(0, 4).map((item) => (
            <Card key={item.id} className="w-[48%] p-4 mb-3 items-center">
              <ThemedText className="text-base font-bold mb-2 text-center">{item.name}</ThemedText>
              <ThemedText className="text-sm text-center">
                Qtd: {item.quantity}
              </ThemedText>
            </Card>
          ))}
        </ThemedView>
      ) : (
        <ThemedText className="text-sm mt-2 italic text-center">
          Nenhum produto em falta por enquanto.
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
