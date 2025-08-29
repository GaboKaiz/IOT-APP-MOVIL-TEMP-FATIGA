import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
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
  flex-direction: column;
  align-items: center;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.025
    : responsiveHeight * 0.03}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#e0f2fe")};
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.02
    : responsiveHeight * 0.03}px;
  border-bottom-width: 3px;
  border-bottom-color: ${({ isDarkMode }) =>
    isDarkMode ? "#60a5fa" : "#3b82f6"};
`;

const HeaderTop = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const TitleContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-weight: bold;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.07
    : responsiveWidth * 0.08}px;
  line-height: ${isSmallScreen
    ? responsiveWidth * 0.1
    : responsiveWidth * 0.12}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e40af")};
  margin-left: 10px;
`;

const DevicesSection = styled(View)`
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.01}px;
`;

const DevicesTitle = styled.Text<{ isDarkMode: boolean }>`
  font-weight: bold;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.05
    : responsiveWidth * 0.055}px;
  line-height: ${isSmallScreen
    ? responsiveWidth * 0.07
    : responsiveWidth * 0.08}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e40af")};
  margin-bottom: 14px;
`;

const DeviceCardContainer = styled(Animated.View)<{ isDarkMode: boolean }>`
  border-radius: 18px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.02
    : responsiveHeight * 0.025}px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.09}px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
`;

const DeviceImage = styled(Image)`
  width: 100%;
  height: ${isSmallScreen ? responsiveHeight * 0.2 : responsiveHeight * 0.25}px;
  border-radius: 14px;
  margin-bottom: 14px;
  border-width: 2px;
  border-color: ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
`;

const DeviceInfoContainer = styled(View)`
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(55, 65, 81, 0.4)" : "rgba(147, 197, 253, 0.15)"};
  border-radius: 10px;
  padding: 10px;
`;

const DeviceInfo = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const DeviceText = styled.Text<{ isDarkMode: boolean }>`
  font-weight: normal;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  line-height: ${isSmallScreen
    ? responsiveWidth * 0.06
    : responsiveWidth * 0.07}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e3a8a")};
  margin-left: 10px;
  flex: 1;
`;

const ErrorContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
`;

const ErrorText = styled.Text<{ isDarkMode: boolean }>`
  font-weight: normal;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: #ef4444;
  margin-left: 10px;
`;

const LoadingContainer = styled(View)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(55, 65, 81, 0.4)" : "rgba(147, 197, 253, 0.2)"};
  border-radius: 50px;
  padding: ${isSmallScreen ? 12 : 16}px;
  align-items: center;
  margin-vertical: ${isSmallScreen
    ? responsiveHeight * 0.03
    : responsiveHeight * 0.04}px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
`;

const LoadingText = styled.Text<{ isDarkMode: boolean }>`
  font-weight: normal;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e3a8a")};
  margin-top: 10px;
`;

const PaginationContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 10px;
`;

const PaginationButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex: 0.48;
  flex-direction: row;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#3b82f6" : "#2563eb")};
  padding: ${isSmallScreen ? 12 : 14}px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const PaginationButtonText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  margin-left: 10px;
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding-bottom: ${isSmallScreen
    ? responsiveHeight * 0.18
    : responsiveHeight * 0.25}px;
`;

