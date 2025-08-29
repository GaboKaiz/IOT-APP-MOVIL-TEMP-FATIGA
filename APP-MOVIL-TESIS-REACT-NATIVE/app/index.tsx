import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

const { width, height } = Dimensions.get("window");

const Container = styled(LinearGradient)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const SplashTitle = styled(Animatable.Text)`
  color: white;
  font-size: ${width * 0.075}px;
  font-weight: bold;
  margin-top: ${height * 0.02}px;
  text-align: center;
`;

const SubText = styled(Animatable.Text)`
  color: #cbd5e1;
  font-size: ${width * 0.04}px;
  margin-top: ${height * 0.01}px;
  text-align: center;
`;

const LogoContainer = styled.View`
  position: absolute;
  bottom: ${height * 0.04}px;
  align-items: center;
`;

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => router.replace("/start"), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <Container colors={["#1e3a8a", "#2563eb"]}>
        <Animatable.View
          animation={{
            from: { opacity: 0.5, transform: [{ scale: 0.5 }] },
            to: { opacity: 0, transform: [{ scale: 2 }] },
          }}
          iterationCount="infinite"
          duration={2000}
          easing="ease-out"
          style={{
            position: "absolute",
            width: width * 0.5,
            height: width * 0.5,
            borderRadius: (width * 0.5) / 2,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
        />
        <Animatable.Image
          animation="zoomIn"
          duration={1000}
          source={require("../assets/images/IoT-Entrada.png")}
          style={{
            width: width * 0.3,
            height: width * 0.3,
            resizeMode: "contain",
          }}
        />
        <SplashTitle animation="bounceIn" delay={800}>
          CISTCOR SenseAI
        </SplashTitle>
        <SubText animation="fadeInUp" delay={1400}>
          Monitoreo Inteligente IoT + IA
        </SubText>
        <LogoContainer>
          <Animatable.Image
            animation="fadeIn"
            delay={1600}
            source={require("../assets/images/logo-blanco.png")}
            style={{
              width: width * 0.2,
              height: width * 0.2,
              resizeMode: "contain",
              marginBottom: height * 0.005,
            }}
          />
          <SubText animation="fadeIn" delay={1800}>
            CISTCOR NETWORKS S.A.C
          </SubText>
        </LogoContainer>
      </Container>
    </SafeAreaView>
  );
}
