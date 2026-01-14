// MommyStockHub/screens/SettingsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/features/settings/contexts/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import {
  exportDatabaseToExcel,
  importDatabaseFromExcel,
} from "@/features/settings/utils";

export default function SettingsScreen() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleToggleNotifications = () =>
    setIsNotificationsEnabled((prev) => !prev);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerClassName="p-4">
        <ThemedText className="text-2xl font-bold mb-6 text-center">Configurações</ThemedText>

        {/* Seção de Tema */}
        <View className="mb-6">
          <ThemedText className="text-lg font-semibold mb-3">Aparência</ThemedText>
          <View className="py-3 px-4 rounded-lg mb-2 flex-row justify-between items-center">
            <ThemedText className="text-base">Tema Escuro</ThemedText>
            <Switch value={isDarkTheme} onValueChange={toggleTheme} />
          </View>
        </View>

        {/* Seção de Notificações */}
        <View className="mb-6">
          <ThemedText className="text-lg font-semibold mb-3">Notificações</ThemedText>
          <View className="py-3 px-4 rounded-lg mb-2 flex-row justify-between items-center">
            <ThemedText className="text-base">
              Ativar Notificações
            </ThemedText>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={handleToggleNotifications}
            />
          </View>
        </View>

        {/* Seção de Exportação */}
        <View className="mb-6">
          <ThemedText className="text-lg font-semibold mb-3">Backup</ThemedText>
          <TouchableOpacity
            className="bg-[#F5A689] py-3 rounded-lg items-center mt-2"
            onPress={exportDatabaseToExcel}
          >
            <ThemedText className="text-white font-bold text-base">
              Exportar Base de Dados (Excel)
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#A3D977] py-3 rounded-lg items-center mt-2"
            onPress={importDatabaseFromExcel}
          >
            <ThemedText className="text-white font-bold text-base">
              Importar Base de Dados (Excel)
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
