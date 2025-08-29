import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import BottomNav from "../components/BottomNav";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const responsiveWidth = Math.min(width, 600);
const responsiveHeight = Math.min(height, 1800);
const isSmallScreen = width < 360;

const Container = styled(SafeAreaView)<{ isDarkMode: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
  padding: ${isSmallScreen
      ? responsiveHeight * 0.02
      : responsiveHeight * 0.03}px
    ${responsiveWidth * 0.05}px;
  align-items: center;
`;

const Content = styled.View`
  flex: 1;
  align-items: center;
  padding-bottom: ${responsiveHeight * 0.12}px; /* Espacio para BottomNav */
`;

const BackButton = styled(TouchableOpacity)`
  position: absolute;
  top: ${isSmallScreen ? responsiveHeight * 0.04 : responsiveHeight * 0.05}px;
  left: ${responsiveWidth * 0.05}px;
`;

const ProfileHeader = styled.View`
  align-items: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.08
    : responsiveHeight * 0.1}px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.03
    : responsiveHeight * 0.05}px;
`;

const ProfileImage = styled(Image)`
  width: ${isSmallScreen ? responsiveWidth * 0.25 : responsiveWidth * 0.3}px;
  height: ${isSmallScreen ? responsiveWidth * 0.25 : responsiveWidth * 0.3}px;
  border-radius: ${isSmallScreen
    ? responsiveWidth * 0.125
    : responsiveWidth * 0.15}px;
  margin-bottom: 16px;
`;

const ProfileName = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.055
    : responsiveWidth * 0.06}px;
  font-weight: bold;
  color: ${({ isDarkMode }) => (isDarkMode ? "#fff" : "#1e3a8a")};
`;

const ProfileEmail = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#cbd5e1" : "#475569")};
  margin-top: 4px;
`;

const FormContainer = styled.View<{ isDarkMode: boolean }>`
  width: ${responsiveWidth * 0.9}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 12px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.02
    : responsiveHeight * 0.03}px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
`;

const InputIcon = styled(Ionicons)`
  margin-right: 8px;
`;

const Input = styled(TextInput)<{ isDarkMode: boolean; editable: boolean }>`
  flex: 1;
  background-color: ${({ isDarkMode, editable }) =>
    isDarkMode
      ? editable
        ? "#374151"
        : "#1f2937"
      : editable
      ? "#f3f4f6"
      : "#e5e7eb"};
  border-radius: 8px;
  padding: ${isSmallScreen ? 10 : 12}px;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1f2937")};
`;

const ActionButton = styled(TouchableOpacity)<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#3b82f6" : "#1e40af")};
  border-radius: 8px;
  padding: ${isSmallScreen ? 12 : 14}px;
  align-items: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  width: ${responsiveWidth * 0.9}px;
`;

