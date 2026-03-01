import mqtt from "mqtt";

let client: mqtt.MqttClient | null = null;
let messageCallback: ((topic: string, message: any) => void) | null = null;

export function connectMQTT(onMessage: (topic: string, message: any) => void) {
  messageCallback = onMessage;

  // If already connected, just update the callback
  if (client?.connected) {
    console.log("MQTT already connected, callback updated");
    return;
  }

  const url =
    "wss://ea53fbd1c1a54682b81526905851077b.s1.eu.hivemq.cloud:8884/mqtt";

  const username = import.meta.env.VITE_MQTT_USERNAME;
  const password = import.meta.env.VITE_MQTT_PASSWORD;

  console.log("MQTT connecting with username:", username);
  console.log("MQTT connecting with password length:", password?.length);
  console.log("MQTT password starts with:", password?.substring(0, 5));

  client = mqtt.connect(url, {
    clientId: "react-dashboard-" + Math.random().toString(16).substr(2, 8),
    clean: true,
    reconnectPeriod: 5000,
    username: username,
    password: password,
    will: {
      topic: "tortoise/status",
      payload: JSON.stringify({ online: false }),
      qos: 1,
      retain: true,
    },
  });

  client.on("connect", () => {
    client?.subscribe("tortoise/status", (err) => {
      if (err) {
        console.error("Subscribe error:", err);
      }
    });

    client?.subscribe("tortoise/#", (err) => {
      if (err) {
        console.error("Subscribe wildcard error:", err);
      }
    });
  });

  client.on("message", (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      messageCallback?.(topic, data);
    } catch {
      console.warn("Invalid JSON from MQTT:", payload.toString());
    }
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err);
  });
}

export function disconnectMQTT() {
  client?.end();
}
