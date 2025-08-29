import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Dimensions,
  Image,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
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

// Lista de nombres femeninos comunes en español
const nombresFemeninos = [
  "talita",
  "rosa",
  "maria",
  "milagros",
  "ana",
  "lucia",
  "sofia",
  "isabel",
  "carmen",
  "laura",
  "julia",
  "paula",
  "clara",
  "elena",
  "sara",
  "emma",
  "valentina",
  "camila",
  "victoria",
  "andrea",
  "patricia",
  "susana",
  "marta",
  "gloria",
  "beatriz",
  "natalia",
  "diana",
  "luz",
  "silvia",
  "teresa",
  "adriana",
  "monica",
  "carolina",
  "gabriela",
  "daniela",
  "veronica",
  "alejandra",
  "esther",
  "angela",
  "lorena",
  "vanessa",
  "cecilia",
  "pilar",
  "irene",
  "alicia",
  "raquel",
  "eva",
  "miriam",
  "noelia",
  "fatima",
  "cristina",
  "olga",
  "rocio",
  "amalia",
  "belen",
  "estefania",
  "yolanda",
];

const Container = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
`;

const Content = styled(ScrollView)<{ bottomPadding: number }>`
  padding: ${isSmallScreen
      ? responsiveHeight * 0.015
      : responsiveHeight * 0.02}px
    ${responsiveWidth * 0.04}px;
  padding-bottom: ${({ bottomPadding }) => bottomPadding}px;
`;

const Header = styled(View)<{ isDarkMode: boolean }>`
  flex-direction: column;
  align-items: center;
  padding: ${isSmallScreen
      ? responsiveHeight * 0.03
      : responsiveHeight * 0.035}px
    ${responsiveWidth * 0.04}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e40af" : "#3b82f6")};
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

const HeaderTop = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const HeaderText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.06
    : responsiveWidth * 0.065}px;
  font-weight: 900;
  color: white;
  text-align: center;
`;

const ProfileImageContainer = styled(View)`
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${isSmallScreen
    ? responsiveWidth * 0.1
    : responsiveWidth * 0.12}px;
  padding: 8px;
`;

const ProfileImage = styled(Image)`
  width: ${isSmallScreen ? responsiveWidth * 0.15 : responsiveWidth * 0.18}px;
  height: ${isSmallScreen ? responsiveWidth * 0.15 : responsiveWidth * 0.18}px;
  border-radius: ${isSmallScreen
    ? responsiveWidth * 0.075
    : responsiveWidth * 0.09}px;
  border-width: 3px;
  border-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const ThemeToggleContainer = styled(View)`
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.01
    : responsiveHeight * 0.015}px;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  padding: ${isSmallScreen ? 8 : 10}px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const ThemeToggleText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: white;
  margin-top: 4px;
  font-weight: 500;
`;

const DateTimeContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
`;

const DateTimeText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#bfdbfe")};
  margin-left: 8px;
`;

const CardContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
`;

const Card = styled(View)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 20px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.025
    : responsiveHeight * 0.03}px;
  margin: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#93c5fd")};
  width: ${isSmallScreen ? responsiveWidth * 0.92 : responsiveWidth * 0.46}px;
  min-height: 160px;
  align-items: center;
  justify-content: center;
`;

const CardText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  text-align: center;
  margin-top: ${isSmallScreen ? 8 : 10}px;
`;

const CardValue = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.055
    : responsiveWidth * 0.06}px;
  font-weight: 800;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.01
    : responsiveHeight * 0.015}px;
  text-align: center;
`;

const FloatingButtonContainer = styled(View)`
  position: absolute;
  bottom: ${isSmallScreen ? 100 : 113}px;
  right: ${isSmallScreen ? 10 : 20}px;
  z-index: 10;
`;

const RefreshButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  padding: ${isSmallScreen ? 12 : 14}px ${isSmallScreen ? 25 : 22}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#34d399" : "#10b981")};
  border-radius: 50px;
  elevation: 30;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const RefreshText = styled(Text)`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: #ffffff;
  font-weight: 600;
  margin-left: ${isSmallScreen ? 4 : 6}px;
`;

const ChartSection = styled(View)<{ isDarkMode: boolean }>`
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
`;

const ChartTitle = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.01
    : responsiveHeight * 0.015}px;
  text-align: center;
