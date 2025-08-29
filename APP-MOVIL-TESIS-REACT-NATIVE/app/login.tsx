import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";
import styled from "styled-components/native";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const responsiveWidth = Math.min(width, 600);
const responsiveHeight = Math.min(height, 1000);

const Container = styled(LinearGradient)`
  flex: 1;
  padding: ${responsiveHeight * 0.04}px;
  justify-content: center;
  align-items: center;
`;

// --- Tus estilos (BackButton, ModeToggle, Logo, Title, InputContainer, Input, IconLeft, IconRight, GradientButton, ButtonText, ToastContainer, ToastText)
// se mantienen igual ---

const BackButton = styled(TouchableOpacity)`
  position: absolute;
  top: ${responsiveHeight * 0.05}px;
  left: ${responsiveWidth * 0.05}px;
  z-index: 10;
  padding: ${responsiveWidth * 0.025}px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"};
`;

const ModeToggle = styled(TouchableOpacity)`
  position: absolute;
  top: ${responsiveHeight * 0.05}px;
  right: ${responsiveWidth * 0.05}px;
  z-index: 10;
  padding: ${responsiveWidth * 0.025}px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"};
`;

const Logo = styled(Animatable.Image)`
  width: ${responsiveWidth * 0.4}px;
  height: ${responsiveWidth * 0.4}px;
  resize-mode: contain;
  margin-bottom: ${responsiveHeight * 0.04}px;
`;

const Title = styled(Animatable.Text)<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#1e3a8a")};
  font-size: ${responsiveWidth * 0.08}px;
  font-weight: 600;
  font-family: ${Platform.OS === "ios" ? "System" : "Roboto"};
  margin-bottom: ${responsiveHeight * 0.05}px;
  text-align: center;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15);
`;

const InputContainer = styled(Animatable.View)`
  position: relative;
  width: 100%;
  margin-bottom: ${responsiveHeight * 0.03}px;