export default function FatigaDatosScreen() {
  const router = useRouter();
  const { isDarkMode } = useContext(ThemeContext);
  const { cameraId } = useLocalSearchParams();
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.15, { duration: 1000 }),
      -1,
      true
    );
  }, [pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return Alert.alert("Error", "Token no válido");
    }
    try {
      const response = await axios.get(
        `https://api-node-js-iot-app-movil.onrender.com/fatiga/camera/${cameraId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit: 10 },
        }
      );
      setDatos(response.data.datos);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      Alert.alert("Error", `No se pudieron cargar los datos: ${error.message}`);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }, [cameraId, page]);

  useEffect(() => {
    if (cameraId) {
      fetchDatos();
    }
  }, [cameraId, page, fetchDatos]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) setPage(page + 1);
  }, [page, totalPages]);

  return (
    <Container isDarkMode={isDarkMode}>
      <Content bounces={true}>
        <Header isDarkMode={isDarkMode}>
          <HeaderTop>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={isSmallScreen ? 24 : 26}
                color={isDarkMode ? "#bfdbfe" : "#1e40af"}
              />
            </TouchableOpacity>
            <TitleContainer>
              <Animated.View style={animatedStyle}>
                <Ionicons
                  name="camera"
                  size={isSmallScreen ? 24 : 26}
                  color={isDarkMode ? "#bfdbfe" : "#1e40af"}
                />
              </Animated.View>
              <Title isDarkMode={isDarkMode}>
                Imágenes de Cámara {cameraId}
              </Title>
            </TitleContainer>
          </HeaderTop>
        </Header>

        <DevicesSection>
          <DevicesTitle isDarkMode={isDarkMode}>
            Imágenes Registradas
          </DevicesTitle>
          {loading ? (
            <LoadingContainer isDarkMode={isDarkMode}>
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#93c5fd" : "#1e40af"}
              />
              <LoadingText isDarkMode={isDarkMode}>Cargando...</LoadingText>
            </LoadingContainer>
          ) : datos.length > 0 ? (
            <>
              {datos.map((item, index) => (
                <DeviceCardContainer
                  key={item._id}
                  isDarkMode={isDarkMode}
                  entering={FadeInDown.delay(index * 150).duration(400)}
                >
                  {item.foto && !imageErrors[item._id] ? (
                    <DeviceImage
                      source={{
                        uri: item.foto.startsWith("http")
                          ? item.foto
                          : `https://api-node-js-iot-app-movil.onrender.com${
                              item.foto
                            }?t=${Date.now()}`,
                      }}
                      resizeMode="cover"
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [item._id]: true,
                        }))
                      }
                    />
                  ) : (
                    <ErrorContainer>
                      <Ionicons
                        name="alert-circle"
                        size={isSmallScreen ? 20 : 22}
                        color="#ef4444"
                      />
                      <ErrorText isDarkMode={isDarkMode}>
                        Imagen no disponible
                      </ErrorText>
                    </ErrorContainer>
                  )}
                  <DeviceInfoContainer>
                    <DeviceInfo>
                      <Ionicons
                        name="calendar"
                        size={isSmallScreen ? 18 : 20}
                        color={isDarkMode ? "#93c5fd" : "#1e40af"}
                      />
                      <DeviceText isDarkMode={isDarkMode}>
                        Fecha:{" "}
                        {new Date(item.fechaHora).toLocaleString("es-ES")}
                      </DeviceText>
                    </DeviceInfo>
                    <DeviceInfo>
                      <Ionicons
                        name="map"
                        size={isSmallScreen ? 18 : 20}
                        color={isDarkMode ? "#93c5fd" : "#1e40af"}
                      />
                      <DeviceText isDarkMode={isDarkMode}>
                        Ambiente: {item.ambiente}
                      </DeviceText>
                    </DeviceInfo>
                  </DeviceInfoContainer>
                </DeviceCardContainer>
              ))}
              <PaginationContainer>
                <PaginationButton
                  isDarkMode={isDarkMode}
                  onPress={handlePreviousPage}
                  disabled={page === 1 || loading}
                >
                  <Ionicons
                    name="chevron-back"
                    size={isSmallScreen ? 18 : 20}
                    color="white"
                  />
                  <PaginationButtonText>Anterior</PaginationButtonText>
                </PaginationButton>
                <PaginationButton
                  isDarkMode={isDarkMode}
                  onPress={handleNextPage}
                  disabled={page === totalPages || loading}
                >
                  <PaginationButtonText>Siguiente</PaginationButtonText>
                  <Ionicons
                    name="chevron-forward"
                    size={isSmallScreen ? 18 : 20}
                    color="white"
                  />
                </PaginationButton>
              </PaginationContainer>
            </>
          ) : (
            <ErrorContainer>
              <Ionicons
                name="alert-circle"
                size={isSmallScreen ? 20 : 22}
                color="#ef4444"
              />
              <ErrorText isDarkMode={isDarkMode}>
                No hay imágenes disponibles
              </ErrorText>
            </ErrorContainer>
          )}
        </DevicesSection>
      </Content>
    </Container>
  );
}
