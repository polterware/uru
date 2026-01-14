import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedInput } from "@/components/ThemedInput";
import { useThemeColor } from "@/features/settings/hooks/useThemeColor";
import { v4 as uuidv4 } from "uuid";
import {
  formatCurrencyInput,
  parseCurrency,
} from "@/features/inventory/hooks/useCurrencyHelpers";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface AddDebtorFormProps {
  addDebtor: (debtor: any) => Promise<void>;
}

export const AddDebtorForm: React.FC<AddDebtorFormProps> = ({ addDebtor }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isDueDatePickerVisible, setDueDatePickerVisible] = useState(false);
  const textColor = useThemeColor({ light: "#222", dark: "#999" }, "text");

  const handleSaveDebtor = async () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }
    const newDebtor = {
      id: uuidv4(),
      name,
      amount: parseCurrency(amount),
      status: "open" as "open",
      startDate: startDate || new Date().toISOString(),
      dueDate,
      paidDate: "",
    };
    await addDebtor(newDebtor);
    Alert.alert("Sucesso", `Devedor "${name}" adicionado!`);
    setName("");
    setAmount("");
    setStartDate("");
    setDueDate("");
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatCurrencyInput(value));
  };

  const handleConfirmStartDate = (date: Date) => {
    setStartDate(date.toISOString().substring(0, 10));
    setStartDatePickerVisible(false);
  };
  const handleConfirmDueDate = (date: Date) => {
    setDueDate(date.toISOString().substring(0, 10));
    setDueDatePickerVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerClassName="p-4 gap-2.5">
        <View>
          <ThemedText className="mb-2 text-base font-medium">Nome do Devedor</ThemedText>
          <ThemedInput
            placeholderTextColor={textColor}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Cliente A"
          />
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Valor Devido</ThemedText>
          <ThemedInput
            placeholderTextColor={textColor}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Ex: R$ 100,00"
            keyboardType="numeric"
          />
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Data de Início</ThemedText>
          <TouchableOpacity onPress={() => setStartDatePickerVisible(true)}>
            <ThemedInput
              placeholderTextColor={textColor}
              value={startDate}
              placeholder="AAAA-MM-DD"
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmStartDate}
            onCancel={() => setStartDatePickerVisible(false)}
          />
        </View>
        <View>
          <ThemedText className="mb-2 text-base font-medium">Prazo para Pagamento</ThemedText>
          <TouchableOpacity onPress={() => setDueDatePickerVisible(true)}>
            <ThemedInput
              placeholderTextColor={textColor}
              value={dueDate}
              placeholder="AAAA-MM-DD"
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDueDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDueDate}
            onCancel={() => setDueDatePickerVisible(false)}
          />
        </View>
        <TouchableOpacity onPress={handleSaveDebtor} className="bg-[#F5A689] py-2.5 rounded-lg mt-4">
          <ThemedText className="text-white text-center font-semibold text-base">Salvar Devedor</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};
