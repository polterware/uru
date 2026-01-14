import React, { useState } from "react";
import { View, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setModalVisible(false);
  };

  return (
    <View className="mb-1">
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Card className="p-1.5 w-full flex-row items-center justify-center rounded-[30px]">
          <ThemedText className="text-sm font-semibold">
            {selectedCategory || "Categoria"}
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
              Selecione uma Categoria
            </ThemedText>
            <TouchableOpacity
              className="p-2.5 border-b border-[#EEE]"
              onPress={() => handleSelectCategory("")}
            >
              <ThemedText className="text-base">
                Todas as Categorias
              </ThemedText>
            </TouchableOpacity>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className="p-2.5 border-b border-[#EEE]"
                onPress={() => handleSelectCategory(category)}
              >
                <ThemedText className="text-base">
                  {category}
                </ThemedText>
              </TouchableOpacity>
            ))}
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
