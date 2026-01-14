import React from "react";
import { View, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSortOptions } from "@/features/inventory/hooks/useSortOptions";

interface InventorySortOptionsProps {
  sortType: "priceAsc" | "priceDesc" | "quantityAsc" | "quantityDesc" | "";
  setSortType: (
    type: "priceAsc" | "priceDesc" | "quantityAsc" | "quantityDesc" | ""
  ) => void;
}

export const InventorySortOptions: React.FC<InventorySortOptionsProps> = ({
  sortType: propSortType,
  setSortType: propSetSortType,
}) => {
  const { sortType, modalVisible, openModal, closeModal, selectSort } =
    useSortOptions<"priceAsc" | "priceDesc" | "quantityAsc" | "quantityDesc">(
      propSortType
    );

  // Sincroniza o estado local com o prop
  React.useEffect(() => {
    if (sortType !== propSortType) {
      propSetSortType(sortType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]);

  return (
    <View className="mb-2.5">
      <TouchableOpacity onPress={openModal}>
        <Card className="p-1.5 w-full flex-row items-center justify-center rounded-[30px]">
          <ThemedText className="text-sm font-semibold">
            {sortType === "priceAsc"
              ? "Menor Preço"
              : sortType === "priceDesc"
                ? "Maior Preço"
                : sortType === "quantityAsc"
                  ? "Menor Quantidade"
                  : sortType === "quantityDesc"
                    ? "Maior Quantidade"
                    : "Ordenar"}
          </ThemedText>
        </Card>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <ThemedView className="p-5 rounded-lg w-[90%]">
            <ThemedText className="font-bold text-lg mb-2.5 text-[#F5A689]">Ordenar por:</ThemedText>
            <TouchableOpacity
              className="p-2.5 border-b border-[#EEE]"
              onPress={() => selectSort("priceAsc")}
            >
              <ThemedText className="text-base">
                Menor Preço
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 border-b border-[#EEE]"
              onPress={() => selectSort("priceDesc")}
            >
              <ThemedText className="text-base">
                Maior Preço
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 border-b border-[#EEE]"
              onPress={() => selectSort("quantityAsc")}
            >
              <ThemedText className="text-base">
                Menor Quantidade
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 border-b border-[#EEE]"
              onPress={() => selectSort("quantityDesc")}
            >
              <ThemedText className="text-base">
                Maior Quantidade
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 rounded-md items-center mt-2.5 bg-[#A3D977] bg-[#808080]"
              onPress={closeModal}
            >
              <ThemedText className="text-white font-bold">Fechar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};
