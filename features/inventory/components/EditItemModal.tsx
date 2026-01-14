import React from "react";
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedInput } from "@/components/ThemedInput";

interface EditItemModalProps {
  visible: boolean;
  onClose: () => void;
  itemName: string;
  setItemName: (text: string) => void;
  itemQuantity: string;
  setItemQuantity: (text: string) => void;
  itemCategory: string;
  setItemCategory: (text: string) => void;
  itemPrice: string;
  setItemPrice: (text: string) => void;
  onSave: () => void;
  onDelete: () => void;
  itemLocation: string;
  setItemLocation: (text: string) => void;
  itemCreatedAt: string;
  setItemCreatedAt: (text: string) => void;
  itemLastRemovedAt: string;
  setItemLastRemovedAt: (text: string) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  onClose,
  itemName,
  setItemName,
  itemQuantity,
  setItemQuantity,
  itemCategory,
  setItemCategory,
  itemPrice,
  setItemPrice,
  onSave,
  onDelete,
  itemLocation,
  setItemLocation,
  itemCreatedAt,
  setItemCreatedAt,
  itemLastRemovedAt,
  setItemLastRemovedAt,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={() => { }}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <ThemedView className="rounded-lg w-[90%] max-h-[80%]">
          <ScrollView
            contentContainerClassName="grow p-5"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText className="font-bold text-lg mb-2.5 text-[#F5A689]">Editar Item</ThemedText>
            <ThemedText className="text-sm font-bold mb-1">Nome do Item</ThemedText>
            <ThemedInput
              placeholder="Nome do item"
              value={itemName}
              onChangeText={setItemName}
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <ThemedText className="text-sm font-bold mb-1">Quantidade</ThemedText>
            <ThemedInput
              placeholder="Quantidade"
              value={itemQuantity}
              onChangeText={setItemQuantity}
              keyboardType="numeric"
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <ThemedText className="text-sm font-bold mb-1">Categoria</ThemedText>
            <ThemedInput
              placeholder="Categoria"
              value={itemCategory}
              onChangeText={setItemCategory}
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <ThemedText className="text-sm font-bold mb-1">Preço</ThemedText>
            <ThemedInput
              placeholder="Preço"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="decimal-pad"
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <ThemedText className="text-sm font-bold mb-1">Localização</ThemedText>
            <ThemedInput
              placeholder="Localização"
              value={itemLocation}
              onChangeText={setItemLocation}
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <ThemedText className="text-sm font-bold mb-1">Criado em</ThemedText>
            <ThemedInput
              placeholder="AAAA-MM-DDTHH:mm"
              value={itemCreatedAt}
              onChangeText={setItemCreatedAt}
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <ThemedText className="text-sm font-bold mb-1">Última retirada</ThemedText>
            <ThemedInput
              placeholder="AAAA-MM-DDTHH:mm"
              value={itemLastRemovedAt}
              onChangeText={setItemLastRemovedAt}
              className="border border-[#DDD] rounded-lg p-2.5 bg-white mb-2.5"
            />
            <TouchableOpacity className="p-2.5 rounded-md items-center mb-2.5 bg-[#A3D977]" onPress={onSave}>
              <ThemedText className="text-white font-bold">Salvar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 rounded-md items-center mb-2.5 bg-[#FF364E]"
              onPress={onDelete}
            >
              <ThemedText className="text-white font-bold">Excluir</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2.5 rounded-md items-center mb-2.5 bg-[#808080] mt-5"
              onPress={onClose}
            >
              <ThemedText className="text-white font-bold">Sair</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);
