import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
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

const TitleContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-weight: bold;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.06
    : responsiveWidth * 0.07}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#e0f2fe" : "#1e40af")};
  margin-left: 10px;
`;

const RefreshButton = styled(TouchableOpacity)`
  padding: 10px;
  border-radius: 12px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"};
`;

const ThemeButton = styled(TouchableOpacity)`
  padding: 10px;
  border-radius: 12px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"};
`;

const FilterContainer = styled(View)<{ isDarkMode: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 14px;
  border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FilterInput = styled.TextInput<{ isDarkMode: boolean }>`
  flex: 1;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e3a8a")};
  margin-left: 10px;
`;

const ClearFilterButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  padding: 8px;
  border-radius: 10px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
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
`;

const ClearDateButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  padding: 8px;
  border-radius: 10px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
  margin-left: 10px;
`;

const ClearAllButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex-direction: row;
  background-color: #dc2626;
  padding: ${isSmallScreen ? 12 : 14}px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
`;

const ClearAllText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  margin-left: 10px;
`;

const Card = styled(View)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
  padding: ${isSmallScreen
    ? responsiveHeight * 0.02
    : responsiveHeight * 0.025}px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  border-radius: 16px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
`;

const CardInfo = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const CardText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e3a8a")};
  margin-left: 10px;
  flex: 1;
`;

const PaginationContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const PaginationButton = styled(TouchableOpacity)<{
  disabled?: boolean;
  isDarkMode: boolean;
}>`
  background-color: ${({ disabled, isDarkMode }) =>
    disabled
      ? isDarkMode
        ? "#4b5563"
        : "#d1d5db"
      : isDarkMode
      ? "#3b82f6"
      : "#2563eb"};
  padding: ${isSmallScreen ? 8 : 10}px;
  border-radius: 12px;
  align-items: center;
  width: 26%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const PaginationText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
`;

const PageIndicator = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e3a8a")};
`;

const ChartButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex-direction: row;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#6b7280" : "#4b5563")};
  padding: ${isSmallScreen ? 12 : 14}px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
`;

const ChartButtonText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.045
    : responsiveWidth * 0.05}px;
  margin-left: 10px;
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
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e3a8a")};
  margin-left: 10px;
`;

const Content = styled(ScrollView).attrs({
  contentContainerStyle: (props: { insets: any }) => ({
    paddingBottom: props.insets.bottom + responsiveHeight * 0.15,
  }),
})``;

