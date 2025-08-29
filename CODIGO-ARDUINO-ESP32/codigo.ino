#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// Configuración WiFi (para Wokwi)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// URL de tu API
const String serverUrl = "https://api-node-js-iot-app-movil.onrender.com/temperatura";

// Tu JWT token (obtenlo de /login y pégalo aquí)
// IMPORTANTE: El token anterior está EXPIRADO. Genera uno nuevo con POST a /login en Postman.
const String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTY3YjYwNTZlMzg1YzMzZTY1MjYwNyIsImlhdCI6MTc1NjQyODQ4NywiZXhwIjoxNzU2NTE0ODg3fQ.1Q1E20FwYCOXL1V9m06dV-wIA5jpJPVp2FpYlgO-xB4"; // ¡Reemplaza con un token válido!

// Pines y configuración DHT22
#define DHTPIN 2     // Pin DATA del DHT22 (GPIO2)
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define RELAY_PIN 5  // Pin del relé (GPIO5, controla LED que simula ventilador)

// Umbral para encender el ventilador
const float TEMP_THRESHOLD = 30.0;

// Configuración del dispositivo
const String dispositivoId = "ESP38"; // ID del dispositivo
const String ambiente = "AMBIENTE-CASA"; // Ambiente

void setup() {
  // Inicializar comunicación serial
  Serial.begin(115200);
  delay(100); // Pequeño retraso para asegurar que el Serial Monitor se inicialice
  Serial.println("=== Iniciando ESP32 - Proyecto Temperatura ===");
  Serial.println("Autor: Ian Gabriel Zuñiga");
  Serial.println("Inicializando sensor DHT22 y relé...");

  // Inicializar DHT22 y relé
  dht.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Relé apagado inicialmente (prueba con LOW)
  Serial.println("DHT22 y relé inicializados.");

  // Conectar a WiFi
  Serial.println("Conectando a WiFi: " + String(ssid));
  WiFi.begin(ssid, password);
  int wifiTimeout = 0;
  while (WiFi.status() != WL_CONNECTED && wifiTimeout < 20) {
    delay(500);
    Serial.print(".");
    wifiTimeout++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Conectado a WiFi!");
    Serial.println("IP: " + WiFi.localIP().toString());
  } else {
    Serial.println(" Error: No se pudo conectar a WiFi!");
  }
}

void loop() {
  Serial.println("=== Ciclo de lectura ===");
  
  // Leer temperatura
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("Error: No se pudo leer la temperatura del DHT22!");
    delay(5000);
    return;
  }

  Serial.print("Temperatura: ");
  Serial.print(temp);
  Serial.println(" °C");

  // Controlar relé (activa LED que simula ventilador)
  bool ventilador = temp > TEMP_THRESHOLD;
  if (ventilador) {
    digitalWrite(RELAY_PIN, HIGH); // Relé ON (prueba con HIGH para encender LED)
    Serial.println("Relé activado (ventilador simulado ON)");
  } else {
    digitalWrite(RELAY_PIN, LOW); // Relé OFF (prueba con LOW para apagar LED)
    Serial.println("Relé desactivado (ventilador simulado OFF)");
  }

  // Enviar datos a la API
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Iniciando solicitud HTTP...");
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + token);

    // Payload JSON con estado del ventilador
    String payload = "{\"temperatura\":" + String(temp) + ",\"ambiente\":\"" + ambiente + "\",\"idDispositivo\":\"" + dispositivoId + "\",\"ventilador\":" + (ventilador ? "true" : "false") + "}";
    Serial.println("Enviando a API: " + payload);

    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Respuesta API (código ");
      Serial.print(httpResponseCode);
      Serial.print("): ");
      Serial.println(response);
    } else {
      Serial.print("Error en POST: ");
      Serial.println(httpResponseCode);
      Serial.println("Verifica: ¿API online? ¿Token válido?");
    }
    http.end();
  } else {
    Serial.println("Error: WiFi desconectado");
  }

  Serial.println("Esperando 5 segundos...");
  delay(5000); // Espera 5 segundos
}