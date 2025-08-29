import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
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
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#0f172a" : "#f9fafb")};
  padding: ${height * 0.02}px ${width * 0.05}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${height * 0.03}px;
`;

const Title = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${width * 0.06}px;
  font-weight: bold;
  color: ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e3a8a")};
`;

const Input = styled.TextInput<{ isDarkMode: boolean }>`
  width: 100%;
  height: 50px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#ffffff")};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#e2e8f0" : "#1e293b")};
  font-size: ${width * 0.04}px;
`;

const Button = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#3b82f6" : "#2563eb")};
  padding: 14px;
  border-radius: 12px;
  align-items: center;
  margin-bottom: 12px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: ${width * 0.045}px;
`;

const DataItem = styled.View<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#ffffff")};
  border-radius: 12px;
  padding: ${isSmallScreen ? height * 0.015 : height * 0.02}px;
  margin-bottom: ${isSmallScreen ? height * 0.01 : height * 0.015}px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: ${isSmallScreen ? width * 0.9 : width * 0.45}px;
  min-height: 150px;
`;

const DataText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen ? width * 0.035 : width * 0.04}px;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  margin-bottom: 4px;
`;

const PreviewImage = styled(Image)`
  width: 100%;
  height: ${isSmallScreen ? "100px" : "120px"};
  border-radius: 8px;
  margin-top: ${isSmallScreen ? 5 : 8}px;
`;

const ErrorText = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen ? width * 0.035 : width * 0.04}px;
  color: #ef4444;
  text-align: center;
  margin-top: ${isSmallScreen ? 5 : 8}px;
`;

const Content = styled.View`
  flex: 1;
  padding-bottom: ${height * 0.15}px;
`;

export default function FatigaScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [datos, setDatos] = useState<any[]>([]);
  const [idCamara, setIdCamara] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  const fetchDatos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://api-node-js-iot-app-movil.onrender.com/fatiga",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDatos(response.data);
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

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Error", "Se necesitan permisos para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0]);
    }
  };

  const agregarDato = async () => {
    if (!idCamara || !ambiente || !image) {
      Alert.alert(
        "Error",
        "Nombre de la cámara, ambiente e imagen son obligatorios"
      );
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const formData = new FormData();
    formData.append("idCamara", idCamara);
    formData.append("ambiente", ambiente);
    formData.append("foto", {
      uri:
        Platform.OS === "android" && !image.uri.startsWith("file://")
          ? `file://${image.uri}`
          : image.uri,
      type: image.mimeType || "image/jpeg",
      name: image.fileName || `photo_${Date.now()}.jpg`,
    } as any);

    try {
      await axios.post(
        "https://api-node-js-iot-app-movil.onrender.com/fatiga",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchDatos();
      setIdCamara("");
      setAmbiente("");
      setImage(null);
      Alert.alert("Éxito", "Cámara agregada");
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
        `https://api-node-js-iot-app-movil.onrender.com/fatiga/${id}`,
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
    if (path === "Temperatura") router.push("/temperatura");
    if (path === "Fatiga") return;
    if (path === "Profile") router.push("/profile");
    if (path === "Cerrar Sesión") {
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
              color={isDarkMode ? "#93c5fd" : "#1e3a8a"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={isDarkMode ? "sunny-outline" : "moon-outline"}
              size={26}
              color={isDarkMode ? "#93c5fd" : "#1e3a8a"}
            />
          </TouchableOpacity>
        </Header>

        <Title isDarkMode={isDarkMode}>😴 IoT - Fatiga</Title>

        <Input
          isDarkMode={isDarkMode}
          placeholder="Nombre de la Cámara"
          value={idCamara}
          onChangeText={setIdCamara}
        />
        <Input
          isDarkMode={isDarkMode}
          placeholder="Ambiente"
          value={ambiente}
          onChangeText={setAmbiente}
        />

        <Button isDarkMode={isDarkMode} onPress={pickImage} disabled={loading}>
          <ButtonText>
            {image ? "Imagen seleccionada" : "Seleccionar Imagen"}
          </ButtonText>
        </Button>

        <Button
          isDarkMode={isDarkMode}
          onPress={agregarDato}
          disabled={loading}
        >
          <ButtonText>Agregar Cámara</ButtonText>
        </Button>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "#93c5fd" : "#1e3a8a"}
          />
        ) : (
          <>
            {datos.length > 0 ? (
              <FlatList
                data={datos}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <DataItem isDarkMode={isDarkMode}>
                    <DataText isDarkMode={isDarkMode}>
                      Cámara: {item.idCamara}
                    </DataText>
                    <DataText isDarkMode={isDarkMode}>
                      Ambiente: {item.ambiente}
                    </DataText>
                    <DataText isDarkMode={isDarkMode}>
                      Fecha: {new Date(item.fechaHora).toLocaleString("es-ES")}
                    </DataText>
                    {item.foto && (
                      <PreviewImage
                        source={{
                          uri: `${
                            item.foto.startsWith("http")
                              ? item.foto
                              : `https://api-node-js-iot-app-movil.onrender.com${item.foto}`
                          }?t=${Date.now()}`,
                          cache: "reload",
                        }}
                      />
                    )}
                    <Button
                      isDarkMode={isDarkMode}
                      onPress={() => eliminarDato(item._id)}
                      disabled={loading}
                    >
                      <ButtonText>Eliminar</ButtonText>
                    </Button>
                  </DataItem>
                )}
              />
            ) : (
              <ErrorText isDarkMode={isDarkMode}>
                No hay datos de fatiga disponibles
              </ErrorText>
            )}
          </>
        )}
      </Content>
      <BottomNav onNavigate={handleNavigation} />
    </Container>
  );
}
