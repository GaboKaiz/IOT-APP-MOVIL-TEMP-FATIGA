import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { ThemeContext } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 360;

const NavContainer = styled(View)`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1e293b" : "#e0f2fe")};
  padding: ${isSmallScreen ? 8 : 12}px 0;
  border-top-width: 1px;
  border-top-color: ${({ isDarkMode }) => (isDarkMode ? "#374151" : "#bfdbfe")};
  position: absolute;
  bottom: 0;
  width: 100%;
  elevation: ${Platform.OS === "android" ? 10 : 0};
`;

const NavButton = styled(TouchableOpacity)<{
  isDarkMode: boolean;
  isActive: boolean;
}>`
  align-items: center;
  padding: ${isSmallScreen ? 8 : 12}px;
  background-color: ${({ isActive, isDarkMode }) =>
    isActive ? (isDarkMode ? "#3b82f6" : "#1e40af") : "transparent"};
  border-radius: 16px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.7)};
  width: ${isSmallScreen ? "15%" : "18%"};
  transition: background-color 0.2s ease;
`;

const NavIcon = styled(View)<{ isActive: boolean }>`
  margin-bottom: ${isSmallScreen ? 4 : 6}px;
`;

const NavIconText = styled(Text)<{ isDarkMode: boolean }>`
  font-size: ${isSmallScreen ? 10 : 12}px;
  font-weight: ${isSmallScreen ? "500" : "600"};
  color: ${({ isDarkMode }) => (isDarkMode ? "#d1d5db" : "#1e40af")};
  text-align: center;
`;

type BottomNavProps = {
  onNavigate: (path: string) => void;
};

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const currentRoute = router.pathname;

  const isActive = (path: string) => {
    if (path === "Home" && currentRoute === "/dashboard") return true;
    if (path === "Temperatura" && currentRoute === "/temperatura") return true;
    if (path === "Fatiga" && currentRoute === "/fatiga") return true;
    if (path === "Profile" && currentRoute === "/profile") return true;
    if (path === "Cerrar Sesión") return false;
    return false;
  };

  const handlePress = (path: string) => {
    if (isActive(path)) return;
    onNavigate(path);
  };

  return (
    <NavContainer
      style={{ paddingBottom: insets.bottom + (isSmallScreen ? 10 : 15) }}
      isDarkMode={isDarkMode}
    >
      <NavButton
        onPress={() => handlePress("Home")}
        isDarkMode={isDarkMode}
        isActive={isActive("Home")}
        disabled={isActive("Home")}
      >
        <NavIcon isActive={isActive("Home")}>
          <Ionicons
            name="home"
            size={isSmallScreen ? 20 : 24}
            color={isDarkMode ? "#d1d5db" : "#1e40af"}
          />
        </NavIcon>
        <NavIconText isDarkMode={isDarkMode}>Home</NavIconText>
      </NavButton>
      <NavButton
        onPress={() => handlePress("Temperatura")}
        isDarkMode={isDarkMode}
        isActive={isActive("Temperatura")}
        disabled={isActive("Temperatura")}
      >
        <NavIcon isActive={isActive("Temperatura")}>
          <MaterialCommunityIcons
            name="thermometer"
            size={isSmallScreen ? 20 : 24}
            color={isDarkMode ? "#d1d5db" : "#1e40af"}
          />
        </NavIcon>
        <NavIconText isDarkMode={isDarkMode}>Temp</NavIconText>
      </NavButton>
      <NavButton
        onPress={() => handlePress("Fatiga")}
        isDarkMode={isDarkMode}
        isActive={isActive("Fatiga")}
        disabled={isActive("Fatiga")}
      >
        <NavIcon isActive={isActive("Fatiga")}>
          <MaterialCommunityIcons
            name="sleep"
            size={isSmallScreen ? 20 : 24}
            color={isDarkMode ? "#d1d5db" : "#1e40af"}
          />
        </NavIcon>
        <NavIconText isDarkMode={isDarkMode}>Fatiga</NavIconText>
      </NavButton>
      <NavButton
        onPress={() => handlePress("Profile")}
        isDarkMode={isDarkMode}
        isActive={isActive("Profile")}
        disabled={isActive("Profile")}
      >
        <NavIcon isActive={isActive("Profile")}>
          <Ionicons
            name="person"
            size={isSmallScreen ? 20 : 24}
            color={isDarkMode ? "#d1d5db" : "#1e40af"}
          />
        </NavIcon>
        <NavIconText isDarkMode={isDarkMode}>Profile</NavIconText>
      </NavButton>
      <NavButton
        onPress={() => handlePress("Cerrar Sesión")}
        isDarkMode={isDarkMode}
        isActive={false}
      >
        <NavIcon isActive={false}>
          <Ionicons
            name="log-out"
            size={isSmallScreen ? 20 : 24}
            color={isDarkMode ? "#d1d5db" : "#1e40af"}
          />
        </NavIcon>
        <NavIconText isDarkMode={isDarkMode}>Cerrar</NavIconText>
      </NavButton>
    </NavContainer>
  );
}
