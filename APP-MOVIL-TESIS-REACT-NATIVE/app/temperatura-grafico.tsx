import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import styled from "styled-components/native";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const responsiveWidth = Math.min(width, 600);
const responsiveHeight = Math.min(height, 1800);
const isSmallScreen = width < 360;

const Container = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#f0f9ff")};
  padding: ${isSmallScreen
      ? responsiveHeight * 0.015
      : responsiveHeight * 0.02}px
    ${responsiveWidth * 0.04}px;
`;

const Header = styled(View)<{ isDarkMode: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#e0f2fe")};
  border-radius: 16px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.02
    : responsiveHeight * 0.025}px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.06
    : responsiveWidth * 0.07}px;
  font-weight: bold;
  color: ${({ isDarkMode }) => (isDarkMode ? "#e0f2fe" : "#1e40af")};
  text-align: center;
`;

const DateButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
  padding: 12px;
  border-radius: 14px;
  margin-bottom: 14px;
  border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const DateText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e3a8a")};
  margin-left: 10px;
  flex: 1;
`;

const ClearDateButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  padding: 8px;
  border-radius: 10px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
`;

const ChartContainer = styled(View)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
`;

const InfoText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e3a8a")};
  text-align: center;
  margin-top: 8px;
`;

const NoDataContainer = styled(View)<{ isDarkMode: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.025
    : responsiveHeight * 0.03}px;
  padding: 14px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(147, 197, 253, 0.3)"};
  border-radius: 14px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const NoDataText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: #ef4444;
  margin-left: 10px;
`;

const Content = styled(ScrollView).attrs({
  contentContainerStyle: (props: { insets: any }) => ({
    paddingBottom: props.insets.bottom + responsiveHeight * 0.15,
  }),
})``;

export default function TemperaturaGraficoScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleButtonPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    scale.value = withSpring(1);
  };

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
      // Limitar a 10 puntos para mejor legibilidad
      setDatos(deviceData.slice(0, 10));
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
    setShowPicker(Platform.OS === "ios");
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  const chartConfig = {
    backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
    backgroundGradientFrom: isDarkMode ? "#2d3748" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#2d3748" : "#ffffff",
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
    propsForBackgroundLines: {
      stroke: isDarkMode ? "#4b5563" : "#d1d5db",
      strokeDasharray: "",
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
        </View>
      </Container>
    );
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <Content insets={insets}>
        <Header isDarkMode={isDarkMode}>
          <TouchableOpacity
            onPress={() => router.back()}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            accessibilityLabel="Volver atrás"
          >
            <Animated.View style={animatedButtonStyle}>
              <Ionicons
                name="arrow-back"
                size={isSmallScreen ? 22 : 26}
                color={isDarkMode ? "#e0f2fe" : "#1e40af"}
              />
            </Animated.View>
          </TouchableOpacity>
          <Title isDarkMode={isDarkMode}>Gráfico - {deviceId}</Title>
          <TouchableOpacity
            onPress={toggleTheme}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            accessibilityLabel="Cambiar tema"
          >
            <Animated.View style={animatedButtonStyle}>
              <Ionicons
                name={isDarkMode ? "sunny" : "moon"}
                size={isSmallScreen ? 22 : 26}
                color={isDarkMode ? "#e0f2fe" : "#1e40af"}
              />
            </Animated.View>
          </TouchableOpacity>
        </Header>

        <DateButton
          isDarkMode={isDarkMode}
          onPress={() => setShowPicker(true)}
          accessibilityLabel="Seleccionar fecha"
        >
          <MaterialIcons
            name="calendar-today"
            size={isSmallScreen ? 18 : 20}
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
          <DateText isDarkMode={isDarkMode}>
            {selectedDate
              ? `Filtrar por día: ${selectedDate.toLocaleDateString("es-ES")}`
              : "Seleccionar día para filtrar"}
          </DateText>
          {selectedDate && (
            <ClearDateButton
              isDarkMode={isDarkMode}
              onPress={clearDate}
              accessibilityLabel="Limpiar fecha"
            >
              <Ionicons
                name="close"
                size={isSmallScreen ? 16 : 18}
                color={isDarkMode ? "#d1d5db" : "#1e3a8a"}
              />
            </ClearDateButton>
          )}
        </DateButton>
        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate || new Date()}
            mode="date"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}

        {datos.length > 0 ? (
          <ChartContainer isDarkMode={isDarkMode}>
            <LineChart
              data={chartData}
              width={responsiveWidth - 48}
              height={isSmallScreen ? 200 : 240}
              yAxisLabel=""
              yAxisSuffix="°C"
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 12 }}
            />
            <InfoText isDarkMode={isDarkMode}>
              {selectedDate
                ? `Mostrando datos del ${selectedDate.toLocaleDateString(
                    "es-ES"
                  )}`
                : "Mostrando últimos datos disponibles"}
            </InfoText>
          </ChartContainer>
        ) : (
          <NoDataContainer isDarkMode={isDarkMode}>
            <MaterialIcons
              name="error"
              size={isSmallScreen ? 18 : 20}
              color="#ef4444"
            />
            <NoDataText isDarkMode={isDarkMode}>
              No hay datos disponibles para graficar
            </NoDataText>
          </NoDataContainer>
        )}
      </Content>
    </Container>
  );
}
