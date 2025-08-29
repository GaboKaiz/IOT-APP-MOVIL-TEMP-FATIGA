import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,  
  Alert,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import BottomNav from "../components/BottomNav";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;

const Container = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
  padding: ${height * 0.02}px ${width * 0.05}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${height * 0.03}px;
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${width * 0.09}px;
  font-weight: bold;
  margin-bottom: ${height * 0.03}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
`;

const Input = styled.TextInput<{ isDarkMode: boolean }>`
  width: 100%;
  height: 50px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  font-size: ${width * 0.04}px;
`;

const Button = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#3b82f6" : "#1e40af")};
  padding: 22px;
  border-radius: 12px;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: ${width * 0.045}px;
`;

const DataItem = styled.View<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  padding: 12px;
  margin-bottom: 18px;
  border-radius: 12px;
  elevation: 2;
`;

const DataText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${width * 0.04}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
  margin-bottom: 4px;
`;

const DetailButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#6b7280" : "#9ca3af")};
  padding: 14px;
  border-radius: 12px;
  align-items: center;
  margin-top: 10px;
  width: 100%;
`;

const DetailButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: ${width * 0.04}px;
`;

const DeleteButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: #ef4444;
  padding: 12px;
  border-radius: 12px;
  align-items: center;
  margin-top: 10px;
  width: 100%;
`;

const DeleteButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: ${width * 0.04}px;
`;

const ErrorText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${width * 0.04}px;
  color: #ef4444;
  text-align: center;
  margin-bottom: 12px;
`;

const Content = styled.View`
  flex: 1;
  padding-bottom: ${height * 0.25}px;
`;

const BottomNavContainer = styled.View`
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
  padding: 10px 0;
  z-index: 10;
`;

export default function TemperaturaScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [ambiente, setAmbiente] = useState("");
  const [idDispositivo, setIdDispositivo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDatos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://api-node-js-iot-app-movil.onrender.com/temperatura",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const uniqueDevices = Array.from(
        new Map(
          response.data.datos.map((item: any) => [item.idDispositivo, item])
        ).values()
      );
      setDatos(uniqueDevices);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
    const interval = setInterval(fetchDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  const agregarDato = async () => {
    if (!ambiente || !idDispositivo) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      await axios.post(
        "https://api-node-js-iot-app-movil.onrender.com/temperatura",
        {
          ambiente,
          idDispositivo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDatos();
      setAmbiente("");
      setIdDispositivo("");
      Alert.alert("Éxito", "Dispositivo agregado");
    } catch {
      Alert.alert("Error", "No se pudo agregar");
    } finally {
      setLoading(false);
    }
  };

  const eliminarDato = async (id: string) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      await axios.delete(
        `https://api-node-js-iot-app-movil.onrender.com/temperatura/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDatos();
      Alert.alert("Éxito", "Dato eliminado");
    } catch {
      Alert.alert("Error", "No se pudo eliminar");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (path === "Home") router.push("/dashboard");
    else if (path === "Temperatura" && router.pathname === "/temperatura")
      return;
    else if (path === "Fatiga") router.push("/fatiga");
    else if (path === "Profile") router.push("/profile");
    else if (path === "Cerrar Sesión") {
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("user");
      router.replace("/login");
    }
  };

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

        <Title isDarkMode={isDarkMode}>🌡️ IoT - Temperatura</Title>

        <Input
          isDarkMode={isDarkMode}
          placeholder="Ambiente"
          value={ambiente}
          onChangeText={setAmbiente}
        />
        <Input
          isDarkMode={isDarkMode}
          placeholder="Nombre del Dispositivo"
          value={idDispositivo}
          onChangeText={setIdDispositivo}
        />

        <Button
          isDarkMode={isDarkMode}
          onPress={agregarDato}
          disabled={loading}
        >
          <ButtonText>Agregar Dispositivo</ButtonText>
        </Button>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "#93c5fd" : "#1e40af"}
          />
        ) : datos.length > 0 ? (
          <FlatList
            data={datos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DataItem isDarkMode={isDarkMode}>
                <DataText isDarkMode={isDarkMode}>
                  Ambiente: {item.ambiente}
                </DataText>
                <DataText isDarkMode={isDarkMode}>
                  Dispositivo: {item.idDispositivo}
                </DataText>
                <DetailButton
                  isDarkMode={isDarkMode}
                  onPress={() =>
                    router.push(
                      `/temperatura-datos?deviceId=${item.idDispositivo}`
                    )
                  }
                >
                  <DetailButtonText>Ver Detalles</DetailButtonText>
                </DetailButton>
                <DeleteButton
                  isDarkMode={isDarkMode}
                  onPress={() => eliminarDato(item._id)}
                  disabled={loading}
                >
                  <DeleteButtonText>Eliminar</DeleteButtonText>
                </DeleteButton>
              </DataItem>
            )}
          />
        ) : (
          <ErrorText isDarkMode={isDarkMode}>
            No hay dispositivos activos
          </ErrorText>
        )}
      </Content>
      <BottomNavContainer isDarkMode={isDarkMode}>
        <BottomNav onNavigate={handleNavigation} />
      </BottomNavContainer>
    </Container>
  );
}
