import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useThemeColor } from "@/features/settings/hooks/useThemeColor";
import { ThemedInput } from "@/components/ThemedInput";
import { v4 as uuidv4 } from "uuid";
import { useCategorySuggestions } from "@/features/add/hooks/useCategorySuggestions";
import {
  formatCurrencyInput,
  parseCurrency,
} from "@/features/inventory/hooks/useCurrencyHelpers";

interface AddProductFormProps {
  addItem: (item: any) => Promise<void>;
  items: any[];
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  addItem,
  items,
}) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const textColor = useThemeColor({ light: "#222", dark: "#999" }, "text");

  const {
    category,
    setCategory,
    filteredCategories,
    handleCategoryChange,
    handleSelectCategory,
    allCategories,
  } = useCategorySuggestions(items);

  const handleSaveProduct = async () => {
    if (!name.trim() || quantity === null) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }
    const productExists = items.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (productExists) {
      Alert.alert("Erro", `O produto "${name}" já existe no inventário.`);
      return;
    }
    const newProduct = {
      id: uuidv4(),
      name,
      category,
      quantity,
      price: parseCurrency(price),
      location: location || undefined,
    };
    await addItem(newProduct);
    Alert.alert("Sucesso", `Produto "${name}" adicionado!`);
    setName("");
    setCategory("");
    setQuantity(null);
    setPrice("");
    setLocation("");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="p-4 gap-2.5"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View>
          <ThemedText className="mb-2 text-base font-medium">Nome do Produto</ThemedText>
          <ThemedInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Sabonete"
          />
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Categoria</ThemedText>
          <ThemedInput
            placeholderTextColor={textColor}
            value={category}
            onChangeText={handleCategoryChange}
            placeholder="Ex: Higiene"
          />
          {filteredCategories.length > 0 && (
            <FlatList
              data={filteredCategories}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectCategory(item)}>
                  <Card className="mb-2.5 p-2.5 flex-row items-center rounded-lg">
                    <ThemedText className="text-base">
                      {item}
                    </ThemedText>
                  </Card>
                </TouchableOpacity>
              )}
              className="max-h-[150px] border rounded-lg -mt-2 mb-4 z-10"
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Quantidade</ThemedText>
          <ThemedInput
            placeholderTextColor={textColor}
            value={quantity !== null ? quantity.toString() : ""}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, "");
              setQuantity(numericValue ? parseInt(numericValue, 10) : null);
            }}
            placeholder="Ex: 10"
            keyboardType="numeric"
          />
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Preço (opcional)</ThemedText>
          <ThemedInput
            placeholderTextColor={textColor}
            value={price}
            onChangeText={(value) => setPrice(formatCurrencyInput(value))}
            placeholder="Ex: R$ 5,99"
            keyboardType="numeric"
          />
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Localização (opcional)</ThemedText>
          <ThemedInput
            placeholderTextColor={textColor}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Prateleira 2"
          />
        </View>
        <TouchableOpacity onPress={handleSaveProduct} className="bg-[#F5A689] py-2.5 rounded-lg mt-4">
          <ThemedText className="text-white text-center font-semibold text-base">Salvar Produto</ThemedText>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
