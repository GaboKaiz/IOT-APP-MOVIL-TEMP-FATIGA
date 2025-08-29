import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import styled from "styled-components/native";
import { ThemeContext } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const responsiveWidth = Math.min(width, 600);
const responsiveHeight = Math.min(height, 1000);

const Container = styled(LinearGradient)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${responsiveHeight * 0.025}px;
`;

const Title = styled.Text<{ textColor: string }>`
  color: ${({ textColor }) => textColor};
  font-size: ${responsiveWidth * 0.08}px;
  font-weight: 600;
  margin-top: ${responsiveHeight * 0.02}px;
  text-align: center;
`;

const GradientButton = styled(LinearGradient)`
  padding: ${responsiveHeight * 0.02}px ${responsiveWidth * 0.08}px;
  border-radius: 16px;
  margin-top: ${responsiveHeight *
  0.015}px; /* un poquito menos para acercarlos */
  width: 70%; /* botones más cortos */
  align-items: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${responsiveWidth * 0.045}px;
  font-weight: 600;
`;

const ThemeToggle = styled(TouchableOpacity)`
  position: absolute;
  top: ${responsiveHeight * 0.05}px;
  right: ${responsiveWidth * 0.05}px;
  padding: ${responsiveWidth * 0.025}px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"};
`;

export default function StartScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors, gradient } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [logoAnim] = useState(new Animated.Value(0));
  const [titleAnim] = useState(new Animated.Value(50));
  const [button1Anim] = useState(new Animated.Value(50));
  const [button2Anim] = useState(new Animated.Value(50));
  const [footerAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(200, [
        Animated.spring(logoAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button1Anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button2Anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(footerAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const textColorCustom = isDarkMode ? colors.text : "#1e3a8a";

  return (
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <Container colors={gradient}>
          {/* Botón de tema */}
          <ThemeToggle onPress={toggleTheme}>
            <Ionicons
              name={isDarkMode ? "sunny-outline" : "moon-outline"}
              size={responsiveWidth * 0.06}
              color={textColorCustom}
            />
          </ThemeToggle>

          {/* Logo principal */}
          <Animated.Image
            source={require("../assets/images/IoT-Entrada.png")}
            style={{
              width: responsiveWidth * 0.4,
              height: responsiveWidth * 0.4,
              resizeMode: "contain",
              marginBottom: responsiveHeight * 0.05, // subir un poquito más
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
              opacity: logoAnim,
            }}
          />

          {/* Título */}
          <Animated.View
            style={{
              transform: [{ translateY: titleAnim }],
              opacity: fadeAnim,
            }}
          >
            <Title textColor={textColorCustom}>CISTCOR SenseAI</Title>
          </Animated.View>

          {/* Botones centrados */}
          <Animated.View
            style={{
              marginTop: responsiveHeight * 0.03, // separacion proporcional
              alignItems: "center",
              transform: [{ translateY: button1Anim }],
              opacity: fadeAnim,
            }}
          >
            {/* Botón Iniciar Sesión */}
            <TouchableOpacity
              style={{ width: "100%", maxWidth: responsiveWidth * 0.7 }}
              onPress={() => handleNavigation("/login")}
            >
              <GradientButton
                colors={
                  isDarkMode ? ["#3b82f6", "#1e40af"] : ["#2563eb", "#3b82f6"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ButtonText>Iniciar Sesión</ButtonText>
              </GradientButton>
            </TouchableOpacity>

            {/* Botón Registrarse */}
            <Animated.View
              style={{
                marginTop: responsiveHeight * 0.015,
                transform: [{ translateY: button2Anim }],
                opacity: fadeAnim,
              }}
            >
              <TouchableOpacity
                style={{ width: "100%", maxWidth: responsiveWidth * 0.7 }}
                onPress={() => handleNavigation("/register")}
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
            </Animated.View>
          </Animated.View>

          {/* Footer con logo abajo */}
          <Animated.View
            style={{
              opacity: footerAnim,
              position: "absolute",
              bottom: insets.bottom + responsiveHeight * 0.02,
              alignItems: "center",
            }}
          >
            <Animated.Image
              source={
                isDarkMode
                  ? require("../assets/images/logo-blanco.png")
                  : require("../assets/images/logo.png")
              }
              style={{
                width: responsiveWidth * 0.2,
                height: responsiveWidth * 0.2,
                resizeMode: "contain",
                marginBottom: responsiveHeight * 0.005,
              }}
            />
            <Title textColor={textColorCustom} style={{ fontSize: 16 }}>
              CISTCOR NETWORKS S.A.C
            </Title>
          </Animated.View>
        </Container>
      </Animated.View>
    </SafeAreaView>
  );
}
