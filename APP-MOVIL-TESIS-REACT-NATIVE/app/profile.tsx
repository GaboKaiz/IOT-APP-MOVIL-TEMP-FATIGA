import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutChangeEvent,
  ScrollView,
  TextInput,
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
import BottomNav from "../components/BottomNav";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const responsiveWidth = Math.min(width, 600);
const responsiveHeight = Math.min(height, 1800);
const isSmallScreen = width < 360;

// Lista de nombres femeninos (copiada del dashboard)
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
  padding: ${isSmallScreen
      ? responsiveHeight * 0.015
      : responsiveHeight * 0.02}px
    ${responsiveWidth * 0.04}px;
`;

const Content = styled(ScrollView)<{ bottomPadding: number }>`
  flex: 1;
  padding-bottom: ${({ bottomPadding }) => bottomPadding}px;
`;

const Header = styled(View)<{ isDarkMode: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.03
    : responsiveHeight * 0.035}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e40af" : "#3b82f6")};
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  width: 100%;
`;

const ProfileHeader = styled.View<{ isDarkMode: boolean }>`
  align-items: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.03
    : responsiveHeight * 0.04}px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.02
    : responsiveHeight * 0.03}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#2d3748" : "#ffffff")};
  border-radius: 16px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#60a5fa" : "#3b82f6")};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  width: ${responsiveWidth * 0.92}px;
`;

const ProfileImage = styled(Image)`
  width: ${isSmallScreen ? responsiveWidth * 0.3 : responsiveWidth * 0.35}px;
  height: ${isSmallScreen ? responsiveWidth * 0.3 : responsiveWidth * 0.35}px;
  border-radius: ${isSmallScreen
    ? responsiveWidth * 0.15
    : responsiveWidth * 0.175}px;
  margin-bottom: 16px;
  border: 3px solid ${({ isDarkMode }) => (isDarkMode ? "#93c5fd" : "#1e40af")};
`;

const ProfileName = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.06
    : responsiveWidth * 0.065}px;
  font-weight: 900;
  color: ${({ isDarkMode }) => (isDarkMode ? "#e0f2fe" : "#1e3a8a")};
`;

const ProfileEmail = styled.Text<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#bfdbfe" : "#475569")};
  margin-top: 4px;
`;

const FormContainer = styled.View<{ isDarkMode: boolean }>`
  width: ${responsiveWidth * 0.92}px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1f2937" : "#ffffff")};
  border-radius: 20px;
  padding: ${isSmallScreen
    ? responsiveHeight * 0.025
    : responsiveHeight * 0.03}px;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.04
    : responsiveHeight * 0.01}px;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.04
    : responsiveHeight * 0.2}px;
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#93c5fd")};
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
`;

const InputIcon = styled(Ionicons)`
  margin-right: 10px;
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
  border-radius: 10px;
  padding: ${isSmallScreen ? 10 : 12}px;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.04
    : responsiveWidth * 0.045}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e3a8a")};
  border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#4b5563" : "#d1d5db")};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: ${isSmallScreen
    ? responsiveHeight * 0.015
    : responsiveHeight * 0.02}px;
`;

const ActionButton = styled(TouchableOpacity)<{
  isDarkMode: boolean;
  isCancel?: boolean;
}>`
  background-color: ${({ isDarkMode, isCancel }) =>
    isCancel
      ? isDarkMode
        ? "#ef4444"
        : "#dc2626"
      : isDarkMode
      ? "#3b82f6"
      : "#1e40af"};
  border-radius: 12px;
  padding: ${isSmallScreen ? 8 : 10}px;
  align-items: center;
  margin-horizontal: ${isSmallScreen ? 8 : 10}px;
  width: ${responsiveWidth * 0.5}px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
`;

const ActionButtonText = styled.Text`
  color: #ffffff;
  font-size: ${isSmallScreen
    ? responsiveWidth * 0.035
    : responsiveWidth * 0.04}px;
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
  const [navHeight, setNavHeight] = useState(0);
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

  const onNavLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setNavHeight(height);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setNombreApellido(parsed.nombreApellido || "");
          setCorreoElectronico(parsed.correoElectronico || "");
          setNumeroCelular(parsed.numeroCelular || "");
          const nombreLower = parsed.nombreApellido.toLowerCase();
          const esMujer =
            nombresFemeninos.some((nombre) => nombreLower.includes(nombre)) ||
            nombreLower.endsWith("a");
          setGenero(esMujer ? "mujer" : "hombre");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        Alert.alert("Error", "No se pudo cargar la información del usuario");
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

      const updateData: any = {
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

      // Actualizar género después de guardar cambios
      const nombreLower = nombreApellido.toLowerCase();
      const esMujer =
        nombresFemeninos.some((nombre) => nombreLower.includes(nombre)) ||
        nombreLower.endsWith("a");
      setGenero(esMujer ? "mujer" : "hombre");
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

  return (
    <Container isDarkMode={isDarkMode}>
      <Content
        contentContainerStyle={{ alignItems: "center" }}
        bottomPadding={insets.bottom + navHeight + (isSmallScreen ? 60 : 80)}
      >
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
                size={
                  isSmallScreen
                    ? responsiveWidth * 0.07
                    : responsiveWidth * 0.08
                }
                color="#ffffff"
              />
            </Animated.View>
          </TouchableOpacity>
          <ProfileName isDarkMode={isDarkMode}>Mi Perfil</ProfileName>
          <TouchableOpacity
            onPress={toggleTheme}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            accessibilityLabel="Cambiar tema"
          >
            <Animated.View style={animatedButtonStyle}>
              <Ionicons
                name={isDarkMode ? "sunny-outline" : "moon-outline"}
                size={
                  isSmallScreen
                    ? responsiveWidth * 0.07
                    : responsiveWidth * 0.08
                }
                color="#ffffff"
              />
            </Animated.View>
          </TouchableOpacity>
        </Header>

        <ProfileHeader isDarkMode={isDarkMode}>
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
          <ButtonContainer>
            <ActionButton
              isDarkMode={isDarkMode}
              onPress={handleUpdateProfile}
              disabled={isLoading}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              accessibilityLabel={
                isEditing ? "Guardar cambios" : "Editar perfil"
              }
            >
              <Animated.View style={animatedButtonStyle}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ActionButtonText>
                    {isEditing ? "Guardar Cambios" : "Editar Perfil"}
                  </ActionButtonText>
                )}
              </Animated.View>
            </ActionButton>
            {isEditing && (
              <ActionButton
                isDarkMode={isDarkMode}
                isCancel
                onPress={() => {
                  setIsEditing(false);
                  setNombreApellido(user?.nombreApellido || "");
                  setCorreoElectronico(user?.correoElectronico || "");
                  setNumeroCelular(user?.numeroCelular || "");
                  setContrasena("");
                }}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                accessibilityLabel="Cancelar edición"
              >
                <Animated.View style={animatedButtonStyle}>
                  <ActionButtonText>Cancelar</ActionButtonText>
                </Animated.View>
              </ActionButton>
            )}
          </ButtonContainer>
        </FormContainer>
      </Content>
      <BottomNav onNavigate={handleNavigation} onLayout={onNavLayout} />
    </Container>
  );
}
