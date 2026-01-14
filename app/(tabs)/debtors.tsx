// MommyStockHub/screens/DebtorsScreen.tsx

import React, { useState } from "react";
import {
  View,
  FlatList,
  Alert,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/features/settings/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import { SortOptions } from "@/features/inventory/components/SortOptions";
import { StatusFilter } from "@/features/debtors/components/StatusFilter";
import { DebtorCard } from "@/features/debtors/components/DebtorCard";
import { useDebtors } from "@/features/debtors/contexts/DebtorContext";
import { SearchBarDebtors } from "@/features/debtors/components/SearchBarDebtors";

export default function DebtorsScreen() {
  const { debtors, removeDebtor, markAsPaid } = useDebtors(); // Usando o contexto de devedores
  const [searchQuery, setSearchQuery] = useState(""); // Estado para a barra de pesquisa
  const [sortType, setSortType] = useState<"amountAsc" | "amountDesc" | "">(""); // Ordenação
  const [statusFilter, setStatusFilter] = useState<"open" | "paid" | "">(""); // Filtro de status
  const textColor = useThemeColor({ light: "#222", dark: "#999" }, "text");

  // Filtrar devedores com base no nome, status e ordenação
  const filteredDebtors = debtors
    .filter((debtor) =>
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((debtor) => (statusFilter ? debtor.status === statusFilter : true))
    .sort((a, b) => {
      if (sortType === "amountAsc") {
        return a.amount - b.amount;
      } else if (sortType === "amountDesc") {
        return b.amount - a.amount;
      }
      return 0;
    });

  // Marcar como pago
  const handleMarkAsPaid = async (debtorId: string) => {
    await markAsPaid(debtorId);
  };

  // Excluir devedor
  const handleDelete = async (debtorId: string) => {
    Alert.alert(
      "Excluir Devedor",
      "Tem certeza que deseja excluir este devedor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await removeDebtor(debtorId);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 pt-6 px-4">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <ThemedView className="flex-row gap-2 bg-transparent mb-2.5">
              <ThemedText type="title">Devedores</ThemedText>
            </ThemedView>

            {/* Barra de Pesquisa */}
            <SearchBarDebtors
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Filtro de Status e Opções de Ordenação */}
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <StatusFilter
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
              </View>
              <View className="flex-1">
                <SortOptions sortType={sortType} setSortType={setSortType} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <View className="flex-1">
          <FlatList
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            className="flex-1"
            data={filteredDebtors}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View className="h-2.5" />}
            contentContainerClassName="grow pb-4"
            ListEmptyComponent={
              <ThemedText className="text-center mt-5 text-[#999] text-base italic">
                Nenhum devedor encontrado.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <DebtorCard
                debtor={item}
                onMarkAsPaid={handleMarkAsPaid}
                onDelete={handleDelete}
              />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
