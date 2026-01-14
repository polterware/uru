import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNavigation } from "expo-router";
import { StyleSheet } from "react-native";

interface Debtor {
  id: string;
  name: string;
  amount: number;
  startDate?: string;
  dueDate?: string;
  paidDate?: string;
  status?: string;
}

interface TopDebtorsListProps {
  topDebtors: Debtor[];
}

export const TopDebtorsList: React.FC<TopDebtorsListProps> = ({
  topDebtors,
}) => {
  const navigation = useNavigation();
  return (
    <Card className="mb-6 py-6">
      <ThemedText className="text-xl font-bold mb-6 mt-1">Maiores Devedores:</ThemedText>
      {topDebtors.length > 0 ? (
        <ThemedView className="flex-row flex-wrap justify-between">
          {topDebtors.slice(0, 4).map((debtor) => (
            <Card key={debtor.id} className="w-[48%] p-4 mb-3 items-center">
              <ThemedText className="text-base font-bold mb-2 text-center">{debtor.name}</ThemedText>
              <ThemedText className="text-sm text-center">
                Valor: R$ {debtor.amount.toFixed(2)}
              </ThemedText>
              <ThemedText className="text-sm text-center">
                Início:{" "}
                {debtor.startDate ? debtor.startDate.substring(0, 10) : "-"}
              </ThemedText>
              <ThemedText className="text-sm text-center">
                Prazo: {debtor.dueDate ? debtor.dueDate.substring(0, 10) : "-"}
              </ThemedText>
              {debtor.status === "paid" && (
                <ThemedText className="text-sm text-center">
                  Pago em:{" "}
                  {debtor.paidDate ? debtor.paidDate.substring(0, 10) : "-"}
                </ThemedText>
              )}
            </Card>
          ))}
        </ThemedView>
      ) : (
        <ThemedText className="text-sm mt-2 italic text-center">
          Nenhum devedor pendente no momento.
        </ThemedText>
      )}
      <TouchableOpacity
        className="bg-[#F5A689] py-2.5 rounded-lg mt-4 shadow-sm"
        onPress={() => navigation.navigate("debtors" as never)}
      >
        <ThemedText className="text-white text-center font-semibold text-base">Ver Devedores</ThemedText>
      </TouchableOpacity>
    </Card>
  );
};
