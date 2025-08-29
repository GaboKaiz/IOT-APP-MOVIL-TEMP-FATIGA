import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext<any>(null);

const lightColors = {
  background: "#d1d5db",
  text: "#1e3a8a",
  primary: "#2563eb",
  gradient: ["#d1d5db", "#9ca3af"], // Gris claro para contraste con íconos plomizos
};

const darkColors = {
  background: "#1e3a8a",
  text: "#FFFFFF",
  primary: "#2563eb",
  gradient: ["#1e3a8a", "#2563eb"], // Degradado azul oscuro
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Por defecto oscuro

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, colors, gradient: colors.gradient }}
    >
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />
      {children}
    </ThemeContext.Provider>
  );
};
