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
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

const Container = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
  padding: ${height * 0.02}px ${width * 0.05}px;
`;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${height * 0.03}px;
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${width * 0.06}px;
  font-weight: bold;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
`;

const Card = styled(View)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 16px;
  elevation: 4;
  border-left-width: 4px;
  border-left-color: ${({ isDarkMode }) =>
    isDarkMode ? "#3b82f6" : "#1e40af"};
`;

const CardText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${width * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
  margin-bottom: 8px;
  font-weight: 500;
`;

const FilterInput = styled.TextInput<{ isDarkMode: boolean }>`
  width: 100%;
  height: 45px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  font-size: ${width * 0.04}px;
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
  font-size: ${width * 0.04}px;
`;

const PaginationButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#3b82f6" : "#1e40af")};
  padding: 12px;
  border-radius: 12px;
  align-items: center;
  margin-top: 16px;
  width: 48%;
`;

const PaginationText = styled(Text)`
  color: white;
  font-weight: bold;
  font-size: ${width * 0.04}px;
`;

const ChartButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#6b7280" : "#9ca3af")};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 20px;
  width: 100%;
`;

const ChartButtonText = styled(Text)`
  color: white;
  font-weight: bold;
  font-size: ${width * 0.045}px;
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding-bottom: ${height * 0.3}px;
`;

export default function TemperaturaDatosScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

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
      let deviceData = response.data.datos;
      const filteredData = deviceData.filter((item: any) => {
        const matchesText =
          item.idDispositivo.toLowerCase().includes(filter.toLowerCase()) ||
          item.ambiente.toLowerCase().includes(filter.toLowerCase()) ||
          (item.temperatura && item.temperatura.toString().includes(filter));
        if (!selectedDate) return matchesText;
        const itemDate = new Date(item.fechaHora);
        return (
          matchesText &&
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getDate() === selectedDate.getDate()
        );
      });
      const totalItems = filteredData.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setDatos(filteredData.slice(start, end));
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
  }, [deviceId, page, filter, selectedDate]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  const onDateChange = (event: any, selected: Date | undefined) => {
    const currentDate = selected || selectedDate;
    setShowPicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
  };

  const goToChart = () => {
    router.push(`/temperatura-grafico?deviceId=${deviceId}`);
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

        <Title isDarkMode={isDarkMode}>Detalles - {deviceId}</Title>

        <FilterInput
          isDarkMode={isDarkMode}
          placeholder="Filtrar por dispositivo, ambiente o temperatura..."
          value={filter}
          onChangeText={setFilter}
        />

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

        {datos.map((item, index) => (
          <Card key={index} isDarkMode={isDarkMode}>
            <CardText isDarkMode={isDarkMode}>
              Ambiente: {item.ambiente}
            </CardText>
            <CardText isDarkMode={isDarkMode}>
              Dispositivo: {item.idDispositivo}
            </CardText>
            <CardText isDarkMode={isDarkMode}>
              Temperatura: {item.temperatura || 0}°C
            </CardText>
            <CardText isDarkMode={isDarkMode}>
              Ventilador:{" "}
              {item.conectadoVentilador ? "Conectado" : "Desconectado"}
            </CardText>
            <CardText isDarkMode={isDarkMode}>
              Fecha: {new Date(item.fechaHora).toLocaleString("es-ES")}
            </CardText>
          </Card>
        ))}

        {totalPages > 1 && (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <PaginationButton
              isDarkMode={isDarkMode}
              onPress={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <PaginationText>Anterior</PaginationText>
            </PaginationButton>
            <PaginationButton
              isDarkMode={isDarkMode}
              onPress={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <PaginationText>Siguiente</PaginationText>
            </PaginationButton>
          </View>
        )}

        <ChartButton isDarkMode={isDarkMode} onPress={goToChart}>
          <ChartButtonText>Ver Gráfico</ChartButtonText>
        </ChartButton>
      </Content>
    </Container>
  );
}
