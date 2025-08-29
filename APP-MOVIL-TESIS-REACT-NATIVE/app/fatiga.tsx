import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import styled from "styled-components/native";
import BottomNav from "../components/BottomNav";
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

const LastUpdateContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(55, 65, 81, 0.4)" : "rgba(147, 197, 253, 0.2)"};
  padding: 6px 12px;
  border-radius: 10px;
`;

const LastUpdateText = styled.Text<{ isDarkMode: boolean }>`
  font-weight: normal;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e3a8a")};
  margin-left: 8px;
`;

const CameraCountContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"};
  border-radius: 10px;
  padding: 8px;
  margin-top: 10px;
`;

const CameraCountText = styled.Text<{ isDarkMode: boolean }>`
  font-weight: bold;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
  margin-left: 8px;
`;

const InputContainer = styled(View)<{
  isDarkMode: boolean;
  isFocused?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
  border: 2px solid
    ${({ isDarkMode, isFocused }) =>
      isFocused
        ? isDarkMode
          ? "#93c5fd"
          : "#2563eb"
        : isDarkMode
        ? "#4b5563"
        : "#d1d5db"};
  box-shadow: ${({ isFocused }) =>
    isFocused
      ? "0 4px 12px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
`;

const Input = styled.TextInput<{ isDarkMode: boolean }>`
  flex: 1;
  font-weight: normal;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  line-height: ${isSmallScreen
    ? responsiveWidth * 0.06
    : responsiveWidth * 0.07}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e3a8a")};
  margin-left: 10px;
`;

const Button = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex-direction: row;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#3b82f6" : "#2563eb")};
  padding: ${isSmallScreen ? 14 : 16}px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ButtonText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
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
  height: ${isSmallScreen ? responsiveHeight * 0.1 : responsiveHeight * 0.12}px;
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
  margin-bottom: 10px;
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

const ButtonContainer = styled(View)`
  flex-direction: ${isSmallScreen ? "column" : "row"};
  justify-content: space-between;
  margin-top: 12px;
`;

const DetailButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex: ${isSmallScreen ? 1 : 0.48};
  flex-direction: row;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#6b7280" : "#9ca3af")};
  padding: ${isSmallScreen ? 12 : 14}px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-top: ${isSmallScreen ? 8 : 0}px;
`;

const DetailButtonText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  margin-left: 10px;
`;

const DeleteButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  flex: ${isSmallScreen ? 1 : 0.48};
  flex-direction: row;
  background-color: #ef4444;
  padding: ${isSmallScreen ? 12 : 14}px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-top: ${isSmallScreen ? 8 : 0}px;
`;

const DeleteButtonText = styled.Text`
  font-weight: bold;
  color: white;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  margin-left: 10px;
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

const ScrollIndicator = styled(Animated.View)<{ isDarkMode: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  padding: 10px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(55, 65, 81, 0.4)" : "rgba(147, 197, 253, 0.2)"};
  border-radius: 12px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
`;

const ScrollIndicatorText = styled.Text<{ isDarkMode: boolean }>`
  font-weight: normal;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#1e3a8a")};
  margin-left: 8px;
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding-bottom: ${isSmallScreen
    ? responsiveHeight * 0.18
    : responsiveHeight * 0.25}px;
`;

const BottomNavContainer = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  width: 100%;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#f0f9ff")};
  padding: 12px 0;
  z-index: 10;
`;

export default function FatigaScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [idCamara, setIdCamara] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [camaraFocused, setCamaraFocused] = useState(false);
  const [ambienteFocused, setAmbienteFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);
  const themeRotation = useSharedValue(0);

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

  const animatedThemeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${themeRotation.value}deg` }],
  }));

  const handleToggleTheme = useCallback(() => {
    themeRotation.value = withTiming(themeRotation.value + 360, {
      duration: 400,
    });
    toggleTheme();
  }, [toggleTheme, themeRotation]);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return Alert.alert("Error", "Token no válido");
    }
    try {
      const response = await axios.get(
        "https://api-node-js-iot-app-movil.onrender.com/fatiga",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const uniqueDevices = Array.from(
        new Map(
          response.data.map((item: any) => [item.idCamara, item])
        ).values()
      );
      setDatos(uniqueDevices);
      const now = new Date();
      setLastUpdate(
        `Última Actualización: ${now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Lima",
        })}`
      );
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      Alert.alert("Error", `No se pudieron cargar los datos: ${error.message}`);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatos();
    const interval = setInterval(fetchDatos, 10000);
    return () => clearInterval(interval);
  }, [fetchDatos]);

  const agregarDato = useCallback(async () => {
    if (!idCamara || !ambiente) {
      Alert.alert("Error", "Nombre de la cámara y ambiente son obligatorios");
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return Alert.alert("Error", "Token no válido");
    }
    try {
      await axios.post(
        "https://api-node-js-iot-app-movil.onrender.com/fatiga",
        { idCamara, ambiente },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDatos();
      setIdCamara("");
      setAmbiente("");
      Alert.alert("Éxito", "Cámara agregada");
    } catch (error: any) {
      console.error("Error adding data:", error.message);
      Alert.alert("Error", `No se pudo agregar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [idCamara, ambiente, fetchDatos]);

  const eliminarDato = useCallback(
    async (id: string) => {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return Alert.alert("Error", "Token no válido");
      }
      try {
        await axios.delete(
          `https://api-node-js-iot-app-movil.onrender.com/fatiga/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchDatos();
        Alert.alert("Éxito", "Dato eliminado");
      } catch (error: any) {
        console.error("Error deleting data:", error.message);
        Alert.alert("Error", `No se pudo eliminar: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [fetchDatos]
  );

  const handleNavigation = useCallback(
    (path: string) => {
      if (path === "Home") router.push("/dashboard");
      else if (path === "Temperatura") router.push("/temperatura");
      else if (path === "Fatiga") return;
      else if (path === "Profile") router.push("/profile");
      else if (path === "Cerrar Sesión") {
        AsyncStorage.multiRemove(["token", "user"]).then(() =>
          router.replace("/login")
        );
      }
    },
    [router]
  );

  const uniqueDevices = useMemo(() => datos, [datos]);

  const cameraCount = useMemo(() => datos.length, [datos]);

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
              <Title isDarkMode={isDarkMode}>😴 IoT - Fatiga</Title>
              <TouchableOpacity onPress={handleToggleTheme}>
                <Animated.View style={animatedThemeStyle}>
                  <Ionicons
                    name={isDarkMode ? "sunny" : "moon"}
                    size={isSmallScreen ? 24 : 26}
                    color={isDarkMode ? "#bfdbfe" : "#1e40af"}
                  />
                </Animated.View>
              </TouchableOpacity>
            </TitleContainer>
          </HeaderTop>
          <LastUpdateContainer>
            <Ionicons
              name="time-outline"
              size={isSmallScreen ? 18 : 20}
              color={isDarkMode ? "#bfdbfe" : "#1e3a8a"}
            />
            <LastUpdateText isDarkMode={isDarkMode}>
              {lastUpdate}
            </LastUpdateText>
          </LastUpdateContainer>
          <CameraCountContainer>
            <Ionicons
              name="camera-outline"
              size={isSmallScreen ? 18 : 20}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
            <CameraCountText isDarkMode={isDarkMode}>
              Cámaras Activas: {cameraCount}
            </CameraCountText>
          </CameraCountContainer>
        </Header>

        <InputContainer isDarkMode={isDarkMode} isFocused={camaraFocused}>
          <Ionicons
            name="camera"
            size={isSmallScreen ? 20 : 22}
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
          <Input
            isDarkMode={isDarkMode}
            placeholder="Nombre de la Cámara"
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            value={idCamara}
            onChangeText={setIdCamara}
            onFocus={() => setCamaraFocused(true)}
            onBlur={() => setCamaraFocused(false)}
          />
        </InputContainer>
        <InputContainer isDarkMode={isDarkMode} isFocused={ambienteFocused}>
          <Ionicons
            name="map"
            size={isSmallScreen ? 20 : 22}
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
          <Input
            isDarkMode={isDarkMode}
            placeholder="Ambiente"
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            value={ambiente}
            onChangeText={setAmbiente}
            onFocus={() => setAmbienteFocused(true)}
            onBlur={() => setAmbienteFocused(false)}
          />
        </InputContainer>

        <Button
          isDarkMode={isDarkMode}
          onPress={agregarDato}
          disabled={loading}
        >
          <Ionicons
            name="add-circle"
            size={isSmallScreen ? 20 : 22}
            color="white"
          />
          <ButtonText>Agregar Cámara</ButtonText>
        </Button>

        <DevicesSection>
          <DevicesTitle isDarkMode={isDarkMode}>Cámaras Activas</DevicesTitle>
          {loading ? (
            <LoadingContainer isDarkMode={isDarkMode}>
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#93c5fd" : "#1e40af"}
              />
              <LoadingText isDarkMode={isDarkMode}>Cargando...</LoadingText>
            </LoadingContainer>
          ) : uniqueDevices.length > 0 ? (
            <>
              {uniqueDevices.map((item, index) => (
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
                      <Animated.View style={animatedStyle}>
                        <Ionicons
                          name="pulse"
                          size={isSmallScreen ? 18 : 20}
                          color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                        />
                      </Animated.View>
                      <DeviceText isDarkMode={isDarkMode}>
                        Ambiente: {item.ambiente}
                      </DeviceText>
                    </DeviceInfo>
                    <DeviceInfo>
                      <Ionicons
                        name="camera"
                        size={isSmallScreen ? 18 : 20}
                        color={isDarkMode ? "#93c5fd" : "#1e40af"}
                      />
                      <DeviceText isDarkMode={isDarkMode}>
                        Cámara: {item.idCamara}
                      </DeviceText>
                    </DeviceInfo>
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
                  </DeviceInfoContainer>
                  <ButtonContainer>
                    <DetailButton
                      isDarkMode={isDarkMode}
                      onPress={() =>
                        router.push(`/fatiga-datos?cameraId=${item.idCamara}`)
                      }
                    >
                      <Ionicons
                        name="eye"
                        size={isSmallScreen ? 18 : 20}
                        color="white"
                      />
                      <DetailButtonText>Ver Detalles</DetailButtonText>
                    </DetailButton>
                    <DeleteButton
                      isDarkMode={isDarkMode}
                      onPress={() => eliminarDato(item._id)}
                      disabled={loading}
                    >
                      <Ionicons
                        name="trash"
                        size={isSmallScreen ? 18 : 20}
                        color="white"
                      />
                      <DeleteButtonText>Eliminar</DeleteButtonText>
                    </DeleteButton>
                  </ButtonContainer>
                </DeviceCardContainer>
              ))}
              {uniqueDevices.length > 3 && (
                <ScrollIndicator
                  isDarkMode={isDarkMode}
                  entering={FadeInDown.duration(400)}
                >
                  <Ionicons
                    name="chevron-down"
                    size={isSmallScreen ? 18 : 20}
                    color={isDarkMode ? "#bfdbfe" : "#1e3a8a"}
                  />
                  <ScrollIndicatorText isDarkMode={isDarkMode}>
                    Desliza para ver más cámaras
                  </ScrollIndicatorText>
                </ScrollIndicator>
              )}
            </>
          ) : (
            <ErrorContainer>
              <Ionicons
                name="alert-circle"
                size={isSmallScreen ? 20 : 22}
                color="#ef4444"
              />
              <ErrorText isDarkMode={isDarkMode}>
                No hay cámaras activas
              </ErrorText>
            </ErrorContainer>
          )}
        </DevicesSection>
      </Content>
      <BottomNavContainer isDarkMode={isDarkMode}>
        <BottomNav onNavigate={handleNavigation} />
      </BottomNavContainer>
    </Container>
  );
}
