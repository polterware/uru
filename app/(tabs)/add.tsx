// MommyStockHub/screens/AddTabScreen.tsx

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView, // Importar o componente
} from "react-native";
// Importando o contexto de devedores
import "react-native-get-random-values";
import { ThemedText } from "@/components/ThemedText";
import { AddProductForm } from "@/features/add/components/AddProductForm";
import { AddDebtorForm } from "@/features/add/components/AddDebtorForm";
import { useDebtors } from "@/features/debtors/contexts/DebtorContext";
import { useInventory } from "@/features/inventory/contexts/InventoryContext";

export default function AddTabScreen() {
  const [activeTab, setActiveTab] = useState<"product" | "debtor">("product");
  const { addItem, items } = useInventory(); // Obter os itens do inventário
  const { addDebtor } = useDebtors(); // Usando o contexto de devedores

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row">
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === "product" ? "border-b-4 border-[#F5A689]" : ""}`}
          onPress={() => setActiveTab("product")}
        >
          <ThemedText
            className={`text-base ${activeTab === "product" ? "text-[#F5A689] font-bold" : ""}`}
          >
            Produto
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === "debtor" ? "border-b-4 border-[#F5A689]" : ""}`}
          onPress={() => setActiveTab("debtor")}
        >
          <ThemedText
            className={`text-base ${activeTab === "debtor" ? "text-[#F5A689] font-bold" : ""}`}
          >
            Devedor
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === "product" && (
        <AddProductForm addItem={addItem} items={items} />
      )}
      {activeTab === "debtor" && <AddDebtorForm addDebtor={addDebtor} />}
    </SafeAreaView>
  );
}
