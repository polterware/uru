import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { CategoryFilter } from "@/features/add/components/CategoryFilter";
import { InventorySortOptions } from "@/features/inventory/components/InventorySortOptions";
import { EditItemModal } from "@/features/inventory/components/EditItemModal";
import { InventoryItemCard } from "@/features/inventory/components/InventoryItemCard";
import { SearchBarInventory } from "@/features/inventory/components/SearchBarInventory";
import { useInventory } from "@/features/inventory/contexts/InventoryContext";

// Main Component
export default function InventoryScreen() {
  const {
    items,
    updateItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
  } = useInventory();

  // State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQuantity, setEditItemQuantity] = useState("1");
  const [editItemCategory, setEditItemCategory] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedCategory, setSelectedCategory] = useState(""); // Valor inicial vazio
  const [sortType, setSortType] = useState<
    "priceAsc" | "priceDesc" | "quantityAsc" | "quantityDesc" | ""
  >(""); // State for sorting
  const [editItemLocation, setEditItemLocation] = useState("");
  const [editItemCustomCreatedAt, setEditItemCustomCreatedAt] = useState("");
  const [editItemLastRemovedAt, setEditItemLastRemovedAt] = useState("");

  // Extract unique categories
  const categories = Array.from(
    new Set(
      items
        .map((item) => item.category)
        .filter((category): category is string => category !== undefined)
    )
  );

  // Handlers
  const openEditModal = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      setEditingIndex(id);
      setEditItemName(item.name);
      setEditItemQuantity(item.quantity.toString());
      setEditItemCategory(item.category || "");
      setEditItemPrice(item.price?.toString() || "");
      setEditItemLocation(item.location || "");
      setEditItemCustomCreatedAt(item.customCreatedAt || "");
      setEditItemLastRemovedAt(item.lastRemovedAt || "");
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (editingIndex !== null) {
      const updatedItem = {
        id: editingIndex,
        name: editItemName,
        quantity: parseInt(editItemQuantity) || 0,
        category: editItemCategory,
        price: parseFloat(editItemPrice) || 0,
        location: editItemLocation,
        customCreatedAt: editItemCustomCreatedAt,
        lastRemovedAt: editItemLastRemovedAt,
      };
      await updateItem(editingIndex, updatedItem);
      setEditModalVisible(false);
    }
  };

  // Filtered and sorted items
  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) =>
      selectedCategory ? item.category === selectedCategory : true
    )
    .sort((a, b) => {
      if (sortType === "priceAsc") {
        return (a.price || 0) - (b.price || 0);
      } else if (sortType === "priceDesc") {
        return (b.price || 0) - (a.price || 0);
      } else if (sortType === "quantityAsc") {
        return a.quantity - b.quantity;
      } else if (sortType === "quantityDesc") {
        return b.quantity - a.quantity;
      }
      return 0;
    });

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 pt-6 px-4 pb-0">
          <ThemedView className="flex-row gap-2 bg-transparent mb-2.5">
            <ThemedText type="title">Inventário</ThemedText>
          </ThemedView>

          <SearchBarInventory
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <CategoryFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
              />
            </View>
            <View className="flex-1">
              <InventorySortOptions
                sortType={sortType}
                setSortType={setSortType}
              />
            </View>
          </View>

          <FlatList
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View className="h-2.5" />}
            contentContainerClassName="pb-8"
            ListEmptyComponent={
              <ThemedText className="text-center mt-5 text-[#999] text-base italic">
                Nenhum item encontrado.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <InventoryItemCard
                item={item}
                onEdit={openEditModal}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
              />
            )}
          />

          <EditItemModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            itemName={editItemName}
            setItemName={setEditItemName}
            itemQuantity={editItemQuantity}
            setItemQuantity={setEditItemQuantity}
            itemCategory={editItemCategory}
            setItemCategory={setEditItemCategory}
            itemPrice={editItemPrice}
            setItemPrice={setEditItemPrice}
            itemLocation={editItemLocation}
            setItemLocation={setEditItemLocation}
            itemCreatedAt={editItemCustomCreatedAt}
            setItemCreatedAt={setEditItemCustomCreatedAt}
            itemLastRemovedAt={editItemLastRemovedAt}
            setItemLastRemovedAt={setEditItemLastRemovedAt}
            onSave={handleSaveEdit}
            onDelete={() => {
              if (editingIndex !== null) removeItem(editingIndex);
              setEditModalVisible(false);
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
