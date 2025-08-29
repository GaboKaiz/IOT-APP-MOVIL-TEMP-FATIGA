import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { ThemeContext } from "../contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

const Container = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
  padding: 20px;
`;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-size: 24px;
  font-weight: bold;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
`;

const DateButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
`;

const DateText = styled(Text)<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  font-size: 16px;
`;

const Content = styled(ScrollView)`
  flex: 1;
`;

const NoDataText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: 18px;
  color: #ef4444;
  text-align: center;
  margin-top: 20px;
`;

export default function TemperaturaGraficoScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const fetchDatos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (!token || !deviceId) {
      setLoading(false);
      return Alert.alert("Error", "Token o ID no válido");
    }
    try {
      const response = await axios.get(
        `https://api-node-js-iot-app-movil.onrender.com/temperatura/device/${deviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let deviceData = response.data.datos.sort(
        (a: any, b: any) =>
          new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      );
      if (selectedDate) {
        deviceData = deviceData.filter((item: any) => {
          const itemDate = new Date(item.fechaHora);
          return (
            itemDate.getFullYear() === selectedDate.getFullYear() &&
            itemDate.getMonth() === selectedDate.getMonth() &&
            itemDate.getDate() === selectedDate.getDate()
          );
        });
      }
      setDatos(deviceData);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      Alert.alert("Error", `No se pudieron cargar los datos: ${error.message}`);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
    const interval = setInterval(fetchDatos, 10000);
    return () => clearInterval(interval);
  }, [deviceId, selectedDate]);

  const onDateChange = (event: any, selected: Date | undefined) => {
    const currentDate = selected || selectedDate;
    setShowPicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
  };

  const chartConfig = {
    backgroundColor: isDarkMode ? "#1e293b" : "#e0f2fe",
    backgroundGradientFrom: isDarkMode ? "#1e293b" : "#e0f2fe",
    backgroundGradientTo: isDarkMode ? "#1e293b" : "#e0f2fe",
    decimalPlaces: 1,
    color: (opacity = 1) =>
      isDarkMode
        ? `rgba(147, 197, 253, ${opacity})`
        : `rgba(30, 64, 175, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDarkMode
        ? `rgba(147, 197, 253, ${opacity})`
        : `rgba(30, 64, 175, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: isDarkMode ? "#93c5fd" : "#1e40af",
    },
  };

  const chartData = {
    labels: datos.map((item) =>
      new Date(item.fechaHora).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        data: datos.map((item) => item.temperatura || 0),
      },
    ],
  };

  if (loading) {
    return (
      <Container isDarkMode={isDarkMode}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#93c5fd" : "#1e40af"}
        />
      </Container>
    );
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <Content>
        <Header>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={26}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={isDarkMode ? "sunny-outline" : "moon-outline"}
              size={26}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
          </TouchableOpacity>
        </Header>

        <Title isDarkMode={isDarkMode}>Gráfico - {deviceId}</Title>

        <DateButton isDarkMode={isDarkMode} onPress={() => setShowPicker(true)}>
          <DateText isDarkMode={isDarkMode}>
            {selectedDate
              ? `Filtrar por día: ${selectedDate.toLocaleDateString("es-ES")}`
              : "Seleccionar día para filtrar"}
          </DateText>
        </DateButton>
        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate || new Date()}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}

        {datos.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="°C"
            chartConfig={chartConfig}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        ) : (
          <NoDataText isDarkMode={isDarkMode}>
            No hay datos disponibles para graficar
          </NoDataText>
        )}
      </Content>
    </Container>
  );
}
