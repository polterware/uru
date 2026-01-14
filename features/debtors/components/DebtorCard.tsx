import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";

interface DebtorCardProps {
  debtor: {
    id: string;
    name: string;
    amount: number;
    status: "open" | "paid";
    startDate?: string;
    dueDate?: string;
    paidDate?: string;
  };
  onMarkAsPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DebtorCard: React.FC<DebtorCardProps> = ({
  debtor,
  onMarkAsPaid,
  onDelete,
}) => (
  <Card className="flex-col justify-between items-start gap-3 p-4">
    <View className="flex-1">
      <ThemedText className="text-base font-semibold">{debtor.name}</ThemedText>
      <ThemedText className="text-sm my-1">
        Valor: R$ {debtor.amount.toFixed(2)}
      </ThemedText>
      <ThemedText className="text-sm font-bold">
        Início: {debtor.startDate ? debtor.startDate.substring(0, 10) : "-"}
      </ThemedText>
      <ThemedText className="text-sm font-bold">
        Prazo: {debtor.dueDate ? debtor.dueDate.substring(0, 10) : "-"}
      </ThemedText>
      {debtor.status === "paid" && (
        <ThemedText className="text-sm font-bold">
          Pago em: {debtor.paidDate ? debtor.paidDate.substring(0, 10) : "-"}
        </ThemedText>
      )}
    </View>
    <View className="flex-row w-full justify-between">
      {debtor.status === "open" && (
        <TouchableOpacity
          className="py-2 px-3 rounded-md items-center w-[48%] bg-[#A3D977]"
          onPress={() => onMarkAsPaid(debtor.id)}
        >
          <ThemedText className="text-white font-semibold text-sm">Marcar Pago</ThemedText>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        className="py-2 px-3 rounded-md items-center w-[48%] bg-[#FF6347]"
        onPress={() => onDelete(debtor.id)}
      >
        <ThemedText className="text-white font-semibold text-sm">Excluir</ThemedText>
      </TouchableOpacity>
    </View>
  </Card>
);
