import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { AccessibilityInfo, Dimensions, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
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

const Header = styled.View`
  align-items: center;
  margin-bottom: ${responsiveHeight * 0.05}px;
`;

const Title = styled.Text<{ textColor: string }>`
  color: ${({ textColor }) => textColor};
  font-size: ${responsiveWidth * 0.08}px;
  font-weight: 600;
  margin-top: ${responsiveHeight * 0.02}px;
  text-align: center;
`;

const ButtonContainer = styled.View`
  width: ${responsiveWidth * 0.75}px;
  align-items: center;
`;

const GradientButton = styled(LinearGradient)`
  padding: ${responsiveHeight * 0.02}px ${responsiveWidth * 0.08}px;
  border-radius: 16px;
  margin-top: ${responsiveHeight * 0.02}px;
  width: 100%;
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

const Footer = styled.View<{ bottomInset: number }>`
  align-items: center;
  position: absolute;
  bottom: ${({ bottomInset }) => bottomInset + responsiveHeight * 0.05}px;
`;

const FooterText = styled.Text<{ textColor: string }>`
  color: ${({ textColor }) => textColor};
  font-size: ${responsiveWidth * 0.038}px;
  margin-top: ${responsiveHeight * 0.008}px;
  text-align: center;
`;

export default function StartScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors, gradient } =
    useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const textColorCustom = isDarkMode ? colors.text : "#1e3a8a";

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  const handleNavigation = (path: string) => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(path);
      setIsExiting(false);
    }, 300);
  };

  return (
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />
      <Animatable.View
        animation={
          isExiting
            ? { from: { opacity: 1, scale: 1 }, to: { opacity: 0, scale: 0.9 } }
            : {
                from: { opacity: 0, scale: 0.95 },
                to: { opacity: 1, scale: 1 },
              }
        }
        duration={300}
        easing="ease-out-cubic"
        style={{ flex: 1 }}
      >
        <Container colors={gradient}>
          <ThemeToggle onPress={toggleTheme}>
            <Ionicons
              name={isDarkMode ? "sunny-outline" : "moon-outline"}
              size={responsiveWidth * 0.06}
              color={textColorCustom}
            />
          </ThemeToggle>

          <Header>
            <Animatable.Image
              animation={
                reduceMotion
                  ? undefined
                  : isExiting
                  ? { from: { scale: 1 }, to: { scale: 0.8, opacity: 0 } }
                  : {
                      from: { scale: 1.2, opacity: 0 },
                      to: { scale: 1, opacity: 1 },
                    }
              }
              duration={300}
              easing="ease-out-cubic"
              source={require("../assets/images/IoT-Entrada.png")}
              style={{
                width: responsiveWidth * 0.4,
                height: responsiveWidth * 0.4,
                resizeMode: "contain",
              }}
            />
            <Title textColor={textColorCustom}>CISTCOR SenseAI</Title>
          </Header>

          <ButtonContainer>
            <TouchableOpacity onPress={() => handleNavigation("/login")}>
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

            <TouchableOpacity onPress={() => handleNavigation("/register")}>
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
          </ButtonContainer>

          <Footer bottomInset={insets.bottom}>
            <Animatable.Image
              animation={
                reduceMotion
                  ? undefined
                  : { from: { opacity: 0 }, to: { opacity: 1 } }
              }
              duration={500}
              delay={300}
              source={
                isDarkMode
                  ? require("../assets/images/logo-blanco.png")
                  : require("../assets/images/logo.png")
              }
              style={{
                width: responsiveWidth * 0.25,
                height: responsiveWidth * 0.25,
                resizeMode: "contain",
              }}
            />
            <FooterText textColor={textColorCustom}>
              CISTCOR NETWORKS S.A.C
            </FooterText>
          </Footer>
        </Container>
      </Animatable.View>
    </SafeAreaView>
  );
}
