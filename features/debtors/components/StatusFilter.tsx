import React, { useState } from "react";
import { View, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface StatusFilterProps {
  statusFilter: "open" | "paid" | "";
  setStatusFilter: (status: "open" | "paid" | "") => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  statusFilter,
  setStatusFilter,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectStatus = (status: "open" | "paid" | "") => {
    setStatusFilter(status);
    setModalVisible(false);
  };

  return (
    <View className="mb-2.5">
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Card className="p-1.5 w-full flex-row items-center justify-center rounded-[30px]">
          <ThemedText className="text-sm font-semibold">
            {statusFilter === "open"
              ? "Em Aberto"
              : statusFilter === "paid"
                ? "Pagos"
                : "Filtrar Status"}
          </ThemedText>
        </Card>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <ThemedView className="p-5 rounded-lg w-[90%]">
            <ThemedText className="font-bold text-lg mb-2.5">
              Filtrar por Status:
            </ThemedText>
            <TouchableOpacity
              className="p-2.5 border-b"
              onPress={() => handleSelectStatus("open")}
            >
              <ThemedText className="text-base">Em Aberto</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 border-b"
              onPress={() => handleSelectStatus("paid")}
            >
              <ThemedText className="text-base">Pagos</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 border-b"
              onPress={() => handleSelectStatus("")}
            >
              <ThemedText className="text-base">Todos</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 rounded-md items-center mt-2.5 bg-[#A3D977] bg-[#808080]"
              onPress={() => setModalVisible(false)}
            >
              <ThemedText className="text-white font-bold">Fechar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};
