import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSortOptions } from "@/features/inventory/hooks/useSortOptions";

interface SortOptionsProps {
  sortType: "amountAsc" | "amountDesc" | "";
  setSortType: (type: "amountAsc" | "amountDesc" | "") => void;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  sortType: propSortType,
  setSortType: propSetSortType,
}) => {
  const { sortType, modalVisible, openModal, closeModal, selectSort } =
    useSortOptions<"amountAsc" | "amountDesc">(propSortType);

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
            {sortType === "amountAsc"
              ? "Menos Devendo"
              : sortType === "amountDesc"
                ? "Mais Devendo"
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <ThemedView className="p-5 rounded-lg w-[90%]">
              <ThemedText className="font-bold text-lg mb-2.5 text-[#F5A689]">Ordenar por:</ThemedText>
              <TouchableOpacity
                className="p-2.5 border-b border-[#EEE]"
                onPress={() => selectSort("amountAsc")}
              >
                <ThemedText className="text-base">
                  Menos Devendo
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2.5 border-b border-[#EEE]"
                onPress={() => selectSort("amountDesc")}
              >
                <ThemedText className="text-base">
                  Mais Devendo
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
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