const ActionButtonText = styled.Text`
  color: #ffffff;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  font-weight: 600;
`;

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState<{
    _id: string;
    nombreApellido: string;
    correoElectronico: string;
    numeroCelular: string;
  } | null>(null);
  const [genero, setGenero] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [nombreApellido, setNombreApellido] = useState("");
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [numeroCelular, setNumeroCelular] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setNombreApellido(parsed.nombreApellido || "");
        setCorreoElectronico(parsed.correoElectronico || "");
        setNumeroCelular(parsed.numeroCelular || "");
        const nombreLower = parsed.nombreApellido.toLowerCase();
        if (
          nombreLower.endsWith("a") ||
          nombreLower.includes("maria") ||
          nombreLower.includes("ana") ||
          nombreLower.includes("lucia")
        ) {
          setGenero("mujer");
        } else {
          setGenero("hombre");
        }
      }
    };
    loadUser();
  }, []);

  const profilePic =
    genero === "mujer"
      ? require("../assets/images/dama.png")
      : require("../assets/images/profile.png");

  const handleUpdateProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Validaciones
    if (
      !nombreApellido.trim() ||
      !correoElectronico.trim() ||
      !numeroCelular.trim()
    ) {
      Alert.alert(
        "Error",
        "Nombre, correo y número de celular son obligatorios"
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico)) {
      Alert.alert("Error", "Por favor, ingrese un correo válido");
      return;
    }
    if (!correoElectronico.endsWith("@cistcor.com")) {
      Alert.alert("Error", "El correo debe terminar en @cistcor.com");
      return;
    }
    if (!/^\d{9}$/.test(numeroCelular)) {
      Alert.alert("Error", "El número de celular debe tener 9 dígitos");
      return;
    }
    if (
      contrasena &&
      (contrasena.length < 8 ||
        !/[A-Z]/.test(contrasena) ||
        !/[0-9]/.test(contrasena) ||
        !/[@%_=+.]/.test(contrasena))
    ) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial (@%_=+.)"
      );
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !user?._id) {
        Alert.alert("Error", "No se encontró el token o ID de usuario");
        setIsLoading(false);
        return;
      }

      const updateData = {
        nombreApellido,
        correoElectronico,
        numeroCelular,
      };
      if (contrasena) {
        updateData.contrasena = contrasena;
      }

      const response = await axios.put(
        `https://api-node-js-iot-app-movil.onrender.com/perfil/${user._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = {
        _id: user._id,
        nombreApellido,
        correoElectronico,
        numeroCelular,
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setContrasena("");
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error: any) {
      console.error(
        "Error updating profile:",
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo actualizar el perfil";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (path === "Home") router.push("/dashboard");
    if (path === "Temperatura") router.push("/temperatura");
    if (path === "Fatiga") router.push("/fatiga");
    if (path === "Profile" && router.pathname === "/profile") return;
    if (path === "Cerrar Sesión") {
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("user");
      router.replace("/login");
    }
  };

  return (
    <Container isDarkMode={isDarkMode}>
      <Content>
        <BackButton onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={
              isSmallScreen ? responsiveWidth * 0.06 : responsiveWidth * 0.07
            }
            color={isDarkMode ? "white" : "#1e3a8a"}
          />
        </BackButton>

        <ProfileHeader>
          <ProfileImage source={profilePic} />
          <ProfileName isDarkMode={isDarkMode}>
            {user?.nombreApellido || "Usuario"}
          </ProfileName>
          <ProfileEmail isDarkMode={isDarkMode}>
            {user?.correoElectronico || "correo@cistcor.com"}
          </ProfileEmail>
        </ProfileHeader>

        <FormContainer isDarkMode={isDarkMode}>
          <InputContainer>
            <InputIcon
              name="person-outline"
              size={isSmallScreen ? 20 : 24}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
            <Input
              isDarkMode={isDarkMode}
              editable={isEditing}
              value={nombreApellido}
              onChangeText={setNombreApellido}
              placeholder="Nombre completo"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            />
          </InputContainer>
          <InputContainer>
            <InputIcon
              name="mail-outline"
              size={isSmallScreen ? 20 : 24}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
            <Input
              isDarkMode={isDarkMode}
              editable={isEditing}
              value={correoElectronico}
              onChangeText={setCorreoElectronico}
              placeholder="Correo electrónico"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </InputContainer>
          <InputContainer>
            <InputIcon
              name="call-outline"
              size={isSmallScreen ? 20 : 24}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
            <Input
              isDarkMode={isDarkMode}
              editable={isEditing}
              value={numeroCelular}
              onChangeText={setNumeroCelular}
              placeholder="Número de celular (9 dígitos)"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              keyboardType="phone-pad"
            />
          </InputContainer>
          <InputContainer>
            <InputIcon
              name="lock-closed-outline"
              size={isSmallScreen ? 20 : 24}
              color={isDarkMode ? "#93c5fd" : "#1e40af"}
            />
            <Input
              isDarkMode={isDarkMode}
              editable={isEditing}
              value={contrasena}
              onChangeText={setContrasena}
              placeholder="Nueva contraseña (opcional)"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              secureTextEntry
            />
          </InputContainer>
          <ActionButton
            isDarkMode={isDarkMode}
            onPress={handleUpdateProfile}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ActionButtonText>
              {isEditing
                ? isLoading
                  ? "Guardando..."
                  : "Guardar Cambios"
                : "Editar Perfil"}
            </ActionButtonText>
          </ActionButton>
          {isEditing && (
            <ActionButton
              isDarkMode={isDarkMode}
              onPress={() => {
                setIsEditing(false);
                setNombreApellido(user?.nombreApellido || "");
                setCorreoElectronico(user?.correoElectronico || "");
                setNumeroCelular(user?.numeroCelular || "");
                setContrasena("");
              }}
              activeOpacity={0.7}
              style={{ backgroundColor: isDarkMode ? "#ef4444" : "#dc2626" }}
            >
              <ActionButtonText>Cancelar</ActionButtonText>
            </ActionButton>
          )}
        </FormContainer>
      </Content>
      <BottomNav onNavigate={handleNavigation} />
    </Container>
  );
}