export default function TemperaturaDatosScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
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

  const fetchDatos = useCallback(async () => {
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
      setDatos(response.data.datos || []);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      Alert.alert("Error", `No se pudieron cargar los datos: ${error.message}`);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const filteredData = useMemo(() => {
    return datos.filter((item: any) => {
      const matchesText =
        item.idDispositivo.toLowerCase().includes(filter.toLowerCase()) ||
        item.ambiente.toLowerCase().includes(filter.toLowerCase());
      if (!selectedDate) return matchesText;
      const itemDate = new Date(item.fechaHora);
      return (
        matchesText &&
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getDate() === selectedDate.getDate()
      );
    });
  }, [datos, filter, selectedDate]);

  const paginatedData = useMemo(() => {
    const totalItems = filteredData.length;
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const handleRefresh = () => {
    fetchDatos();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  const handleDatePress = () => {
    setShowPicker(true);
  };

  const onDateChange = (event: any, selected: Date | undefined) => {
    setShowPicker(Platform.OS === "ios");
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const clearFilter = () => {
    setFilter("");
    setSelectedDate(null);
    setPage(1);
  };

  const goToChart = () => {
    router.push(`/temperatura-grafico?deviceId=${deviceId}`);
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
          <TitleContainer>
            <MaterialIcons
              name="device-thermostat"
              size={isSmallScreen ? 22 : 26}
              color={isDarkMode ? "#e0f2fe" : "#1e40af"}
            />
            <Title isDarkMode={isDarkMode}>Detalles - {deviceId}</Title>
            <RefreshButton
              onPress={handleRefresh}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              accessibilityLabel="Refrescar datos"
              isDarkMode={isDarkMode}
            >
              <Animated.View style={animatedButtonStyle}>
                <Ionicons
                  name="refresh"
                  size={isSmallScreen ? 22 : 26}
                  color={isDarkMode ? "#e0f2fe" : "#1e40af"}
                />
              </Animated.View>
            </RefreshButton>
            <ThemeButton
              onPress={toggleTheme}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              accessibilityLabel="Cambiar tema"
              isDarkMode={isDarkMode}
            >
              <Animated.View style={animatedButtonStyle}>
                <Ionicons
                  name={isDarkMode ? "sunny" : "moon"}
                  size={isSmallScreen ? 22 : 26}
                  color={isDarkMode ? "#e0f2fe" : "#1e40af"}
                />
              </Animated.View>
            </ThemeButton>
          </TitleContainer>
        </Header>
        <FilterContainer isDarkMode={isDarkMode}>
          <Ionicons
            name="search"
            size={isSmallScreen ? 18 : 20}
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
          <FilterInput
            isDarkMode={isDarkMode}
            placeholder="Filtrar por dispositivo o ambiente..."
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            value={filter}
            onChangeText={setFilter}
            accessibilityLabel="Filtrar datos"
          />
          {filter && (
            <ClearFilterButton
              isDarkMode={isDarkMode}
              onPress={() => setFilter("")}
              accessibilityLabel="Limpiar filtro de texto"
            >
              <Ionicons
                name="close"
                size={isSmallScreen ? 16 : 18}
                color={isDarkMode ? "#d1d5db" : "#1e3a8a"}
              />
            </ClearFilterButton>
          )}
        </FilterContainer>
        <DateButton
          isDarkMode={isDarkMode}
          onPress={handleDatePress}
          accessibilityLabel="Seleccionar fecha"
        >
          <MaterialIcons
            name="calendar-today"
            size={isSmallScreen ? 18 : 20}
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
          <DateText isDarkMode={isDarkMode}>
            {selectedDate
              ? selectedDate.toLocaleDateString("es-ES")
              : "Seleccionar día"}
          </DateText>
          {selectedDate && (
            <ClearDateButton
              isDarkMode={isDarkMode}
              onPress={() => setSelectedDate(null)}
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
        {(filter || selectedDate) && (
          <ClearAllButton
            isDarkMode={isDarkMode}
            onPress={clearFilter}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            accessibilityLabel="Limpiar todos los filtros"
          >
            <Animated.View style={animatedButtonStyle}>
              <Ionicons
                name="trash"
                size={isSmallScreen ? 16 : 18}
                color="white"
              />
              <ClearAllText>Limpiar Filtros</ClearAllText>
            </Animated.View>
          </ClearAllButton>
        )}
        {paginatedData.length > 0 ? (
          paginatedData.map((item, index) => (
            <Card key={index} isDarkMode={isDarkMode}>
              <CardInfo>
                <MaterialIcons
                  name="location-on"
                  size={isSmallScreen ? 16 : 18}
                  color={isDarkMode ? "#93c5fd" : "#1e40af"}
                />
                <CardText isDarkMode={isDarkMode}>
                  Ambiente: {item.ambiente}
                </CardText>
              </CardInfo>
              <CardInfo>
                <MaterialIcons
                  name="sensors"
                  size={isSmallScreen ? 16 : 18}
                  color={isDarkMode ? "#93c5fd" : "#1e40af"}
                />
                <CardText isDarkMode={isDarkMode}>
                  Dispositivo: {item.idDispositivo}
                </CardText>
              </CardInfo>
              <CardInfo>
                <MaterialIcons
                  name="ac-unit"
                  size={isSmallScreen ? 16 : 18}
                  color={isDarkMode ? "#93c5fd" : "#1e40af"}
                />
                <CardText isDarkMode={isDarkMode}>
                  Ventilador:{" "}
                  {item.conectadoVentilador ? "Conectado" : "Desconectado"}
                </CardText>
              </CardInfo>
              <CardInfo>
                <Ionicons
                  name="time"
                  size={isSmallScreen ? 16 : 18}
                  color={isDarkMode ? "#93c5fd" : "#1e40af"}
                />
                <CardText isDarkMode={isDarkMode}>
                  Fecha: {new Date(item.fechaHora).toLocaleString("es-ES")}
                </CardText>
              </CardInfo>
            </Card>
          ))
        ) : (
          <NoDataContainer isDarkMode={isDarkMode}>
            <MaterialIcons
              name="error"
              size={isSmallScreen ? 18 : 20}
              color="#ef4444"
            />
            <NoDataText isDarkMode={isDarkMode}>
              No hay datos disponibles
            </NoDataText>
          </NoDataContainer>
        )}
        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationButton
              isDarkMode={isDarkMode}
              onPress={() => handlePageChange(page - 1)}
              disabled={page === 1}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              accessibilityLabel="Página anterior"
            >
              <Animated.View style={animatedButtonStyle}>
                <PaginationText>Anterior</PaginationText>
              </Animated.View>
            </PaginationButton>
            <PageIndicator isDarkMode={isDarkMode}>
              Página {page} de {totalPages}
            </PageIndicator>
            <PaginationButton
              isDarkMode={isDarkMode}
              onPress={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              accessibilityLabel="Página siguiente"
            >
              <Animated.View style={animatedButtonStyle}>
                <PaginationText>Siguiente</PaginationText>
              </Animated.View>
            </PaginationButton>
          </PaginationContainer>
        )}
        <ChartButton
          isDarkMode={isDarkMode}
          onPress={goToChart}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
          accessibilityLabel="Ver gráfico de temperatura"
        >
          <Animated.View style={animatedButtonStyle}>
            <MaterialIcons
              name="insights"
              size={isSmallScreen ? 18 : 20}
              color="white"
            />
            <ChartButtonText>Ver Gráfico</ChartButtonText>
          </Animated.View>
        </ChartButton>
      </Content>
    </Container>
  );
}