`;

const NoDataText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  color: #ef4444;
  text-align: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.01
    : responsiveHeight * 0.015}px;
`;

const FatigaSection = styled(View)<{ isDarkMode: boolean }>`
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.04}px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.03
    : responsiveHeight * 0.05}px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.025
    : responsiveHeight * 0.03}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
`;

const FatigaTitle = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  font-weight: 700;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  text-align: center;
`;

const FatigaCardContainer = styled(View)`
  flex-direction: column;
  align-items: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
`;

const FatigaCard = styled(View)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 20px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.025
    : responsiveHeight * 0.03}px;
  margin: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#93c5fd")};
  width: ${isSmallScreen ? responsiveWidth * 0.92 : responsiveWidth * 0.92}px;
  min-height: 400px;
  align-items: center;
`;

const FatigaCardText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  font-weight: 500;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  margin-left: 10px;
  text-align: center;
  flex: 1;
`;

const FatigaImage = styled(Image)`
  width: 100%;
  height: ${isSmallScreen ? "280px" : "320px"};
  border-radius: 16px;
  margin-top: ${isSmallScreen ? 15 : 20}px;
`;

const ErrorImageText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
  font-weight: 500;
  color: #ef4444;
  text-align: center;
  margin-top: ${isSmallScreen ? 10 : 12}px;
`;

const PlaceholderImage = styled(Image)`
  width: 100%;
  height: ${isSmallScreen ? "280px" : "320px"};
  border-radius: 16px;
  margin-top: ${isSmallScreen ? 15 : 20}px;
`;

