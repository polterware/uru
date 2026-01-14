import React from "react";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { BarChart } from "react-native-chart-kit";
import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface StockByCategoryChartProps {
  stockByCategory: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  backgroundColor: string;
  color: string;
}

export const StockByCategoryChart: React.FC<StockByCategoryChartProps> = ({
  stockByCategory,
  backgroundColor,
  color,
}) => (

  <Card className="mb-6 p-4 rounded-lg shadow-sm">
    <ThemedText className="text-xl font-bold mb-6 mt-1">Estoque por Categoria</ThemedText>
    {stockByCategory.datasets[0].data.length > 0 ? (
      <BarChart
        data={stockByCategory}
        width={screenWidth - 64}
        height={220}
        yAxisLabel="Qtd: "
        yAxisSuffix=""
        chartConfig={{
          decimalPlaces: 0,
          backgroundColor: "transparent",
          backgroundGradientFrom: backgroundColor,
          backgroundGradientTo: backgroundColor,
          color: (opacity = 1) => `rgba(245, 166, 137, ${opacity})`,
          labelColor: (opacity = 1) => color,
          style: { borderRadius: 16 },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        style={{ marginVertical: 8, borderRadius: 8 }}
      />
    ) : (
      <ThemedText className="text-sm mt-2 italic text-center">
        Nenhum dado disponível para o gráfico.
      </ThemedText>
    )}
  </Card>
);
