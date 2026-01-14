import React from "react";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { PieChart } from "react-native-chart-kit";
import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface DebtorsPieChartProps {
  debtorsData: any[];
}

export const DebtorsPieChart: React.FC<DebtorsPieChartProps> = ({
  debtorsData,
}) => (
  <Card className="mb-6 p-4 rounded-lg shadow-sm">
    <ThemedText className="text-xl font-bold mb-6 mt-1">
      Distribuição dos Devedores
    </ThemedText>
    {debtorsData.length > 0 ? (
      <PieChart
        data={debtorsData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(245, 166, 137, ${opacity})`,
        }}
        accessor={"amount"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
    ) : (
      <ThemedText className="text-sm mt-2 italic text-center">
        Nenhum dado disponível para o gráfico.
      </ThemedText>
    )}
  </Card>
);
