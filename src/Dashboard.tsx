// Dashboard.tsx

import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import { connectMQTT } from "./mqtt";

export default function Dashboard() {
  const [heaterTemp, setHeaterTemp] = useState(0);
  const [coolsideTemp, setCoolsideTemp] = useState(0);
  const [outsideTemp, setOutsideTemp] = useState(0);
  const [heaterState, setHeaterState] = useState("OFF");
  const [wifiState, setWifiState] = useState("UNKNOWN");
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [firebaseState, setFirebaseState] = useState("UNKNOWN");

  useEffect(() => {
    const heaterTempRef = ref(db, "system/status/heater/currentTemp");
    const heaterStateRef = ref(db, "system/status/heater/state");
    const coolsideRef = ref(db, "system/status/sensors/coolside");
    const outsideRef = ref(db, "system/status/sensors/outside");
    const wifiRef = ref(db, "system/status/wifi/state");

    onValue(heaterTempRef, (snap) => setHeaterTemp(snap.val() || 0));
    onValue(heaterStateRef, (snap) => setHeaterState(snap.val() || "OFF"));
    onValue(coolsideRef, (snap) => setCoolsideTemp(snap.val() || 0));
    onValue(outsideRef, (snap) => setOutsideTemp(snap.val() || 0));
    onValue(wifiRef, (snap) => setWifiState(snap.val() || "UNKNOWN"));
  }, []);

  useEffect(() => {
    connectMQTT((topic, message) => {
      if (topic === "tortoise/status") {
        // Check if it's a full status message (has system object)
        if (message.system && typeof message.system === "object") {
          // Update MQTT status from ESP32's perspective
          if (message.mqtt && message.mqtt.state === "CONNECTED") {
            setDeviceOnline(true);
          } else {
            setDeviceOnline(false);
          }

          // Update WiFi status from MQTT message if available
          if (message.wifi && message.wifi.state) {
            setWifiState(message.wifi.state);
          }

          // Update Firebase status from MQTT message if available
          if (message.firebase && message.firebase.state) {
            setFirebaseState(message.firebase.state);
          }
        } else if (message.online !== undefined) {
          // Simple online/offline message (LWT or heartbeat)
          setDeviceOnline(message.online);
          // If device goes offline, WiFi and Firebase are also disconnected
          if (!message.online) {
            setWifiState("DISCONNECTED");
            setFirebaseState("DISCONNECTED");
          }
        }
      }
    });
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tortoise Heater Control Panel</h1>

      <div style={styles.cardContainer}>
        <TempCard title="Coolside" value={coolsideTemp} />
        <TempCard title="Outside" value={outsideTemp} />
        <TempCard title="Heater" value={heaterTemp} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "15px",
          fontSize: "15px",
          alignItems: "flex-start", // Changed from "center" to allow independent positioning
        }}
      >
        <div style={styles.statusCard}>
          Heater Status:
          <span
            style={{
              color: heaterState === "ON" ? "lime" : "red",
              marginTop: "15px",
              marginLeft: "10px",
              fontSize: "15px",
            }}
          >
            {heaterState}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "40px", // Now you can adjust Wifi text position without affecting Heater Status
          }}
        >
          <span>
            WiFi:{" "}
            <span
              style={{
                color: wifiState === "CONNECTED" ? "lime" : "red",
              }}
            >
              {wifiState}
            </span>
          </span>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: wifiState === "CONNECTED" ? "lime" : "red",
              position: "relative",
              top: "5px", // Move up (negative) or down (positive),Red/Green indicator vertical position
              left: "0px", // Move left (negative) or right (positive),Red/Green indicator horizontal position
            }}
          />
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "40px", // Now you can adjust Wifi text position without affecting Heater Status
            }}
          ></div>
          MQTT:
          <span
            style={{
              color: deviceOnline ? "lime" : "red",
              marginLeft: 10,
              fontSize: "15px",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {deviceOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
        {/* <div className="card"> */}
        <div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "40px", // Now you can adjust Wifi text position without affecting Heater Status
            }}
          ></div>
          Firebase:
          <span
            style={{
              color: firebaseState === "CONNECTED" ? "lime" : "red",
              marginLeft: 10,
              fontSize: "15px",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {firebaseState}
          </span>
        </div>
      </div>
    </div>
  );
}

function TempCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value.toFixed(1)}°</div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0d1117",
    minHeight: "100vh",
    color: "white",
    padding: "20px",
    fontFamily: "Arial",
  },

  title: {
    marginBottom: 30,
  },

  cardContainer: {
    display: "flex",
    marginLeft: 80,
    gap: 30,
  },

  card: {
    backgroundColor: "#060c18",
    padding: 20,
    borderRadius: 50,
    width: 150,
  },

  cardTitle: {
    fontSize: 18,
    color: "#8b949e",
  },

  cardValue: {
    fontSize: 32,
    marginTop: 10,
  },

  statusCard: {
    marginLeft: 70,
    marginTop: 35,
    fontSize: 20,
  },
};
