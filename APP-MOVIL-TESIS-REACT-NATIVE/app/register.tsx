import { Ionicons } from "@expo/vector-icons";
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
  TextInput,
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

const BackButton = styled(TouchableOpacity)`
  position: absolute;
  top: ${responsiveHeight * 0.05}px;
  left: ${responsiveWidth * 0.05}px;
  z-index: 10;
  padding: ${responsiveWidth * 0.025}px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"};
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
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
    isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.85)"};
  border-radius: 16px;
  padding: 0 ${responsiveWidth * 0.15}px;
  color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#1e3a8a")};
  font-size: ${responsiveWidth * 0.04}px;
  border: 1px solid
    ${({ isDarkMode }) =>
      isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"};
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.15);
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

export default function RegisterScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, gradient } = useContext(ThemeContext);
  const [nombreApellido, setNombreApellido] = useState("");
  const [numeroCelular, setNumeroCelular] = useState("");
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

  const validarContrasena = (pass: string) =>
    pass.length >= 8 &&
    /[A-Z]/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[!@#$%^&*]/.test(pass);

  const formatNumber = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 9);
    return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, (_, a, b, c) =>
      c ? `${a} ${b} ${c}` : b ? `${a} ${b}` : a
    );
  };

  const manejarRegistro = async () => {
    if (!nombreApellido.trim())
      return showToastMessage("Ingresa tu nombre y apellido.");
    if (numeroCelular.replace(/\D/g, "").length !== 9)
      return showToastMessage("El número debe tener exactamente 9 dígitos.");

    let correo = correoElectronico.trim();
    if (!correo.includes("@")) correo = `${correo}@cistcor.com`;
    if (!correo.endsWith("@cistcor.com"))
      return showToastMessage("El correo debe terminar en @cistcor.com");

    if (!validarContrasena(contrasena))
      return showToastMessage(
        "La contraseña debe tener 8+ caracteres, 1 mayúscula, 1 número y 1 símbolo."
      );

    setLoading(true);
    try {
      await axios.post(
        "https://api-node-js-iot-app-movil.onrender.com/registro",
        {
          nombreApellido,
          numeroCelular: "+51" + numeroCelular.replace(/\D/g, ""),
          correoElectronico: correo,
          contrasena,
        }
      );
      showToastMessage("Usuario registrado con éxito.");
      setIsExiting(true);
      setTimeout(() => router.push("/login"), 400);
    } catch (err: any) {
      showToastMessage(
        err.response?.data?.mensaje || "Error al registrar el usuario."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.push("/start"), 400);
  };

  const animationProps = reduceMotion
    ? {}
    : {
        from: { opacity: 0, scale: 0.9 },
        to: { opacity: 1, scale: 1 },
        duration: 600,
        easing: "ease-out-cubic",
      };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Animatable.View
        animation={
          isExiting
            ? { from: { opacity: 1 }, to: { opacity: 0 } }
            : { from: { opacity: 0 }, to: { opacity: 1 } }
        }
        duration={isExiting ? 400 : 600}
        style={{ flex: 1, backgroundColor: gradient[0] }}
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
            animation={
              reduceMotion
                ? undefined
                : isExiting
                ? { from: { scale: 1 }, to: { scale: 1.2 } }
                : { from: { scale: 0.8 }, to: { scale: 1 } }
            }
            duration={isExiting ? 400 : 800}
            easing="ease-out-cubic"
            source={require("../assets/images/IoT-Entrada.png")}
          />

          <Title
            isDarkMode={isDarkMode}
            animation={!reduceMotion ? "fadeInDown" : undefined}
            duration={600}
            delay={200}
          >
            Crear Cuenta
          </Title>

          {/* Inputs */}
          {[
            {
              icon: "person-outline",
              placeholder: "Nombre y Apellido",
              value: nombreApellido,
              setter: setNombreApellido,
              secure: false,
            },
            {
              icon: "call-outline",
              placeholder: "999 999 999",
              value: numeroCelular,
              setter: setNumeroCelular,
              secure: false,
              isPhone: true,
            },
            {
              icon: "mail-outline",
              placeholder: "usuario@cistcor.com",
              value: correoElectronico,
              setter: setCorreoElectronico,
              secure: false,
            },
            {
              icon: "lock-closed-outline",
              placeholder: "Contraseña",
              value: contrasena,
              setter: setContrasena,
              secure: true,
            },
          ].map((item, i) => (
            <InputContainer
              key={i}
              animation={!reduceMotion ? "fadeInUp" : undefined}
              duration={600}
              delay={400 + i * 200}
            >
              <IconLeft>
                <Ionicons
                  name={item.icon}
                  size={responsiveWidth * 0.05}
                  color={isDarkMode ? "#D1E7FF" : "#1e3a8a"}
                />
              </IconLeft>
              {item.isPhone ? (
                <>
                  <TextInput
                    value="+51"
                    editable={false}
                    style={{
                      position: "absolute",
                      left: responsiveWidth * 0.12,
                      color: isDarkMode ? "#FFF" : "#1e3a8a",
                      fontSize: responsiveWidth * 0.04,
                      fontWeight: "600",
                    }}
                  />
                  <Input
                    isDarkMode={isDarkMode}
                    placeholder={item.placeholder}
                    placeholderTextColor={
                      isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                    }
                    value={item.value}
                    onChangeText={(text) => item.setter(formatNumber(text))}
                    keyboardType="phone-pad"
                    style={{ paddingLeft: responsiveWidth * 0.25 }}
                    maxLength={11}
                  />
                </>
              ) : (
                <Input
                  isDarkMode={isDarkMode}
                  placeholder={item.placeholder}
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={item.value}
                  onChangeText={item.setter}
                  secureTextEntry={item.secure && !showPassword}
                  autoCapitalize="none"
                  keyboardType={
                    item.icon === "mail-outline" ? "email-address" : "default"
                  }
                />
              )}
              {item.secure && (
                <IconRight onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={responsiveWidth * 0.05}
                    color={isDarkMode ? "#D1E7FF" : "#1e3a8a"}
                  />
                </IconRight>
              )}
            </InputContainer>
          ))}

          {/* Buttons */}
          {[
            {
              text: "Registrarse",
              onPress: manejarRegistro,
              colors: isDarkMode
                ? ["#10b981", "#047857"]
                : ["#059669", "#10b981"],
            },
            {
              text: "Volver al Login",
              onPress: () => router.push("/login"),
              colors: isDarkMode
                ? ["#3b82f6", "#1e40af"]
                : ["#2563eb", "#3b82f6"],
            },
          ].map((btn, i) => (
            <Animatable.View
              key={i}
              {...animationProps}
              delay={1200 + i * 200}
              style={{ width: "100%" }}
            >
              <TouchableOpacity
                onPress={btn.onPress}
                style={{ width: "100%" }}
                disabled={loading}
              >
                <GradientButton
                  colors={btn.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading && btn.text === "Registrarse" ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ButtonText>{btn.text}</ButtonText>
                  )}
                </GradientButton>
              </TouchableOpacity>
            </Animatable.View>
          ))}

          {showToast && (
            <ToastContainer
              isDarkMode={isDarkMode}
              animation={!reduceMotion ? "fadeInDown" : undefined}
              duration={600}
              easing="ease-out-cubic"
            >
              <ToastText isDarkMode={isDarkMode}>{toastMessage}</ToastText>
            </ToastContainer>
          )}
        </Container>
      </Animatable.View>
    </KeyboardAvoidingView>
  );
}