export default function DashboardScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState("");
  const [dateTime, setDateTime] = useState(
    "Viernes, 29 de Agosto de 2025 - 10:18 AM -05"
  );
  const [fatigaData, setFatigaData] = useState<any[]>([]);
  const [temperaturaData, setTemperaturaData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [averageTemp, setAverageTemp] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [navHeight, setNavHeight] = useState(0);
  const insets = useSafeAreaInsets();

  const onNavLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setNavHeight(height);
  };

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const parsed = JSON.parse(user);
          const nombreCompleto = parsed.nombreApellido || "Usuario";
          setNombre(nombreCompleto);
          const nombreLower = nombreCompleto.toLowerCase();
          const esMujer =
            nombresFemeninos.some((nombre) => nombreLower.includes(nombre)) ||
            nombreLower.endsWith("a");
          setGenero(esMujer ? "mujer" : "hombre");
        }
      } catch (err) {
        console.error("Error retrieving user from AsyncStorage:", err);
      }
    };
    getUser();
  }, []);

  const fetchFatiga = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log(
        "Fetching fatiga with token:",
        token ? token.slice(0, 10) + "..." : "No token"
      );
      if (!token) {
        setError("No se encontró el token de autenticación");
        Alert.alert("Error", "Por favor, inicia sesión nuevamente.");
        router.replace("/login");
        return;
      }
      const res = await axios.get(
        "https://api-node-js-iot-app-movil.onrender.com/fatiga",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Fatiga data received:", JSON.stringify(res.data, null, 2));
      const sortedData = res.data.sort(
        (a, b) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
      );
      setFatigaData(sortedData || []);
      setImageErrors({});
    } catch (err: any) {
      console.error("Fatiga fetch error:", err.message, err.response?.data);
      setError(err.response?.data?.mensaje || err.message);
      setFatigaData([]);
      if (err.response?.status === 401) {
        Alert.alert("Sesión expirada", "Por favor, inicia sesión nuevamente.");
        AsyncStorage.removeItem("token");
        AsyncStorage.removeItem("user");
        router.replace("/login");
      }
    }
  };

  const fetchTemperatura = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log(
        "Fetching temperatura with token:",
        token ? token.slice(0, 10) + "..." : "No token"
      );
      if (!token) {
        setError("No se encontró el token de autenticación");
        Alert.alert("Error", "Por favor, inicia sesión nuevamente.");
        router.replace("/login");
        return;
      }
      const res = await axios.get(
        "https://api-node-js-iot-app-movil.onrender.com/temperatura",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Temperatura response status:", res.status);
      console.log(
        "Temperatura data received:",
        JSON.stringify(res.data, null, 2)
      );
      const data = res.data.datos || [];
      setTemperaturaData(data);
      if (data.length > 0) {
        const validTemps = data.filter((item) => item.temperatura != null);
        const avg =
          validTemps.length > 0
            ? validTemps.reduce((sum, item) => sum + item.temperatura, 0) /
              validTemps.length
            : 0;
        setAverageTemp(Number(avg.toFixed(2)));
        setDeviceCount(new Set(data.map((item) => item.idDispositivo)).size);
      } else {
        setAverageTemp(0);
        setDeviceCount(0);
      }
    } catch (err: any) {
      console.error(
        "Temperatura fetch error:",
        err.message,
        err.response?.data
      );
      setError(err.response?.data?.mensaje || err.message);
      setTemperaturaData([]);
      setAverageTemp(0);
      setDeviceCount(0);
      Alert.alert(
        "Error",
        `No se pudieron cargar los datos de temperatura: ${
          err.response?.data?.mensaje || err.message
        }`
      );
    }
  };

  useEffect(() => {
    fetchFatiga();
    fetchTemperatura();
    const interval = setInterval(() => {
      fetchFatiga();
      fetchTemperatura();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDateTime(
        `${now.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })} - ${now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Lima",
        })} -05`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path: string) => {
    if (path === "Home" && router.pathname === "/dashboard") return;
    if (path === "Temperatura") router.push("/temperatura");
    if (path === "Fatiga") router.push("/fatiga");
    if (path === "Profile") router.push("/profile");
    if (path === "Cerrar Sesión") {
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("user");
      router.replace("/login");
    }
  };

  const profilePic = genero.toLowerCase().includes("mujer")
    ? require("../assets/images/dama.png")
    : require("../assets/images/profile.png");

  const sortedTemperaturaData = [...temperaturaData].sort(
    (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
  );

  const last10TemperaturaData = sortedTemperaturaData.slice(-10);

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const allSameDay =
    last10TemperaturaData.length > 0
      ? last10TemperaturaData.every((item, index) =>
          index === 0
            ? true
            : isSameDay(
                new Date(item.fechaHora),
                new Date(last10TemperaturaData[0].fechaHora)
              )
        )
      : false;

  const temperaturaChartData =
    last10TemperaturaData.length > 0
      ? {
          labels: last10TemperaturaData.map((item) =>
            allSameDay
              ? new Date(item.fechaHora).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Lima",
                })
              : new Date(item.fechaHora).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                })
          ),
          datasets: [
            {
              data: last10TemperaturaData.map((item) => item.temperatura || 0),
            },
          ],
        }
      : { labels: [], datasets: [{ data: [] }] };

  const chartConfig = {
    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    backgroundGradientFrom: isDarkMode ? "#1f2937" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1f2937" : "#ffffff",
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

  const normalizeImageUrl = (url: string) => {
    if (!url) return url;
    const normalized = url.startsWith("http://")
      ? url.replace("http://", "https://")
      : url;
    return `${normalized}?t=${Date.now()}`;
  };

  const iconColor = isDarkMode ? "#93c5fd" : "#1e40af";
  const bottomPadding = insets.bottom + navHeight + (isSmallScreen ? 30 : 50);

  return (
    <Container isDarkMode={isDarkMode}>
      <Content bottomPadding={bottomPadding}>
        <Header isDarkMode={isDarkMode}>
          <HeaderTop>
            <HeaderText isDarkMode={isDarkMode}>
              Bienvenid@, {nombre}
            </HeaderText>
          </HeaderTop>
          <ProfileImageContainer>
            <ProfileImage source={profilePic} />
            <ThemeToggleContainer>
              <TouchableOpacity onPress={toggleTheme}>
                <Ionicons
                  name={isDarkMode ? "sunny-outline" : "moon-outline"}
                  size={
                    isSmallScreen
                      ? responsiveWidth * 0.06
                      : responsiveWidth * 0.07
                  }
                  color="white"
                />
              </TouchableOpacity>
              <ThemeToggleText isDarkMode={isDarkMode}>
                Cambiar Tema
              </ThemeToggleText>
            </ThemeToggleContainer>
          </ProfileImageContainer>
          <DateTimeContainer>
            <Ionicons
              name="time-outline"
              size={24}
              color={isDarkMode ? "#93c5fd" : "#bfdbfe"}
            />
            <DateTimeText isDarkMode={isDarkMode}>{dateTime}</DateTimeText>
          </DateTimeContainer>
        </Header>

        <CardContainer>
          <Card isDarkMode={isDarkMode}>
            <Ionicons name="thermometer-outline" size={48} color={iconColor} />
            <CardText isDarkMode={isDarkMode}>Temperatura Promedio</CardText>
            <CardValue isDarkMode={isDarkMode}>{averageTemp} °C</CardValue>
          </Card>

          <Card isDarkMode={isDarkMode}>
            <Ionicons
              name="hardware-chip-outline"
              size={48}
              color={iconColor}
            />
            <CardText isDarkMode={isDarkMode}>Dispositivos Activos</CardText>
            <CardValue isDarkMode={isDarkMode}>{deviceCount}</CardValue>
          </Card>
        </CardContainer>

        <ChartSection isDarkMode={isDarkMode}>
          <ChartTitle isDarkMode={isDarkMode}>
            Gráficos de Temperatura
          </ChartTitle>
          <View style={{ alignItems: "center" }}>
            {temperaturaChartData.labels.length > 0 ? (
              <LineChart
                data={temperaturaChartData}
                width={responsiveWidth * 0.9}
                height={isSmallScreen ? 200 : 250}
                yAxisLabel=""
                yAxisSuffix="°C"
                chartConfig={chartConfig}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            ) : (
              <NoDataText isDarkMode={isDarkMode}>
                No hay datos de temperatura disponibles
              </NoDataText>
            )}
          </View>
        </ChartSection>

        <FatigaSection isDarkMode={isDarkMode}>
          <FatigaTitle isDarkMode={isDarkMode}>
            Últimas Lecturas de Fatiga
          </FatigaTitle>
          <FatigaTitle isDarkMode={isDarkMode}>
            Actualizaciones cada 10 segundos
          </FatigaTitle>
          {fatigaData.length > 0 ? (
            <FatigaCardContainer>
              {fatigaData.slice(0, 2).map((item) => (
                <FatigaCard key={item._id} isDarkMode={isDarkMode}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={32}
                      color={iconColor}
                    />
                    <FatigaCardText isDarkMode={isDarkMode}>
                      Cámara: {item.idCamara || "No disponible"}
                    </FatigaCardText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name="cloud-outline"
                      size={32}
                      color={iconColor}
                    />
                    <FatigaCardText isDarkMode={isDarkMode}>
                      Ambiente: {item.ambiente || "No disponible"}
                    </FatigaCardText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={32}
                      color={iconColor}
                    />
                    <FatigaCardText isDarkMode={isDarkMode}>
                      Fecha:{" "}
                      {new Date(item.fechaHora).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Lima",
                      })}
                    </FatigaCardText>
                  </View>
                  {item.foto && !imageErrors[item._id] ? (
                    <FatigaImage
                      source={{
                        uri: normalizeImageUrl(item.foto),
                        cache: "reload",
                      }}
                      resizeMode="cover"
                      onError={(e) => {
                        console.error(
                          `Error loading image for fatiga ${item._id}:`,
                          e.nativeEvent.error,
                          `URL: ${item.foto}`
                        );
                        setImageErrors((prev) => ({
                          ...prev,
                          [item._id]: true,
                        }));
                      }}
                    />
                  ) : (
                    <PlaceholderImage
                      source={require("../assets/images/placeholder.png")}
                      resizeMode="cover"
                    />
                  )}
                  {imageErrors[item._id] && (
                    <ErrorImageText isDarkMode={isDarkMode}>
                      Imagen no encontrada en el servidor
                    </ErrorImageText>
                  )}
                </FatigaCard>
              ))}
            </FatigaCardContainer>
          ) : (
            <NoDataText isDarkMode={isDarkMode}>
              No hay datos de fatiga disponibles
            </NoDataText>
          )}
        </FatigaSection>
      </Content>
      <FloatingButtonContainer>
        <RefreshButton
          isDarkMode={isDarkMode}
          onPress={() => {
            fetchTemperatura();
            fetchFatiga();
          }}
        >
          <Ionicons name="refresh" size={20} color="#ffffff" />
          <RefreshText>Actualizar</RefreshText>
        </RefreshButton>
      </FloatingButtonContainer>
      <BottomNav onNavigate={handleNavigation} onLayout={onNavLayout} />
    </Container>
  );
}
