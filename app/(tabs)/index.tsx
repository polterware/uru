// MommyStockHub/screens/HomeScreen.tsx

import React, { useMemo } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/features/settings/hooks/useThemeColor";
import { DebtorsPieChart } from "@/features/debtors/components/DebtorsPieChart";
import { TopDebtorsList } from "@/features/debtors/components/TopDebtorsList";
import { LowCategoryList } from "@/features/inventory/components/LowCategoryList";
import { LowStockList } from "@/features/inventory/components/LowStockList";
import { StockByCategoryChart } from "@/features/inventory/components/StockByCategoryChart";
import { SummaryCards } from "@/features/inventory/components/SummaryCards";
import { useInventory } from "@/features/inventory/contexts/InventoryContext";
import { useDebtors } from "@/features/debtors/contexts/DebtorContext";

export default function HomeScreen() {
  const { items } = useInventory();
  const { debtors } = useDebtors();

  // Ensure useThemeColor is called consistently at the top level
  const backgroundColor = useThemeColor(
    { light: undefined, dark: undefined },
    "background"
  );
  const color = useThemeColor({ light: undefined, dark: undefined }, "text");

  // Precompute colors for PieChart at the top level
  // Cor base do tema (chamada única de Hook)
  const basePieColor = useThemeColor(
    { light: "rgba(245, 166, 137, 1)", dark: "rgba(245, 166, 137, 1)" },
    "text"
  );
  const legendFontColor = useThemeColor(
    { light: "#000", dark: "#FFF" },
    "text"
  );

  // Gera o array só com lógica normal (useMemo opcional, sem Hooks dentro)
  const pieChartColors = useMemo(
    () =>
      debtors.map((_, index) => ({
        color: `rgba(245, 166, 137, ${1 - index * 0.2})`, // ajusta a opacidade
        legendFontColor,
      })),
    [debtors, legendFontColor]
  );

  const totalProducts = items.length;

  const totalCategories = useMemo(() => {
    const categories = new Set(
      items.map((item) => item.category || "Sem Categoria")
    );
    return categories.size;
  }, [items]);

  const lowStock = useMemo(
    () => items.filter((item) => item.quantity <= 15),
    [items]
  );

  const topDebtors = useMemo(() => {
    return debtors
      .filter((debtor) => debtor.status === "open")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [debtors]);

  const stockByCategory = useMemo(() => {
    const categoryData = items.reduce<Record<string, number>>((acc, item) => {
      const category = item.category || "Sem Categoria";
      acc[category] = (acc[category] || 0) + item.quantity;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
        },
      ],
    };
  }, [items]);

  const debtorsData = useMemo(() => {
    return debtors.map((debtor, index) => ({
      name: debtor.name,
      amount: debtor.amount,
      color: pieChartColors[index]?.color,
      legendFontColor: pieChartColors[index]?.legendFontColor,
      legendFontSize: 12,
    }));
  }, [debtors]);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerClassName="grow px-4 pb-[60px]">
        <View className="items-center flex flex-row pb-5">
          <Image
            source={require("../../assets/images/logo.png")}
            className="w-[100px] h-[100px]"
          />
          <ThemedText className="text-xl font-bold text-left shrink">
            Bem-vindo(a) ao Inventy!
          </ThemedText>
        </View>

        {/* Seção de resumo */}
        <SummaryCards
          totalProducts={totalProducts}
          totalCategories={totalCategories}
          lowStockCount={lowStock.length}
        />
        <LowStockList lowStock={lowStock} />
        <TopDebtorsList topDebtors={topDebtors} />
        <LowCategoryList
          categories={items.reduce((acc, item) => {
            const category = item.category || "Sem Categoria";
            acc[category] = (acc[category] || 0) + item.quantity;
            return acc;
          }, {} as Record<string, number>)}
        />
        <StockByCategoryChart
          stockByCategory={stockByCategory}
          backgroundColor={backgroundColor}
          color={color}
        />
        <DebtorsPieChart debtorsData={debtorsData} />
      </ScrollView>
    </SafeAreaView>
  );
}
