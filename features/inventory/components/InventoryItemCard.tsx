import React from "react";
import { Pressable, View, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";

interface InventoryItemCardProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    category?: string;
    price?: number;
    location?: string;
    lastRemovedAt?: string;
    createdAt?: string;
  };
  onEdit: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onEdit,
  onIncrement,
  onDecrement,
}) => (
  <Pressable onPress={() => onEdit(item.id)}>
    <Card className="flex-row justify-between items-center">
      <View className="flex-col items-start gap-1">
        <ThemedText className="font-bold text-lg">{item.name}</ThemedText>
        <ThemedText>
          Quantidade:{" "}
          <ThemedText className="font-bold">
            {item.quantity}
          </ThemedText>
        </ThemedText>
        {item.category && (
          <ThemedText>
            Categoria:{" "}
            <ThemedText className="font-bold">
              {item.category}
            </ThemedText>
          </ThemedText>
        )}
        {item.price !== undefined && (
          <ThemedText>
            Preço:{" "}
            <ThemedText className="font-bold">
              R$ {item.price.toFixed(2)}
            </ThemedText>
          </ThemedText>
        )}
        {item.location && (
          <ThemedText>
            Localização:{" "}
            <ThemedText className="font-bold">
              {item.location}
            </ThemedText>
          </ThemedText>
        )}
        {item.lastRemovedAt && (
          <ThemedText>
            Última retirada:{" "}
            <ThemedText className="font-bold">
              {item.lastRemovedAt.substring(0, 16).replace("T", " ")}
            </ThemedText>
          </ThemedText>
        )}
        {item.createdAt && (
          <ThemedText>
            Criado em:{" "}
            <ThemedText className="font-bold">
              {item.createdAt.substring(0, 16).replace("T", " ")}
            </ThemedText>
          </ThemedText>
        )}
      </View>
      <View className="flex-row items-center gap-1.5">
        <TouchableOpacity
          className="bg-[#A3D977] rounded-full w-[35px] h-[35px] justify-center items-center"
          onPress={() => onIncrement(item.id)}
        >
          <ThemedText className="text-white font-bold">+</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#FF364E] rounded-full w-[35px] h-[35px] justify-center items-center"
          onPress={() => onDecrement(item.id)}
        >
          <ThemedText className="text-white font-bold">-</ThemedText>
        </TouchableOpacity>
      </View>
    </Card>
  </Pressable>
);