`;

const Input = styled.TextInput<{ isDarkMode: boolean }>`
  width: 100%;
  height: ${responsiveHeight * 0.07}px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.85)"};
  border-radius: 16px;
  padding: 0 ${responsiveWidth * 0.15}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#1e3a8a")};
  font-size: ${responsiveWidth * 0.04}px;
  border: 1px solid
    ${({ isDarkMode }) =>
      isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"};
`;

const IconLeft = styled.View`
  position: absolute;
  left: ${responsiveWidth * 0.05}px;
  top: ${responsiveHeight * 0.022}px;
  z-index: 10;
`;

const IconRight = styled(TouchableOpacity)`
  position: absolute;
  right: ${responsiveWidth * 0.05}px;
  top: ${responsiveHeight * 0.022}px;
  z-index: 10;
`;

const GradientButton = styled(LinearGradient)`
  width: 100%;
  padding: ${responsiveHeight * 0.02}px;
  border-radius: 16px;
  align-items: center;
  margin-bottom: ${responsiveHeight * 0.025}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${responsiveWidth * 0.04}px;
  font-weight: 600;
`;

const ToastContainer = styled(Animatable.View)<{ isDarkMode: boolean }>`
  position: absolute;
  top: ${responsiveHeight * 0.12}px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.85)"};
  padding: ${responsiveHeight * 0.015}px ${responsiveWidth * 0.06}px;
  border-radius: 12px;
  z-index: 20;
  border: 1px solid
    ${({ isDarkMode }) =>
      isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
`;

const ToastText = styled.Text<{ isDarkMode: boolean }>`
  color: #fff;
  font-size: ${responsiveWidth * 0.038}px;
  text-align: center;
`;

export default function LoginScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, gradient } = useContext(ThemeContext);
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const manejarLogin = async () => {
    if (!correoElectronico.trim()) {
      showToastMessage("Ingresa tu correo electrónico.");
      return;
    }
    if (!contrasena.trim()) {
      showToastMessage("Ingresa tu contraseña.");
      return;
    }

    let correo = correoElectronico.trim();
    if (!correo.includes("@")) correo = `${correo}@cistcor.com`;
    if (!correo.endsWith("@cistcor.com")) {
      showToastMessage("Solo se permiten correos @cistcor.com");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://api-node-js-iot-app-movil.onrender.com/login",
        { correoElectronico: correo, contrasena }
      );

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(response.data.usuario)
        );
        setIsExiting(true);
        setTimeout(() => router.replace("/dashboard"), 400);
      } else {
        showToastMessage("Respuesta inválida del servidor.");
      }
    } catch (err: any) {
      showToastMessage(
        err.response?.data?.mensaje || "Usuario o contraseña incorrectos."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.push("/start"), 400);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View
          animation={
            isExiting
              ? "fadeOut"
              : {
                  from: { opacity: 0, translateY: 20 },
                  to: { opacity: 1, translateY: 0 },
                }
          }
          duration={600}
          easing="ease-out-cubic"
          style={{ flex: 1 }}
        >
          <Container colors={gradient}>
            <BackButton onPress={handleBack}>
              <Ionicons
                name="arrow-back"
                size={responsiveWidth * 0.06}
                color={isDarkMode ? "white" : "#1e3a8a"}
              />
            </BackButton>

            <ModeToggle onPress={toggleTheme}>
              <Ionicons
                name={isDarkMode ? "sunny-outline" : "moon-outline"}
                size={responsiveWidth * 0.06}
                color={isDarkMode ? "white" : "#1e3a8a"}
              />
            </ModeToggle>

            <Logo
              animation={reduceMotion ? undefined : "zoomIn"}
              duration={800}
              easing="ease-out-cubic"
              source={require("../assets/images/IoT-Entrada.png")}
            />

            <Title
              isDarkMode={isDarkMode}
              animation={reduceMotion ? undefined : "fadeInDown"}
              duration={600}
              delay={200}
              easing="ease-out-cubic"
            >
              Iniciar Sesión
            </Title>

            {/* Inputs */}
            <InputContainer
              animation={reduceMotion ? undefined : "fadeInUp"}
              duration={600}
              delay={400}
              easing="ease-out-cubic"
            >
              <IconLeft>
                <Ionicons
                  name="mail-outline"
                  size={responsiveWidth * 0.05}
                  color={isDarkMode ? "#D1E7FF" : "#1e3a8a"}
                />
              </IconLeft>
              <Input
                isDarkMode={isDarkMode}
                placeholder="usuario@cistcor.com"
                placeholderTextColor={
                  isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                }
                value={correoElectronico}
                onChangeText={setCorreoElectronico}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </InputContainer>

            <InputContainer
              animation={reduceMotion ? undefined : "fadeInUp"}
              duration={600}
              delay={600}
              easing="ease-out-cubic"
            >
              <IconLeft>
                <Ionicons
                  name="lock-closed-outline"
                  size={responsiveWidth * 0.05}
                  color={isDarkMode ? "#D1E7FF" : "#1e3a8a"}
                />
              </IconLeft>
              <Input
                isDarkMode={isDarkMode}
                placeholder="Contraseña"
                placeholderTextColor={
                  isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                }
                secureTextEntry={!showPassword}
                value={contrasena}
                onChangeText={setContrasena}
              />
              <IconRight onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={responsiveWidth * 0.05}
                  color={isDarkMode ? "#D1E7FF" : "#1e3a8a"}
                />
              </IconRight>
            </InputContainer>

            {/* Botones */}
            <Animatable.View
              animation={reduceMotion ? undefined : "fadeInUp"}
              duration={600}
              delay={800}
              easing="ease-out-cubic"
              style={{ width: "100%" }}
            >
              <TouchableOpacity
                onPress={manejarLogin}
                style={{ width: "100%" }}
                disabled={loading}
              >
                <GradientButton
                  colors={
                    isDarkMode ? ["#3b82f6", "#1e40af"] : ["#2563eb", "#3b82f6"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ButtonText>Iniciar Sesión</ButtonText>
                  )}
                </GradientButton>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View
              animation={reduceMotion ? undefined : "fadeInUp"}
              duration={600}
              delay={1000}
              easing="ease-out-cubic"
              style={{ width: "100%" }}
            >
              <TouchableOpacity
                onPress={() => router.push("/register")}
                style={{ width: "100%" }}
                disabled={loading}
              >
                <GradientButton
                  colors={
                    isDarkMode ? ["#10b981", "#047857"] : ["#059669", "#10b981"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ButtonText>Registrarse</ButtonText>
                </GradientButton>
              </TouchableOpacity>
            </Animatable.View>

            {showToast && (
              <ToastContainer
                isDarkMode={isDarkMode}
                animation={reduceMotion ? undefined : "fadeInDown"}
                duration={600}
                easing="ease-out-cubic"
              >
                <ToastText isDarkMode={isDarkMode}>{toastMessage}</ToastText>
              </ToastContainer>
            )}
          </Container>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
